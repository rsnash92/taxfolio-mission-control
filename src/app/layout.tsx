import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxFolio Mission Control",
  description: "Agent orchestration dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
