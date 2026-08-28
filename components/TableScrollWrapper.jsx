"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tableau large avec défilement horizontal ET en-tête fixe fiable.
 *
 * Pourquoi un composant dédié : combiner `position: sticky` sur une ligne
 * d'en-tête AVEC `overflow-x: auto` sur son conteneur ne fonctionne pas de
 * façon fiable en CSS pur — dès qu'un axe passe à `auto`, l'autre axe est
 * silencieusement forcé à `auto` lui aussi (même écrit "visible"
 * explicitement), ce qui casse la référence utilisée par `position: sticky`.
 *
 * Solution robuste : l'en-tête et le corps sont deux <table> DISTINCTS.
 * L'en-tête est fixé sous le bandeau de nav (position: sticky, sans son
 * propre défilement). Le corps défile horizontalement normalement. Leur
 * position de défilement horizontal est synchronisée en JS, ainsi qu'avec
 * la barre de défilement collée en bas de l'écran.
 */
export default function TableScrollWrapper({ headerRow, children, className, tableClassName }) {
  const bodyRef = useRef(null);
  const headerRef = useRef(null);
  const barRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const syncing = useRef(false);

  useEffect(() => {
    function measure() {
      if (bodyRef.current) setScrollWidth(bodyRef.current.scrollWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (bodyRef.current) ro.observe(bodyRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  });

  function applyScrollLeft(left) {
    syncing.current = true;
    if (headerRef.current) headerRef.current.scrollLeft = left;
    if (barRef.current) barRef.current.scrollLeft = left;
    if (bodyRef.current) bodyRef.current.scrollLeft = left;
  }

  function onBodyScroll() {
    if (syncing.current) { syncing.current = false; return; }
    applyScrollLeft(bodyRef.current.scrollLeft);
  }
  function onBarScroll() {
    if (syncing.current) { syncing.current = false; return; }
    applyScrollLeft(barRef.current.scrollLeft);
  }

  return (
    <div>
      {/* En-tête : fixé sous le bandeau de nav, pas de scrollbar propre */}
      <div
        ref={headerRef}
        style={{
          position: "sticky",
          top: 57,
          zIndex: 4,
          overflow: "hidden",
          background: "var(--bg-page)",
        }}
      >
        <table className={tableClassName} style={{ borderCollapse: "collapse", width: "max-content" }}>
          <thead>
            <tr>{headerRow}</tr>
          </thead>
        </table>
      </div>

      {/* Corps : défilement horizontal normal, scrollbar native masquée */}
      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        className={`hide-native-scrollbar ${className ?? ""}`}
        style={{ overflowX: "auto" }}
      >
        <table className={tableClassName} style={{ borderCollapse: "collapse", width: "max-content" }}>
          <tbody>{children}</tbody>
        </table>
      </div>

      {/* Barre de défilement collée en bas de l'écran, synchronisée */}
      <div
        ref={barRef}
        onScroll={onBarScroll}
        style={{
          position: "sticky",
          bottom: 0,
          overflowX: "auto",
          overflowY: "hidden",
          height: 16,
          background: "var(--bg-page)",
          borderTop: "1px solid #e8dfc0",
        }}
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>
    </div>
  );
}
