import { siteConfig } from "@/data/site";

export const siteUrl = new URL("/", siteConfig.metadata.siteUrl).toString();
export const organizationId = `${siteUrl}#organization`;
export const websiteId = `${siteUrl}#website`;
export const festivalId = `${siteUrl}#festival`;

export function absoluteSiteUrl(pathname: string): string {
  return new URL(pathname, siteUrl).toString();
}

/**
 * JSON-LDをscript要素へ安全に埋め込む。
 * CMS由来の文字列に`</script>`相当が含まれても要素を閉じないよう`<`をescapeする。
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createHomeStructuredData() {
  const logoUrl = absoluteSiteUrl("/images/brand/favicon.png");
  const ogImageUrl = absoluteSiteUrl(siteConfig.metadata.ogImage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: siteConfig.metadata.searchSiteName,
        alternateName: [
          `第${siteConfig.edition}回 世田谷祭`,
          siteConfig.metadata.siteName,
          "東京都市大学 世田谷祭",
        ],
        description: siteConfig.description,
        inLanguage: "ja",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.organization.name,
        alternateName: siteConfig.organization.currentName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          contentUrl: logoUrl,
          width: 500,
          height: 500,
        },
        image: ogImageUrl,
        sameAs: Object.values(siteConfig.sns),
        address: {
          "@type": "PostalAddress",
          streetAddress: "玉堤1-28-1",
          addressLocality: "世田谷区",
          addressRegion: "東京都",
          postalCode: "158-8557",
          addressCountry: "JP",
        },
      },
      {
        "@type": "Event",
        "@id": festivalId,
        name: siteConfig.name,
        alternateName: `第${siteConfig.edition}回 世田谷祭`,
        description: siteConfig.description,
        url: siteUrl,
        image: [ogImageUrl],
        startDate: `${siteConfig.dates.day1}T${siteConfig.openTime}:00+09:00`,
        endDate: `${siteConfig.dates.day2}T${siteConfig.closeTime}:00+09:00`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: siteConfig.venue,
          address: {
            "@type": "PostalAddress",
            streetAddress: "玉堤1-28-1",
            addressLocality: "世田谷区",
            addressRegion: "東京都",
            postalCode: "158-8557",
            addressCountry: "JP",
          },
        },
        organizer: { "@id": organizationId },
      },
    ],
  };
}
