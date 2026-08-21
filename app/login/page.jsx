"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "Connecté !");
      return;
    }

    // Inscription : le pseudo devient l'URL de partage (/sets/pseudo)
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setMessage(error.message);

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ user_id: data.user.id, username });
    if (profileError) {
      setMessage("Compte créé, mais pseudo déjà pris ou invalide (lettres/chiffres/tirets, 3-30 caractères).");
      return;
    }
    setMessage(`Compte créé ! Votre collection sera partageable sur /sets/${username}`);
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h1>{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Pseudo (pour votre lien de partage)"
            required
            pattern="[a-z0-9_-]{3,30}"
            title="Lettres minuscules, chiffres, tirets — 3 à 30 caractères"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <button type="submit">{mode === "login" ? "Se connecter" : "S'inscrire"}</button>
      </form>
      <button style={{ marginTop: 12, background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}
        onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Pas encore de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
      </button>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
