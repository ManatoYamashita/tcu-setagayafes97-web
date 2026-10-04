"use client";

import { useState } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { AppImage } from "@/components/ui/AppImage";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { sponsorsPageContent } from "@/data/sponsors";
import { hasSponsorDetails } from "@/lib/sponsor-list";
import type { Information } from "@/types/informations";

interface SponsorListProps {
  /** 協賛企業（優先度順）。並べ替えず、1件も捨てない */
  sponsors: Information[];
}

const PANEL_TITLE_ID = "sponsor-panel-title";

/**
 * 協賛・協力の一覧（ロゴまたは団体名だけのタイル）
 *
 * 全社を同じ大きさのタイルで `priority` 順に並べ、詳細を持つ協賛だけ押せるボタンにする。
 * 押すと `SlidePanel`（タイムテーブルの企画詳細と同じ機構）が出て、説明・Web サイトを見せる。
 * 団体名と表示順しか持たない協賛は押せない（`hasSponsorDetails`）。
 * 開いている協賛はURLに載せない。共有する価値が無いため。
 */
export function SponsorList({ sponsors }: SponsorListProps) {
  const [selected, setSelected] = useState<Information | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id}>
            <SponsorTile sponsor={sponsor} onSelect={setSelected} />
          </li>
        ))}
      </ul>
      <SlidePanel
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy={PANEL_TITLE_ID}
      >
        {selected && <SponsorPanelBody sponsor={selected} onClose={() => setSelected(null)} />}
      </SlidePanel>
    </>
  );
}

const tileBaseClassName =
  "relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-4";

function SponsorTile({
  sponsor,
  onSelect,
}: {
  sponsor: Information;
  onSelect: (sponsor: Information) => void;
}) {
  const face = sponsor.image?.url ? (
    <AppImage
      src={sponsor.image.url}
      alt={sponsor.title}
      fill
      className="object-contain p-4"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
    />
  ) : (
    <span className="min-w-0 text-center text-sm font-bold text-balance [overflow-wrap:anywhere] [word-break:auto-phrase] text-gray-900 md:text-base">
      {sponsor.title}
    </span>
  );

  if (!hasSponsorDetails(sponsor)) {
    return <div className={tileBaseClassName}>{face}</div>;
  }

  // 画像だけのタイルでも名前が読み上げられるよう、accessible name はボタンに持たせる。
  // 中の画像の alt と二重に読まれないよう、画像は装飾扱いにする
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={sponsor.title}
      onClick={() => onSelect(sponsor)}
      className={`${tileBaseClassName} cursor-pointer text-start transition-[border-color,box-shadow] hoverable:hover:border-primary-300 hoverable:hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600`}
    >
      <span aria-hidden="true" className="contents">
        {face}
      </span>
      <Plus className="absolute end-2 bottom-2 size-4 text-primary-700" aria-hidden="true" />
    </button>
  );
}

function SponsorPanelBody({ sponsor, onClose }: { sponsor: Information; onClose: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 justify-end border-b border-gray-200 px-4 py-2 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label={sponsorsPageContent.closeLabel}
          className="-me-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-gray-900 transition-colors hoverable:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        {sponsor.image?.url && (
          <div className="relative mb-5 h-32 w-full">
            <AppImage
              src={sponsor.image.url}
              alt=""
              fill
              className="object-contain"
              sizes="(min-width: 64rem) 400px, 100vw"
            />
          </div>
        )}

        <h2
          id={PANEL_TITLE_ID}
          className="text-2xl font-bold leading-tight text-balance text-gray-900"
        >
          {sponsor.title}
        </h2>

        {sponsor.description && (
          <p className="mt-4 text-base leading-8 whitespace-pre-wrap text-gray-700">
            {sponsor.description}
          </p>
        )}

        {sponsor.url && (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-700 underline underline-offset-4 hoverable:hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
          >
            {sponsorsPageContent.websiteLabel}
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
        )}
      </div>
    </div>
  );
}
