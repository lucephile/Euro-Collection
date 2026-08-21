export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-header)", borderTop: "1px solid #e8dfc0", marginTop: 40 }}>
      <div className="container" style={{ padding: "20px 16px", fontSize: 14, color: "var(--text-muted)" }}>
        <p>Suivi Pièces Euro — site communautaire pour collectionneurs.</p>
        <p>© {new Date().getFullYear()} — Fait avec 🪙 par des passionnés.</p>
      </div>
    </footer>
  );
}
