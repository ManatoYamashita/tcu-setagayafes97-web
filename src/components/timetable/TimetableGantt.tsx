import type { StageGroup } from "@/lib/timetable";
import {
  HOUR_HEIGHT_PX,
  MIN_STAGE_COL_WIDTH_PX,
  TIME_COL_WIDTH_PX,
  calculateBoardHeight,
  getCardDensity,
  layoutStageEvents,
  type TimeRange,
} from "@/lib/timetable-layout";
import { HourLines, TimeAxisColumn } from "./TimeAxis";
import { TimetableEventCard } from "./TimetableEventCard";

interface TimetableGanttProps {
  groups: StageGroup[];
  range: TimeRange;
}

/** 見出し行の高さ（px）。全列で同じ値にすることで盤面の開始位置が揃う */
const HEADER_HEIGHT_CLASS = "h-8";

/**
 * デスクトップのガントチャート盤面（縦軸: 時間 / 横軸: ステージ）
 *
 * ## 縦は px、横は %
 *
 * 盤面とカードの高さは全て px で持つ。`h-full` や `height: %` を縦に使うと、
 * 親の高さが確定していない限り 0 に潰れる（#148 の事故そのもの）。
 * レーン分割の `left` / `width` だけは % だが、こちらは CSS Grid のトラック幅が
 * 確定しているため安全である。
 *
 * ## スクロールと sticky
 *
 * 列が増えると幅が足りなくなるため `overflow-x-auto` で横スクロールさせ、
 * 時刻ラベル列を `sticky left-0` で残す。ここで2点、CSS の制約がある。
 *
 * 1. `overflow-x: auto` は `overflow-y` の使用値も `auto` にする。つまりこの要素は
 *    縦方向にもスクロールコンテナになり、**中の要素をページに対して `sticky top-0` に
 *    することはできない。** ステージ名の縦固定はやらない。
 * 2. `sticky left-0` はスクロールポートの端に付くため、スクローラ自身に `padding-left` を
 *    置くと見た目がずれる。余白は外側のカード（`TimetableChart`）が持つ。
 */
export function TimetableGantt({ groups, range }: TimetableGanttProps) {
  const boardHeight = calculateBoardHeight(range, HOUR_HEIGHT_PX);
  const gridTemplateColumns = `${TIME_COL_WIDTH_PX}px repeat(${groups.length}, minmax(${MIN_STAGE_COL_WIDTH_PX}px, 1fr))`;

  return (
    // キーボードでスクロールできる領域には名前とフォーカスが要る（WCAG 2.1.1 / 4.1.2）
    <div
      data-timetable-scroller
      role="region"
      aria-label="ステージ企画のタイムテーブル"
      tabIndex={0}
      className="overflow-x-auto overscroll-x-contain pb-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <div className="grid" style={{ gridTemplateColumns }}>
        {/* 時刻ラベル列。横スクロール中も残るため面は不透明でなければならない */}
        <div className="sticky left-0 z-20 border-r border-gray-200 bg-white">
          <div className={HEADER_HEIGHT_CLASS} />
          <TimeAxisColumn range={range} hourHeightPx={HOUR_HEIGHT_PX} />
        </div>

        {/* ステージ列 */}
        {groups.map((group) => (
          <section key={group.id} className="min-w-0">
            <h3
              className={`flex ${HEADER_HEIGHT_CLASS} items-center px-2 text-sm font-bold text-gray-900`}
            >
              <span className="truncate">{group.name}</span>
            </h3>

            <div
              data-timetable-column
              className="relative border-l border-gray-200"
              style={{ height: boardHeight }}
            >
              <HourLines range={range} hourHeightPx={HOUR_HEIGHT_PX} />

              {layoutStageEvents(group.events, range, HOUR_HEIGHT_PX).map((positioned) => (
                <div
                  key={positioned.event.id}
                  data-timetable-event
                  // px-1 / pb-1 が隣り合うカードの間隔になる。幾何計算側では余白を扱わない
                  className="absolute px-1 pb-1"
                  style={{
                    top: positioned.topPx,
                    height: positioned.heightPx,
                    left: `${(positioned.laneIndex / positioned.laneCount) * 100}%`,
                    width: `${100 / positioned.laneCount}%`,
                  }}
                >
                  <TimetableEventCard
                    event={positioned.event}
                    density={getCardDensity(positioned.heightPx)}
                    stageName={group.name}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
