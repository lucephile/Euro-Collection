"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ensureProfile } from "../../lib/collectionData";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState(null);

  // Cas où on arrive ici APRÈS avoir cliqué sur le lien de confirmation d'email :
  // Supabase a déjà ouvert une session (détectée automatiquement dans l'URL). On peut donc
  // enfin créer le profil (le pseudo choisi à l'inscription est en attente dans user_metadata).
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await ensureProfile(session.user);
        router.push("/");
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMessage(error.message);
      await ensureProfile(data.user); // no-op si le profil existe déjà
      router.push("/");
      return;
    }

    // Inscription : le pseudo est stocké dans user_metadata (pas encore en base "profiles",
    // car tant que l'email n'est pas confirmé, aucune session active -> la RLS refuserait
    // l'écriture). Il sera récupéré et inséré dans "profiles" une fois la confirmation faite
    // (voir useEffect ci-dessus, déclenché au retour sur /login).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { username },
      },
    });
    if (error) return setMessage(error.message);

    if (data.session) {
      // La confirmation email est désactivée sur ce projet Supabase -> session immédiate
      await ensureProfile(data.user);
      router.push("/");
      return;
    }

    setMessage("Compte créé ! Vérifiez vos emails et cliquez sur le lien de confirmation pour activer votre profil.");
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
