"use client";

import { useEffect } from "react";
import { Dela_Gothic_One, Kaisei_Opti } from "next/font/google";

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dela-gothic-one",
  display: "swap",
  preload: false,
});

const kaiseiOpti = Kaisei_Opti({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kaisei-opti",
  display: "swap",
  preload: false,
});

export function DeferredDecorativeFonts() {
  useEffect(() => {
    const body = document.body;
    body.classList.add(delaGothicOne.variable, kaiseiOpti.variable);
    return () => body.classList.remove(delaGothicOne.variable, kaiseiOpti.variable);
  }, []);

  return null;
}
