import type { StageGroup } from "@/lib/timetable";
import { TimetableEventCard } from "./TimetableEventCard";

interface TimetableStackedListProps {
  groups: StageGroup[];
}

/**
 * モバイルの縦スタック表示
 *
 * ガント盤面は最小でも 972px（時間軸 72px + 5列 × 180px）を要求するため、
 * 狭い画面では成立しない。時刻による位置づけを諦めて、ステージごとの時系列リストにする。
 *
 * 盤面と DOM を2本持っているのは、`docs/frontend/layout-patterns.md`「DOM 2枚持ちを避ける」の
 * **例外**である。同ドキュメントの指針は「形状差が Tailwind のバリアントだけで表現できる場合」を
 * 対象にしており、今回は縦位置が `style={{ top, height }}` のインラインスタイルに載っている。
 * インラインスタイルにレスポンシブバリアントは存在せず、JS でブレークポイントを見て切り替えると
 * ハイドレーション不整合とレイアウトシフトを招く。
 *
 * 代わりに重複を最小化している。`StageGroup[]` と `TimeRange` は `TimetableContent` が
 * 一度だけ計算して両方へ配り、カードは `TimetableEventCard` を共有する。重複するのは
 * 「絶対配置のラッパ」対「通常フローの `<li>`」だけである。
 * 画像を持たないカードなので、同ドキュメントが挙げる二重 fetch の実害も無い。
 */
export function TimetableStackedList({ groups }: TimetableStackedListProps) {
  return (
    <div data-timetable-list className="space-y-8">
      {groups.map((group) => (
        <section key={group.id}>
          <h3 className="mb-3 text-lg font-bold text-gray-900">{group.name}</h3>
          <ul className="space-y-3">
            {group.events.map((event) => (
              <li key={event.id}>
                <TimetableEventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
