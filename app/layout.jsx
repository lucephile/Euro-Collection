import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Suivi Pièces Euro",
  description: "Site communautaire de suivi de collection de pièces Euro (sets + 2€ commémoratives)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="container" style={{ padding: "24px 16px", minHeight: "70vh" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
