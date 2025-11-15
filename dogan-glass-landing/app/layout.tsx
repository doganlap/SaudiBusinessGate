import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dogan Business Insights — Glass Landing",
  description: "Glass-morphism landing with agents and live dashboard underlay (AR/EN).",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
