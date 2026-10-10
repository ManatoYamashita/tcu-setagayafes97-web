import type { Metadata } from "next";
import { getChromeMessages } from "@/i18n/chrome-messages";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/data/site";

const localeOpenGraph = {
  ja: "ja_JP",
  en: "en_US",
  zh: "zh_CN",
  ko: "ko_KR",
} as const;

type MetadataImage =
  | string
  | {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    };

interface PageMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  locale?: Locale;
  type?: "website" | "article";
  image?: MetadataImage;
  /**
   * 検索エンジンからの除外
   *
   * コンテンツが見つからないときの詳細ページ（`/events/[id]` など）で使う。
   *
   * `notFound()` は現在 HTTP 404 を返す（2026-09-19 実測）が、**ステータスとは別に
   * メタデータ側の手当てが要る。** `generateMetadata` は `notFound()` より先に評価され、
   * 存在しないIDに対しても canonical を出しうるためである。
   *
   * 履歴: ルート直下の `src/app/loading.tsx` があった間は `notFound()` 自体が
   * ステータスへ反映されず、実測（2026-09-03）で `/events/__no_such_id__` が
   * **200 を返し、自分自身を canonical に指定していた**。任意の文字列で薄いURLを
   * 無限に生成できる状態だった。`loading.tsx` は #217 で削除済み。
   *
   * `noindex: true` のときは canonical も出さない。存在しないURLに
   * 自己参照 canonical を与えると、Google にその URL を正規版として宣言してしまう。
   *
   * 日本語以外のロケールは、この指定に関わらず常に noindex になる（`isIndexableLocale`）。
   */
  noindex?: boolean;
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function buildLocalePath(pathname: string, locale: Locale): string {
  const normalized = normalizePathname(pathname);
  return locale === routing.defaultLocale ? normalized || "/" : `/${locale}${normalized}`;
}

function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, siteConfig.metadata.siteUrl).toString();
}

/** OGP カードが期待する標準サイズ */
const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;

/** microCMS の画像配信ホスト */
const MICROCMS_IMAGE_HOST = "images.microcms-assets.io";

/**
 * レターボックスの余白色。globals.css の `--color-primary-600` と同値。
 * `#` を付けないのは microCMS（imgix 準拠）の `fill-color` の記法に合わせるため。
 */
const OGP_FILL_COLOR = "8E3AB0";

/**
 * microCMS の画像を OGP 用の 1200x630 に整える
 *
 * サムネイルの比率は入稿者に委ねられており、著名人企画は正方形で入稿されている。
 * `twitter:card = summary_large_image` は 2:1 前後を想定するため、正方形をそのまま
 * 渡すと上下が切り落とされ、人物写真では頭部が欠ける。
 *
 * `fit=fill` で 1200x630 のキャンバス中央へ画像全体を収め、余った左右（縦長なら
 * 上下）をブランドカラーで埋める。トリミングしないので、どの比率で入稿されても
 * 被写体が欠けない。
 *
 * microCMS 以外のURL（`/ogp-v3.webp` などの静的ファイル）は変換せずに返す。
 */
function toOgpImageUrl(url: string): string {
  let parsed: URL;

  try {
    parsed = new URL(url, siteConfig.metadata.siteUrl);
  } catch {
    return url;
  }

  if (parsed.hostname !== MICROCMS_IMAGE_HOST) return url;

  parsed.searchParams.set("w", String(OGP_IMAGE_WIDTH));
  parsed.searchParams.set("h", String(OGP_IMAGE_HEIGHT));
  parsed.searchParams.set("fit", "fill");
  parsed.searchParams.set("fill", "solid");
  parsed.searchParams.set("fill-color", OGP_FILL_COLOR);

  return parsed.toString();
}

function buildImages(image: MetadataImage | undefined, title: string) {
  const source = image ?? {
    url: siteConfig.metadata.ogImage,
    width: OGP_IMAGE_WIDTH,
    height: OGP_IMAGE_HEIGHT,
    alt: title,
  };
  const normalized = typeof source === "string" ? { url: source } : source;
  const ogpUrl = toOgpImageUrl(normalized.url);
  /*
   * 変換したときだけ寸法を上書きする。入稿時の実寸（例: 1280x1280）を残すと、
   * 実体が 1200x630 なのに SNS 側が正方形の領域を確保してしまう。
   */
  const isConverted = ogpUrl !== normalized.url;

  return [
    {
      ...normalized,
      url: absoluteUrl(ogpUrl),
      width: isConverted ? OGP_IMAGE_WIDTH : normalized.width,
      height: isConverted ? OGP_IMAGE_HEIGHT : normalized.height,
      alt: normalized.alt ?? title,
    },
  ];
}

/**
 * 検索エンジンに載せるロケール
 *
 * 日本語だけを索引させ、en / zh / ko は noindex にする（#433）。ページ自体は残し、
 * 言語切替からは引き続き開ける。
 *
 * hreflang で言語版を対応づけていた間も、日本語のクエリのサイトリンクに
 * `/zh/about`（「第97届东京都市大学世田谷祭」）が混ざった（2026-10-10 観測）。
 * hreflang は Google にとってヒントでしかなく、漢字のクエリ「世田谷祭」は
 * 中国語ページの本文にもそのまま当たる。確実に除外できる手段は noindex だけである。
 *
 * noindex のページを指す hreflang は無意味なので、`alternates.languages`・
 * next-intl の `Link:` ヘッダ（`src/i18n/routing.ts` の `alternateLinks`）・
 * サイトマップの言語別URLもあわせて撤去してある。
 */
export function isIndexableLocale(locale: Locale): boolean {
  return locale === routing.defaultLocale;
}

export function createPageMetadata({
  title,
  description,
  pathname,
  locale = routing.defaultLocale,
  type = "website",
  image,
  noindex: noindexRequested = false,
}: PageMetadataOptions): Metadata {
  const noindex = noindexRequested || !isIndexableLocale(locale);
  // サイト名はロケール別。ja では siteConfig.metadata の値と一致する（chrome JSON が出典）
  const { name: siteName, shortName: ogSiteName } = getChromeMessages(locale).brand;
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`;
  const canonicalPath = buildLocalePath(pathname, locale);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const images = buildImages(image, fullTitle);

  return {
    title: { absolute: fullTitle },
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: noindex
      ? // 継承した canonical を打ち消す。`null` は Next.js の型でも許容される。
        { canonical: null }
      : { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: ogSiteName,
      images,
      locale: localeOpenGraph[locale],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map(({ url }) => url),
    },
  };
}
