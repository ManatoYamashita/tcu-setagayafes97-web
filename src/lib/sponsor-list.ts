import type { Information } from "@/types/informations";

/**
 * 協賛・協力ページでの見せ方を決める
 *
 * 本番では16件中13件が画像・説明・URL のいずれも持たない（2026-09-30 実測）。
 * 全件をロゴ枠の高さ（aspect-video）で並べると、社名だけのカードが灰色の空白で
 * ページを埋め、画像ありのカードと同じ行に入った社名カードは引き伸ばされる。
 *
 * そこで「詳細を持つ協賛」はカードで、「社名しか無い協賛」は小さなタイルで並べる。
 * **どちらの群でも入力の順序（`priority` 順）を保ち、1件も捨てない。**
 */
export interface SponsorListGroups {
  /** 画像・説明・URL のいずれかを持つ協賛 */
  detailed: Information[];
  /** 社名しか持たない協賛 */
  nameOnly: Information[];
}

/** 画像・説明・URL のいずれかを持つか */
export function hasSponsorDetails(sponsor: Information): boolean {
  return Boolean(sponsor.image?.url || sponsor.description || sponsor.url);
}

/**
 * 協賛を「詳細あり」と「社名のみ」に振り分ける
 * @param sponsors 協賛企業（優先度順）
 * @returns 各群とも入力の相対順序を保った振り分け結果
 */
export function groupSponsorsForList(sponsors: Information[]): SponsorListGroups {
  const detailed: Information[] = [];
  const nameOnly: Information[] = [];
  for (const sponsor of sponsors) {
    (hasSponsorDetails(sponsor) ? detailed : nameOnly).push(sponsor);
  }
  return { detailed, nameOnly };
}
