/**
 * 著名人企画LP（/special/[id]）の静的コンテンツ
 * コンテンツ分離原則に基づき、UIコンポーネントとデータを分離
 */

/**
 * 物販セクションの文言
 *
 * placeholder は SPECIAL_GOODS_VISIBLE が false の間に表示する文言。
 * クライアント提供の掲載文であり、グッズ確定前後で差し替わる可能性が高いため、
 * コンポーネント側にハードコードせずここで管理する。
 */
export const specialGoods = {
  /** セクション見出し。解禁前後どちらの表示でも共通で使う */
  heading: "物販",
  /** 商品テーブルの sr-only キャプション */
  tableCaption: "物販商品の一覧",
  /** 未解禁（SPECIAL_GOODS_VISIBLE = false）のときの表示 */
  placeholder: {
    title: "グッズ販売予定",
    description: "商品の詳細が決まり次第、こちらでお知らせします。",
  },
} as const;
