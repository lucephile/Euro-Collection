"use client";

import { useEffect, useState } from "react";
import CoinCell from "../../components/CoinCell";
import { supabase } from "../../lib/supabaseClient";
import { COIN_IMAGES_BASE } from "../../lib/constants";
import { getOwnedPieces, getOwnedCommemoratives } from "../../lib/collectionData";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

export default function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [detailStatus, setDetailStatus] = useState("idle"); // idle | loading | ok
  const [series, setSeries] = useState([]);
  const [commemSets, setCommemSets] = useState([]); // [{ year, name, coin }]
  const [ownedPieces, setOwnedPieces] = useState({}); // pieces.id -> true
  const [ownedCommems, setOwnedCommems] = useState({}); // commemorative_coins.id -> true
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("countries")
        .select("id, name, slug, iso_code, sort_order")
        .order("sort_order");
      if (error) {
        setStatus("error");
        return;
      }
      setCountries(data ?? []);
      setStatus("ok");
    })();
  }, []);

  async function loadCountry(slug) {
    setSelectedSlug(slug);
    if (!slug) return;
    setDetailStatus("loading");

    const country = countries.find((c) => c.slug === slug);
    if (!country) return;

    const [seriesRes, commemRes] = await Promise.all([
      supabase
        .from("coin_series")
        .select("id, label, sort_order, pieces ( id, value, image_url )")
        .eq("country_id", country.id)
        .order("sort_order"),
      supabase
        .from("commemorative_coins")
        .select("id, name, mintage, issue_date, image_url, commemorative_sets ( year, name, sort_order )")
        .eq("country_id", country.id),
    ]);

    setSeries(seriesRes.data ?? []);

    const commems = (commemRes.data ?? []).sort((a, b) => {
      const ay = a.commemorative_sets?.year ?? 0;
      const by = b.commemorative_sets?.year ?? 0;
      if (ay !== by) return ay - by;
      return (a.commemorative_sets?.sort_order ?? 0) - (b.commemorative_sets?.sort_order ?? 0);
    });
    setCommemSets(commems);

    if (user) {
      const [ownedPiecesData, ownedCommemsData] = await Promise.all([
        getOwnedPieces(user.id),
        getOwnedCommemoratives(user.id),
      ]);
      setOwnedPieces(ownedPiecesData);
      setOwnedCommems(ownedCommemsData);
    }
    setDetailStatus("ok");
  }

  return (
    <div>
      <h1>Explorer par pays</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Choisissez un pays pour voir ses sets de pièces Euro puis ses 2€ commémoratives, réunis
        sur une seule page.
      </p>

      {status === "loading" && <p>Chargement des pays…</p>}
      {status === "error" && <p style={{ color: "#a33" }}>Impossible de charger la liste des pays.</p>}

      {status === "ok" && (
        <select
          value={selectedSlug}
          onChange={(e) => loadCountry(e.target.value)}
          style={{ padding: 8, fontSize: 16, marginBottom: 24 }}
        >
          <option value="">— Choisir un pays —</option>
          {countries.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      )}

      {detailStatus === "loading" && <p>Chargement…</p>}

      {detailStatus === "ok" && (
        <>
          <h2>Sets de pièces Euro</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="sets-table" style={{ borderCollapse: "collapse", width: "max-content" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Série</th>
                  {VALUES.map((v) => (
                    <th key={v} className="coin-col">
                      <img className="header-coin-img" src={`${COIN_IMAGES_BASE}/headers/${v}.webp`} alt={v} title={v} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {series.map((serie) => {
                  const piecesByValue = Object.fromEntries((serie.pieces ?? []).map((p) => [p.value, p]));
                  return (
                    <tr key={serie.id}>
                      <td>{serie.label}</td>
                      {VALUES.map((v) => {
                        const piece = piecesByValue[v];
                        return (
                          <td key={v} className="coin-col">
                            {piece ? (
                              <CoinCell
                                imageUrl={piece.image_url}
                                alt={`${v} ${serie.label}`}
                                owned={!!ownedPieces[piece.id]}
                              />
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: 32 }}>2€ commémoratives</h2>
          {commemSets.length === 0 && (
            <p style={{ color: "var(--text-muted)" }}>Aucune pièce commémorative connue pour ce pays.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {commemSets.map((coin) => (
              <div key={coin.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 8 }}>
                <div style={{ width: 90 }}>
                  <CoinCell
                    imageUrl={coin.image_url}
                    alt={coin.name}
                    owned={!!ownedCommems[coin.id]}
                    info={{ name: coin.name, mintage: coin.mintage, issueDate: coin.issue_date }}
                  />
                </div>
                <div>
                  <strong>{coin.commemorative_sets?.year}</strong> — {coin.name}
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Tirage : {coin.mintage?.toLocaleString("fr-FR") ?? "?"} — Émission : {coin.issue_date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
