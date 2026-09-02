import Link from "next/link";
import type { Event } from "@/types/events";
import type { EventCardDensity } from "@/lib/timetable-layout";

interface TimetableEventCardProps {
  event: Event;
  /**
   * ガント盤面での表示密度。省略するとモバイルの縦スタック用（高さ自動・全項目）になります。
   * 値は `getCardDensity(heightPx)` から得てください。
   */
  density?: EventCardDensity;
  /** 読み上げ用にステージ名を補う。ガント盤面では列の位置でしか伝わらないため */
  stageName?: string;
}

/**
 * タイムテーブル用イベントカードコンポーネント
 * タイムテーブルに表示されるイベントカード
 *
 * タイトルに見出し要素を使っていないのは、見出しはステージ名（セクションの構造）が担うためです。
 * カードはリンクであり、その名前がタイトルになります。
 */
export function TimetableEventCard({ event, density, stageName }: TimetableEventCardProps) {
  // 著名人企画は専用LP（/special/[id]）が正規URL
  const href = event.type === "special" ? `/special/${event.id}` : `/events/${event.id}`;

  // ガント盤面では、時刻・場所・ステージが「位置」でしか伝わらず、密度によっては
  // 文字としても出ない。デスクトップ表示中はモバイル側の縦スタックが display:none で
  // 支援技術から見えないため、盤面のカードは単体で自足している必要がある。
  const label = [
    event.title,
    stageName,
    event.startTime && event.endTime ? `${event.startTime}から${event.endTime}` : undefined,
    event.place,
  ]
    .filter(Boolean)
    .join("／");

  // 左アクセントは primary-600（白いシート上で 7.45:1）。primary-light は 2.43:1 しかなく、
  // 装飾線としても読めない（docs/frontend/design.md「コントラスト比（アクセシビリティ）」）。
  // hover:border-* は border-color を全辺へ当てて border-left-color を上書きするため、
  // ホバー時の左色も明示している。
  // 面も bg-white で不透明に持つ。bg-white/10 は白いシート上では結果的に同じ色になるが、
  // 淡紫背景を前提にしたトークンであり、下地が変わったときに黙って崩れる。
  //
  // focus リングを ring-inset にしているのは、盤面が overflow-x-auto のスクロールコンテナで、
  // 外向きの outline / ring がクリップされて見えなくなるため。
  const base =
    "block h-full overflow-hidden rounded-lg bg-white border border-gray-200 transition-colors " +
    "hover:border-gray-400 border-l-4 border-l-primary-600 hover:border-l-primary-700 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600";

  const timeText = `${event.startTime} - ${event.endTime}`;

  // 高さが確保できないときは、優先度の低い情報から落とす。溢れさせて切ると
  // 「主催が途中で切れたカード」になり、読めない情報が場所だけ占めてしまう。
  if (density === "minimal") {
    return (
      <Link href={href} aria-label={label} className={`${base} px-2 py-1`}>
        <p className="text-xs font-bold leading-tight text-gray-900 line-clamp-1">{event.title}</p>
      </Link>
    );
  }

  if (density === "compact") {
    return (
      <Link href={href} aria-label={label} className={`${base} px-2 py-1`}>
        <p className="text-sm font-bold leading-tight text-gray-900 line-clamp-1">{event.title}</p>
        <p className="truncate text-xs font-medium text-primary-700">{timeText}</p>
      </Link>
    );
  }

  // 縦の余白が `px-3` と揃わないのは、60分企画（カード実寸 92px）へ
  // タイトル2行 + 時刻 + 場所（計 75px）を余白ごと収めるため。
  // `py-3` に戻すと必要高が 101px になり、`getCardDensity` の閾値も連動して上がるため、
  // 1時間企画が compact へ落ちて場所が表示されなくなる。
  if (density === "full") {
    return (
      <Link href={href} aria-label={label} className={`${base} px-3 py-1.5`}>
        <p className="mb-1 text-sm font-bold leading-tight text-gray-900 line-clamp-2">
          {event.title}
        </p>
        <p className="mb-1 truncate text-xs font-medium text-primary-700">{timeText}</p>
        <p className="truncate text-xs text-gray-900/80">{event.place}</p>
      </Link>
    );
  }

  // 密度指定なし = モバイルの縦スタック。高さが自由なので全項目を出す
  return (
    <Link href={href} className={`${base} p-3`}>
      {/* タイトル */}
      <p className="mb-1 text-sm font-bold text-gray-900 line-clamp-2">{event.title}</p>

      {/* 時刻 */}
      <p className="mb-1 text-xs font-medium text-primary-700">{timeText}</p>

      {/* 場所 */}
      <p className="text-xs text-gray-900/80">{event.place}</p>

      {/* 主催 */}
      {event.organizer && (
        <p className="mt-1 text-xs text-gray-900/60 line-clamp-1">{event.organizer}</p>
      )}
    </Link>
  );
}
