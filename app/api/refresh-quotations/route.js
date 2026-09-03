import { createClient } from "@supabase/supabase-js";

// Traite un lot de pièces par exécution (pas toutes les 612 d'un coup) pour
// rester dans les limites de temps d'exécution de Vercel. Avec un cron
// quotidien, un cycle complet (toutes les pièces rafraîchies une fois)
// prend environ 12-13 jours — proche de la fréquence "toutes les 2 semaines"
// demandée. Augmenter BATCH_SIZE si le plan Vercel autorise des fonctions
// plus longues (Hobby = 10s, Pro = jusqu'à 60s+).
const BATCH_SIZE = 50;
const CONCURRENCY = 10;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function fetchNumistaType(numistaId, apiKey) {
  try {
    const res = await fetch(`https://api.numista.com/api/v3/types/${numistaId}`, {
      headers: { "Numista-API-Key": apiKey },
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, status: 0, error: String(e) };
  }
}

// À CALIBRER une fois qu'on a vu un vrai exemple de réponse Numista (via
// ?dryRun=true) : la structure exacte du prix retourné n'a pas pu être
// vérifiée à l'avance (impossible d'appeler l'API depuis cet environnement).
function extractQuotation(data) {
  if (!data || !Array.isArray(data.prices) || data.prices.length === 0) return null;
  const eur = data.prices.filter((p) => p.currency === "EUR" && typeof p.value === "number");
  const list = eur.length ? eur : data.prices.filter((p) => typeof p.value === "number");
  if (!list.length) return null;
  const uncirculated = list.find((p) => /unc|ms|bu/i.test(p.grade ?? ""));
  return uncirculated ? uncirculated.value : list[list.length - 1].value;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";
  const debugLimit = parseInt(searchParams.get("limit") || "0", 10);

  // Sécurité : Vercel Cron envoie "Authorization: Bearer <CRON_SECRET>"
  // automatiquement si la variable d'env CRON_SECRET est définie. Pour un
  // test manuel dans le navigateur, on accepte aussi ?secret=...
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const secretParam = searchParams.get("secret");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secretParam !== cronSecret) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const numistaApiKey = process.env.NUMISTA_API_KEY;
  if (!supabaseAdmin || !numistaApiKey) {
    return Response.json(
      { error: "Configuration serveur manquante (SUPABASE_SERVICE_ROLE_KEY ou NUMISTA_API_KEY)." },
      { status: 500 }
    );
  }

  // Priorité aux pièces jamais/rarement rafraîchies
  const { data: coins, error } = await supabaseAdmin
    .from("commemorative_coins")
    .select("id, numista_id, quotation, quotation_updated_at")
    .not("numista_id", "is", null)
    .order("quotation_updated_at", { ascending: true, nullsFirst: true })
    .limit(debugLimit > 0 ? debugLimit : BATCH_SIZE);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (let i = 0; i < coins.length; i += CONCURRENCY) {
    const batch = coins.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (coin) => {
        const { ok, data, status, error: fetchError } = await fetchNumistaType(coin.numista_id, numistaApiKey);
        if (!ok) return { id: coin.id, numista_id: coin.numista_id, error: fetchError ?? `HTTP ${status}` };
        const quotation = extractQuotation(data);
        return { id: coin.id, numista_id: coin.numista_id, quotation, raw: dryRun ? data : undefined };
      })
    );
    results.push(...batchResults);
  }

  if (!dryRun) {
    for (const r of results) {
      if (r.quotation != null) {
        await supabaseAdmin
          .from("commemorative_coins")
          .update({ quotation: r.quotation, quotation_updated_at: new Date().toISOString() })
          .eq("id", r.id);
      }
    }
  }

  return Response.json({
    dryRun,
    processed: results.length,
    updated: dryRun ? 0 : results.filter((r) => r.quotation != null).length,
    results: dryRun ? results : results.map(({ raw, ...rest }) => rest),
  });
}

export const maxDuration = 60;
