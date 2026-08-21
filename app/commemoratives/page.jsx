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
  const [owned, setOwned] = useState({}); // { [commemorative_id]: true }
  const [coins, setCoins] = useState([]);
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("commemorative_coins")
        .select("id, year, name, mintage, issue_date, image_url, countries ( name, iso_code, sort_order )")
        .order("year")
        .order("sort_order", { referencedTable: "countries" });

      if (error) {
        console.error(error);
        setStatus("error");
        return;
      }
      setCoins(data ?? []);

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

  const years = [...new Set(coins.map((c) => c.year))].sort();
  // colonnes = tous les pays apparus, dans l'ordre de countries.sort_order
  const countriesByName = new Map();
  coins.forEach((c) => {
    if (c.countries) countriesByName.set(c.countries.name, c.countries);
  });
  const countries = [...countriesByName.values()].sort((a, b) => a.sort_order - b.sort_order);

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
          <code>import_sets.sql</code> et <code>import_commemoratives.sql</code> ont bien été
          exécutés dans Supabase.
        </p>
      )}

      {status === "ok" && (
        <div className={wrapperClass} style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Année</th>
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
              {years.map((year) => (
                <tr key={year}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{year}</td>
                  {countries.map((country) => {
                    const coin = coins.find((c) => c.year === year && c.countries?.name === country.name);
                    return (
                      <td key={country.name} style={{ padding: 4, width: 100 }}>
                        {coin ? (
                          <CoinCell
                            imageUrl={coin.image_url}
                            alt={coin.name}
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
        Survolez une pièce pour voir son nom, son tirage et sa date d'émission. Cliquez pour la
        marquer possédée / non possédée.
      </p>
    </div>
  );
}
