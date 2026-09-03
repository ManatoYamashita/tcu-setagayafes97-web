/**
 * 過去回サイトの配信先
 *
 * 第96回は `96th.setagayafes.org`（さくら）へ退避済みで、`setagayafes.org/96th/*` は
 * そこへ 301 する。転送は2箇所で実装されている。
 *
 * - `next.config.ts` の `redirects()` — 通常の経路
 * - `src/proxy.ts` — Next.js の末尾スラッシュ正規化（308）より先に走らせるため
 *
 * 定数を両方で個別に宣言していたため、片方だけ変えると食い違う状態だった。
 * ここを唯一の出典にする。
 *
 * 手順と検証は docs/dev/domain-migration.md を参照。
 */
export const ARCHIVE_96TH_ORIGIN = "https://96th.setagayafes.org";
