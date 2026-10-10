"use client";

import { useSyncExternalStore } from "react";
import { routing, type Locale } from "./routing";

/**
 * 来場者が選んだ外国語の記憶（#441）
 *
 * 寿命はタブ1つ分（`sessionStorage`）。Cookie にしないのは、`localeCookie: false` の意図
 * （ブラウザの言語だけを根拠に外国語ページへ送らない）とぶつけないためで、
 * この記憶はリンクの行き先を変えるだけで、リダイレクトには使わない。
 *
 * サーバー描画と hydrate の間は `null` を返す。差し替えは hydrate の後に React が
 * `getSnapshot` の値で描き直すときに起きるので、サーバーの HTML と食い違わない。
 */
const STORAGE_KEY = "setagayafes:preferred-locale";
const CHANGE_EVENT = "setagayafes:preferred-locale-change";

function isForeignLocale(value: string | null): value is Locale {
  return (
    value !== null &&
    value !== routing.defaultLocale &&
    (routing.locales as readonly string[]).includes(value)
  );
}

function getSnapshot(): Locale | null {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return isForeignLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

/** 同じタブ内の書き込みでは storage イベントが来ないため、自前のイベントで知らせる */
function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** 外国語を渡すと記憶し、`null` を渡すと消す */
export function setPreferredLocale(locale: Locale | null): void {
  if (getSnapshot() === locale) return;
  try {
    if (locale && isForeignLocale(locale)) {
      window.sessionStorage.setItem(STORAGE_KEY, locale);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function usePreferredLocale(): Locale | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
