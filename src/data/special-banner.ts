/**
 * 著名人企画（スペシャル企画）告知セクションの表示内容
 *
 * 参照するのは4箇所です。文言を変えるときは全部に効くと考えてください。
 *
 * - トップページ Hero 直下の告知セクション（SpecialGuestSection variant="hero"）
 * - /events 最下部の告知セクション（同 variant="sheet"）
 * - /events 冒頭のバナー（SpecialEventBanner。`nameLogo` と `image` だけを使う）
 * - next.config.ts の `/special` 転送（`eventId` から転送先を組み立てる）
 *
 * 文言と画像は microCMS ではなくここで管理します。チケットと注意事項は LP（/special/[id]）の
 * チケット表・注意事項（microCMS の `special.tickets` / `special.notices`）を、トップで読める
 * 粒度へ要約したものです。LP 側を変更したら、ここも必ず追随させてください。
 *
 * IMPORTANT: 券種を片方だけ載せてはいけません。学内生券（¥1,000・東京都市大生のみ・
 * 学生証必須・学内手売り・現金のみ）と一般券（¥2,300・イープラス）は、価格も販売経路も
 * 購入資格も異なります。片方だけを「チケット販売日時」のような一般的な見出しで出すと、
 * 一般来場者が「学内で手売りしている」と誤読して来校する事故につながります。
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

/** 画像アセット（寸法は元画像の実寸。next/image のレイアウト計算に使用） */
interface SpecialBannerLogo {
  src: string;
  width: number;
  height: number;
}

export interface SpecialBannerData {
  /** microCMS 上の企画 ID。リンク先の組み立てと実在確認に使います */
  eventId: string;
  /** 見出しの下、本文の左に縦書きで置く分類ラベル */
  category: string;
  /**
   * 出演者名。見出しはロゴ画像で表示するため、この文字列は
   * 画像の代替テキスト（= 見出しのアクセシブル名）として使われます。
   */
  name: string;
  /**
   * 出演者名のロゴ画像（黒の線画・内側は透過）。/events 冒頭の SpecialEventBanner 専用で、
   * あちらは `brightness-0 invert` で白抜きにして暗い背景へ置きます。
   * 内側を白で塗った `nameLogoFilled` を渡すと、文字が白い塊になって読めません。
   *
   * LP（/special/[id]）が使うロゴは microCMS の `special.logo` で、こことは別系統です。
   * あちらは暗いヒーローの上に置くため白ロゴを想定しており、ここは淡い紫または白の
   * 背景に置くため黒ロゴを使います。取り違えるとどちらかが背景に溶けます。
   *
   * 差し替える場合は必ず背景が透過したアセットを用意してください。入稿された原本は
   * 白地に黒の線画（不透明）で、そのまま置くと紫の背景に白い板が浮きます。
   */
  nameLogo: SpecialBannerLogo;
  /**
   * `nameLogo` の黒縁に囲まれた透明部分を白で塗った版。告知セクション（SpecialGuestSection）の
   * 見出しの本体です。見出しが写真に重なっても文字の中身が抜けないようにするため。
   */
  nameLogoFilled: SpecialBannerLogo;
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
  /** チケットの要点。券種は必ず両方載せる（冒頭の IMPORTANT） */
  tickets: SpecialBannerDetail[];
  /** 入場の条件。1 要素が 1 項目で、表示側が「※」を付けます */
  notes: string[];
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
  nameLogoFilled: {
    src: "/images/special/mon7a-logo-filled.avif",
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
  // 販売開始が早い順。一般券（9/3）→ 学内生券（9/28）
  tickets: [
    { term: "一般", lines: ["¥2,300", "イープラスにて販売"] },
    {
      term: "学内生",
      lines: ["¥1,000", "東京都市大生のみ・学生証必須", "学内にて手売り（現金のみ）"],
    },
  ],
  notes: [
    "全席指定",
    "未就学児（6歳以下）は入場不可",
    "当日は顔写真付きの本人確認証（学生証・免許証など）が必要",
  ],
  ctaLabel: "詳しくはこちら",
};
