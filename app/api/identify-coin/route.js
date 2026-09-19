import { createClient } from "@supabase/supabase-js";

// Seuil au-dessus duquel on considère l'identification fiable.
// En dessous, la photo part en évaluation humaine (status pending_review).
const CONFIDENCE_THRESHOLD = 0.75;

// Google retire ses modèles rapidement (gemini-2.0-flash a été arrêté le
// 1er juin 2026). On utilise donc par défaut l'alias "latest", qui suit
// automatiquement le modèle Flash courant, et on laisse la possibilité de
// figer un modèle précis via la variable d'environnement GEMINI_MODEL.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function normalizeText(s) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-z0-9 ]/g, " ");
}

// Score de similarité simple par mots partagés (>3 lettres), entre le thème
// que Gemini a décrit et le nom (français) de chaque pièce candidate en base.
// Sert à départager quand un pays a émis plusieurs pièces la même année.
function scoreMatch(topic, name) {
  if (!topic || !name) return 0;
  const topicWords = new Set(normalizeText(topic).split(/\s+/).filter((w) => w.length > 3));
  const nameWords = normalizeText(name).split(/\s+/).filter((w) => w.length > 3);
  return nameWords.reduce((score, w) => score + (topicWords.has(w) ? 1 : 0), 0);
}

const PROMPT = `Tu analyses la photo d'une pièce en euro. Réponds UNIQUEMENT par un objet JSON, sans texte autour, sans balises markdown.

Format exact attendu :
{
  "kind": "set" | "commemorative",
  "country_slug": "<slug>",
  "year": <nombre ou null>,
  "value": "1c"|"2c"|"5c"|"10c"|"20c"|"50c"|"1e"|"2e",
  "commemorative_topic": "<courte description du motif commémoratif, ou null>",
  "confidence": <nombre entre 0 et 1>
}

Règles :
- "kind" vaut "commemorative" uniquement si c'est une 2€ commémorative (motif national spécifique, pas le motif courant du pays).
- "country_slug" doit être l'un de : allemagne, andorre, autriche, belgique, bulgarie, chypre, croatie, espagne, estonie, finlande, france, grece, irlande, italie, lettonie, lituanie, luxembourg, malte, monaco, pays-bas, portugal, saint-marin, slovaquie, slovenie, vatican.
- "confidence" doit refléter honnêtement ta certitude. Si la photo est floue, partielle, mal éclairée, ou si tu hésites entre plusieurs pays/années, mets une valeur basse (< 0.5). Ne devine pas au hasard.
- Si tu ne peux pas identifier la pièce, mets confidence à 0 et les autres champs à null.`;

