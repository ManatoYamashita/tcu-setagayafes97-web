import { Bus, Footprints } from "lucide-react";
import type { ReactNode } from "react";

/** ノードの種類。出発＝塗り丸、経由＝白抜き丸、到着＝二重丸で区別する */
type MarkerVariant = "departure" | "via" | "arrival";

/** ノードから下へ伸びる区間の種類。乗車＝実線、徒歩＝点線 */
type LineVariant = "ride" | "walk";

const markerClassName: Record<MarkerVariant, string> = {
  departure: "mt-1.5 h-4 w-4 shrink-0 rounded-full bg-primary-600",
  via: "mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-primary-600 bg-white",
  arrival:
    "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary-600 bg-white",
};

// w-1（4px）と border-l-4（4px）はbox-sizingにより線幅と中心が一致する
const lineClassName: Record<LineVariant, string> = {
  ride: "min-h-8 w-1 flex-1 rounded-full bg-primary-600",
  walk: "min-h-8 w-1 flex-1 border-l-4 border-dotted border-gray-400",
};

const segmentLabelClassName =
  "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-gray-700";

interface TimelineStepProps {
  marker: MarkerVariant;
  title: string;
  subtitle?: string;
  /** 省略するとこのノードから下へ線を引かない（＝経路の終点） */
  lineVariant?: LineVariant;
  segment?: ReactNode;
}

/**
 * 経路タイムラインの1ステップ。
 *
 * 「ノード」と「そのノードから下へ出る区間」を1つの<li>にまとめることで、
 * 読み上げ順が経路順と一致する。縦線はステップごとに独立した要素なので、
 * 先頭ノードの上と終点ノードの下に線がはみ出すことがない。
 */
export function TimelineStep({ marker, title, subtitle, lineVariant, segment }: TimelineStepProps) {
  return (
    <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3">
      <div aria-hidden="true" className="flex flex-col items-center">
        <span className={markerClassName[marker]}>
          {marker === "arrival" && <span className="h-2 w-2 rounded-full bg-primary-600" />}
        </span>
        {lineVariant && <span className={lineClassName[lineVariant]} />}
      </div>

      {/* 終点以外は下側に余白を取り、その分だけ区間の線も伸びる */}
      <div className={`min-w-0 ${lineVariant ? "pb-4" : ""}`}>
        <p className="text-lg font-bold leading-7 text-gray-900">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs font-bold text-gray-600">{subtitle}</p>}
        {segment}
      </div>
    </li>
  );
}

interface DurationTextProps {
  label: string;
  minutes: number;
  unit: string;
  className?: string;
}

/** 所要時間。数字だけを一段大きくして視線が止まるようにする */
function DurationText({ label, minutes, unit, className }: DurationTextProps) {
  return (
    <span className={className}>
      {label} <span className="text-base">{minutes}</span>
      {unit}
    </span>
  );
}

interface RideSegmentLabelProps {
  lineCode: string;
  /** `{destination}` を含むテンプレート文字列 */
  destinationLabel: string;
  destination: string;
  rideTimeLabel: string;
  minutes: number;
  minuteUnit: string;
}

export function RideSegmentLabel({
  lineCode,
  destinationLabel,
  destination,
  rideTimeLabel,
  minutes,
  minuteUnit,
}: RideSegmentLabelProps) {
  return (
    <div className={segmentLabelClassName}>
      <Bus aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-600" />
      <span className="inline-flex items-center rounded-md bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
        {lineCode}
      </span>
      <span>{destinationLabel.replace("{destination}", destination)}</span>
      <DurationText
        label={rideTimeLabel}
        minutes={minutes}
        unit={minuteUnit}
        className="text-gray-600"
      />
    </div>
  );
}

interface WalkSegmentLabelProps {
  walkTimeLabel: string;
  minutes: number;
  minuteUnit: string;
}

export function WalkSegmentLabel({ walkTimeLabel, minutes, minuteUnit }: WalkSegmentLabelProps) {
  return (
    <div className={segmentLabelClassName}>
      <Footprints aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-600" />
      <DurationText label={walkTimeLabel} minutes={minutes} unit={minuteUnit} />
    </div>
  );
}
