import { routing, type Locale } from "./routing";

/**
 * 多言語版が存在するパス（`src/app/[locale]` 配下に実体があるもの）。
 *
 * IMPORTANT: `src/proxy.ts` の `config.matcher` と必ず同期させること。
 * Next.js の制約により matcher は静的リテラルでなければならず、この定数から
 * 生成できないため、`src/proxy.ts` に開発時のドリフト検知を置いている。
 */
export const LOCALIZED_PATHNAMES = [
  "/about",
  "/about/privacy",
  "/access",
  "/info/guide",
  "/info/faq",
  "/info/contact",
] as const;

export type LocalizedPathname = (typeof LOCALIZED_PATHNAMES)[number];

/**
 * 多言語版が存在しないページから他言語へ切り替えたときの着地先。
 * 「ご来場の方へ」は4ロケールとも全セクションが翻訳済みで、
 * 外国人来場者向けのランディングとして最も情報量が多い。
 */
export const LOCALE_FALLBACK_PATHNAME: LocalizedPathname = "/info/guide";

export function isLocalizedPathname(pathname: string): pathname is LocalizedPathname {
  return (LOCALIZED_PATHNAMES as readonly string[]).includes(pathname);
}

/**
 * パスからロケール接頭辞を切り離す。
 *
 * `localePrefix: "as-needed"` ではデフォルトロケールに接頭辞が付かないため、
 * 接頭辞が無いパスは `ja` とみなす。
 *
 * デフォルトロケールのページは内部的に `/ja/about` へ rewrite されるため、
 * `usePathname()` の戻り値は静的生成時とハイドレーション後で食い違う。
 * この関数を通せばどちらも同じ結果へ正規化される。
 *
 * @example splitLocalePrefix("/en/access") // { locale: "en", pathname: "/access" }
 * @example splitLocalePrefix("/ja/about")  // { locale: "ja", pathname: "/about" }
 * @example splitLocalePrefix("/events")    // { locale: "ja", pathname: "/events" }
 */
export function splitLocalePrefix(pathname: string): { locale: Locale; pathname: string } {
  const segments = pathname.split("/");
  const first = segments[1];

  if (first && (routing.locales as readonly string[]).includes(first)) {
    const rest = `/${segments.slice(2).join("/")}`;

    return {
      locale: first as Locale,
      // "/ja" のようにロケールだけのパスはルートを指す
      pathname: rest === "/" ? "/" : rest.replace(/\/$/, ""),
    };
  }

  return { locale: routing.defaultLocale, pathname };
}

/**
 * `localePrefix: "as-needed"` に沿って href を組み立てる。
 *
 * デフォルトロケールには接頭辞を付けない。`/ja/xxx` を出力すると
 * ミドルウェアの307リダイレクトを踏むうえ、ハイドレーション不一致の原因になる。
 */
export function buildLocaleHref(pathname: string, locale: Locale): string {
  if (locale === routing.defaultLocale) {
    return pathname;
  }

  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

export interface LocalizedNavHref {
  readonly href: string;
  /** 多言語版が無い＝遷移先が日本語固定のページであることを宣言する */
  readonly hrefLang?: "ja";
}

/**
 * ヘッダー・フッター等のナビゲーションリンク用に href を組み立てる。
 *
 * 接頭辞を付けてよいのは `LOCALIZED_PATHNAMES` の6つだけ。`/` や `/events` に
 * 付けると `src/proxy.ts` の matcher 外なので即 404 になる。この判定を通すことで
 * 呼び出し側の注意力に依存せず 404 を防ぐ。
 *
 * `hrefLang` を付ける条件は接頭辞を付けない条件と完全に同一なので、両者を組で
 * 返す。描画側で別々に判定すると、片方だけ直して不整合になる余地が生まれる。
 *
 * @example localizeNavHref("/access", "en")  // { href: "/en/access" }
 * @example localizeNavHref("/events", "en")  // { href: "/events", hrefLang: "ja" }
 * @example localizeNavHref("/events", "ja")  // { href: "/events" }
 */
export function localizeNavHref(pathname: string, locale: Locale): LocalizedNavHref {
  if (isLocalizedPathname(pathname)) {
    return { href: buildLocaleHref(pathname, locale) };
  }

  // 日本語で閲覧中に日本語ページへのリンクへ hreflang を付けるのは冗長
  if (locale === routing.defaultLocale) {
    return { href: pathname };
  }

  return { href: pathname, hrefLang: "ja" };
}
