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
import { TimetableTabs } from "./TimetableTabs";
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
  const selectedDate = (searchParams.get("date") as EventDate) || "day1";
  const selectedStage = searchParams.get("stage") || "all";

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

  return (
    <div className="container mx-auto px-4 py-12">
      {/* タブ */}
      <TimetableTabs
        selectedDate={selectedDate}
        selectedStage={selectedStage}
        availableStages={availableStages}
      />

      {/* タイムテーブルチャート */}
      <div className="mt-8">
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
      </div>
    </div>
  );
}
