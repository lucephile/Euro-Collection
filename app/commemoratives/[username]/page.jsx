"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CoinCell from "../../../components/CoinCell";
import TableScrollWrapper from "../../../components/TableScrollWrapper";
import { supabase } from "../../../lib/supabaseClient";
import { NATIVE_NAMES } from "../../../lib/constants";
import { getProfileByUsername, getOwnedCommemoratives } from "../../../lib/collectionData";

export default function PublicCommemorativesPage() {
  const { username } = useParams();
  const [status, setStatus] = useState("loading");
  const [owned, setOwned] = useState({});
  const [sets, setSets] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    (async () => {
      const profile = await getProfileByUsername(username);
      if (!profile) return setStatus("not-found");
      if (!profile.is_public) return setStatus("private");

      const { data, error } = await supabase
        .from("commemorative_sets")
        .select(`
          id, year, name, sort_order,
          commemorative_coins ( id, name, mintage, issue_date, image_url, countries ( name, slug, iso_code, sort_order ) )
        `)
        .order("year")
        .order("sort_order");

      if (error) {
        console.error(error);
        setStatus("not-found");
        return;
      }

      const countriesByName = new Map();
      (data ?? []).forEach((s) =>
        (s.commemorative_coins ?? []).forEach((c) => {
          if (c.countries) countriesByName.set(c.countries.name, c.countries);
        })
      );
      setCountries([...countriesByName.values()].sort((a, b) => a.sort_order - b.sort_order));

      setSets(
        (data ?? []).map((s) => ({
          id: s.id,
          year: s.year,
          name: s.name,
          coinsByCountry: Object.fromEntries((s.commemorative_coins ?? []).map((c) => [c.countries?.name, c])),
        }))
      );

      setOwned(await getOwnedCommemoratives(profile.user_id));
      setStatus("ok");
    })();
  }, [username]);

  if (status === "loading") return <p>Chargement…</p>;
  if (status === "not-found") return <p>Aucun utilisateur avec le pseudo « {username} ».</p>;
  if (status === "private") return <p>Cette collection n'est pas publique.</p>;

  return (
    <div>
      <h1>2€ commémoratives de {username}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Vue en lecture seule — partagez ce lien : <code>/commemoratives/{username}</code>
      </p>

      <TableScrollWrapper
        tableClassName="sets-table commem-table"
        headerRow={
          <>
            <th style={{ textAlign: "left", padding: 8 }}>Année - Raison</th>
            {countries.map((c) => (
              <th key={c.name} className="coin-col-commem" style={{ padding: 8, fontWeight: 400 }}>
                {c.iso_code && (
                  <img
                    src={`https://flagcdn.com/w40/${c.iso_code.toLowerCase()}.png`}
                    alt={c.name}
                    title={c.name}
                    width={40}
                  />
                )}
                <div style={{ fontSize: 20, lineHeight: 1.2, marginTop: 4 }}>
                  <div>{c.name}</div>
                  {NATIVE_NAMES[c.slug] && (
                    <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{NATIVE_NAMES[c.slug]}</div>
                  )}
                </div>
              </th>
            ))}
          </>
        }
      >
        {sets.map((set) => (
          <tr key={set.id}>
            <td style={{ padding: 8 }}>
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
                <td key={country.name} className="coin-col-commem" style={{ padding: 4 }}>
                  {coin ? (
                    <CoinCell
                      imageUrl={coin.image_url}
                      alt={`${coin.name} ${country.name}`}
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
      </TableScrollWrapper>
    </div>
  );
}
