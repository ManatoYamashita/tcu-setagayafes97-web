import { PageHero } from "@/components/ui/PageHero";
import type { PageHeroData } from "@/data/page-heroes";

interface PageSheetLayoutProps {
  hero: PageHeroData;
  children: React.ReactNode;
}

export function PageSheetLayout({ hero, children }: PageSheetLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary">
      <PageHero {...hero} />
      {/*
        スキップリンク（Header）の遷移先。data-page-sheet は Layout E2E が参照する
        目印なので消さないこと（docs/frontend/layout-e2e.md）。
        tabIndex={-1} はスキップリンク経由でフォーカスを受けるために要る。
        キーボードの順送りには入らない
      */}
      <main
        id="content"
        tabIndex={-1}
        className="relative z-10 -mt-6 mx-4 min-h-[50vh] rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] focus-visible:outline-none sm:mx-6 lg:mx-8"
        data-page-sheet
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
