/**
 * トップページの著名人企画（スペシャル企画）告知セクションの表示内容
 *
 * 文言と画像は microCMS ではなくここで管理します。LP（/special/[id]）の
 * チケット表は e+ での一般販売を含む全券種を扱いますが、このセクションで告知するのは
 * 学内手売り分に絞った先行案内のため、別の文言として持たせています。
 *
 * リンク先の URL は eventId から組み立てます。LP が公開されているかどうかは
 * 表示側で `getSpecialEventById()` を使って確認します。
 */

/** 定義リストで表示する明細の 1 ブロック */
export interface SpecialBannerDetail {
  /** 項目名（`<dt>`） */
  term: string;
  /** 内容（`<dd>`）。配列の 1 要素が 1 行になります */
  lines: string[];
}

export interface SpecialBannerData {
  /** microCMS 上の企画 ID。リンク先の組み立てと実在確認に使います */
  eventId: string;
  /** 出演者名の上に置く小ラベル */
  label: string;
  /** 出演者名（セクション見出し） */
  name: string;
  /** バナー画像 */
  image: {
    src: string;
    alt: string;
    /** 元画像の実寸（next/image のレイアウト計算に使用） */
    width: number;
    height: number;
  };
  /** チケット販売情報などの明細 */
  details: SpecialBannerDetail[];
  /** LP へ誘導する CTA のラベル */
  ctaLabel: string;
}

export const specialBanner: SpecialBannerData = {
  eventId: "special-event-mon7a",
  label: "著名人スペシャル企画決定！",
  name: "MON7A",
  image: {
    src: "/images/special/mon7a.webp",
    alt: "MON7A のアーティスト写真",
    width: 1280,
    height: 1280,
  },
  details: [
    {
      term: "チケット販売日時",
      lines: [
        "世田谷キャンパス: 9/28（月）〜10/2（金）（予定）",
        "横浜キャンパス: 10/5（月）〜10/9（金）（予定）",
        "時間: 13:00〜13:30",
      ],
    },
    {
      term: "販売場所/方法",
      lines: [
        "学内にて手売り／現金のみ",
        "世田谷キャンパス: 3号館前ベンチ",
        "横浜キャンパス: 食堂前",
      ],
    },
  ],
  ctaLabel: "企画の詳細を見る",
};
