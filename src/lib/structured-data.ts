import { siteConfig } from "@/data/site";
import { buildLocalePath } from "@/lib/metadata";
import { type Locale } from "@/i18n/routing";

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

/**
 * 検索での呼ばれ方
 *
 * 年次で変わる「第97回 世田谷祭」と、年次をまたいで一貫する「世田谷祭」の両方を
 * 同じエンティティとして認識させる。かな表記を入れているのは、日本語の検索で
 * 漢字を確定させずに引かれることがあるため。
 */
const FESTIVAL_ALTERNATE_NAMES = [
  `第${siteConfig.edition}回 世田谷祭`,
  siteConfig.metadata.siteName,
  "東京都市大学 世田谷祭",
  "せたがやさい",
  "都市大 世田谷祭",
  "東京都市大学 学園祭",
] as const;

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "玉堤1-28-1",
  addressLocality: "世田谷区",
  addressRegion: "東京都",
  postalCode: "158-8557",
  addressCountry: "JP",
} as const;

export function createWebSiteNode() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteConfig.metadata.searchSiteName,
    alternateName: [...FESTIVAL_ALTERNATE_NAMES],
    description: siteConfig.description,
    inLanguage: "ja",
    publisher: { "@id": organizationId },
  };
}

export function createOrganizationNode() {
  const logoUrl = absoluteSiteUrl("/images/brand/favicon.png");

  return {
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.organization.name,
    alternateName: [
      siteConfig.organization.currentName,
      "世田谷祭実行委員会",
      "世田谷祭 実行委員会",
    ],
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      contentUrl: logoUrl,
      width: 500,
      height: 500,
    },
    image: absoluteSiteUrl(siteConfig.metadata.ogImage),
    sameAs: Object.values(siteConfig.sns),
    address: POSTAL_ADDRESS,
  };
}

export function createFestivalEventNode() {
  return {
    "@type": "Event",
    "@id": festivalId,
    name: siteConfig.name,
    alternateName: `第${siteConfig.edition}回 世田谷祭`,
    description: siteConfig.description,
    url: siteUrl,
    image: [absoluteSiteUrl(siteConfig.metadata.ogImage)],
    startDate: `${siteConfig.dates.day1}T${siteConfig.openTime}:00+09:00`,
    endDate: `${siteConfig.dates.day2}T${siteConfig.closeTime}:00+09:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: siteConfig.venue,
      address: POSTAL_ADDRESS,
    },
    organizer: { "@id": organizationId },
  };
}

export function createHomeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [createWebSiteNode(), createOrganizationNode(), createFestivalEventNode()],
  };
}

/**
 * `/about` の構造化データ
 *
 * Organization と Event はトップページと同じ `@id` を使う。Google は同一 `@id` の
 * ノードを結合するため、これは重複ではなくエンティティの補強になる。
 *
 * `mainEntity` に Organization を置くのは、このページの主題が実行委員会だからである。
 * ページが説明している祭そのものは `about` で参照する。
 */
export function createAboutStructuredData(locale: Locale) {
  const canonical = absoluteSiteUrl(buildLocalePath("/about", locale));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: siteConfig.metadata.siteName,
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        about: [{ "@id": festivalId }, { "@id": organizationId }],
        mainEntity: { "@id": organizationId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteSiteUrl("/images/photos/setagayafe97-image.webp"),
        },
      },
      createWebSiteNode(),
      createOrganizationNode(),
      createFestivalEventNode(),
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  /** 現在地（最後の項目）は省略する。Google は末尾の item 省略を許容する */
  pathname?: string;
}

/**
 * パンくずの構造化データ
 *
 * **視覚的なパンくずが実在するページにだけ使う。** 構造化データはページの可視内容を
 * 表すものであり、画面に無い階層を宣言するとガイドライン違反になる。
 */
export function createBreadcrumbStructuredData(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.pathname ? { item: absoluteSiteUrl(item.pathname) } : {}),
    })),
  };
}
