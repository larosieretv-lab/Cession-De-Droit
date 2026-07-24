import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cession de droit à l'image — Office de Tourisme de La Rosière",
  description:
    "Formulaire de cession de droit à l'image. Remplissez vos informations et signez directement depuis votre téléphone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
