"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadKaiseiFont } from "./loadKaiseiFont";

/** Load the heading font on every route except the home initial viewport. */
export function DeferredKaiseiFontsLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") return;
    void loadKaiseiFont();
  }, [pathname]);

  return null;
}
