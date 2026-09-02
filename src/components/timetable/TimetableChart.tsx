import type { StageGroup } from "@/lib/timetable";
import type { TimeRange } from "@/lib/timetable-layout";
import { TimetableGantt } from "./TimetableGantt";
import { TimetableStackedList } from "./TimetableStackedList";

interface TimetableChartProps {
  groups: StageGroup[];
  range: TimeRange;
}

/**
 * タイムテーブルチャート
 *
 * デスクトップ（lg 以上）はガント盤面、それ未満はステージごとの縦スタック。
 * 切り替えを `lg`(1024px) に置いているのは、盤面が最小 972px を要求するためで、
 * `md`(768px) では初期表示の大半が画面外になる。
 *
 * このコンポーネントは PageSheetLayout の白いシート（bg-white）の上に載る。
 * 面は不透明色で持ち、bg-white/10 は使わない（白地では純白になり下地と分離しない）。
 * 枠は border-gray-200（#d1d1d1 / 1.53:1）。判断基準は
 * docs/frontend/design.md「コントラスト比（アクセシビリティ）」を参照。
 *
 * 外枠に overflow-hidden を置かないこと。中のスクローラが自分で横スクロールを持っており、
 * 二重にクリップすると sticky な時刻ラベル列とフォーカスリングが欠ける。
 */
export function TimetableChart({ groups, range }: TimetableChartProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-900/80">企画が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      {/* デスクトップ: ガントチャート */}
      <div className="hidden lg:block">
        <TimetableGantt groups={groups} range={range} />
      </div>

      {/* モバイル・タブレット: 縦スタック */}
      <div className="lg:hidden">
        <TimetableStackedList groups={groups} />
      </div>
    </div>
  );
}
