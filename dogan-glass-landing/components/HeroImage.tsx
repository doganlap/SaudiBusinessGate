"use client";
import Image from "next/image";
import { useState } from "react";

export default function HeroImage() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="absolute inset-0" aria-hidden="true" role="presentation">
      <Image
        src="/images/hero.jpg"
        alt="Saudi skyline"
        fill
        priority
        onError={() => setHidden(true)}
        style={{ objectFit: "cover", objectPosition: "right" }}
        className="opacity-20 mix-blend-screen"
      />
    </div>
  );
}