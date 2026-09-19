"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const VALUES = ["1c", "2c", "5c", "10c", "20c", "50c", "1e", "2e"];
const FACE_VALUE = { "1c": 0.01, "2c": 0.02, "5c": 0.05, "10c": 0.10, "20c": 0.20, "50c": 0.50, "1e": 1, "2e": 2 };

function pct(owned, total) {
  return total ? ((owned / total) * 100).toFixed(2) + " %" : "—";
}
function euro(n) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function StatsPage() {
  const [status, setStatus] = useState("loading"); // loading | signed-out | ok
  const [username, setUsername] = useState(null);
  const [setsStats, setSetsStats] = useState(null); // { [value]: { owned, total } }
  const [commemByCountry, setCommemByCountry] = useState([]); // [{ name, owned, total }]
  const [value, setValue] = useState(null); // { setsFace, setsKitValue, commemFace, commemCount, commemResale }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("signed-out");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();
      setUsername(profile?.username ?? null);

      // --- Sets : total par valeur + possédé par valeur + détail par série/pays ---
      const [{ data: allPieces }, { data: ownedPieceRows }] = await Promise.all([
        supabase.from("pieces").select("id, value, series_id, coin_series ( country_id, countries ( slug ) )"),
        supabase
          .from("user_collection_pieces")
          .select("piece_id, possessed, pieces ( value, series_id )")
          .eq("user_id", user.id)
          .eq("possessed", true),
      ]);

      const totalsByValue = Object.fromEntries(VALUES.map((v) => [v, 0]));
      (allPieces ?? []).forEach((p) => { if (totalsByValue[p.value] !== undefined) totalsByValue[p.value]++; });
      const ownedByValue = Object.fromEntries(VALUES.map((v) => [v, 0]));
      (ownedPieceRows ?? []).forEach((r) => {
        const v = r.pieces?.value;
        if (v && ownedByValue[v] !== undefined) ownedByValue[v]++;
      });
      const sStats = {};
      VALUES.forEach((v) => { sStats[v] = { owned: ownedByValue[v], total: totalsByValue[v] }; });
      setSetsStats(sStats);

      // --- Commémoratives : total par pays + possédé par pays ---
      const [{ data: allCommems }, { data: ownedCommemRows }] = await Promise.all([
        supabase.from("commemorative_coins").select("id, quotation, countries ( name, sort_order )"),
        supabase
          .from("user_collection_commemoratives")
          .select("commemorative_id, possessed, commemorative_coins ( quotation )")
          .eq("user_id", user.id)
          .eq("possessed", true),
      ]);

      const byCountry = new Map();
      (allCommems ?? []).forEach((c) => {
        const name = c.countries?.name ?? "?";
        const so = c.countries?.sort_order ?? 0;
        if (!byCountry.has(name)) byCountry.set(name, { name, sort_order: so, owned: 0, total: 0 });
        byCountry.get(name).total++;
      });

      let commemResale = 0;
      (ownedCommemRows ?? []).forEach((r) => {
        commemResale += Number(r.commemorative_coins?.quotation ?? 0);
      });

      // pour compter "possédé par pays" il faut le country_id -> on refait un
      // petit passage via allCommems pour associer chaque commemorative_id à son pays
      const countryByCoinId = new Map();
      (allCommems ?? []).forEach((c) => countryByCoinId.set(c.id, c.countries?.name ?? "?"));
      (ownedCommemRows ?? []).forEach((r) => {
        const name = countryByCoinId.get(r.commemorative_id);
        if (name && byCountry.has(name)) byCountry.get(name).owned++;
      });

      setCommemByCountry([...byCountry.values()].sort((a, b) => a.sort_order - b.sort_order));

      // --- Valeur de la collection ---
      const setsFace = VALUES.reduce((sum, v) => sum + ownedByValue[v] * FACE_VALUE[v], 0);

      // --- Valeur "kit" des sets, série par série ---
      // Set complet : 10€ (60€ pour les micro-états) ; incomplet : somme des
      // pièces possédées, chacune à sa valeur faciale +10% (+100% pour les
      // micro-états). Andorre n'est PAS un micro-état.
      const MICRO_STATES = new Set(["monaco", "vatican", "saint-marin"]);

      const seriesInfo = new Map(); // series_id -> { slug, totalCount }
      (allPieces ?? []).forEach((p) => {
        const slug = p.coin_series?.countries?.slug;
        if (!seriesInfo.has(p.series_id)) seriesInfo.set(p.series_id, { slug, totalCount: 0 });
        seriesInfo.get(p.series_id).totalCount++;
      });

      const ownedBySeriesId = new Map(); // series_id -> [face values possédées]
      (ownedPieceRows ?? []).forEach((r) => {
        const sid = r.pieces?.series_id;
        const v = r.pieces?.value;
        if (sid == null || v == null) return;
        if (!ownedBySeriesId.has(sid)) ownedBySeriesId.set(sid, []);
        ownedBySeriesId.get(sid).push(FACE_VALUE[v]);
      });

      let setsKitValue = 0;
      for (const [sid, ownedValues] of ownedBySeriesId.entries()) {
        const info = seriesInfo.get(sid);
        if (!info || ownedValues.length === 0) continue;
        const isMicro = MICRO_STATES.has(info.slug);
        const isComplete = ownedValues.length === info.totalCount;
        if (isComplete) {
          setsKitValue += isMicro ? 60 : 10;
        } else {
          const multiplier = isMicro ? 2 : 1.1; // +100% ou +10%
          setsKitValue += ownedValues.reduce((sum, fv) => sum + fv * multiplier, 0);
        }
      }
      const commemCount = (ownedCommemRows ?? []).length;
      const commemFace = commemCount * 2;
      setValue({ setsFace, setsKitValue, commemFace, commemCount, commemResale });

      setStatus("ok");
    })();
  }, []);

  if (status === "loading") return <p>Chargement…</p>;
  if (status === "signed-out") {
    return <p>Vous devez être connecté pour voir vos statistiques. <a href="/login">Se connecter</a></p>;
  }

  return (
    <div>
      <h1>Mes statistiques</h1>
      {username && (
        <p style={{ color: "var(--text-muted)" }}>
          Partagez votre avancée : <code>/sets/{username}</code> et <code>/commemoratives/{username}</code>
        </p>
      )}

      <h2>Valeur estimée de ma collection</h2>

      <h3 style={{ marginBottom: 8 }}>Sets Euro par pays</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Valeur faciale</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{euro(value?.setsFace ?? 0)}</div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Valeur "kit" estimée (par série)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{euro(value?.setsKitValue ?? 0)}</div>
        </div>
      </div>

      <h3 style={{ marginBottom: 8 }}>2€ commémoratives</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Valeur faciale ({value?.commemCount ?? 0} pièce{(value?.commemCount ?? 0) > 1 ? "s" : ""} × 2€)
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{euro(value?.commemFace ?? 0)}</div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Valeur de revente estimée</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{euro(value?.commemResale ?? 0)}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        La valeur faciale correspond à ce que vos pièces valent en tant que monnaie. La valeur
        "kit" estimée applique, série par série : 10€ si la série est complète (60€ pour les
        micro-états — Monaco, Vatican, Saint-Marin ; l'Andorre est traitée comme un pays classique),
        sinon la somme des pièces possédées à leur valeur faciale +10% (+100% pour les
        micro-états). La valeur de revente des commémoratives est une estimation basée sur une
        cotation figée au moment de l'import des données — elle ne se met pas encore à jour
        automatiquement.
      </p>

      <h2 style={{ marginTop: 32 }}>Sets Euro — par valeur de pièce</h2>
      {setsStats && (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th></th>
              {VALUES.map((v) => (
                <th key={v} style={{ padding: 8 }}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600, padding: 8 }}>Possédé</td>
              {VALUES.map((v) => (
                <td key={v} style={{ padding: 8, textAlign: "center" }}>{setsStats[v].owned}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600, padding: 8 }}>Recherché</td>
              {VALUES.map((v) => (
                <td key={v} style={{ padding: 8, textAlign: "center" }}>{setsStats[v].total - setsStats[v].owned}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600, padding: 8 }}>Avancement</td>
              {VALUES.map((v) => (
                <td key={v} style={{ padding: 8, textAlign: "center" }}>
                  {pct(setsStats[v].owned, setsStats[v].total)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 32 }}>2€ commémoratives — par pays</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Pays</th>
              <th style={{ padding: "8px 12px", width: 90 }}>Possédé</th>
              <th style={{ padding: "8px 12px", width: 90 }}>Recherché</th>
              <th style={{ padding: "8px 12px", width: 100 }}>Avancement</th>
            </tr>
          </thead>
          <tbody>
            {commemByCountry.map((c) => (
              <tr key={c.name}>
                <td style={{ padding: "6px 12px" }}>{c.name}</td>
                <td style={{ padding: "6px 12px", textAlign: "center" }}>{c.owned}</td>
                <td style={{ padding: "6px 12px", textAlign: "center" }}>{c.total - c.owned}</td>
                <td style={{ padding: "6px 12px", textAlign: "center" }}>{pct(c.owned, c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
