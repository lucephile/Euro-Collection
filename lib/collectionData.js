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
