import { createClient } from "@supabase/supabase-js";

// Route serveur : seule façon sûre de supprimer un compte Supabase Auth.
// Utilise la clé "service role" (jamais exposée au navigateur, contrairement à
// NEXT_PUBLIC_SUPABASE_ANON_KEY) — à ajouter comme variable d'environnement
// SUPABASE_SERVICE_ROLE_KEY (Vercel > Settings > Environment Variables),
// disponible dans Supabase > Project Settings > API > service_role.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
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
