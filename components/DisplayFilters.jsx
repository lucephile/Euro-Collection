"use client";

// Utilisé sur chaque page d'affichage de pièces.
// Les classes hide-owned / hide-missing sont posées sur le wrapper parent
// et gérées en pur CSS (voir globals.css) pour rester léger.
export default function DisplayFilters({ hideOwned, hideMissing, onChange }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "12px 0" }}>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={hideOwned}
          onChange={(e) => onChange({ hideOwned: e.target.checked, hideMissing })}
        />
        Cacher les pièces en ma possession
      </label>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={hideMissing}
          onChange={(e) => onChange({ hideOwned, hideMissing: e.target.checked })}
        />
        Cacher les pièces que je n'ai pas
      </label>
    </div>
  );
}
