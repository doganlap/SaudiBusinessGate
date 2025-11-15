"use client";
import { useEffect, useState } from "react";
import GlassHero from "@/components/GlassHero";
import FooterStrap from "@/components/FooterStrap";
import type { Locale } from "@/lib/i18n";

export default function Page() {
  const [locale, setLocale] = useState<Locale>("en");

  // Persist preference
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  return (
    <main>
      <GlassHero locale={locale} setLocale={setLocale} />
      <FooterStrap />
    </main>
  );
}
