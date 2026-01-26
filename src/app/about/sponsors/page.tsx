import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";
import { getSponsorsList } from "@/lib/informations";
import type { Information } from "@/types/informations";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "協賛企業一覧 | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭を支援してくださる協賛企業様をご紹介します。心より感謝申し上げます。",
  openGraph: {
    title: "協賛企業一覧 | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭を支援してくださる協賛企業様をご紹介します。心より感謝申し上げます。",
    type: "website",
  },
};

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * 協賛企業一覧ページ
 */
export default async function SponsorsPage() {
  // 協賛企業一覧を取得
  const sponsors = await getSponsorsList();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">協賛企業</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">
            第97回 世田谷祭を支援してくださる企業様
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {/* 感謝メッセージ */}
          <section className="mb-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">協賛企業の皆様へ</h2>
            <p className="text-center text-gray-700">
              第97回
              世田谷祭の開催にあたり、多大なるご支援を賜りました協賛企業の皆様に、心より感謝申し上げます。
              <br />
              皆様のご協力により、学生主体の素晴らしいイベントを実現することができております。
            </p>
          </section>

          {/* 協賛企業件数表示 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{sponsors.length}</span> 社の企業様
            </p>
          </div>

          {/* 協賛企業一覧 */}
          {sponsors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">現在、協賛企業情報は準備中です。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 協賛企業カードコンポーネント
 */
interface SponsorCardProps {
  sponsor: Information;
}

function SponsorCard({ sponsor }: SponsorCardProps) {
  const CardContent = (
    <div className="group h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-primary hover:shadow-lg">
      {/* ロゴ */}
      {sponsor.logo ? (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
          <Image
            src={sponsor.logo.url}
            alt={sponsor.sponsorName || sponsor.title}
            fill
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary to-purple-600">
          <Heart className="h-16 w-16 text-white opacity-50" />
        </div>
      )}

      <div className="p-6">
        {/* 企業名 */}
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {sponsor.sponsorName || sponsor.title}
        </h3>

        {/* 説明文 */}
        {sponsor.sponsorDescription && (
          <p className="mb-4 line-clamp-3 text-sm text-gray-600">{sponsor.sponsorDescription}</p>
        )}

        {/* Webサイトリンク */}
        {sponsor.url && (
          <div className="mt-4 flex items-center gap-2 text-sm text-primary">
            <ExternalLink className="h-4 w-4" />
            <span className="group-hover:underline">Webサイトを見る</span>
          </div>
        )}
      </div>
    </div>
  );

  // URLがある場合はリンク、ない場合は通常のdiv
  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {CardContent}
      </a>
    );
  }

  return <div>{CardContent}</div>;
}
