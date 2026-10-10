import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getNewsById, getNewsList } from "@/lib/news";
import { NewsArticleMotion } from "@/components/info/NewsArticleMotion";
import { Badge } from "@/components/ui/Badge";
import { DraftPreviewBanner } from "@/components/layout/DraftPreviewBanner";
import { readDraftPreviewContext } from "@/lib/draft-mode";
import { createPageMetadata } from "@/lib/metadata";
import { getChromeMessages } from "@/i18n/chrome-messages";
import {
  absoluteSiteUrl,
  createBreadcrumbStructuredData,
  createOrganizationNode,
  organizationId,
  serializeJsonLd,
} from "@/lib/structured-data";
import { UnbreakableText } from "@/components/ui/UnbreakableText";

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ISR設定: 10分ごとに再検証
 */
export const revalidate = 600;

function resolveNewsCtaTarget(cta?: string): { href: string; external: boolean } | null {
  const value = cta?.trim();
  if (!value) return null;

  try {
    const baseUrl = absoluteSiteUrl("/");
    const url = new URL(value, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    const external = url.origin !== new URL(baseUrl).origin;
    return {
      href: external ? url.href : `${url.pathname}${url.search}${url.hash}`,
      external,
    };
  } catch {
    return null;
  }
}

/**
 * 静的パラメータ生成（generateStaticParams）
 * ビルド時に全お知らせページを生成
 */
export async function generateStaticParams() {
  const newsList = await getNewsList(100);
  return newsList.map((news) => ({
    id: news.id,
  }));
}

/**
 * メタデータ生成（動的OGP）
 */
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const draft = await readDraftPreviewContext("news", id);
  const news = await getNewsById(id, draft?.draftKey);

  if (!news) {
    return createPageMetadata({
      title: "お知らせが見つかりません",
      description: "お探しのお知らせは見つかりませんでした。",
      pathname: `/info/${id}`,
      // 存在しない記事から canonical を出さず、noindex にする（詳細は createPageMetadata）。
      noindex: true,
    });
  }

  return createPageMetadata({
    title: news.title,
    description: news.description || news.title,
    pathname: `/info/${id}`,
    type: "article",
    image: news.thumbnail
      ? {
          url: news.thumbnail.url,
          width: news.thumbnail.width,
          height: news.thumbnail.height,
          alt: news.title,
        }
      : undefined,
    // 下書きプレビューは公開前の内容である。canonical も出さない（createPageMetadata の仕様）
    noindex: draft !== null,
  });
}

/**
 * お知らせ詳細ページ
 */
