"use client";

import { useEffect } from "react";
import { loadKaiseiFont } from "./loadKaiseiFont";

/** Load the heading font on every route except the home initial viewport. */
export function DeferredKaiseiFontsLoader() {
  useEffect(() => {
    if (window.location.pathname === "/") return;
    void loadKaiseiFont();
  }, []);

  return null;
}
