// TODO: rediriger vers /login si l'utilisateur n'est pas connecté (middleware Supabase)

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

// Exemple de calcul — en réalité : compter les lignes de
// user_collection_pieces (possessed=true / false) groupées par `value`.
const SAMPLE_STATS = {
  "1c": { owned: 17, missing: 23 },
  "2c": { owned: 17, missing: 23 },
  "5c": { owned: 20, missing: 20 },
  "10c": { owned: 24, missing: 16 },
  "20c": { owned: 24, missing: 16 },
  "50c": { owned: 24, missing: 16 },
  "1e": { owned: 25, missing: 15 },
  "2e": { owned: 24, missing: 16 },
};

function pct(owned, missing) {
  const total = owned + missing;
  return total ? ((owned / total) * 100).toFixed(2) + " %" : "—";
}

export default function StatsPage() {
  return (
    <div>
      <h1>Mes statistiques</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Partagez votre avancée : <code>/sets/votre-pseudo</code> et <code>/commemoratives/votre-pseudo</code>
        {/* TODO: remplacer "votre-pseudo" par profile.username une fois l'auth branchée ici */}
      </p>

      <h2>Sets Euro — par valeur de pièce</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th></th>
            {VALUES.map((v) => (
              <th key={v} style={{ padding: 8 }}>{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, padding: 8 }}>Possédé</td>
            {VALUES.map((v) => (
              <td key={v} style={{ padding: 8, textAlign: "center" }}>{SAMPLE_STATS[v].owned}</td>
            ))}
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 8 }}>Recherché</td>
            {VALUES.map((v) => (
              <td key={v} style={{ padding: 8, textAlign: "center" }}>{SAMPLE_STATS[v].missing}</td>
            ))}
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 8 }}>Avancement</td>
            {VALUES.map((v) => (
              <td key={v} style={{ padding: 8, textAlign: "center" }}>
                {pct(SAMPLE_STATS[v].owned, SAMPLE_STATS[v].missing)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>2€ commémoratives — par pays</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Même structure de tableau, colonnes = pays au lieu des valeurs de pièce.
        (à brancher sur user_collection_commemoratives groupé par country_id)
      </p>
    </div>
  );
}
