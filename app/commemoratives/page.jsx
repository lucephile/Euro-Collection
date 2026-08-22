"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CoinCell from "../../components/CoinCell";
import DisplayFilters from "../../components/DisplayFilters";
import { supabase } from "../../lib/supabaseClient";
import { getOwnedCommemoratives, setCommemorativeOwned } from "../../lib/collectionData";

export default function CommemorativesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ hideOwned: false, hideMissing: false });
  const [owned, setOwned] = useState({}); // { [commemorative_coin_id]: true }
  const [sets, setSets] = useState([]); // [{ id, year, name, coinsByCountry: {name: coin} }]
  const [countries, setCountries] = useState([]); // colonnes, ordonnées
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Un "set" = une pièce commémorative (année + raison), potentiellement émise par
      // plusieurs pays (design commun) — chaque pays émetteur a sa propre ligne dans
      // commemorative_coins, reliée à ce set.
      const { data, error } = await supabase
        .from("commemorative_sets")
        .select(`
          id, year, name, sort_order,
          commemorative_coins ( id, name, mintage, issue_date, image_url, countries ( name, iso_code, sort_order ) )
        `)
        .order("year")
        .order("sort_order");

      if (error) {
        console.error(error);
        setStatus("error");
        return;
      }

      const countriesByName = new Map();
      (data ?? []).forEach((s) =>
        (s.commemorative_coins ?? []).forEach((c) => {
          if (c.countries) countriesByName.set(c.countries.name, c.countries);
        })
      );
      const countryList = [...countriesByName.values()].sort((a, b) => a.sort_order - b.sort_order);
      setCountries(countryList);

      const formattedSets = (data ?? []).map((s) => ({
        id: s.id,
        year: s.year,
        name: s.name,
        coinsByCountry: Object.fromEntries((s.commemorative_coins ?? []).map((c) => [c.countries?.name, c])),
      }));
      setSets(formattedSets);

      if (user) setOwned(await getOwnedCommemoratives(user.id));
      setStatus("ok");
    })();
  }, []);

  const wrapperClass = [
    filters.hideOwned ? "hide-owned" : "",
    filters.hideMissing ? "hide-missing" : "",
  ].join(" ");

  async function toggle(coinId) {
    if (!user) {
      router.push("/login");
      return;
    }
    const nextOwned = !owned[coinId];
    setOwned((prev) => ({ ...prev, [coinId]: nextOwned }));
    const success = await setCommemorativeOwned(user.id, coinId, nextOwned);
    if (!success) setOwned((prev) => ({ ...prev, [coinId]: !nextOwned }));
  }

  return (
    <div>
      <h1>Pièces de 2€ commémoratives</h1>
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

      {status === "loading" && <p>Chargement…</p>}
      {status === "error" && (
        <p style={{ color: "#a33" }}>
          Impossible de charger les données. Vérifiez que <code>schema.sql</code>,{" "}
          <code>import_sets.sql</code>, <code>migrate_commemorative_sets.sql</code> et{" "}
          <code>import_commemoratives.sql</code> ont bien été exécutés, dans cet ordre.
        </p>
      )}

      {status === "ok" && (
        <div className={wrapperClass} style={{ overflowX: "auto", maxHeight: "80vh", overflowY: "auto" }}>
          <table className="sets-table" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Année - Raison</th>
                {countries.map((c) => (
                  <th key={c.name} style={{ padding: 8 }}>
                    {c.iso_code && (
                      <img
                        src={`https://flagcdn.com/w40/${c.iso_code.toLowerCase()}.png`}
                        alt={c.name}
                        title={c.name}
                        width={20}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.id}>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                      <span style={{ fontWeight: 600 }}>{set.year}</span>
                      {set.name && (
                        <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-muted)" }}>
                          {set.name}
                        </span>
                      )}
                    </div>
                  </td>
                  {countries.map((country) => {
                    const coin = set.coinsByCountry[country.name];
                    return (
                      <td key={country.name} style={{ padding: 4, width: 300 }}>
                        {coin ? (
                          <CoinCell
                            imageUrl={coin.image_url}
                            alt={`${coin.name} ${country.name}`}
                            owned={!!owned[coin.id]}
                            onToggle={() => toggle(coin.id)}
                            info={{ name: coin.name, mintage: coin.mintage, issueDate: coin.issue_date }}
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
        Chaque ligne correspond à une pièce (année - raison d'émission) ; les émissions communes à
        plusieurs pays partagent la même ligne. Survolez une pièce pour voir son tirage et sa date
        d'émission. Cliquez pour la marquer possédée / non possédée.
      </p>
    </div>
  );
}
