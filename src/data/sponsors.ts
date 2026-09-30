/**
 * 協賛・協力ページとトップの協賛バーで使う文言
 *
 * 協賛企業そのもの（社名・ロゴ・URL）は microCMS `informations` の `sponsor` が持つ。
 * ここに置くのはページの枠組みの文言だけ。
 */
export const sponsorsPageContent = {
  /** 一覧冒頭の謝辞 */
  intro: [
    "第97回東京都市大学世田谷祭の開催にあたり、多大なるご支援を賜りました企業・団体の皆様に、心より御礼申し上げます。",
    "皆様のご協力により、学生主体の学園祭を実現することができております。",
  ],
  /** 掲載件数の単位。大学・実行委員会など企業ではない団体も含むため「社」は使わない */
  countSuffix: "の企業・団体",
  /** 掲載が0件のとき */
  emptyMessage: "現在、協賛・協力の情報は準備中です。",
  /** 協賛先の Web サイトへのリンク文言 */
  websiteLabel: "Webサイトを見る",
} as const;

/** トップ・委員会ページの協賛バーから一覧ページへ誘導する CTA */
export const sponsorBannerCta = {
  label: "協賛・協力の一覧を見る",
  href: "/about/sponsors",
} as const;
