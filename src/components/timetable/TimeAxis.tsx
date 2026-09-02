import { calculateBoardHeight, generateTimeAxis, type TimeRange } from "@/lib/timetable-layout";

interface TimeAxisProps {
  range: TimeRange;
  hourHeightPx: number;
}

/**
 * 時間軸の時刻ラベル列
 *
 * 盤面の左端に立つ列で、横スクロール時も `sticky left-0` で残ります。
 * そのため面は不透明（`bg-white`）でなければなりません。**下を企画カードが通過します。**
 * 旧実装の時刻チップも `bg-white` でしたが、あれは「自分の下を通る罫線を切り抜く」ための
 * ものでした。罫線はステージ列の中へ移したので、いまの理由は sticky です。
 *
 * `aria-hidden` にしているのは、各カードが自分の時刻を文字で持っているためです。
 * 目盛りまで読み上げるとノイズにしかなりません。
 */
export function TimeAxisColumn({ range, hourHeightPx }: TimeAxisProps) {
  const timeAxis = generateTimeAxis(range);

  // 高さは自分で px を持つ。h-full にすると親の height が確定しているかに依存し、
  // #148 と同じ「親が min-height しか持たず 0px に潰れる」経路が復活する。
  return (
    <div
      className="relative"
      style={{ height: calculateBoardHeight(range, hourHeightPx) }}
      aria-hidden="true"
    >
      {timeAxis.map((time, index) => (
        <span
          key={time}
          className="absolute right-3 -translate-y-1/2 text-xs font-medium text-gray-700 tabular-nums"
          style={{ top: index * hourHeightPx }}
        >
          {time}
        </span>
      ))}
    </div>
  );
}

/**
 * 毎正時の罫線
 *
 * ステージ列の内側に敷きます。列ごとに置くことで、隣り合う列の線が突き合わさって
 * 盤面全幅を横断し、かつ sticky な時刻ラベル列の手前で自然に止まります。
 * 盤面全体を1枚のオーバーレイで覆う方式だと、sticky 列との重なり順を調整する必要があり、
 * さらに時刻ラベルの下に線が透けます。
 *
 * グリッド線は装飾ではなく時間軸の目盛りであり、WCAG 1.4.11（非テキストコントラスト）の
 * 3:1 を満たす必要がある。白いシート上では border-gray-400（#8f8f8f / 3.23:1）を使う。
 * border-gray-200 は 1.53:1 しかなく、かつての border-gray-200/20 は 1.08:1 で消えていた。
 */
export function HourLines({ range, hourHeightPx }: TimeAxisProps) {
  const timeAxis = generateTimeAxis(range);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {timeAxis.map((time, index) => (
        <div
          key={time}
          className="absolute inset-x-0 border-t border-gray-400"
          style={{ top: index * hourHeightPx }}
        />
      ))}
    </div>
  );
}
