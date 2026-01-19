import type { Event } from "@/types/events";

/**
 * モックデータ: 企画
 * microCMS準備完了までの開発用データ
 */
export const mockEvents: Event[] = [
  {
    id: "event-001",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "both",
    type: "stage",
    place: "中庭特設ステージ",
    building: "中庭",
    title: "TCUダンスパフォーマンスショー",
    organizer: "ダンスサークル GROOVE",
    thumbnail: {
      url: "/images/placeholder/event-01.jpg",
      height: 800,
      width: 1200,
    },
    description:
      "学内最大級のダンスサークルGROOVEによる圧巻のパフォーマンス。ヒップホップ、ジャズ、ブレイクダンスなど多彩なジャンルを披露します。",
    content:
      "学内最大級のダンスサークルGROOVEによる圧巻のパフォーマンスをお届けします。ヒップホップ、ジャズ、ブレイクダンスなど多彩なジャンルを織り交ぜた30分のステージショー。1年生から4年生まで総勢50名が出演します。両日とも14:00から開催予定です。",
    startTime: "14:00",
    endTime: "14:30",
    sns: {
      twitter: "https://twitter.com/tcu_groove",
      instagram: "https://instagram.com/tcu_groove",
    },
  },
  {
    id: "event-002",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day1",
    type: "room",
    place: "1号館201教室",
    building: "1号館",
    title: "VR体験コーナー 〜未来の教室へようこそ〜",
    organizer: "情報科学部 VR研究会",
    thumbnail: {
      url: "/images/placeholder/event-02.jpg",
      height: 800,
      width: 1200,
    },
    description:
      "最新のVR技術を使った没入型体験をお楽しみいただけます。学生が開発したオリジナルコンテンツも多数展示。",
    content:
      "情報科学部のVR研究会が制作した最新VRコンテンツを体験できます。宇宙探検、海底散策、歴史的建造物の再現など、多彩なコンテンツをご用意。所要時間は1回約5分。先着順での体験となりますので、お早めにお越しください。",
    startTime: "10:00",
    endTime: "17:00",
    sns: {
      twitter: "https://twitter.com/tcu_vr_lab",
      website: "https://vr-lab.example.com",
    },
  },
  {
    id: "event-003",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "both",
    type: "room",
    place: "2号館1階ホール",
    building: "2号館",
    title: "世田谷カフェ 〜コーヒーと軽食の店〜",
    organizer: "軽音楽サークル Acoustic Waves",
    thumbnail: {
      url: "/images/placeholder/event-03.jpg",
      height: 800,
      width: 1200,
    },
    description:
      "本格コーヒーと手作りスイーツを提供するカフェ企画。アコースティックギターの生演奏もお楽しみいただけます。",
    content:
      "落ち着いた雰囲気の中で、本格的なハンドドリップコーヒーと手作りスイーツをお楽しみいただけます。定期的にアコースティックギターの生演奏も実施。勉強や休憩の場としてもご利用ください。メニューはコーヒー300円、ケーキセット500円など。",
    startTime: "10:00",
    endTime: "17:00",
    sns: {
      instagram: "https://instagram.com/tcu_acoustic",
    },
  },
  {
    id: "event-004",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day2",
    type: "special",
    place: "体育館",
    building: "体育館",
    title: "お笑いライブ 〜芸人ネタバトル〜",
    organizer: "世田谷祭実行委員会",
    thumbnail: {
      url: "/images/placeholder/event-04.jpg",
      height: 800,
      width: 1200,
    },
    description:
      "プロの芸人さんを招いた本格お笑いライブ。漫才、コント、ピン芸など、バラエティ豊かなネタをお届けします。",
    content:
      "世田谷祭実行委員会が厳選したプロの芸人さんたちによる本格お笑いライブを開催します。漫才、コント、ピン芸など、バラエティ豊かなネタをお届け。学園祭ならではの笑いと感動をお楽しみください。入場無料、先着300名様限定です。",
    startTime: "15:00",
    endTime: "16:30",
  },
  {
    id: "event-005",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "both",
    type: "room",
    place: "3号館501教室",
    building: "3号館",
    title: "お化け屋敷 〜廃校の怪〜",
    organizer: "演劇サークル Stage Craft",
    thumbnail: {
      url: "/images/placeholder/event-05.jpg",
      height: 800,
      width: 1200,
    },
    description:
      "廃校をテーマにした本格お化け屋敷。演劇サークルが総力を挙げて制作した恐怖の空間をお楽しみください。",
    content:
      "演劇サークル Stage Craftが3ヶ月かけて制作した本格お化け屋敷。廃校に伝わる怪談をベースに、プロジェクションマッピングや特殊メイクを駆使した恐怖演出をお楽しみいただけます。所要時間約10分。心臓の弱い方はご遠慮ください。",
    startTime: "10:00",
    endTime: "17:00",
    sns: {
      twitter: "https://twitter.com/tcu_stagecraft",
    },
  },
  {
    id: "event-006",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day1",
    type: "room",
    place: "1号館103教室",
    building: "1号館",
    title: "プログラミング体験教室 〜初めてのゲーム制作〜",
    organizer: "プログラミング研究会",
    thumbnail: {
      url: "/images/placeholder/event-06.jpg",
      height: 800,
      width: 1200,
    },
    description:
      "プログラミング初心者向けのゲーム制作体験。現役大学生が丁寧にサポートしますので、小学生から大人まで安心してご参加いただけます。",
    content:
      "プログラミング初心者の方でも楽しめるゲーム制作体験教室を開催します。ブロックを組み合わせるだけで簡単にゲームが作れるScratchを使用。現役情報科学部生が丁寧にサポートしますので、小学生から大人まで安心してご参加いただけます。1回30分、先着順での受付となります。",
    startTime: "11:00",
    endTime: "16:00",
    sns: {
      website: "https://programming-club.example.com",
    },
  },
];
