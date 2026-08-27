"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Enrobe un tableau large avec défilement horizontal, ET ajoute une seconde
 * barre de défilement synchronisée, collée en bas de l'écran (position sticky)
 * tant que le tableau est visible à l'écran — évite d'avoir à redescendre
 * tout en bas de la page pour pouvoir défiler horizontalement.
 */
export default function TableScrollWrapper({ children, className }) {
  const contentRef = useRef(null);
  const barRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const syncing = useRef(false);

  useEffect(() => {
    function updateWidth() {
      if (contentRef.current) setScrollWidth(contentRef.current.scrollWidth);
    }
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  function onContentScroll() {
    if (syncing.current) { syncing.current = false; return; }
    if (barRef.current && contentRef.current) {
      syncing.current = true;
      barRef.current.scrollLeft = contentRef.current.scrollLeft;
    }
  }
  function onBarScroll() {
    if (syncing.current) { syncing.current = false; return; }
    if (contentRef.current && barRef.current) {
      syncing.current = true;
      contentRef.current.scrollLeft = barRef.current.scrollLeft;
    }
  }

  return (
    <div>
      <div ref={contentRef} onScroll={onContentScroll} className={className} style={{ overflowX: "auto" }}>
        {children}
      </div>
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
