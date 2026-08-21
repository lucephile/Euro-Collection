"use client";

/**
 * Affiche une pièce (image) avec :
 * - fond vert si possédée, rouge si non possédée
 * - au survol : infos (nom / tirage / date) si fournies (cas 2€ commémoratives)
 *
 * props:
 *  - imageUrl, alt
 *  - owned: boolean
 *  - info: { name, mintage, issueDate } (optionnel, pour les commémoratives)
 */
export default function CoinCell({ imageUrl, alt, owned, info, onToggle }) {
  return (
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
    </div>
  );
}
