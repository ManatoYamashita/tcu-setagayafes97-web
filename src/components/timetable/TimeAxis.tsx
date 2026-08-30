import { generateTimeAxis } from "@/lib/timetable";

/**
 * 時間軸コンポーネント
 * タイムテーブルの左側に表示される時間軸
 */
export function TimeAxis() {
  const timeAxis = generateTimeAxis(10, 18);

  // グリッド線は装飾ではなく時間軸の目盛りであり、WCAG 1.4.11（非テキストコントラスト）の
  // 3:1 を満たす必要がある。白いシート上では border-gray-400（#8f8f8f / 3.23:1）を使う。
  // border-gray-200 は 1.53:1 しかなく、旧実装の border-gray-200/20 は 1.08:1 で消えていた。
  //
  // なお w-full は、このコンポーネントを収める TimetableChart 側の枠が w-20（80px）のため、
  // 盤面の右端まで伸びない。現状は「時刻ラベルに付く目盛り」として描画される。
  // 盤面を横断するグリッド線にするにはデスクトップ版チャートのレイアウト自体を
  // 組み直す必要があり、そちらは別Issueで追跡している。
  //
  // 時刻チップの bg-white は不透明であることが必須。グリッド線の上に白を敷いて線を切る
  // 役割を兼ねており、透過にすると線が数字を貫く。
  // 旧実装の bg-secondary（淡紫）は、ページ背景が淡紫だった時代の名残である。
  return (
    <div className="relative h-full">
      {timeAxis.map((time, index) => (
        <div
          key={time}
          className="absolute left-0 w-full border-t border-gray-400"
          style={{
            top: `${(index / (timeAxis.length - 1)) * 100}%`,
          }}
        >
          <span className="absolute -top-3 left-0 bg-white px-2 text-sm font-medium text-gray-700">
            {time}
          </span>
        </div>
      ))}
    </div>
  );
}
