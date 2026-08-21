import { createClient } from "@supabase/supabase-js";

// Route serveur : seule façon sûre de supprimer un compte Supabase Auth.
// Le client admin est créé À L'INTÉRIEUR du handler (pas au chargement du module) :
// sinon, si SUPABASE_SERVICE_ROLE_KEY est absente, Next.js plante au BUILD (toutes
// les pages), pas seulement au moment d'appeler cette route.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return Response.json(
      { error: "Suppression de compte non configurée côté serveur (SUPABASE_SERVICE_ROLE_KEY manquante)." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifie que le token correspond bien à un utilisateur (on ne fait jamais
  // confiance à un user_id envoyé par le client)
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return Response.json({ error: "Session invalide" }, { status: 401 });
  }

  // Suppression du compte auth — les lignes profiles / user_collection_pieces /
  // user_collection_commemoratives partent automatiquement (ON DELETE CASCADE)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
