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
      url: "/images/placeholder/p.jpeg",
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
      url: "/images/placeholder/p.jpeg",
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
      url: "/images/placeholder/p.jpeg",
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
      url: "/images/placeholder/p.jpeg",
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
      url: "/images/placeholder/p.jpeg",
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
      url: "/images/placeholder/p.jpeg",
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
  // 追加のステージ企画（タイムテーブル検証用）
  {
    id: "event-007",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day1",
    type: "stage",
    place: "7号館A（7A）",
    building: "7号館",
    title: "アカペラライブ 〜Harmony Voices〜",
    organizer: "アカペラサークル Harmony",
    thumbnail: {
      url: "/images/placeholder/p.jpeg",
      height: 800,
      width: 1200,
    },
    description:
      "学内アカペラサークルによる美しいハーモニーをお届けします。J-POPからクラシックまで、幅広いジャンルをカバー。",
    content:
      "学内アカペラサークルHarmonyによる圧巻のステージパフォーマンス。人の声だけで奏でる音楽の素晴らしさを体感してください。J-POPの人気曲からクラシックの名曲まで、幅広いレパートリーをお楽しみいただけます。",
    startTime: "11:00",
    endTime: "11:45",
    sns: {
      twitter: "https://twitter.com/tcu_harmony",
      instagram: "https://instagram.com/tcu_harmony",
    },
  },
  {
    id: "event-008",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day2",
    type: "stage",
    place: "7号館B（7B）",
    building: "7号館",
    title: "バンドコンテスト 〜ROCK THE CAMPUS〜",
    organizer: "軽音楽サークル連合",
    thumbnail: {
      url: "/images/placeholder/p.jpeg",
      height: 800,
      width: 1200,
    },
    description:
      "学内バンドサークルによる本格ライブコンテスト。ロック、ポップス、メタルなど、多彩なバンドが熱いステージを繰り広げます。",
    content:
      "学内の軽音楽サークルから選抜された8組のバンドが出演する大型ライブイベント。オリジナル曲からカバー曲まで、バラエティ豊かな音楽をお楽しみいただけます。来場者投票で優勝バンドを決定します。",
    startTime: "13:00",
    endTime: "16:00",
    sns: {
      twitter: "https://twitter.com/tcu_keion",
      website: "https://keion.example.com",
    },
  },
  {
    id: "event-009",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day1",
    type: "stage",
    place: "体育館",
    building: "体育館",
    title: "よさこいソーラン演舞",
    organizer: "よさこいソーランサークル 彩",
    thumbnail: {
      url: "/images/placeholder/p.jpeg",
      height: 800,
      width: 1200,
    },
    description:
      "迫力満点のよさこいソーラン演舞。色とりどりの衣装と力強い踊りで、会場を盛り上げます。",
    content:
      "よさこいソーランサークル「彩」による迫力満点のステージパフォーマンス。半年間練習を重ねてきた渾身の演舞をご覧ください。伝統的なよさこいソーランから現代風アレンジまで、多彩な演目を披露します。",
    startTime: "12:00",
    endTime: "12:40",
    sns: {
      instagram: "https://instagram.com/tcu_yosakoi",
    },
  },
  {
    id: "event-010",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "both",
    type: "stage",
    place: "ホール",
    building: "ホール",
    title: "演劇公演『青春の一ページ』",
    organizer: "演劇サークル Stage Craft",
    thumbnail: {
      url: "/images/placeholder/p.jpeg",
      height: 800,
      width: 1200,
    },
    description:
      "大学生活をテーマにした感動のオリジナル演劇。笑いあり涙ありの青春ストーリーをお届けします。",
    content:
      "演劇サークルStage Craftが贈る完全オリジナル脚本の舞台公演。大学生活の喜び、悩み、友情、恋愛を描いた心温まる青春ストーリー。プロの演出家による指導のもと、3ヶ月間稽古を重ねてきた渾身の作品です。両日とも公演いたします。",
    startTime: "15:00",
    endTime: "16:30",
    sns: {
      twitter: "https://twitter.com/tcu_stagecraft",
      website: "https://stagecraft.example.com",
    },
  },
  {
    id: "event-011",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day2",
    type: "stage",
    place: "中庭特設ステージ",
    building: "中庭",
    title: "ジャズコンサート 〜Autumn Jazz Night〜",
    organizer: "ジャズ研究会",
    thumbnail: {
      url: "/images/placeholder/p.jpeg",
      height: 800,
      width: 1200,
    },
    description:
      "秋の夜長にぴったりのジャズコンサート。スタンダードナンバーから現代ジャズまで、大人の音楽をお楽しみください。",
    content:
      "ジャズ研究会による本格ジャズコンサート。トランペット、サックス、ピアノ、ベース、ドラムによる5人編成で、ジャズの名曲を演奏します。秋の爽やかな風を感じながら、優雅なジャズサウンドに酔いしれてください。",
    startTime: "16:30",
    endTime: "17:30",
    sns: {
      instagram: "https://instagram.com/tcu_jazz",
    },
  },
  {
    id: "event-012",
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    publishedAt: "2026-09-10T10:00:00.000Z",
    date: "day1",
    type: "stage",
    place: "7号館A（7A）",
    building: "7号館",
    title: "落語研究会 寄席",
    organizer: "落語研究会",
    thumbnail: {
      url: "/images/placeholder/p.jpeg",
      height: 800,
      width: 1200,
    },
    description: "学生による本格落語公演。古典落語から創作落語まで、笑いの世界をお楽しみください。",
    content:
      "落語研究会による学生寄席を開催します。プロの落語家から指導を受けた学生たちが、古典落語の名作から、現代風にアレンジした創作落語まで披露。日本の伝統芸能の魅力を存分にお楽しみください。",
    startTime: "13:00",
    endTime: "14:00",
    sns: {
      twitter: "https://twitter.com/tcu_rakugo",
    },
  },
];
