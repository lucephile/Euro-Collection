"use client";

import { useEffect, useState } from "react";
import CoinCell from "../../components/CoinCell";
import DisplayFilters from "../../components/DisplayFilters";
import { supabase } from "../../lib/supabaseClient";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

export default function SetsPage() {
  const [filters, setFilters] = useState({ hideOwned: false, hideMissing: false });
  const [owned, setOwned] = useState({}); // TODO: charger la vraie collection si l'utilisateur est connecté
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ok

  useEffect(() => {
    (async () => {
      // Une requête : toutes les séries + leur pays + leurs pièces, dans l'ordre d'affichage
      const { data, error } = await supabase
        .from("coin_series")
        .select(`
          id, label, sort_order,
          countries ( name, slug, iso_code, sort_order ),
          pieces ( value, image_url )
        `)
        .order("sort_order", { referencedTable: "countries" })
        .order("sort_order");

      if (error) {
        console.error(error);
        setStatus("error");
        return;
      }

      const formatted = (data ?? []).map((s) => ({
        id: s.id,
        country: s.countries?.name ?? "?",
        countrySortOrder: s.countries?.sort_order ?? 0,
        label: s.label,
        isoCode: s.countries?.iso_code?.toLowerCase(),
        images: Object.fromEntries((s.pieces ?? []).map((p) => [p.value, p.image_url])),
      }));
      formatted.sort((a, b) => a.countrySortOrder - b.countrySortOrder || a.id - b.id);

      setSeries(formatted);
      setStatus("ok");
    })();
  }, []);

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

      {status === "loading" && <p>Chargement des {`>`}300 pièces…</p>}
      {status === "error" && (
        <p style={{ color: "#a33" }}>
          Impossible de charger les données. Vérifiez que <code>schema.sql</code> et{" "}
          <code>import_sets.sql</code> ont bien été exécutés dans Supabase, et que les variables
          d'environnement <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> sont configurées sur Vercel.
        </p>
      )}

      {status === "ok" && (
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
              {series.map((serie) => (
                <tr key={serie.id}>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {serie.isoCode && (
                      <img
                        src={`https://flagcdn.com/w40/${serie.isoCode}.png`}
                        alt=""
                        width={20}
                        style={{ verticalAlign: "middle", marginRight: 6 }}
                      />
                    )}
                    {serie.country}{" "}
                    <small style={{ color: "var(--text-muted)" }}>{serie.label}</small>
                  </td>
                  {VALUES.map((v) => {
                    const key = `${serie.id}-${v}`;
                    const imageUrl = serie.images[v];
                    return (
                      <td key={v} style={{ padding: 4, width: 80 }}>
                        {imageUrl ? (
                          <CoinCell
                            imageUrl={imageUrl}
                            alt={`${v} ${serie.country}`}
                            owned={!!owned[key]}
                            onToggle={() => toggle(key)}
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
      )}

      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 16 }}>
        Cliquez sur une pièce pour basculer son statut (possédée / non possédée) — la sauvegarde
        réelle en base (Supabase) reste à brancher.
      </p>
    </div>
  );
}
