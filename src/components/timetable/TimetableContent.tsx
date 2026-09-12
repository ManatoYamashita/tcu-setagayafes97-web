"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Event, EventDate } from "@/types/events";
import {
  filterEventsByDate,
  filterEventsByStage,
  groupEventsByStage,
  listStageTabs,
  warnUnresolvedStagePlaces,
} from "@/lib/timetable";
import { calculateTimeRange } from "@/lib/timetable-layout";
import { isKnownStageId } from "@/data/stages";
import { getTimetableDateLabel, TimetableTabs } from "./TimetableTabs";
import { TimetableChart } from "./TimetableChart";

interface TimetableContentProps {
  initialEvents: Event[];
}

/**
 * タイムテーブルコンテンツ
 * クライアントサイドで日程・ステージによるフィルタリング処理
 */
export function TimetableContent({ initialEvents }: TimetableContentProps) {
  const searchParams = useSearchParams();

  // URL Search Params から日程とステージを取得
  const dateParam = searchParams.get("date");
  const selectedDate: EventDate = dateParam === "day2" ? "day2" : "day1";
  const stageParam = searchParams.get("stage");
  const selectedStage = stageParam && isKnownStageId(stageParam) ? stageParam : "all";

  // 日程だけで絞った集合。タブの一覧と時間レンジは必ずここから作る
  const dateEvents = useMemo(
    () => filterEventsByDate(initialEvents, selectedDate),
    [initialEvents, selectedDate]
  );

  // 時間レンジは全ステージ共通。ステージ絞り込み後から算出すると、
  // タブを切り替えるたびに縦のスケールが動いてステージ間の比較ができなくなる
  const range = useMemo(() => calculateTimeRange(dateEvents), [dateEvents]);

  // タブに出すステージ。**ステージ絞り込み前**の集合を渡すこと（理由は listStageTabs 側）。
  // 選択中のステージは当日0件でも一覧へ残るため、どのタブも未選択になる状態は起きない
  const availableStages = useMemo(
    () => listStageTabs(dateEvents, selectedStage),
    [dateEvents, selectedStage]
  );

  const groups = useMemo(
    () => groupEventsByStage(filterEventsByStage(dateEvents, selectedStage)),
    [dateEvents, selectedStage]
  );

  // 入稿の表記ゆれは「その他」列で拾われるため画面上は破綻しない。
  // 気付ける場所で知らせないと直らないので、開発時のみ警告する
  useEffect(() => {
    warnUnresolvedStagePlaces(initialEvents);
  }, [initialEvents]);

  const hasEvents = groups.length > 0;
  const eventCount = groups.reduce((count, group) => count + group.events.length, 0);
  const selectedDateLabel = getTimetableDateLabel(selectedDate);

  return (
    <div className="py-2 sm:py-4">
      {/* タブ */}
      <TimetableTabs
        selectedDate={selectedDate}
        selectedStage={selectedStage}
        availableStages={availableStages}
      />

      <section className="mt-8" aria-labelledby="timetable-results-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h2
            id="timetable-results-heading"
            className="font-sans text-xl font-bold text-balance text-gray-900 sm:text-2xl"
          >
            {selectedDateLabel}の企画
          </h2>
          <p data-timetable-summary role="status" className="text-sm font-medium text-gray-700">
            {eventCount}企画を表示中
          </p>
        </div>

        {hasEvents ? (
          <TimetableChart groups={groups} range={range} />
        ) : (
          // 企画が見つからない場合。
          // 「その他」の受け皿ができたことで、企画があるのに空の盤面が出る状態は無くなった
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-lg text-gray-900/80">
              選択した条件に該当するステージ企画が見つかりませんでした。
            </p>
            <p className="mt-2 text-sm text-gray-900/60">
              他の日程やステージを選択してみてください。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
