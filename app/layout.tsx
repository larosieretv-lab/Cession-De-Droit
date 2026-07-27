import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

// One workhorse sans for the whole interface, paired on a contrast axis with a
// reading serif used only for the page title and the contract itself.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cession de droit à l'image — Office de Tourisme de La Rosière",
  description:
    "Formulaire de cession de droit à l'image. Remplissez vos informations et signez directement depuis votre téléphone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
