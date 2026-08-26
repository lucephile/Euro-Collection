"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CoinCell from "../../components/CoinCell";
import DisplayFilters from "../../components/DisplayFilters";
import { supabase } from "../../lib/supabaseClient";
import { COIN_IMAGES_BASE } from "../../lib/constants";
import { getOwnedPieces, setPieceOwned } from "../../lib/collectionData";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];

export default function SetsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ hideOwned: false, hideMissing: false });
  const [owned, setOwned] = useState({}); // { [piece_id]: true }
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ok
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Toutes les séries + leur pays + leurs pièces (avec l'id réel de chaque pièce)
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
        setStatus("error");
        return;
      }

      const formatted = (data ?? []).map((s) => ({
        id: s.id,
        country: s.countries?.name ?? "?",
        countrySortOrder: s.countries?.sort_order ?? 0,
        label: s.label,
        isoCode: s.countries?.iso_code?.toLowerCase(),
        // pieces indexées par valeur : { "1c": { id, image_url }, ... }
        pieces: Object.fromEntries((s.pieces ?? []).map((p) => [p.value, p])),
      }));
      formatted.sort((a, b) => a.countrySortOrder - b.countrySortOrder || a.id - b.id);
      setSeries(formatted);

      if (user) {
        setOwned(await getOwnedPieces(user.id));
      }
      setStatus("ok");
    })();
  }, []);

  const wrapperClass = [
    filters.hideOwned ? "hide-owned" : "",
    filters.hideMissing ? "hide-missing" : "",
  ].join(" ");

  async function toggle(pieceId) {
    if (!user) {
      router.push("/login");
      return;
    }
    const nextOwned = !owned[pieceId];
    // mise à jour optimiste de l'affichage
    setOwned((prev) => ({ ...prev, [pieceId]: nextOwned }));

    const success = await setPieceOwned(user.id, pieceId, nextOwned);
    if (!success) {
      // échec de la sauvegarde -> on annule le changement visuel
      setOwned((prev) => ({ ...prev, [pieceId]: !nextOwned }));
    }
  }

  return (
    <div>
      <h1>Sets de pièces Euro par pays</h1>
      {!user && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          <a href="/login">Connectez-vous</a> pour enregistrer votre collection — sans compte, vos
          sélections ne seront pas sauvegardées.
        </p>
      )}
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
        <div className={wrapperClass} style={{ overflowX: "auto", maxHeight: "80vh", overflowY: "auto" }}>
          <table className="sets-table" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Pays</th>
                {VALUES.map((v) => (
                  <th key={v} className="coin-col">
                    <img
                      className="header-coin-img"
                      src={`${COIN_IMAGES_BASE}/headers/${v}.webp`}
                      alt={v}
                      title={v}
                    />
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
                            onToggle={() => toggle(piece.id)}
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
    </div>
  );
}
