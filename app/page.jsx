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
    </div>
  );
}
