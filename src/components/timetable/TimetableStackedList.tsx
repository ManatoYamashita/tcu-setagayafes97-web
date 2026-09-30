import type { StageGroup } from "@/lib/timetable";
import { getTimeAxisTick, parseTimeToMinutes } from "@/lib/timetable-layout";
import { TimetableEventCard } from "./TimetableEventCard";

interface TimetableStackedListProps {
  groups: StageGroup[];
}

/**
 * モバイルの縦スタック表示
 *
 * ガント盤面は最小でも 972px（時間軸 72px + 5列 × 180px）を要求するため、
 * 狭い画面では成立しない。時刻による位置づけを諦めて、全ステージ横断の時系列リストにする。
 *
 * 盤面と DOM を2本持っているのは、`docs/frontend/layout-responsive.md`「DOM 2枚持ちを避ける」の
 * **例外**である。同ドキュメントの指針は「形状差が Tailwind のバリアントだけで表現できる場合」を
 * 対象にしており、今回は縦位置が `style={{ top, height }}` のインラインスタイルに載っている。
 * インラインスタイルにレスポンシブバリアントは存在せず、JS でブレークポイントを見て切り替えると
 * ハイドレーション不整合とレイアウトシフトを招く。
 *
 * 代わりに重複を最小化している。`StageGroup[]` と `TimeRange` は `TimetableContent` が
 * 一度だけ計算して両方へ配り、カードは `TimetableEventCard` を共有する。重複するのは
 * 「絶対配置のラッパ」対「通常フローの `<li>`」だけである。
 * 画像を持たないカードなので、同ドキュメントが挙げる二重 fetch の実害も無い。
 *
 * 盤面と同じ30分刻みの時刻見出しを、各目盛りに属する最初の企画の上に置く（#302）。
 * 見出しをカードの左へ並べる形にすると、320px 幅でカード本文が 250px を割る。
 * 企画の無い目盛りは出さない。盤面と違い縦位置が時刻に比例しないため、空の見出しは
 * 軸として働かず、スクロール量だけを増やす。
 * 見出しは `aria-hidden`。各カードが自分の時刻を文字で持っており、盤面の時刻ラベルと同じ理由で
 * 読み上げるとノイズにしかならない。リストの項目数も企画数のまま保てる。
 */
export function TimetableStackedList({ groups }: TimetableStackedListProps) {
  const items = groups
    .flatMap((group) =>
      group.events.map((event) => ({ event, stageName: group.name, stageId: group.id }))
    )
    .sort((a, b) => {
      const startDiff =
        (parseTimeToMinutes(a.event.startTime) ?? Number.POSITIVE_INFINITY) -
        (parseTimeToMinutes(b.event.startTime) ?? Number.POSITIVE_INFINITY);

      if (startDiff !== 0) return startDiff;
      return a.stageId.localeCompare(b.stageId);
    });

  return (
    <div data-timetable-list>
      <p className="mb-3 text-sm font-semibold text-gray-700">開始時刻順</p>
      <ol
        className="relative space-y-3 before:absolute before:inset-y-5 before:-left-3 before:w-0.5 before:rounded-full before:bg-primary-200"
        role="list"
      >
        {items.map(({ event, stageName }, index) => {
          const tick = getTimeAxisTick(event.startTime);
          const isFirstOfTick =
            tick !== null && tick !== getTimeAxisTick(items[index - 1]?.event.startTime);

          return (
            <li key={event.entryKey} data-timetable-list-item data-start-time={event.startTime}>
              {isFirstOfTick && (
                <div
                  data-timetable-list-tick={tick}
                  className={`mb-2 flex items-center gap-3 text-sm font-semibold text-gray-700 tabular-nums${
                    index > 0 ? " pt-3" : ""
                  }`}
                  aria-hidden="true"
                >
                  {tick}
                  {/* 盤面の罫線と同じ border-gray-400（白地で 3.23:1。WCAG 1.4.11） */}
                  <span className="flex-1 border-t border-gray-400" />
                </div>
              )}
              {/* 時系列の点はカードの上端に合わせる。li に付けると見出しの分だけ上へずれる */}
              <div className="relative after:absolute after:top-5 after:-left-[0.9375rem] after:size-2 after:rounded-full after:bg-primary-600 after:ring-4 after:ring-white">
                <TimetableEventCard event={event} stageName={stageName} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
