"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | signed-out
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("signed-out");
        return;
      }
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();
      setUsername(profile?.username ?? null);
      setStatus("ok");
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (!confirm("Supprimer définitivement votre compte et toute votre collection ? Cette action est irréversible.")) return;
    setDeleting(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Erreur lors de la suppression.");
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
  }

  if (status === "loading") return <p>Chargement…</p>;
  if (status === "signed-out") return <p>Vous devez être connecté pour voir cette page. <a href="/login">Se connecter</a></p>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Mon profil</h1>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Pseudo :</strong> {username ?? "—"}</p>

      <h2 style={{ marginTop: 24 }}>Mes liens à partager</h2>
      {username ? (
        <ul>
          <li>
            Sets par pays :{" "}
            <a href={`/sets/${username}`}>{typeof window !== "undefined" ? window.location.origin : ""}/sets/{username}</a>
          </li>
          <li>
            2€ commémoratives :{" "}
            <a href={`/commemoratives/${username}`}>{typeof window !== "undefined" ? window.location.origin : ""}/commemoratives/{username}</a>
          </li>
        </ul>
      ) : (
        <p style={{ color: "var(--text-muted)" }}>Aucun pseudo associé à ce compte.</p>
      )}

      <h2 style={{ marginTop: 24 }}>Session</h2>
      <button onClick={handleLogout}>Se déconnecter</button>

      <h2 style={{ marginTop: 24, color: "#a33" }}>Zone dangereuse</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Supprime définitivement votre compte, votre profil et toute votre collection enregistrée.
      </p>
      {error && <p style={{ color: "#a33" }}>{error}</p>}
      <button
        onClick={handleDeleteAccount}
        disabled={deleting}
        style={{ background: "#c0392b", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}
      >
        {deleting ? "Suppression…" : "Supprimer mon compte"}
      </button>
    </div>
  );
}
