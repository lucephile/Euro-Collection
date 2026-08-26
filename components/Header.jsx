"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

// Un seul tableau à modifier pour changer la nav sur TOUTES les pages
const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/sets", label: "Sets Euro par pays" },
  { href: "/commemoratives", label: "2€ commémoratives" },
  { href: "/country", label: "Explorer par pays" },
  { href: "/stats", label: "Mes statistiques" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header style={{ background: "var(--bg-header)", borderBottom: "1px solid #e8dfc0" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <Link href="/" style={{ fontWeight: 700, color: "var(--text-main)" }}>
          🪙 Suivi Pièces Euro
        </Link>

        {/* Bouton burger — visible seulement en mobile via CSS (voir <style>) */}
        <button
          className="burger"
          aria-label="Ouvrir le menu"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <nav className={`nav ${open ? "nav-open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/account" onClick={() => setOpen(false)}>Mon profil</Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>Connexion</Link>
          )}
        </nav>
      </div>

      <style jsx>{`
        .burger {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .nav {
          display: flex;
          gap: 20px;
        }
        @media (max-width: 720px) {
          .burger { display: block; }
          .nav {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 56px;
            left: 0;
            right: 0;
            background: var(--bg-header);
            padding: 12px 16px;
            gap: 12px;
            border-bottom: 1px solid #e8dfc0;
          }
          .nav-open { display: flex; }
        }
      `}</style>
    </header>
  );
}
