import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_Arabic } from "next/font/google";

const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Dogan Hub | Demo & POC Workspace",
    template: "%s | Dogan Hub",
  },
  description:
    "Central workspace to manage all demos and POCs across Shahin, Saudi Business Gate, and enterprise solutions.",
  applicationName: "Saudi Business Gate",
  keywords: [
    "Saudi Business Gate",
    "Shahin AI",
    "GRC",
    "Compliance",
    "Risk",
    "ERP",
    "KSA",
  ],
  openGraph: {
    title: "Saudi Business Gate — Demo & POC Workspace",
    description:
      "Central workspace to manage all demos and POCs across Shahin, Saudi Business Gate, and enterprise solutions.",
    url: "/",
    siteName: "Saudi Business Gate",
    type: "website",
    locale: "ar_SA",
    images: [
      {
        url: "/images/og-cover.webp",
        width: 1200,
        height: 630,
        alt: "Saudi Business Gate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saudi Business Gate — Demo & POC Workspace",
    description:
      "Central workspace to manage all demos and POCs across Shahin, Saudi Business Gate, and enterprise solutions.",
    images: ["/images/og-cover.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${notoArabic.className} bg-white text-slate-900 antialiased`}>
        <a href="#main-content" className="fixed start-4 top-4 z-50 -translate-y-20 rounded-full bg-emerald-400 px-3 py-1 text-sm font-semibold text-slate-950 shadow focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-300">
          تخطي إلى المحتوى
        </a>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark') document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
