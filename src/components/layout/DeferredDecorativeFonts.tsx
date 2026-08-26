"use client";

import { useEffect } from "react";
import { Dela_Gothic_One } from "next/font/google";

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dela-gothic-one",
  display: "swap",
  preload: false,
});

export function DeferredDecorativeFonts() {
  useEffect(() => {
    const body = document.body;
    body.classList.add(delaGothicOne.variable);
    return () => body.classList.remove(delaGothicOne.variable);
  }, []);

  return null;
}
