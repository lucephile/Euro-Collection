"""
Traite numista_matches.csv (produit par match_numista.py) et sélectionne
automatiquement le bon candidat pour chaque pièce, selon ce motif fiable :
  - le titre commence par "2 Euros" (pas "2 Euro Cents", pas une autre valeur)
  - la période couvre exactement l'année ciblée (ex: années = "2004-2004")

Produit deux fichiers :
  - confirmed_matches.csv : une ligne par pièce, avec le statut
    AUTO_MATCHED (id choisi automatiquement) ou NEEDS_REVIEW (aucun
    candidat ne correspond au motif — à vérifier à la main)
  - update_numista_ids.sql : les UPDATE SQL pour les pièces AUTO_MATCHED
    uniquement (à exécuter dans Supabase)

Ne fait aucun appel réseau — ne consomme aucun quota API.
"""
import csv
from collections import defaultdict

# Nom anglais attendu pour l'"issuer" Numista, par pays (pour vérifier la cohérence)
ISSUER_NAMES = {
    "allemagne": "Germany", "andorre": "Andorra", "autriche": "Austria",
    "belgique": "Belgium", "bulgarie": "Bulgaria", "chypre": "Cyprus",
    "croatie": "Croatia", "espagne": "Spain", "estonie": "Estonia",
    "finlande": "Finland", "france": "France", "grece": "Greece",
    "irlande": "Ireland", "italie": "Italy", "lettonie": "Latvia",
    "lituanie": "Lithuania", "luxembourg": "Luxembourg", "malte": "Malta",
    "monaco": "Monaco", "pays-bas": "Netherlands", "portugal": "Portugal",
    "saint-marin": "San Marino", "slovaquie": "Slovakia", "slovenie": "Slovenia",
    "vatican": "Vatican City",
}

def is_good_candidate(row):
    title = row["candidate_title"]
    years = row["candidate_years"]
    issuer = row["candidate_issuer"]
    slug = row["country_slug"]
    year = row["year"]

    if not title.strip().lower().startswith("2 euros"):
        return False
    if "cent" in title.lower():
        return False
    if years != f"{year}-{year}":
        return False
    expected_issuer = ISSUER_NAMES.get(slug, "")
    if expected_issuer and expected_issuer.lower() not in issuer.lower():
        return False
    return True

def main():
    rows_by_coin = defaultdict(list)
    with open("numista_matches.csv", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = (row["year"], row["country_slug"], row["our_name"], row["image_url"])
            rows_by_coin[key].append(row)

    confirmed = 0
    needs_review = 0

    with open("confirmed_matches.csv", "w", newline="", encoding="utf-8") as out_csv, \
         open("update_numista_ids.sql", "w", encoding="utf-8") as out_sql:

        writer = csv.writer(out_csv)
        writer.writerow(["year", "country_slug", "our_name", "image_url", "status", "numista_id", "candidate_title"])

        out_sql.write("-- Généré par select_best_match.py — met à jour numista_id\n")
        out_sql.write("-- pour les pièces où une correspondance fiable a été trouvée.\n\n")

        for (year, slug, name, url), candidates in rows_by_coin.items():
            good = [c for c in candidates if is_good_candidate(c)]

            if len(good) == 1:
                match = good[0]
                writer.writerow([year, slug, name, url, "AUTO_MATCHED", match["numista_id"], match["candidate_title"]])
                url_esc = url.replace("'", "''")
                out_sql.write(
                    f"update commemorative_coins set numista_id = {match['numista_id']}, "
                    f"quotation_updated_at = now() where image_url = '{url_esc}';\n"
                )
                confirmed += 1
            else:
                # 0 ou plusieurs candidats valides -> à vérifier à la main
                status = "NEEDS_REVIEW (aucun candidat)" if not good else "NEEDS_REVIEW (plusieurs candidats)"
                writer.writerow([year, slug, name, url, status, "", ""])
                needs_review += 1

    print(f"{confirmed} pièces auto-associées, {needs_review} à vérifier manuellement.")
    print("Voir confirmed_matches.csv (colonne 'status') et update_numista_ids.sql")

if __name__ == "__main__":
    main()
