import { ArrowUpRight, ExternalLink, Navigation } from "lucide-react";
import { AccessHeroMedia } from "@/components/access/AccessHeroMedia";
import { accessConfig, type AccessPageContent } from "@/data/access";

const linkClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";

interface AccessHeroProps {
  content: AccessPageContent;
}

export function AccessHero({ content }: AccessHeroProps) {
  return (
    <section aria-labelledby="access-hero-title" className="bg-white">
      <div className="w-full bg-white">
        <div className="grid min-h-[clamp(20rem,42dvh,28rem)] items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.75fr)] lg:gap-14 lg:px-16 xl:px-24">
          <div className="max-w-4xl">
            <h1
              id="access-hero-title"
              className="text-balance text-4xl font-bold tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {content.introduction.title}
            </h1>
          </div>

          <div>
            <p className="text-pretty text-base leading-7 text-gray-700 sm:text-lg sm:leading-8">
              {content.introduction.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <a
                href={accessConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClassName} bg-gray-950 text-white hover:bg-primary-700`}
              >
                <Navigation aria-hidden="true" className="h-4 w-4" />
                {content.introduction.mapLinkLabel}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                href={accessConfig.officialAccessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClassName} border border-gray-300 bg-white text-gray-900 hover:border-primary-400 hover:bg-primary-50`}
              >
                {content.introduction.officialLinkLabel}
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden bg-gray-100 sm:aspect-[2/1]">
          <AccessHeroMedia />
        </div>
      </div>
    </section>
  );
}
