import { PageHero, type PageHeroSize } from "@/components/ui/PageHero";
import type { PageHeroData } from "@/data/page-heroes";

interface PageSheetLayoutProps {
  hero: PageHeroData;
  heroSize?: PageHeroSize;
  children: React.ReactNode;
}

export function PageSheetLayout({ hero, heroSize = "default", children }: PageSheetLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary">
      <PageHero {...hero} size={heroSize} />
      {/*
        スキップリンク（Header）の遷移先。tabIndex={-1} はスキップリンク経由で
        フォーカスを受けるために要る（キーボードの順送りには入らない）。

        data-page-sheet を消さないこと。参照しているのは AccessPageMotion.tsx の
        2箇所で、アクセスページの入場モーションがシートの外側をスコープとして拾う。
        Layout E2E はこの属性を見ていないため、外しても e2e は緑のまま入場モーション
        だけが壊れる（docs/frontend/landmarks-and-skip-link.md）
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
