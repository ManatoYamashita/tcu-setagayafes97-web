import type { Metadata } from "next";
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
  localized?: boolean;
  type?: "website" | "article";
  image?: MetadataImage;
  /**
   * 検索エンジンからの除外
   *
   * コンテンツが見つからないときの詳細ページ（`/events/[id]` など）で使う。
   * このアプリはルート直下の `src/app/loading.tsx` によりストリーミングのシェルが
   * 先に送出されるため、ページ本体で投げた `notFound()` が HTTP ステータスへ
   * 反映されない。実測（2026-09-03）では `/events/__no_such_id__` が
   * **200 を返し、自分自身を canonical に指定していた**。
   * つまり任意の文字列で薄いURLを無限に生成できる状態だった。
   *
   * `noindex: true` のときは canonical も出さない。存在しないURLに
   * 自己参照 canonical を与えると、Google にその URL を正規版として宣言してしまう。
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
 * microCMS 以外のURL（`/ogp.webp` などの静的ファイル）は変換せずに返す。
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

export function createPageMetadata({
  title,
  description,
  pathname,
  locale = routing.defaultLocale,
  localized = false,
  type = "website",
  image,
  noindex = false,
}: PageMetadataOptions): Metadata {
  const siteName = siteConfig.metadata.siteName;
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
      : {
          canonical: canonicalUrl,
          ...(localized
            ? {
                languages: {
                  ...Object.fromEntries(
                    routing.locales.map((targetLocale) => [
                      targetLocale,
                      absoluteUrl(buildLocalePath(pathname, targetLocale)),
                    ])
                  ),
                  "x-default": absoluteUrl(buildLocalePath(pathname, routing.defaultLocale)),
                },
              }
            : {}),
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.metadata.searchSiteName,
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
