"use client";

import { useState } from "react";
import CoinCell from "../../components/CoinCell";
import DisplayFilters from "../../components/DisplayFilters";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

// Données d'exemple — à remplacer par un fetch Supabase (table pieces + coin_series + countries)
const SAMPLE_SERIES = [
  {
    id: 1,
    country: "Allemagne",
    label: "(2002-)",
    flag: "/flags/de.svg",
    images: Object.fromEntries(VALUES.map((v) => [v, `/coins/${v}_allemagne.webp`])),
  },
  {
    id: 2,
    country: "Belgique",
    label: "1re série (1999-2007)",
    flag: "/flags/be.svg",
    images: Object.fromEntries(VALUES.map((v) => [v, `/coins/${v}_belgique1.webp`])),
  },
];

export default function SetsPage() {
  const [filters, setFilters] = useState({ hideOwned: false, hideMissing: false });
  // TODO: remplacer par la vraie collection de l'utilisateur (Supabase)
  const [owned, setOwned] = useState({});

  const wrapperClass = [
    filters.hideOwned ? "hide-owned" : "",
    filters.hideMissing ? "hide-missing" : "",
  ].join(" ");

  function toggle(pieceKey) {
    setOwned((prev) => ({ ...prev, [pieceKey]: !prev[pieceKey] }));
  }

  return (
    <div>
      <h1>Sets de pièces Euro par pays</h1>
      <DisplayFilters
        hideOwned={filters.hideOwned}
        hideMissing={filters.hideMissing}
        onChange={setFilters}
      />

      <div className={wrapperClass} style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Pays</th>
              {VALUES.map((v) => (
                <th key={v} style={{ padding: 8 }}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SAMPLE_SERIES.map((serie) => (
              <tr key={serie.id}>
                <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                  <img src={serie.flag} alt="" width={20} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  {serie.country} <small style={{ color: "var(--text-muted)" }}>{serie.label}</small>
                </td>
                {VALUES.map((v) => {
                  const key = `${serie.id}-${v}`;
                  return (
                    <td key={v} style={{ padding: 4, width: 80 }}>
                      <CoinCell
                        imageUrl={serie.images[v]}
                        alt={`${v} ${serie.country}`}
                        owned={!!owned[key]}
                        onToggle={() => toggle(key)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 16 }}>
        Cliquez sur une pièce pour basculer son statut (possédée / non possédée) — la sauvegarde
        réelle en base (Supabase) reste à brancher.
      </p>
    </div>
  );
}
