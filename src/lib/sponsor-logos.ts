import type { Information } from "@/types/informations";

/**
 * 協賛企業ロゴ帯の表示項目
 *
 * microCMS `informations` の `image` は任意項目で、本番では協賛16件のうち13件が画像なし
 * （2026-09-30 実測）。以前は `image?.url` で絞っていたため、画像の無い協賛がエラーも出さずに
 * ロゴ帯から消えていた（#332）。
 *
 * **1件も捨てず、並び（`priority` 順）も変えない。** 画像が無ければ社名を文字で見せる。
 * ロゴ帯の静的フォールバックと LogoLoop 本体は、必ずこの関数の結果を同じ添字で使うこと。
 * 片方だけ絞ると、クリックしたロゴと開くモーダルの協賛がずれる。
 */
export type SponsorLogo =
  | { kind: "image"; sponsor: Information; src: string; displayWidth: number }
  | { kind: "text"; sponsor: Information };

/** ロゴ帯の表示高さ（px） */
export const SPONSOR_LOGO_HEIGHT = 40;

/**
 * 協賛企業の配列をロゴ帯の表示項目へ変換する
 * @param sponsors 協賛企業（優先度順）
 * @returns 入力と同じ件数・同じ順序の表示項目
 */
export function toSponsorLogos(sponsors: Information[]): SponsorLogo[] {
  return sponsors.map((sponsor) => {
    const image = sponsor.image;
    if (!image?.url) return { kind: "text", sponsor };

    // 寸法が欠けている画像は正方形として扱う（0 や undefined で割ると NaN になる）
    const width = image.width && image.width > 0 ? image.width : 1;
    const height = image.height && image.height > 0 ? image.height : 1;
    const displayWidth = Math.max(1, Math.round((width / height) * SPONSOR_LOGO_HEIGHT));
    return { kind: "image", sponsor, src: image.url, displayWidth };
  });
}
