import type { News } from "@/types/news";

/**
 * モックデータ: お知らせ
 * microCMS準備完了までの開発用データ
 */
export const mockNews: News[] = [
  {
    id: "news-001",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
    publishedAt: "2026-09-15T10:00:00.000Z",
    type: "urgent",
    title: "台風接近に伴う開催可否について",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description:
      "台風の接近が予想されておりますが、現時点では予定通り開催予定です。中止の場合は前日18時までに公式サイト・SNSでお知らせいたします。",
    content:
      "台風の接近が予想されておりますが、現時点では予定通り開催予定です。開催中止となる場合は、前日（10月30日）18時までに公式サイトおよびSNSでお知らせいたします。最新情報は随時更新いたしますので、ご来場前に必ずご確認ください。",
  },
  {
    id: "news-002",
    createdAt: "2026-09-01T12:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
    publishedAt: "2026-09-01T12:00:00.000Z",
    type: "news",
    title: "第97回世田谷祭公式サイトを公開しました",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description:
      "東京都市大学 第97回世田谷祭の公式サイトを公開しました。企画情報やタイムテーブル、アクセス情報などを掲載しています。",
    content:
      "東京都市大学 第97回世田谷祭の公式サイトを公開しました。本サイトでは、企画情報、タイムテーブル、キャンパスマップ、アクセス情報などを掲載しています。今後も随時情報を更新してまいりますので、ぜひブックマークしてご活用ください。",
  },
  {
    id: "news-003",
    createdAt: "2026-08-20T09:00:00.000Z",
    updatedAt: "2026-08-20T09:00:00.000Z",
    publishedAt: "2026-08-20T09:00:00.000Z",
    type: "other",
    title: "協賛企業を募集しています",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description:
      "第97回世田谷祭では、協賛企業様を募集しております。詳細は実行委員会までお問い合わせください。",
    content:
      "第97回世田谷祭では、協賛企業様を募集しております。協賛いただける企業様には、公式サイトやパンフレットへの掲載、会場内での広告掲出などの特典をご用意しております。詳細につきましては、実行委員会までお問い合わせください。",
  },
  {
    id: "news-004",
    createdAt: "2026-08-10T14:00:00.000Z",
    updatedAt: "2026-08-10T14:00:00.000Z",
    publishedAt: "2026-08-10T14:00:00.000Z",
    type: "news",
    title: "企画エントリーの受付を開始しました",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description:
      "世田谷祭に出展する企画のエントリー受付を開始しました。参加団体は9月末までにお申し込みください。",
    content:
      "第97回世田谷祭に出展する企画のエントリー受付を開始しました。教室企画・ステージ企画・屋外企画など、幅広いジャンルで募集しています。参加を希望される団体は、9月30日までに専用フォームよりお申し込みください。",
  },
  {
    id: "news-005",
    createdAt: "2026-07-25T11:00:00.000Z",
    updatedAt: "2026-07-25T11:00:00.000Z",
    publishedAt: "2026-07-25T11:00:00.000Z",
    type: "urgent",
    title: "ボランティアスタッフを募集中",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description: "世田谷祭当日の運営をサポートしていただけるボランティアスタッフを募集しています。",
    content:
      "第97回世田谷祭の開催にあたり、当日の運営をサポートしていただけるボランティアスタッフを募集しています。来場者案内、受付、設営・撤去など、さまざまな役割がございます。ご興味のある方は実行委員会までご連絡ください。",
  },
  {
    id: "news-006",
    createdAt: "2026-07-15T08:00:00.000Z",
    updatedAt: "2026-07-15T08:00:00.000Z",
    publishedAt: "2026-07-15T08:00:00.000Z",
    type: "news",
    title: "公式SNSアカウントを開設しました",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description:
      "世田谷祭の最新情報をお届けする公式SNSアカウントを開設しました。ぜひフォローをお願いいたします。",
    content:
      "第97回世田谷祭の公式SNSアカウントを開設しました。X（旧Twitter）、Instagramにて最新情報や企画の紹介などを発信してまいります。ぜひフォローをお願いいたします。",
  },
  {
    id: "news-007",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
    publishedAt: "2026-07-01T10:00:00.000Z",
    type: "other",
    title: "第97回世田谷祭のテーマが決定しました",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description: "今年の世田谷祭のテーマが決定しました。詳細は近日中に公開予定です。",
    content:
      "第97回世田谷祭のテーマが決定しました。今年のテーマに込められた思いや、テーマに沿った企画の詳細は近日中に公開予定です。お楽しみにお待ちください。",
  },
  {
    id: "news-008",
    createdAt: "2026-06-20T09:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
    publishedAt: "2026-06-20T09:00:00.000Z",
    type: "news",
    title: "実行委員会の新体制が発足しました",
    thumbnail: {
      url: "/images/placeholder/pastel-castle.webp",
      height: 630,
      width: 1200,
    },
    description:
      "第97回世田谷祭の実行委員会が新体制で活動を開始しました。委員長挨拶を近日公開予定です。",
    content:
      "第97回世田谷祭の実行委員会が新体制で活動を開始しました。委員長をはじめとする各部門の責任者が決まり、今年の学園祭に向けて準備を進めています。委員長挨拶は近日中にABOUTページにて公開予定です。",
  },
];
