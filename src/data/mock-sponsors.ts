import type { Information } from "@/types/informations";

/**
 * モックデータ: 協賛企業
 * microCMS準備完了までの開発用データ
 */
export const mockSponsors: Information[] = [
  {
    id: "sponsor-001",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    category: "sponsor",
    title: "株式会社テクノロジーソリューションズ",
    description: "最先端のITソリューションを提供する企業です。学生の成長を応援しています。",
    image: {
      url: "/logo.webp",
      height: 400,
      width: 800,
    },
    url: "https://example-tech.com",
    priority: 100,
  },
  {
    id: "sponsor-002",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    category: "sponsor",
    title: "グローバルエンジニアリング株式会社",
    description: "世界を舞台に活躍するエンジニアリング企業。未来の技術者を育成します。",
    image: {
      url: "/logo.webp",
      height: 400,
      width: 800,
    },
    url: "https://example-global.com",
    priority: 90,
  },
  {
    id: "sponsor-003",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    category: "sponsor",
    title: "世田谷商工会議所",
    description: "地域経済の発展と学生支援を目指して活動しています。",
    image: {
      url: "/logo.webp",
      height: 400,
      width: 800,
    },
    url: "https://example-chamber.com",
    priority: 80,
  },
  {
    id: "sponsor-004",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    category: "sponsor",
    title: "株式会社アカデミックサポート",
    description: "教育支援事業を通じて、次世代の人材育成に貢献します。",
    image: {
      url: "/logo.webp",
      height: 400,
      width: 800,
    },
    url: "https://example-academic.com",
    priority: 70,
  },
  {
    id: "sponsor-005",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    category: "sponsor",
    title: "ユニバーサルデザイン株式会社",
    description: "誰もが使いやすいデザインを追求する企業です。",
    image: {
      url: "/logo.webp",
      height: 400,
      width: 800,
    },
    url: "https://example-universal.com",
    priority: 60,
  },
  {
    id: "sponsor-006",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    category: "sponsor",
    title: "株式会社フューチャーイノベーション",
    description: "革新的な技術で未来を切り開くスタートアップ企業です。",
    image: {
      url: "/logo.webp",
      height: 400,
      width: 800,
    },
    url: "https://example-future.com",
    priority: 50,
  },
];
