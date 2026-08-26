"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CoinCell from "../../../components/CoinCell";
import { supabase } from "../../../lib/supabaseClient";
import { COIN_IMAGES_BASE } from "../../../lib/constants";
import { getProfileByUsername, getOwnedPieces } from "../../../lib/collectionData";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

export default function PublicSetsPage() {
  const { username } = useParams();
  const [status, setStatus] = useState("loading"); // loading | not-found | private | ok
  const [owned, setOwned] = useState({});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    (async () => {
      const profile = await getProfileByUsername(username);
      if (!profile) return setStatus("not-found");
      if (!profile.is_public) return setStatus("private");

      const { data, error } = await supabase
        .from("coin_series")
        .select(`
          id, label, sort_order,
          countries ( name, slug, iso_code, sort_order ),
          pieces ( id, value, image_url )
        `)
        .order("sort_order");

      if (error) {
        console.error(error);
        setStatus("not-found");
        return;
      }

      const formatted = (data ?? []).map((s) => ({
        id: s.id,
        country: s.countries?.name ?? "?",
        countrySortOrder: s.countries?.sort_order ?? 0,
        label: s.label,
        isoCode: s.countries?.iso_code?.toLowerCase(),
        pieces: Object.fromEntries((s.pieces ?? []).map((p) => [p.value, p])),
      }));
      formatted.sort((a, b) => a.countrySortOrder - b.countrySortOrder || a.id - b.id);
      setSeries(formatted);

      setOwned(await getOwnedPieces(profile.user_id));
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

      <div style={{ overflowX: "auto", maxHeight: "80vh", overflowY: "auto" }}>
        <table className="sets-table" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Pays</th>
              {VALUES.map((v) => (
                <th key={v} className="coin-col">
                  <img className="header-coin-img" src={`${COIN_IMAGES_BASE}/headers/${v}.webp`} alt={v} title={v} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((serie) => (
              <tr key={serie.id}>
                <td style={{ whiteSpace: "nowrap" }}>
                  <div className="country-cell">
                    <span>
                      {serie.isoCode && (
                        <img
                          src={`https://flagcdn.com/w40/${serie.isoCode}.png`}
                          alt=""
                          width={20}
                          style={{ verticalAlign: "middle", marginRight: 6 }}
                        />
                      )}
                      {serie.country}
                    </span>
                    <span className="series-label">{serie.label}</span>
                  </div>
                </td>
                {VALUES.map((v) => {
                  const piece = serie.pieces[v];
                  return (
                    <td key={v} className="coin-col">
                      {piece ? (
                        <CoinCell
                          imageUrl={piece.image_url}
                          alt={`${v} ${serie.country}`}
                          owned={!!owned[piece.id]}
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
    </div>
  );
}
