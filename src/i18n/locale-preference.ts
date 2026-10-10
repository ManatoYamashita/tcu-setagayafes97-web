"use client";

import { useSyncExternalStore } from "react";
import { routing, type Locale } from "@/i18n/routing";

const STORAGE_KEY = "setagayafes.locale";
const listeners = new Set<() => void>();
// ブラウザでのみ初期化する。保存できない環境でもSPA遷移中は記憶を保つ。
let preference: Locale | null | undefined;

function getSnapshot(): Locale | null {
  if (preference === undefined) {
    preference = null;
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (
        stored &&
        stored !== routing.defaultLocale &&
        routing.locales.includes(stored as Locale)
      ) {
        preference = stored as Locale;
      }
    } catch {
      // ブラウザの保存制限はナビゲーションを止めない。
    }
  }
  return preference;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// SSRと初回hydrateではURLだけを使う。記憶はhydrateの後に反映する。
function getServerSnapshot(): null {
  return null;
}

export function rememberLocale(locale: Locale): void {
  const next = locale === routing.defaultLocale ? null : locale;
  if (getSnapshot() === next) return;
  preference = next;
  try {
    if (next === null) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, next);
  } catch {
    // sessionStorageが拒否されても、メモリ上の記憶と解除は有効。
  }
  listeners.forEach((listener) => listener());
}

export function usePreferredLocale(): Locale | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
