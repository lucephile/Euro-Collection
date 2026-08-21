"use client";

import { useState } from "react";
import CoinCell from "../../components/CoinCell";
import DisplayFilters from "../../components/DisplayFilters";

// Données d'exemple issues de la structure "2004" — à remplacer par un fetch Supabase
// (table commemorative_coins), une ligne par année/pays.
const SAMPLE_COMMEMORATIVES = [
  {
    year: 2004,
    country: "Finlande",
    flag: "/flags/fi.svg",
    name: "Elargissement de l'Union européenne à dix nouveaux États membres",
    mintage: 1000000,
    issueDate: "juin 2004",
    image: "/coins/2e_comme_finlande_2004.webp",
  },
  {
    year: 2004,
    country: "Grèce",
    flag: "/flags/gr.svg",
    name: "Jeux olympiques d'Athènes de 2004",
    mintage: 50000000,
    issueDate: "mars 2004",
    image: "/coins/2e_comme_grece_2004.webp",
  },
];

export default function CommemorativesPage() {
  const [filters, setFilters] = useState({ hideOwned: false, hideMissing: false });
  const [owned, setOwned] = useState({}); // TODO: Supabase (user_collection_commemoratives)

  const wrapperClass = [
    filters.hideOwned ? "hide-owned" : "",
    filters.hideMissing ? "hide-missing" : "",
  ].join(" ");

  // Regroupement par année (1ère colonne), pays en colonnes — structure demandée
  const years = [...new Set(SAMPLE_COMMEMORATIVES.map((c) => c.year))];
  const countries = [...new Set(SAMPLE_COMMEMORATIVES.map((c) => c.country))];

  function toggle(key) {
    setOwned((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <h1>Pièces de 2€ commémoratives</h1>
      <DisplayFilters
        hideOwned={filters.hideOwned}
        hideMissing={filters.hideMissing}
        onChange={setFilters}
      />

      <div className={wrapperClass} style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Année</th>
              {countries.map((c) => (
                <th key={c} style={{ padding: 8 }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year}>
                <td style={{ padding: 8, fontWeight: 600 }}>{year}</td>
                {countries.map((country) => {
                  const coin = SAMPLE_COMMEMORATIVES.find((c) => c.year === year && c.country === country);
                  const key = `${year}-${country}`;
                  return (
                    <td key={country} style={{ padding: 4, width: 100 }}>
                      {coin ? (
                        <CoinCell
                          imageUrl={coin.image}
                          alt={coin.name}
                          owned={!!owned[key]}
                          onToggle={() => toggle(key)}
                          info={{ name: coin.name, mintage: coin.mintage, issueDate: coin.issueDate }}
                        />
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 16 }}>
        Survolez une pièce pour voir son nom, son tirage et sa date d'émission.
      </p>
    </div>
  );
}
