import type { Event } from "@/types/events";

/**
 * タイムテーブル検証用のフィクスチャ（開発専用）
 *
 * microCMS の実データはステージ企画が1件しかなく、しかも `place` がどのステージにも
 * 一致しない表記のため、盤面のレイアウトを実際に検証できません。
 * `NEXT_PUBLIC_TIMETABLE_FIXTURE=1` かつ開発ビルドのときだけ、
 * `src/app/timetable/page.tsx` がこのデータへ差し替えます。
 *
 * **本番ビルドには載りません。** 呼び出し側の分岐が `process.env.NODE_ENV` を見ており、
 * ビルド時に定数置換されて到達不能コードになるため、動的 import のチャンクごと落ちます。
 *
 * 網羅しているケース（減らすときは、何を検証できなくなるかを確認すること）:
 *
 * | 企画                   | 検証対象                                       |
 * | ---------------------- | ---------------------------------------------- |
 * | 7A の 13:00 と 13:30   | 同一ステージの時間重なり → レーン分割           |
 * | 体育館の 09:30 開始    | レンジの下端が10時より前へ広がること           |
 * | 中庭の 19:00 終了      | レンジの上端が18時より後ろへ広がること         |
 * | 7B の 15分企画         | MIN_EVENT_HEIGHT_PX と minimal 密度            |
 * | ホールの 30分企画      | compact 密度                                   |
 * | 【TEST】テストステージ | 「その他」列 + 開発時の console.warn           |
 * | startTime が "1000"    | 形式不正が filterStageEvents で落ちること       |
 * | date: "both"           | Day1 / Day2 の両方に出ること                   |
 *
 * **ユニットテストからも読まれます**（`src/lib/timetable.test.ts` ほか）。
 * 上の表の各行は、対応するテストが実際に検証しています。件数や時刻を変更すると
 * テストの期待値が動くため、変更時は `pnpm test` を通してください。
 */

const BASE = {
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  publishedAt: "2026-08-01T00:00:00.000Z",
  building: "7号館",
  description: "検証用のダミー企画です。",
  content: "<p>検証用のダミー企画です。</p>",
} as const;

export function fixture(
  id: string,
  overrides: Pick<Event, "date" | "type" | "place" | "title" | "organizer"> &
    Partial<Pick<Event, "startTime" | "endTime" | "building" | "description">>
): Event {
  return { ...BASE, id, ...overrides };
}

export const stageEventFixtures: Event[] = [
  fixture("fx-7a-1", {
    date: "day1",
    type: "stage",
    place: "7A ステージ",
    title: "軽音楽部 ライブステージ",
    organizer: "軽音楽部",
    startTime: "10:30",
    endTime: "12:00",
  }),
  fixture("fx-7a-2", {
    date: "day1",
    type: "stage",
    place: "7A ステージ",
    title: "ダンスサークル ショーケース",
    organizer: "Dance Circle SWING",
    startTime: "13:00",
    endTime: "14:30",
  }),
  // fx-7a-2 と重なる。レーン分割されて左右に並ぶこと
  fixture("fx-7a-3", {
    date: "day1",
    type: "stage",
    place: "7A ステージ",
    title: "アカペラサークル 中間公演",
    organizer: "アカペラサークル",
    startTime: "13:30",
    endTime: "14:00",
  }),
  // 15分。MIN_EVENT_HEIGHT_PX にクランプされ、密度は minimal
  fixture("fx-7b-1", {
    date: "day1",
    type: "stage",
    place: "7B",
    title: "開会宣言",
    organizer: "実行委員会",
    startTime: "11:00",
    endTime: "11:15",
  }),
  // 10時より前。レンジの下端が広がること
  fixture("fx-gym-1", {
    date: "day1",
    type: "stage",
    place: "体育館 メインアリーナ",
    title: "オープニングセレモニー",
    organizer: "実行委員会",
    building: "体育館",
    startTime: "09:30",
    endTime: "10:15",
  }),
  fixture("fx-gym-2", {
    date: "day1",
    type: "special",
    place: "体育館 メインアリーナ",
    title: "著名人ステージ（検証用）",
    organizer: "実行委員会",
    building: "体育館",
    startTime: "15:00",
    endTime: "17:00",
  }),
  // 30分。密度は compact
  fixture("fx-hall-1", {
    date: "both",
    type: "stage",
    place: "ホール",
    title: "落語研究会 寄席",
    organizer: "落語研究会",
    building: "講堂",
    startTime: "12:00",
    endTime: "12:30",
  }),
  // 18時より後。レンジの上端が広がること
  fixture("fx-court-1", {
    date: "day1",
    type: "stage",
    place: "中庭特設ステージ",
    title: "後夜祭ライブ",
    organizer: "実行委員会",
    building: "中庭",
    startTime: "17:30",
    endTime: "19:00",
  }),
  // どのステージにも一致しない。「その他」列へ入り、開発コンソールに警告が1回出ること
  fixture("fx-other-1", {
    date: "day1",
    type: "stage",
    place: "【TEST】テストステージ会場",
    title: "【TEST】テストステージ企画",
    organizer: "実行委員会",
    startTime: "11:00",
    endTime: "12:00",
  }),
  // 時刻の形式が不正。filterStageEvents で落ち、盤面にも縦スタックにも出ないこと
  fixture("fx-broken-1", {
    date: "day1",
    type: "stage",
    place: "7B",
    title: "時刻が壊れている企画",
    organizer: "実行委員会",
    startTime: "1000",
    endTime: "11:00",
  }),
  fixture("fx-day2-1", {
    date: "day2",
    type: "stage",
    place: "7A ステージ",
    title: "吹奏楽部 定期演奏会",
    organizer: "吹奏楽部",
    startTime: "13:00",
    endTime: "14:00",
  }),
];
