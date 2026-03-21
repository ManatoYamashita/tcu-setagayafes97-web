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
      <div className="relative z-10 -mt-6 mx-4 min-h-[50vh] rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 lg:mx-8">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
