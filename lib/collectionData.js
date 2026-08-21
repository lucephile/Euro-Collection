import { supabase } from "./supabaseClient";

// Retourne le profil (user_id, username, is_public) ou null si pseudo inconnu
export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, is_public")
    .eq("username", username)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

// Retourne un objet { [piece_id]: true } des pièces "normales" possédées par cet utilisateur
export async function getOwnedPieces(userId) {
  const { data } = await supabase
    .from("user_collection_pieces")
    .select("piece_id, possessed")
    .eq("user_id", userId);
  const owned = {};
  (data ?? []).forEach((row) => { if (row.possessed) owned[row.piece_id] = true; });
  return owned;
}

// Idem pour les 2€ commémoratives
export async function getOwnedCommemoratives(userId) {
  const { data } = await supabase
    .from("user_collection_commemoratives")
    .select("commemorative_id, possessed")
    .eq("user_id", userId);
  const owned = {};
  (data ?? []).forEach((row) => { if (row.possessed) owned[row.commemorative_id] = true; });
  return owned;
}

// Bascule le statut possédée / non possédée d'une pièce "normale" pour l'utilisateur connecté.
// possessed=true -> upsert la ligne ; possessed=false -> on supprime la ligne
// (cohérent avec la RLS et la convention "pas de ligne = non possédée")
export async function setPieceOwned(userId, pieceId, possessed) {
  if (possessed) {
    const { error } = await supabase
      .from("user_collection_pieces")
      .upsert({ user_id: userId, piece_id: pieceId, possessed: true, updated_at: new Date().toISOString() });
    return !error;
  }
  const { error } = await supabase
    .from("user_collection_pieces")
    .delete()
    .eq("user_id", userId)
    .eq("piece_id", pieceId);
  return !error;
}

// Idem pour une pièce commémorative 2€
export async function setCommemorativeOwned(userId, commemorativeId, possessed) {
  if (possessed) {
    const { error } = await supabase
      .from("user_collection_commemoratives")
      .upsert({ user_id: userId, commemorative_id: commemorativeId, possessed: true, updated_at: new Date().toISOString() });
    return !error;
  }
  const { error } = await supabase
    .from("user_collection_commemoratives")
    .delete()
    .eq("user_id", userId)
    .eq("commemorative_id", commemorativeId);
  return !error;
}

// Crée le profil (pseudo) une fois que l'utilisateur a une session active (donc après
// confirmation de son email) — le pseudo choisi à l'inscription est récupéré depuis
// user_metadata, où il a été stocké temporairement le temps de la confirmation.
// Ne fait rien si le profil existe déjà (utilisateur déjà confirmé/connecté auparavant).
export async function ensureProfile(user) {
  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return;

  const desiredUsername = user.user_metadata?.username;
  if (!desiredUsername) return; // pas de pseudo en attente pour cet utilisateur

  await supabase.from("profiles").insert({ user_id: user.id, username: desiredUsername });
}
