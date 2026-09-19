"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function IdentifyPage() {
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setResult(null);
    setError(null);
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image trop lourde (5 Mo maximum).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/identify-coin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'identification.");
        return;
      }
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>Identifier une pièce par photo</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Prenez la pièce en photo à plat, bien éclairée et cadrée. L'identification est
        automatique ; si le résultat n'est pas certain, la photo est mise de côté pour
        vérification manuelle.
      </p>

      <input type="file" accept="image/*" capture="environment" onChange={onFileChange} />

      {preview && (
        <div style={{ marginTop: 16 }}>
          <img src={preview} alt="Aperçu" style={{ maxWidth: 240, borderRadius: "var(--radius)" }} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSubmit} disabled={!file || loading}>
          {loading ? "Analyse en cours…" : "Identifier cette pièce"}
        </button>
      </div>

      {error && <p style={{ color: "#a33", marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16 }}>
          {result.status === "auto_matched" ? (
            <>
              <h2 style={{ marginTop: 0 }}>Pièce identifiée</h2>
              <p style={{ fontSize: 18, fontWeight: 600 }}>{result.match?.label}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Indice de confiance : {Math.round((result.confidence ?? 0) * 100)} %
              </p>

              <h3>Qui cherche cette pièce ?</h3>
              {result.seekers?.length ? (
                <>
                  <p style={{ fontSize: 14 }}>
                    {result.seekers.length} membre{result.seekers.length > 1 ? "s" : ""} au profil
                    public ne l'a pas encore :
                  </p>
                  <ul>
                    {result.seekers.map((u) => (
                      <li key={u}>
                        <a href={`/commemoratives/${u}`}>{u}</a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  Personne parmi les profils publics ne cherche cette pièce actuellement.
                </p>
              )}
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>Identification incertaine</h2>
              <p>{result.reason}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {result.confidence != null && `Indice de confiance : ${Math.round(result.confidence * 100)} %`}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
