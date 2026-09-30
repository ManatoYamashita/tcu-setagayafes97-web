import type { MouseEvent } from "react";
import Link from "next/link";
import type { TimetableEntry } from "@/types/timetable";
import type { EventCardDensity } from "@/lib/timetable-layout";

interface TimetableEventCardProps {
  /** 開催枠1つぶん。2部制の企画は枠ごとに別のカードになる */
  event: TimetableEntry;
  /**
   * ガント盤面での表示密度。省略するとモバイルの縦スタック用（高さ自動・全項目）になります。
   * 値は `getCardDensity(heightPx)` から得てください。
   */
  density?: EventCardDensity;
  /** 読み上げ用にステージ名を補う。ガント盤面では列の位置でしか伝わらないため */
  stageName?: string;
  /**
   * 押されたときに企画詳細パネルを開く。省略すると通常のリンク遷移になる。
   * リンク（`href`）は残してあるので、新規タブ・中クリック・JS無効・クローラは従来どおり働く。
   */
  onSelect?: (entryKey: string) => void;
}

/**
 * タイムテーブル用イベントカードコンポーネント
 * タイムテーブルに表示されるイベントカード
 *
 * タイトルに見出し要素を使っていないのは、見出しはステージ名（セクションの構造）が担うためです。
 * カードはリンクであり、その名前がタイトルになります。
 */
