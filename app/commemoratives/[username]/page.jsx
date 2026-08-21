"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CoinCell from "../../../components/CoinCell";
import { supabase } from "../../../lib/supabaseClient";
import { getProfileByUsername, getOwnedCommemoratives } from "../../../lib/collectionData";

export default function PublicCommemorativesPage() {
  const { username } = useParams();
  const [status, setStatus] = useState("loading");
  const [owned, setOwned] = useState({});
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    (async () => {
      const profile = await getProfileByUsername(username);
      if (!profile) return setStatus("not-found");
      if (!profile.is_public) return setStatus("private");

      const { data, error } = await supabase
        .from("commemorative_coins")
        .select("id, year, name, mintage, issue_date, image_url, countries ( name, iso_code, sort_order )")
        .order("year")
        .order("sort_order", { referencedTable: "countries" });

      if (error) {
        console.error(error);
        setStatus("not-found");
        return;
      }
      setCoins(data ?? []);
      setOwned(await getOwnedCommemoratives(profile.user_id));
      setStatus("ok");
    })();
  }, [username]);

  if (status === "loading") return <p>Chargement…</p>;
  if (status === "not-found") return <p>Aucun utilisateur avec le pseudo « {username} ».</p>;
  if (status === "private") return <p>Cette collection n'est pas publique.</p>;

  const years = [...new Set(coins.map((c) => c.year))].sort();
  const countriesByName = new Map();
  coins.forEach((c) => {
    if (c.countries) countriesByName.set(c.countries.name, c.countries);
  });
  const countries = [...countriesByName.values()].sort((a, b) => a.sort_order - b.sort_order);

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
    </div>
  );
}
