/**
 * 著名人企画（スペシャル企画）告知セクションの表示内容
 *
 * 参照するのは3箇所です。文言を変えるときは全部に効くと考えてください。
 *
 * - トップページ Hero 直下の告知セクション（SpecialGuestSection variant="hero"）
 * - /events 最下部の告知セクション（同 variant="sheet"）
 * - next.config.ts の `/special` 転送（`eventId` から転送先を組み立てる）
 *
 * 文言と画像は microCMS ではなくここで管理します。告知セクションは日時・会場だけを見せ、
 * 券種や販売方法は LP（/special/[id]）のチケット表（microCMS の `special.tickets`）へ任せます。
 *
 * IMPORTANT: 告知セクションへチケット情報を戻す場合は、券種を必ず両方載せてください。
 * 学内生券（¥1,000・東京都市大生のみ・学生証必須・学内手売り・現金のみ）と一般券
 * （¥2,300・イープラス）は、価格も販売経路も購入資格も異なります。片方だけを
 * 「チケット販売日時」のような一般的な見出しで出すと、一般来場者が「学内で手売りしている」と
 * 誤読して来校する事故につながります。
 *
 * リンク先の URL は eventId から組み立てます。LP が公開されているかどうかは
 * 表示側（各セクション）が `getSpecialEventById()` を使って確認します。
 */

export interface SpecialBannerData {
  /** microCMS 上の企画 ID。リンク先の組み立てと実在確認に使います */
  eventId: string;
  /** 見出しの下、本文の左に縦書きで置く分類ラベル */
  category: string;
  /**
   * 出演者名。見出しは `nameLogo` の画像で表示するため、この文字列は
   * 画像の代替テキスト（= 見出しのアクセシブル名）として使われます。
   */
  name: string;
  /**
   * 出演者名のロゴ画像。見出しの本体です。
   *
   * LP（/special/[id]）が使うロゴは microCMS の `special.logo` で、こことは別系統です。
   * あちらは暗いヒーローの上に置くため白ロゴを想定しており、ここは淡い紫または白の
   * 背景に置くため黒ロゴを使います。取り違えるとどちらかが背景に溶けます。
   *
   * 差し替える場合は必ず背景が透過したアセットを用意してください。入稿された原本は
   * 白地に黒の線画（不透明）で、そのまま置くと紫の背景に白い板が浮きます。
   */
  nameLogo: {
    src: string;
    /** 元画像の実寸（next/image のレイアウト計算に使用） */
    width: number;
    height: number;
  };
  /** バナー画像 */
  image: {
    src: string;
    alt: string;
    /** 元画像の実寸（next/image のレイアウト計算に使用） */
    width: number;
    height: number;
  };
  /** 本文（日時・会場）。配列の 1 要素が 1 行になります */
  headline: string[];
  /** LP へ誘導する CTA のラベル */
  ctaLabel: string;
}

export const specialBanner: SpecialBannerData = {
  eventId: "special-event-mon7a",
  category: "著名人企画",
  name: "MON7A",
  nameLogo: {
    src: "/images/special/mon7a-logo.avif",
    width: 719,
    height: 191,
  },
  image: {
    src: "/images/special/mon7a.avif",
    alt: "MON7A のアーティスト写真",
    width: 920,
    height: 920,
  },
  headline: ["11月1日 16:00~", "世田谷キャンパス第1アリーナ"],
  ctaLabel: "詳しくはこちら",
};
