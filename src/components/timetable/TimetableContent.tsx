"use client";

import { useSearchParams } from "next/navigation";
import type { Event, EventDate } from "@/types/events";
import { filterEventsByDateAndStage, groupEventsByStage } from "@/lib/timetable";
import { stages } from "@/data/stages";
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

  // フィルタリング
  const filteredEvents = filterEventsByDateAndStage(initialEvents, selectedDate, selectedStage);

  // ステージごとにグループ化
  const eventsByStage = groupEventsByStage(filteredEvents);

  // 利用可能なステージID一覧
  const availableStages = Object.keys(eventsByStage);

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
        {filteredEvents.length > 0 ? (
          selectedStage === "all" ? (
            // 全ステージ表示
            <div className="space-y-12">
              {stages
                .filter((stage) => eventsByStage[stage.id])
                .map((stage) => (
                  <div key={stage.id}>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">{stage.name}</h2>
                    <TimetableChart events={eventsByStage[stage.id]} />
                  </div>
                ))}
            </div>
          ) : (
            // 特定のステージのみ表示
            <TimetableChart events={filteredEvents} />
          )
        ) : (
          // 企画が見つからない場合
          <div className="rounded-lg bg-gray-100 p-12 text-center">
            <p className="text-lg text-gray-600">
              選択した条件に該当するステージ企画が見つかりませんでした。
            </p>
            <p className="mt-2 text-sm text-gray-500">他の日程やステージを選択してみてください。</p>
          </div>
        )}
      </div>
    </div>
  );
}
