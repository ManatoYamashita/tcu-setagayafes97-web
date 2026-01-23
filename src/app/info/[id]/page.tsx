import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getNewsById, getNewsList } from "@/lib/news";
import { Badge } from "@/components/ui/Badge";

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

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
  const news = await getNewsById(id);

  if (!news) {
    return {
      title: "お知らせが見つかりません | 東京都市大学 第97回 世田谷祭",
    };
  }

  return {
    title: `${news.title} | 東京都市大学 第97回 世田谷祭`,
    description: news.description || news.title,
    openGraph: {
      title: `${news.title} | 東京都市大学 第97回 世田谷祭`,
      description: news.description || news.title,
      type: "article",
      images: news.thumbnail
        ? [
            {
              url: news.thumbnail.url,
              width: news.thumbnail.width,
              height: news.thumbnail.height,
              alt: news.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${news.title} | 東京都市大学 第97回 世田谷祭`,
      description: news.description || news.title,
      images: news.thumbnail ? [news.thumbnail.url] : undefined,
    },
  };
}

/**
 * お知らせ詳細ページ
 */
export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) {
    notFound();
  }

  // 公開日をフォーマット
  const publishedDate = new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 構造化データ（JSON-LD）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.description || news.title,
    datePublished: news.publishedAt || news.createdAt,
    dateModified: news.updatedAt,
    author: {
      "@type": "Organization",
      name: "東京都市大学 第97回 世田谷祭 実行委員会",
    },
    publisher: {
      "@type": "Organization",
      name: "東京都市大学 第97回 世田谷祭",
    },
    image: news.thumbnail?.url,
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* パンくずリスト */}
        <nav className="border-b border-gray-200 bg-white py-4" aria-label="パンくずリスト">
          <div className="container mx-auto px-4">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-primary hover:underline">
                  トップ
                </Link>
              </li>
              <li>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li>
                <Link href="/info" className="hover:text-primary hover:underline">
                  お知らせ一覧
                </Link>
              </li>
              <li>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="font-semibold text-gray-900" aria-current="page">
                {news.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <div className="container mx-auto px-4 py-12">
          <article className="mx-auto max-w-4xl">
            {/* 記事ヘッダー */}
            <header className="mb-8">
              {/* バッジと公開日 */}
              <div className="mb-4 flex items-center gap-3">
                <Badge
                  variant={news.type}
                  label={
                    news.type === "urgent" ? "重要" : news.type === "news" ? "お知らせ" : "その他"
                  }
                />
                <time className="text-sm text-gray-500">{publishedDate}</time>
              </div>

              {/* タイトル */}
              <h1 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">{news.title}</h1>

              {/* サムネイル */}
              {news.thumbnail && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={news.thumbnail.url}
                    alt={news.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                    priority
                  />
                </div>
              )}
            </header>

            {/* 本文 */}
            <div className="prose prose-lg max-w-none">
              {/* 説明文 */}
              {news.description && (
                <p className="text-xl leading-relaxed text-gray-700">{news.description}</p>
              )}

              {/* HTMLコンテンツ */}
              {news.content && (
                <div className="mt-6" dangerouslySetInnerHTML={{ __html: news.content }} />
              )}
            </div>
          </article>

          {/* 戻るリンク */}
          <div className="mx-auto mt-12 max-w-4xl">
            <Link
              href="/info"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>お知らせ一覧に戻る</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
