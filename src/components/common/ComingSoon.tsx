import { Cog } from "lucide-react";
import type { ReactNode } from "react";

interface ComingSoonProps {
  /** 大見出し。例: "企画情報は準備中です" */
  title?: string;
  /** 補足説明。デフォルト文言は汎用メッセージ */
  description?: string;
  /** 公開予定。"2026年2月公開予定" 等を指定すると下部にバッジ表示 */
  eta?: string;
  /** 中央アイコンを差し替えたい場合のスロット */
  icon?: ReactNode;
}

/**
 * 準備中（Coming Soon）表示用の共通セクション
 * カラクリ（歯車）モチーフを slow-spin させて、テーマと整合させる
 */
export function ComingSoon({
  title = "準備中です",
  description = "公開までもうしばらくお待ちください。",
  eta,
  icon,
}: ComingSoonProps) {
  return (
    <section aria-label={title} className="container mx-auto px-4 py-12">
      <div className="relative flex min-h-[40vh] flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl border border-gray-200/20 bg-white/10 px-6 py-16 text-center shadow-sm backdrop-blur-sm md:py-20">
        {/* 背景の薄い歯車装飾 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 text-primary/5 md:-right-16 md:-top-16"
        >
          <Cog className="h-48 w-48 motion-safe:animate-[spin_24s_linear_infinite] md:h-64 md:w-64" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-10 text-secondary/5"
        >
          <Cog className="h-36 w-36 motion-safe:animate-[spin_32s_linear_infinite_reverse] md:h-48 md:w-48" />
        </div>

        {/* メインアイコン */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary md:h-20 md:w-20">
          {icon ?? (
            <Cog className="h-8 w-8 motion-safe:animate-[spin_8s_linear_infinite] md:h-10 md:w-10" />
          )}
        </div>

        {/* テキスト */}
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Coming Soon
          </p>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-md text-sm text-gray-900/80 md:text-base">{description}</p>
        </div>

        {/* 公開予定バッジ */}
        {eta && (
          <div className="relative inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
            <span>{eta}</span>
          </div>
        )}
      </div>
    </section>
  );
}
