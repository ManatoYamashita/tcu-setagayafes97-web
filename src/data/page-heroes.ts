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
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "世田谷祭の企画風景",
  },
  special: {
    title: "著名人企画",
    subtitle: "Special",
    description: "第97回 世田谷祭にお招きするゲストのご紹介",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "ステージ企画の様子",
  },
  timetable: {
    title: "タイムテーブル",
    subtitle: "Timetable",
    description: "第97回 世田谷祭のステージ企画スケジュール",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "ステージ企画の様子",
  },
  access: {
    title: "アクセス",
    subtitle: "Access",
    description: "キャンパスマップと交通アクセス情報",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "世田谷キャンパスの風景",
  },
  info: {
    title: "お知らせ",
    subtitle: "Information",
    description: "第97回 世田谷祭に関する最新情報をお届けします",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "お知らせイメージ",
  },
  contact: {
    title: "お問い合わせ",
    subtitle: "Contact",
    description: "第97回 世田谷祭に関するご質問・ご相談",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "お問い合わせ",
  },
  privacy: {
    title: "プライバシーポリシー",
    subtitle: "Privacy Policy",
    description: "個人情報保護方針",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "プライバシーポリシー",
  },
  guide: {
    title: "ご来場の方へ",
    subtitle: "Visitor Guide",
    description: "皆様に安全で快適にお過ごしいただくためのご案内",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "来場ガイド",
  },
  faq: {
    title: "よくある質問",
    subtitle: "FAQ",
    description: "第97回 世田谷祭に関するよくある質問と回答",
    imageSrc: "/images/photos/setagayafe97-image.webp",
    imageAlt: "よくある質問",
  },
};