export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  /*
   * 一覧の呼称をここでベタ書きすると、ヘッダー（「お知らせ」）や
   * フッターと食い違う。カタログ1箇所で決める。
   * このルートは CMS 本文が日本語のみのため ja 固定でよい。
   */
  const { navigation } = getChromeMessages("ja");
  const draft = await readDraftPreviewContext("news", id);
  const news = await getNewsById(id, draft?.draftKey);

  if (!news) {
    notFound();
  }

  // 公開日をフォーマット
  const publishedDate = new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  });

  // 構造化データ（JSON-LD）
  const newsArticle = {
    "@type": "NewsArticle",
    headline: news.title,
    description: news.description || news.title,
    datePublished: news.publishedAt || news.createdAt,
    dateModified: news.updatedAt,
    /*
     * 著者と発行者はトップページの Organization ノードと同一実体である。
     * 名前をベタ書きしていたため siteConfig.organization.name と食い違い、
     * publisher に logo も無かった（Google は publisher.logo を要求する）。
     * @id 参照にして、ノードの定義を1箇所へ寄せる。
     */
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteSiteUrl(`/info/${id}`),
    },
    image: news.thumbnail?.url,
  };

  // @id で参照する Organization の実体を同じ @graph に含める。
  // 参照先が無いと Google はノードを解決できない。
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [newsArticle, createOrganizationNode()],
  };
  const newsCtaTarget = resolveNewsCtaTarget(news.cta);
  const newsCtaClassName =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-md transition-[background-color,box-shadow,scale] duration-150 ease-out hoverable:hover:bg-primary-700 hoverable:hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100";

  /*
   * ルートを Fragment ではなく div にしていること。Fragment だと先頭の JSON-LD（寸法0で
   * 飛ばされる）の次の main がページの先頭要素になり、Next.js がサイト内遷移の最後に呼ぶ
   * focus() で main の上端が sticky Header の裏へ潜る（#429。
   * docs/frontend/landmarks-and-skip-link.md「ページの先頭要素を main にしない」）。
   */
  return (
    <div>
      {/*
        構造化データ。下書きプレビューでは出さない。
        公開前の内容を機械可読な形で置く必要がなく、noindex との整合も取れる
      */}
      {!draft && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
          />

          {/*
            パンくずの構造化データ。この直下の nav に視覚的なパンくずが実在するため
            宣言してよい（画面に無い階層を宣言するとガイドライン違反になる）。
          */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd(
                createBreadcrumbStructuredData([
                  { name: "トップ", pathname: "/" },
                  { name: navigation.newsList, pathname: "/info" },
                  { name: news.title },
                ])
              ),
            }}
          />
        </>
      )}

      {/*
        id は後続のスキップリンク（#177 A）がそのまま指せるように今から振っておく。
        このルートは PageSheetLayout を経由しないため、main は自前で出す必要がある
      */}
      <main
        id="content"
        tabIndex={-1}
        className="min-h-screen bg-secondary focus-visible:outline-none"
      >
        {/* パンくずリスト */}
        <nav className="bg-secondary py-6 sm:py-8" aria-label="パンくずリスト">
          {/* 記事（max-w-4xl）と左端を揃える。揃えないと広い画面で左端が2本になる */}
          <div className="container mx-auto px-4">
            <ol className="mx-auto flex max-w-4xl min-w-0 flex-wrap items-center gap-2 text-sm text-gray-900/80">
              <li>
                <Link href="/" className="text-primary-700 hover:underline">
                  トップ
                </Link>
              </li>
              {/* 区切りは階層ではない。li ごと隠さないとリストの項目数が階層数と合わなくなる */}
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </li>
              <li>
                <Link href="/info" className="text-primary-700 hover:underline">
                  {navigation.newsList}
                </Link>
              </li>
              {/* 区切りは階層ではない。li ごと隠さないとリストの項目数が階層数と合わなくなる */}
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </li>
              <li className="min-w-0 break-words font-semibold text-gray-900" aria-current="page">
                {news.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <div className="mx-4 rounded-t-3xl bg-white px-5 py-8 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 sm:px-8 sm:py-12 lg:mx-8 lg:py-16">
          <NewsArticleMotion />
          <article className="mx-auto min-w-0 max-w-4xl">
            {/* 記事ヘッダー */}
            <header className="mb-8 border-b border-gray-200 pb-8 sm:mb-10 sm:pb-10">
              <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-primary-700">
                SETAGAYA FES · NEWS
              </p>
              {/* バッジと公開日 */}
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge
                  variant={news.type}
                  label={
                    news.type === "urgent" ? "重要" : news.type === "news" ? "お知らせ" : "その他"
                  }
                />
                <time
                  dateTime={news.publishedAt || news.createdAt}
                  className="text-sm text-gray-600"
                >
                  {publishedDate}
                </time>
              </div>

              {/* タイトル */}
              <h1 className="mb-0 text-2xl leading-relaxed font-bold break-words text-balance [word-break:auto-phrase] text-gray-900 sm:text-3xl md:text-4xl md:leading-normal">
                <UnbreakableText text={news.title} />
              </h1>

              {/* サムネイル */}
              {news.thumbnail && (
                <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-gray-50">
                  {/*
                    alt に h1 と同じ文字列を入れると同じ語が2回読み上げられ、
                    画像の内容は一度も説明されないままになる。
                    microCMS に代替テキスト用のフィールドが無いため装飾として扱う
                  */}
                  <AppImage
                    src={news.thumbnail.url}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 896px"
                    priority
                  />
                </div>
              )}
            </header>

            {/* 本文 */}
            <div className="news-article-prose prose mx-auto max-w-[38em] text-base text-gray-700 sm:text-lg">
              {/* 説明文 */}
              {news.description && (
                <p className="mb-8 border-l-4 border-primary-600 bg-primary-50 py-4 pr-4 pl-5 text-base leading-8 font-medium text-gray-900 sm:text-lg">
                  {news.description}
                </p>
              )}

              {/* HTMLコンテンツ */}
              {news.content && (
                <div
                  className="mt-8"
                  data-news-reveal
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              )}
            </div>

            {newsCtaTarget && (
              <div className="mx-auto mt-10 max-w-[38em] sm:text-lg" data-news-reveal>
                {newsCtaTarget.external ? (
                  <a
                    href={newsCtaTarget.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={newsCtaClassName}
                  >
                    <span>詳しくはこちら</span>
                    <ExternalLink className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                    <span className="sr-only">（新しいタブで開きます）</span>
                  </a>
                ) : (
                  <Link href={newsCtaTarget.href} className={newsCtaClassName}>
                    <span>詳しくはこちら</span>
                    <ChevronRight className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                )}
              </div>
            )}
          </article>

          {/* 戻るリンク */}
          <div className="mx-auto mt-12 max-w-4xl border-t border-gray-200 pt-6 sm:mt-16 sm:pt-8">
            <Link
              href="/info"
              className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-primary-700 transition-colors hoverable:hover:border-primary-600 hoverable:hover:bg-primary-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 motion-reduce:transition-none"
            >
              <ArrowLeft
                className="h-5 w-5 transition-transform hoverable:group-hover:-translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>{navigation.newsList}に戻る</span>
            </Link>
          </div>
        </div>
      </main>

      {draft && <DraftPreviewBanner />}
    </div>
  );
}
