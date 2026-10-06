import type { Locale } from "@/i18n/routing";

import { ARCHIVE_96TH_ORIGIN } from "./legacy-hosts";

/**
 * 過去の世田谷祭（/about の PastFestivalsSection）
 *
 * 出典は実行委員会の「過去の世田谷祭」（https://archive.setagayafes.org/）。
 * 第76〜95回は同ホストの静的アーカイブ、第96回は WordPress 版の退避先を指す
 * （アーカイブのページ自体も第96回は `96th.setagayafes.org` へリンクしている）。
 *
 * - 第87回（2016年）はサイトが残っておらず、アーカイブでも「閲覧できません」になっている。載せない。
 * - 第75回のサイトはアーカイブに実体があるが、一覧ページでは非掲載（コメントアウト）。それに倣う。
 *
 * どのホストも `X-Robots-Tag: noindex` 付与済みで、リンクしても検索除外の方針には反しない
 * （docs/dev/legacy-site-deindex.md）。経緯は docs/frontend/about-past-festivals.md を参照。
 */

const ARCHIVE_ORIGIN = "https://archive.setagayafes.org";

/** 第1回が1929年度なので、開催年は「回数 + 1929」になる（第96回 = 2025年） */
const FIRST_FESTIVAL_YEAR_OFFSET = 1929;

/** サムネイルの実寸（`scripts/static-image-manifest.mjs` の box と同じ 4:3） */
const THUMBNAIL_SIZE = { width: 560, height: 420 } as const;

export interface PastFestivalSite {
  /** 回数 */
  edition: number;
  /** 開催年 */
  year: number;
  /** 当時の公式サイト */
  href: string;
  /** public/ のサムネイル（AVIF） */
  image: { src: string; width: number; height: number };
}

/** 英語の序数（81st / 82nd / 83rd / 89th）。アーカイブのディレクトリ名もこの形 */
function toOrdinal(edition: number): string {
  const lastTwo = edition % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${edition}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[edition % 10] ?? "th";
  return `${edition}${suffix}`;
}

const EDITIONS = [
  96, 95, 94, 93, 92, 91, 90, 89, 88, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76,
] as const;

/** 新しい回から順に並べる */
export const pastFestivalSites: readonly PastFestivalSite[] = EDITIONS.map((edition) => {
  const ordinal = toOrdinal(edition);
  return {
    edition,
    year: edition + FIRST_FESTIVAL_YEAR_OFFSET,
    href: edition === 96 ? `${ARCHIVE_96TH_ORIGIN}/` : `${ARCHIVE_ORIGIN}/${ordinal}/`,
    image: { src: `/images/past-festivals/${ordinal}.avif`, ...THUMBNAIL_SIZE },
  };
});

export interface PastFestivalsContent {
  heading: string;
  lead: string;
  /** 回数の表記（「第89回」など） */
  editionLabel: (edition: number) => string;
  /** 開催年の表記 */
  yearLabel: (year: number) => string;
  /** リンクが新しいタブで開くことの読み上げ */
  opensInNewTab: string;
}

// TODO(委員会確認): en / zh / ko は機械翻訳相当のドラフト（#361）
export const pastFestivalsContents = {
  ja: {
    heading: "過去の世田谷祭",
    lead: "歴代の世田谷祭の公式サイトを、当時のまま公開しています。第87回（2016年）のサイトは残っていません。",
    editionLabel: (edition) => `第${edition}回`,
    yearLabel: (year) => `${year}年`,
    opensInNewTab: "（新しいタブで開きます）",
  },
  en: {
    heading: "Past Festivals",
    lead: "The official websites of past Setagaya Festivals, preserved as they were. The site for the 87th festival (2016) no longer exists.",
    editionLabel: (edition) => toOrdinal(edition),
    yearLabel: (year) => `${year}`,
    opensInNewTab: " (opens in a new tab)",
  },
  zh: {
    heading: "往届世田谷祭",
    lead: "历届世田谷祭的官方网站按当时的原貌保留。第87届（2016年）的网站已不存在。",
    editionLabel: (edition) => `第${edition}届`,
    yearLabel: (year) => `${year}年`,
    opensInNewTab: "（在新标签页中打开）",
  },
  ko: {
    heading: "역대 세타가야사이",
    lead: "역대 세타가야사이 공식 웹사이트를 당시 모습 그대로 공개하고 있습니다. 제87회(2016년) 사이트는 남아 있지 않습니다.",
    editionLabel: (edition) => `제${edition}회`,
    yearLabel: (year) => `${year}년`,
    opensInNewTab: " (새 탭에서 열림)",
  },
} as const satisfies Record<Locale, PastFestivalsContent>;
