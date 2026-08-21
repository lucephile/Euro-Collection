"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CoinCell from "../../../components/CoinCell";
import { getProfileByUsername, getOwnedCommemoratives } from "../../../lib/collectionData";

const SAMPLE_COMMEMORATIVES = [
  { year: 2004, country: "Finlande", name: "Elargissement de l'Union européenne à dix nouveaux États membres", mintage: 1000000, issueDate: "juin 2004", image: "/coins/2e_comme_finlande_2004.webp" },
  { year: 2004, country: "Grèce", name: "Jeux olympiques d'Athènes de 2004", mintage: 50000000, issueDate: "mars 2004", image: "/coins/2e_comme_grece_2004.webp" },
];

export default function PublicCommemorativesPage() {
  const { username } = useParams();
  const [status, setStatus] = useState("loading");
  const [owned, setOwned] = useState({});

  useEffect(() => {
    (async () => {
      const profile = await getProfileByUsername(username);
      if (!profile) return setStatus("not-found");
      if (!profile.is_public) return setStatus("private");
      setOwned(await getOwnedCommemoratives(profile.user_id));
      setStatus("ok");
    })();
  }, [username]);

  if (status === "loading") return <p>Chargement…</p>;
  if (status === "not-found") return <p>Aucun utilisateur avec le pseudo « {username} ».</p>;
  if (status === "private") return <p>Cette collection n'est pas publique.</p>;

  const years = [...new Set(SAMPLE_COMMEMORATIVES.map((c) => c.year))];
  const countries = [...new Set(SAMPLE_COMMEMORATIVES.map((c) => c.country))];

  return (
    <div>
      <h1>2€ commémoratives de {username}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Vue en lecture seule — partagez ce lien : <code>/commemoratives/{username}</code>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Année</th>
              {countries.map((c) => <th key={c} style={{ padding: 8 }}>{c}</th>)}
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
                          info={{ name: coin.name, mintage: coin.mintage, issueDate: coin.issueDate }}
                        />
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
