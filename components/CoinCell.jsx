"use client";

import { useState } from "react";

/**
 * Affiche une pièce (image) avec :
 * - fond vert si possédée, rouge si non possédée
 * - au survol : infos (nom / tirage / date) si fournies (cas 2€ commémoratives)
 * - un bouton "loupe" (visible au survol) pour agrandir l'image en grand
 *
 * props:
 *  - imageUrl, alt
 *  - owned: boolean
 *  - info: { name, mintage, issueDate } (optionnel, pour les commémoratives)
 *  - onToggle: bascule possédée / non possédée (clic sur la cellule)
 */
export default function CoinCell({ imageUrl, alt, owned, info, onToggle }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <div
        className={`coin-cell ${owned ? "owned" : "missing"}`}
        title={
          info
            ? `${info.name}\nTirage : ${info.mintage?.toLocaleString("fr-FR") ?? "?"}\nÉmission : ${info.issueDate ?? "?"}`
            : undefined
        }
        onClick={onToggle}
        style={{ cursor: onToggle ? "pointer" : "default" }}
      >
        <img src={imageUrl} alt={alt} loading="lazy" />
        <button
          type="button"
          className="zoom-btn"
          aria-label="Agrandir l'image"
          onClick={(e) => {
            e.stopPropagation(); // ne pas déclencher le toggle possédée/non possédée
            setZoomed(true);
          }}
        >
          +
        </button>
      </div>

      {zoomed && (
        <div className="coin-lightbox-overlay" onClick={() => setZoomed(false)}>
          <div className="coin-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt={alt} />
            {info && (
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
                <strong>{info.name}</strong>
                <br />
                Tirage : {info.mintage?.toLocaleString("fr-FR") ?? "?"} — Émission : {info.issueDate ?? "?"}
              </p>
            )}
            <button className="coin-lightbox-close" onClick={() => setZoomed(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
