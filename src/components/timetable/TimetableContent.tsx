"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EventDate } from "@/types/events";
import type { TimetableEntry, TimetableEventDetail } from "@/types/timetable";
import {
  countDistinctEvents,
  filterEventsByDate,
  filterEventsByStage,
  groupEventsByStage,
  listStageTabs,
  sortEntriesByStart,
  warnUnresolvedStagePlaces,
} from "@/lib/timetable";
import { calculateTimeRange } from "@/lib/timetable-layout";
import { isKnownStageId } from "@/data/stages";
import { getTimetableDateLabel, TimetableTabs } from "./TimetableTabs";
import { TimetableChart } from "./TimetableChart";
import { TimetableEventPanel, type TimetablePanelView } from "./TimetableEventPanel";

interface TimetableContentProps {
  /** `filterStageEvents()` で開催枠ごとに展開済みのブロック */
  initialEvents: TimetableEntry[];
  /** 企画ID → 企画詳細パネルの補足情報。`buildStageEventDetails()` の結果 */
  eventDetails: Record<string, TimetableEventDetail>;
}

/**
 * タイムテーブルコンテンツ
 * クライアントサイドで日程・ステージによるフィルタリング処理
 */
export function TimetableContent({ initialEvents, eventDetails }: TimetableContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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

  // 企画詳細パネルの「前の企画 / 次の企画」。縦スタックと同じ開始時刻順で、
  // 現在の日・ステージの絞り込みの中だけを行き来する。著名人企画は専用LPへ遷移するので含めない
  const panelItems = useMemo(
    () =>
      sortEntriesByStart(
        groups.flatMap((group) =>
          group.events.map((event) => ({ event, stageName: group.name, stageId: group.id }))
        )
      ).filter((item) => item.event.type !== "special"),
    [groups]
  );

  // パネルの開閉は URL が持つ（`?event=<entryKey>`）。戻る・共有・再読み込みがそのまま効く。
  // 絞り込みの外（別の日のID等）や存在しないIDは、パネルを出さずに無視する
  const eventParam = searchParams.get("event");
  const panelView = useMemo<TimetablePanelView | null>(() => {
    if (!eventParam) return null;
    const index = panelItems.findIndex((item) => item.event.entryKey === eventParam);
    if (index < 0) return null;

    const { event, stageName } = panelItems[index];
    return {
      event,
      stageName,
      detail: eventDetails[event.id],
      prev: index > 0 ? panelItems[index - 1] : null,
      next: index < panelItems.length - 1 ? panelItems[index + 1] : null,
    };
  }, [eventParam, panelItems, eventDetails]);

  // 操作でパネルを開いた（履歴に1件積んだ）ときだけ true。閉じるときに back() してよいかの判定に使う。
  // 直リンクで開いた場合に back() すると、サイトの外へ出てしまう
  const openedByPush = useRef(false);
  useEffect(() => {
    if (!eventParam) openedByPush.current = false;
  }, [eventParam]);

  const hrefWithEvent = useCallback(
    (entryKey: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (entryKey) params.set("event", entryKey);
      else params.delete("event");
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const handleSelect = useCallback(
    (entryKey: string) => {
      openedByPush.current = true;
      router.push(hrefWithEvent(entryKey), { scroll: false });
    },
    [router, hrefWithEvent]
  );

  const handleNavigate = useCallback(
    (entryKey: string) => router.replace(hrefWithEvent(entryKey), { scroll: false }),
    [router, hrefWithEvent]
  );

  const handleClose = useCallback(() => {
    if (openedByPush.current) {
      openedByPush.current = false;
      router.back();
    } else {
      router.replace(hrefWithEvent(null), { scroll: false });
    }
  }, [router, hrefWithEvent]);

  const hasEvents = groups.length > 0;
  // 2部制の企画はブロックが2つでも1企画として数える
  const eventCount = countDistinctEvents(groups.flatMap((group) => group.events));
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
          <p
            data-timetable-summary
            role="status"
            className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700"
          >
            {eventCount}企画・{groups.length}会場
          </p>
        </div>

        {hasEvents ? (
          <TimetableChart groups={groups} range={range} onSelect={handleSelect} />
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

      <TimetableEventPanel view={panelView} onClose={handleClose} onNavigate={handleNavigate} />
    </div>
  );
}
