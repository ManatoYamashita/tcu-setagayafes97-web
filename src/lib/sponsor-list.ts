import type { Information } from "@/types/informations";

/**
 * 協賛・協力ページで「押せる」協賛かどうか
 *
 * 一覧は全社を同じ大きさのロゴ / 団体名タイルで `priority` 順に並べる。
 * そのうち、団体名と表示順以外に見せるものを持つ協賛だけがボタンになり、
 * 押すと詳細パネルが開く。何も持たない協賛は押せない（開いても空のパネルになるため）。
 * 本番では16件中13件が何も持たない（2026-09-30 実測）。
 */
export function hasSponsorDetails(sponsor: Information): boolean {
  return Boolean(sponsor.image?.url || sponsor.description || sponsor.url);
}
