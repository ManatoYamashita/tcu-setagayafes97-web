/**
 * 著名人企画（スペシャル企画）告知セクションの表示内容
 *
 * 参照するのは3箇所です。文言を変えるときは全部に効くと考えてください。
 *
 * - トップページ Hero 直下の告知セクション（SpecialGuestSection variant="hero"）
 * - /events 最下部の告知セクション（同 variant="sheet"）
 * - next.config.ts の `SPECIAL_LANDING_PATH`（`eventId` から /special の転送先を組み立てる）
 *
 * 文言と画像は microCMS ではなくここで管理します。LP（/special/[id]）の
 * チケット表（microCMS の `special.tickets`）と同じ内容を、トップで読める粒度へ要約します。
 *
 * IMPORTANT: 券種を片方だけ載せてはいけません。学内生券（¥1,000・東京都市大生のみ・
 * 学生証必須・学内手売り・現金のみ）と一般券（¥2,300・イープラス）は、価格も販売経路も
 * 購入資格も異なります。片方だけを「チケット販売日時」のような一般的な見出しで出すと、
 * 一般来場者が「学内で手売りしている」と誤読して来校する事故につながります。
 * LP の TicketTable を変更したら、ここも必ず追随させてください。
 *
 * リンク先の URL は eventId から組み立てます。LP が公開されているかどうかは
 * 表示側（各セクション）が `getSpecialEventById()` を使って確認します。
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
  /** チケット販売情報などの明細 */
  details: SpecialBannerDetail[];
  /** LP へ誘導する CTA のラベル */
  ctaLabel: string;
}

export const specialBanner: SpecialBannerData = {
  eventId: "special-event-mon7a",
  label: "著名人スペシャル企画決定！",
  name: "MON7A",
  nameLogo: {
    src: "/images/special/mon7a-logo.webp",
    width: 1524,
    height: 405,
  },
  image: {
    src: "/images/special/mon7a.webp",
    alt: "MON7A のアーティスト写真",
    width: 1280,
    height: 1280,
  },
  // 販売開始が早い順。一般券（9/3）→ 学内生券（9/28）
  details: [
    {
      term: "一般チケット",
      lines: ["¥2,300", "9/3（木）10:00 〜 発売", "プレイガイド【イープラス】にて販売"],
    },
    {
      term: "学内生チケット",
      lines: [
        "¥1,000（東京都市大生のみ・学生証必須）",
        "世田谷キャンパス: 9/28（月）〜10/2（金）（予定）",
        "横浜キャンパス: 10/5（月）〜10/9（金）（予定）",
        "時間: 13:00〜13:30",
        "学内にて手売り／現金のみ",
        "世田谷: 3号館前ベンチ／横浜: 食堂前",
      ],
    },
  ],
  ctaLabel: "企画の詳細を見る",
};
