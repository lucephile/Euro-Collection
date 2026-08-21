"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CoinCell from "../../../components/CoinCell";
import { getProfileByUsername, getOwnedPieces } from "../../../lib/collectionData";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

// Mêmes données d'exemple que /app/sets/page.jsx (à remplacer par le vrai référentiel Supabase)
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

export default function PublicSetsPage() {
  const { username } = useParams();
  const [status, setStatus] = useState("loading"); // loading | not-found | private | ok
  const [owned, setOwned] = useState({});

  useEffect(() => {
    (async () => {
      const profile = await getProfileByUsername(username);
      if (!profile) return setStatus("not-found");
      if (!profile.is_public) return setStatus("private");
      const ownedPieces = await getOwnedPieces(profile.user_id);
      setOwned(ownedPieces);
      setStatus("ok");
    })();
  }, [username]);

  if (status === "loading") return <p>Chargement…</p>;
  if (status === "not-found") return <p>Aucun utilisateur avec le pseudo « {username} ».</p>;
  if (status === "private") return <p>Cette collection n'est pas publique.</p>;

  return (
    <div>
      <h1>Collection de {username}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Vue en lecture seule — partagez ce lien : <code>/sets/{username}</code>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Pays</th>
              {VALUES.map((v) => <th key={v} style={{ padding: 8 }}>{v}</th>)}
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
                  // id de pièce réel = pieces.id (série x valeur) une fois les vraies données importées
                  const pieceId = `${serie.id}-${v}`;
                  return (
                    <td key={v} style={{ padding: 4, width: 80 }}>
                      <CoinCell
                        imageUrl={serie.images[v]}
                        alt={`${v} ${serie.country}`}
                        owned={!!owned[pieceId]}
                      />
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