export function TimetableEventCard({
  event,
  density,
  stageName,
  onSelect,
}: TimetableEventCardProps) {
  // 著名人企画は専用LP（/special/[id]）が正規URL
  const href = event.type === "special" ? `/special/${event.id}` : `/events/${event.id}`;

  // 著名人企画は専用LPへ遷移する。パネルで見せるのは通常の企画だけ。
  // 修飾キー付き・左ボタン以外は、ブラウザの「新規タブで開く」等へ任せる
  const opensPanel = onSelect !== undefined && event.type !== "special";
  const linkProps = {
    href,
    ...(opensPanel && {
      "aria-haspopup": "dialog" as const,
      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onSelect(event.entryKey);
      },
    }),
  };

  // ガント盤面では、時刻・場所・ステージが「位置」でしか伝わらず、密度によっては
  // 文字としても出ない。デスクトップ表示中はモバイル側の縦スタックが display:none で
  // 支援技術から見えないため、盤面のカードは単体で自足している必要がある。
  const label = [
    event.title,
    event.organizer,
    stageName,
    event.sessionLabel,
    `${event.startTime}から${event.endTime}`,
    event.openTime ? `開場${event.openTime}` : undefined,
    event.place,
  ]
    .filter(Boolean)
    .join("／");

  // 面は primary-700（白文字で 11.2:1）。ホバーで primary-600（同 7.45:1）へ明るくする。
  // primary-400 以下へ寄せると白文字が AA に届かない（docs/frontend/design.md「コントラスト比」）。
  // 枠線は透明で 1px を残す。`getCardDensity` の閾値が上下の border 2px を含めて計算しているため、
  // 枠ごと外すとカード内の高さ配分がずれる。
  //
  // focus リングを ring-inset にしているのは、盤面が overflow-x-auto のスクロールコンテナで、
  // 外向きの outline / ring がクリップされて見えなくなるため。暗色の面の上なので色は白を使う。
  const cardClass =
    "block h-full overflow-hidden rounded-lg border border-transparent bg-primary-700 text-white " +
    "transition-colors hoverable:hover:bg-primary-600 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white";

  // 2部制の企画は、同じタイトルのカードが2枚並ぶ。どちらの枠かを時刻の前に添える
  const timeText = `${event.sessionLabel ? `${event.sessionLabel} ` : ""}${event.startTime}–${event.endTime}`;

  // 開場時刻は高さを増やさず、時刻の行の後ろへ続ける（密度の閾値は行数で決まっているため）。
  // 溢れた分は truncate で切れる。全文は aria-label が伝える
  const openText = event.openTime ? (
    <span className="ms-1.5 font-normal">開場 {event.openTime}</span>
  ) : null;

  // 団体名は盤面のどこにも出ない情報なので、どの密度でも落とさない。
  // タイトルが「世田谷祭公演」のように団体名を含まない企画は、団体名が無いと見つけられない。
  // 行を足せない密度では、既存の行の後ろへ細字で続ける（1行に収め、溢れた分は省略記号で切る）
  const organizer = event.organizer ? (
    <span className="ms-1.5 font-normal">{event.organizer}</span>
  ) : null;

  // 高さが確保できないときは、優先度の低い情報から落とす。溢れさせて切ると
  // 「主催が途中で切れたカード」になり、読めない情報が場所だけ占めてしまう。
  if (density === "minimal") {
    return (
      <Link {...linkProps} aria-label={label} className={`${cardClass} px-2 py-1`}>
        <p className="truncate text-xs font-bold leading-tight">
          {event.title}
          {organizer}
        </p>
      </Link>
    );
  }

  if (density === "compact") {
    return (
      <Link {...linkProps} aria-label={label} className={`${cardClass} px-2 py-1`}>
        <p className="text-sm font-bold leading-tight line-clamp-1">{event.title}</p>
        <p className="truncate text-xs font-medium">
          {timeText}
          {openText}
          {organizer}
        </p>
      </Link>
    );
  }

  // 縦の余白が `px-3` と揃わないのは、60分企画（カード実寸 92px）へ
  // 15px のタイトル2行 + 13px の時刻・団体名（計 76.5px）を余白ごと収めるため。
  // `py-3` に戻すと `getCardDensity` の閾値も連動して上がるため、
  // 1時間企画が compact へ落ちて団体名が時刻の後ろへ押し込まれる。
  //
  // full の3行目は団体名で、場所は detailed（約72分以上）でだけ出す。場所はステージ列の見出しと
  // おおむね重なるが、団体名は盤面のどこにも出ないため。団体名が空の企画は場所で埋める。
  if (density === "detailed" || density === "full") {
    const lineClass = "truncate text-[0.8125rem] leading-tight";
    return (
      <Link {...linkProps} aria-label={label} className={`${cardClass} px-3 py-1.5`}>
        <p className="mb-1 text-[0.9375rem] font-bold leading-[1.2] line-clamp-2">{event.title}</p>
        <p className={`${lineClass} mb-1 font-semibold tabular-nums`}>
          {timeText}
          {openText}
        </p>
        {density === "detailed" ? (
          <>
            <p className={`${lineClass} ${event.organizer ? "mb-1" : ""}`}>{event.place}</p>
            {event.organizer ? <p className={lineClass}>{event.organizer}</p> : null}
          </>
        ) : (
          <p className={lineClass}>{event.organizer || event.place}</p>
        )}
      </Link>
    );
  }

  // 密度指定なし = モバイルの縦スタック。高さが自由なので全項目を出す
  return (
    <Link {...linkProps} className={`${cardClass} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="flex items-baseline gap-1 font-sans tabular-nums">
          <time dateTime={event.startTime} className="text-lg font-bold">
            {event.startTime}
          </time>
          <span className="sr-only">から</span>
          <span className="text-sm" aria-hidden="true">
            –
          </span>
          <time dateTime={event.endTime} className="text-sm font-semibold">
            {event.endTime}
          </time>
        </p>
        {(stageName || event.sessionLabel) && (
          <span className="flex flex-wrap gap-1">
            {event.sessionLabel && (
              <span className="rounded-full border border-primary-200 px-2 py-0.5 text-xs font-semibold">
                {event.sessionLabel}
              </span>
            )}
            {stageName && (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-primary-700">
                {stageName}
              </span>
            )}
          </span>
        )}
      </div>

      {event.openTime ? <p className="mt-1 text-sm tabular-nums">開場 {event.openTime}</p> : null}

      <p className="mt-2 text-base font-bold leading-snug text-pretty">{event.title}</p>
      <p className="mt-2 text-sm leading-relaxed">{event.place}</p>

      {event.organizer ? <p className="mt-1 text-sm leading-relaxed">{event.organizer}</p> : null}
    </Link>
  );
}