async function askGemini(base64Image, mimeType, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: base64Image } },
            ],
          },
        ],
        generationConfig: { temperature: 0, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!supabaseAdmin || !geminiKey) {
    return Response.json(
      { error: "Configuration serveur manquante (SUPABASE_SERVICE_ROLE_KEY ou GEMINI_API_KEY)." },
      { status: 500 }
    );
  }

  // Authentification : on identifie l'utilisateur via son token Supabase
  const token = (request.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return Response.json({ error: "Non authentifié" }, { status: 401 });
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return Response.json({ error: "Session invalide" }, { status: 401 });
  }
  const userId = userData.user.id;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const { imageBase64, mimeType } = body ?? {};
  if (!imageBase64 || !mimeType) {
    return Response.json({ error: "Image manquante" }, { status: 400 });
  }

  // --- 1) Interrogation du modèle de vision ---
  let ai;
  try {
    ai = await askGemini(imageBase64, mimeType, geminiKey);
  } catch (e) {
    // Échec technique (modèle inexistant, quota, panne, réponse illisible) :
    // on garde la photo pour évaluation humaine plutôt que de perdre la
    // demande, ET on remonte le détail pour pouvoir diagnostiquer.
    const detail = String(e?.message ?? e);
    console.error("[identify-coin] échec Gemini:", detail);
    const { data: saved } = await supabaseAdmin
      .from("coin_identifications")
      .insert({ user_id: userId, ai_raw_response: { error: detail }, status: "pending_review" })
      .select("id")
      .single();
    return Response.json({
      status: "pending_review",
      reason: "Le service de reconnaissance n'a pas pu traiter l'image. Elle a été mise de côté pour vérification manuelle.",
      technicalDetail: detail,
      model: GEMINI_MODEL,
      identificationId: saved?.id ?? null,
    });
  }

  const confidence = Number(ai?.confidence ?? 0);
  const countrySlug = ai?.country_slug ?? null;
  const year = ai?.year ?? null;
  const kind = ai?.kind ?? null;

  // --- 2) Correspondance en base ---
  let matchedPieceId = null;
  let matchedCommemorativeId = null;
  let matchLabel = null;
  let seekers = [];

  if (confidence >= CONFIDENCE_THRESHOLD && countrySlug) {
    const { data: country } = await supabaseAdmin
      .from("countries")
      .select("id, name")
      .eq("slug", countrySlug)
      .maybeSingle();

    if (country) {
      if (kind === "commemorative" && year) {
        // Une année + un pays peuvent donner plusieurs pièces : on essaie
        // d'abord de trancher avec le thème identifié par Gemini
        // (commemorative_topic), sinon évaluation humaine.
        const { data: sets } = await supabaseAdmin
          .from("commemorative_sets")
          .select("id")
          .eq("year", year);
        const setIds = (sets ?? []).map((s) => s.id);
        if (setIds.length) {
          const { data: coins } = await supabaseAdmin
            .from("commemorative_coins")
            .select("id, name")
            .eq("country_id", country.id)
            .in("set_id", setIds);

          if ((coins ?? []).length === 1) {
            matchedCommemorativeId = coins[0].id;
            matchLabel = `${country.name} ${year} — ${coins[0].name}`;
          } else if ((coins ?? []).length > 1) {
            const scored = coins
              .map((c) => ({ ...c, score: scoreMatch(ai?.commemorative_topic, c.name) }))
              .sort((a, b) => b.score - a.score);
            const best = scored[0];
            const runnerUp = scored[1];
            // On ne retient l'auto-match que si le meilleur score est net
            // (pas d'ambiguïté avec le deuxième candidat)
            if (best.score > 0 && (!runnerUp || best.score > runnerUp.score)) {
              matchedCommemorativeId = best.id;
              matchLabel = `${country.name} ${year} — ${best.name}`;
            }
          }
        }
      } else if (kind === "set" && ai?.value) {
        const { data: series } = await supabaseAdmin
          .from("coin_series")
          .select("id, label")
          .eq("country_id", country.id);
        const seriesIds = (series ?? []).map((s) => s.id);
        if (seriesIds.length) {
          const { data: pieces } = await supabaseAdmin
            .from("pieces")
            .select("id, value, series_id")
            .eq("value", ai.value)
            .in("series_id", seriesIds);
          if ((pieces ?? []).length === 1) {
            matchedPieceId = pieces[0].id;
            matchLabel = `${country.name} — ${ai.value}`;
          }
        }
      }
    }
  }

  const matched = matchedPieceId != null || matchedCommemorativeId != null;
  const status = matched ? "auto_matched" : "pending_review";

  // --- 3) Qui cherche cette pièce (profils PUBLICS uniquement) ---
  if (matched) {
    if (matchedCommemorativeId != null) {
      const { data } = await supabaseAdmin
        .from("commemorative_seekers")
        .select("username")
        .eq("commemorative_id", matchedCommemorativeId)
        .limit(50);
      seekers = (data ?? []).map((r) => r.username);
    } else {
      const { data } = await supabaseAdmin
        .from("piece_seekers")
        .select("username")
        .eq("piece_id", matchedPieceId)
        .limit(50);
      seekers = (data ?? []).map((r) => r.username);
    }
  }

  const { data: saved } = await supabaseAdmin
    .from("coin_identifications")
    .insert({
      user_id: userId,
      ai_raw_response: ai,
      ai_country_slug: countrySlug,
      ai_year: year,
      ai_kind: kind,
      ai_confidence: isNaN(confidence) ? 0 : confidence,
      matched_piece_id: matchedPieceId,
      matched_commemorative_id: matchedCommemorativeId,
      status,
    })
    .select("id")
    .single();

  return Response.json({
    status,
    confidence,
    match: matched ? { label: matchLabel } : null,
    seekers,
    reason: matched
      ? null
      : confidence < CONFIDENCE_THRESHOLD
      ? "L'identification n'est pas assez certaine. La photo a été mise de côté pour vérification manuelle."
      : "La pièce n'a pas pu être retrouvée avec certitude en base (plusieurs correspondances possibles). Mise de côté pour vérification manuelle.",
    identificationId: saved?.id ?? null,
  });
}

export const maxDuration = 60;
