import { Suspense } from "react";
import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { filterStageEvents } from "@/lib/timetable";
import { TimetableContent } from "@/components/timetable/TimetableContent";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { EVENTS_VISIBLE } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 * EVENTS_VISIBLE が false の間は準備中の文言を表示
 */
export const metadata: Metadata = EVENTS_VISIBLE
  ? createPageMetadata({
      title: "タイムテーブル",
      description:
        "東京都市大学 第97回 世田谷祭のタイムテーブルページ。ステージ企画の開催時刻を確認できます。",
      pathname: "/timetable",
    })
  : createPageMetadata({
      title: "タイムテーブル",
      description:
        "東京都市大学 第97回 世田谷祭のタイムテーブルは現在準備中です。公開までもうしばらくお待ちください。",
      pathname: "/timetable",
    });

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * 検証用フィクスチャの差し替え（開発時のみ）
 *
 * microCMS のステージ企画は現在1件のみで、盤面のレイアウト（複数ステージ・時間の重なり・
 * レンジ外の時刻）を実データでは検証できない。`NEXT_PUBLIC_TIMETABLE_FIXTURE=1` を
 * 付けて `pnpm dev` を起動したときだけダミーデータへ差し替える。
 *
 * `process.env.NODE_ENV` はビルド時に定数置換されるため、本番ビルドではこの分岐が
 * 到達不能コードになり、動的 import のチャンクごと生成されない。
 *
 * searchParams で切り替えないのは、それを読むとルートが動的になり
 * `revalidate = 3600` の ISR 挙動そのものが検証対象から外れてしまうため。
 */
const USE_FIXTURE =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TIMETABLE_FIXTURE === "1";

/**
 * タイムテーブルページ
 * SSG + クライアントサイドフィルタリング
 * EVENTS_VISIBLE が false の間は準備中表示
 */
export default async function TimetablePage() {
  if (!EVENTS_VISIBLE) {
    return (
      <PageSheetLayout hero={pageHeroes.timetable}>
        <ComingSoon
          title="タイムテーブルは準備中です"
          description="第97回 世田谷祭のタイムテーブルは現在準備中です。公開までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  // フィクスチャも本番と同じ filterStageEvents を通す。ここを迂回すると、
  // 検証しているものが本番の経路と別物になる
  const sourceEvents = USE_FIXTURE
    ? (await import("@/components/timetable/__fixtures__/stage-events")).stageEventFixtures
    : // 全企画を取得（最大200件）
      await getEventsList(200);
  const stageEvents = filterStageEvents(sourceEvents);

  return (
    <PageSheetLayout hero={pageHeroes.timetable}>
      {/*
        TimetableContent は useSearchParams() を使うため Suspense 境界が要る。
        境界が無いと、ルート直下の src/app/loading.tsx が代役を務めてしまい、
        ページ全体（ヒーローとシェルを含む）がクライアントレンダリングへ落ちる。
      */}
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <TimetableContent initialEvents={stageEvents} />
      </Suspense>
    </PageSheetLayout>
  );
}
