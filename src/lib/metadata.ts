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
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function buildLocalePath(pathname: string, locale: Locale): string {
  const normalized = normalizePathname(pathname);
  return locale === routing.defaultLocale ? normalized || "/" : `/${locale}${normalized}`;
}

function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, siteConfig.metadata.siteUrl).toString();
}

function buildImages(image: MetadataImage | undefined, title: string) {
  const source = image ?? {
    url: siteConfig.metadata.ogImage,
    width: 1200,
    height: 630,
    alt: title,
  };
  const normalized = typeof source === "string" ? { url: source } : source;

  return [
    {
      ...normalized,
      url: absoluteUrl(normalized.url),
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
}: PageMetadataOptions): Metadata {
  const siteName = siteConfig.metadata.siteName;
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`;
  const canonicalPath = buildLocalePath(pathname, locale);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const images = buildImages(image, fullTitle);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
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
