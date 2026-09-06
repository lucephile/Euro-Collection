export default function Home() {
  return (
    <div>
      <h1>Suivez votre collection de pièces Euro</h1>
      <p>
        Ce site recense l'ensemble des sets de pièces en euro émis par chaque pays depuis 1999,
        ainsi que toutes les pièces commémoratives de 2 € depuis 2004.
      </p>
      <p>
        Créez un compte gratuit pour cocher les pièces que vous possédez : les pièces en votre
        possession s'affichent en vert, celles qui vous manquent en rouge. Vous pouvez ensuite
        suivre votre progression sur la page statistiques.
      </p>
      <ul>
        <li><a href="/sets">Voir tous les sets de pièces Euro par pays</a></li>
        <li><a href="/commemoratives">Voir toutes les 2€ commémoratives</a></li>
        <li><a href="/login">Créer un compte / se connecter</a></li>
      </ul>

      <h2 style={{ marginTop: 32 }}>Une meilleure image pour une pièce ?</h2>
      <p>
        Si vous avez trouvé une photo de meilleure qualité pour une pièce du site, n'hésitez pas à
        nous l'envoyer par email — nous déciderons de l'intégrer ou non.
      </p>
      <p>
        {/* TODO : remplacer TON-EMAIL@exemple.com par la vraie adresse une fois choisie */}
        <a href="mailto:TON-EMAIL@exemple.com?subject=Suggestion%20d'image%20-%20Suivi%20Pi%C3%A8ces%20Euro">
          Nous envoyer une image par email
        </a>
      </p>
    </div>
  );
}
