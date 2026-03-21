/**
 * 各セクションページのヒーローコンテンツを一元管理
 * コンテンツ分離原則に基づき、UIコンポーネントとデータを分離
 */

export interface PageHeroData {
  /** ページタイトル（配列の場合は <br /> で結合） */
  title: string | string[];
  /** 小ラベル（"Events", "About Us" 等） */
  subtitle?: string;
  /** 説明文 */
  description?: string;
  /** ヒーロー画像パス */
  imageSrc?: string;
  /** 画像の alt テキスト */
  imageAlt?: string;
  /** バッジ画像パス（画像右上に円形配置） */
  badgeSrc?: string;
  /** バッジの alt テキスト */
  badgeAlt?: string;
  /** CTA リンク先 */
  ctaHref?: string;
  /** CTA ラベル（デフォルト: "View More"） */
  ctaLabel?: string;
}

export const pageHeroes: Record<string, PageHeroData> = {
  events: {
    title: "企画を探す",
    subtitle: "Events",
    description: "第97回 世田谷祭の企画を検索・閲覧できます",
    imageSrc: "/images/placeholder/pastel-castle.webp",
    imageAlt: "世田谷祭の企画風景",
  },
  timetable: {
    title: "タイムテーブル",
    subtitle: "Timetable",
    description: "第97回 世田谷祭のステージ企画スケジュール",
    imageSrc: "/images/placeholder/pastel-castle.webp",
    imageAlt: "ステージ企画の様子",
  },
  map: {
    title: "キャンパスマップ",
    subtitle: "Campus Map",
    description: "建物をクリックすると、開催企画を検索できます",
    imageSrc: "/images/placeholder/pastel-castle.webp",
    imageAlt: "世田谷キャンパスの風景",
  },
  info: {
    title: "お知らせ",
    subtitle: "Information",
    description: "第97回 世田谷祭に関する最新情報をお届けします",
    imageSrc: "/images/placeholder/pastel-castle.webp",
    imageAlt: "お知らせイメージ",
  },
  about: {
    title: ["世田谷祭", "こころを動かす", "からくり"],
    subtitle: "About Us",
    ctaHref: "/events",
    ctaLabel: "View More",
    imageSrc: "/images/placeholder/pastel-castle.webp",
    imageAlt: "実行委員会の活動風景",
  },
};
