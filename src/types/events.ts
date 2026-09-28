import type { MicroCMSImage, MicroCMSListResponse } from "microcms-js-sdk";

/**
 * 開催日
 */
export type EventDate = "day1" | "day2" | "both" | "other";

/**
 * 企画種別
 *
 * microCMS の select `type` と1対1で対応します。**選択肢を増やしたら、ここだけでなく
 * `src/lib/events.ts` の `normalizeEventType()` と `src/data/filter-options.ts` の
 * `typeFilterOptions` も直すこと。** 正規化はホワイトリスト方式なので、直さないと
 * 新しい値がエラーも警告も出さずに `other` へ落ちます（`store` が実際にそうなっていました）。
 */
export type EventType = "room" | "stage" | "store" | "special" | "other";

/**
 * SNS情報
 *
 * microCMS 側の `sns` はカスタムフィールドではなくテキストフィールド1つです。
 * 単一のURLを `normalizeSNSLinks()` が種別へ振り分けるため、1企画につき
 * 掲載できるSNSは1件のみという制約があります。
 */
export interface SNSLinks {
  twitter?: string;
  instagram?: string;
  website?: string;
}

/**
 * 物販商品（著名人企画LP用）
 *
 * microCMS カスタムフィールド `goodsItem` に対応します。
 * 価格は「¥3,000（税込）」「無料」といった表記をそのまま受けるため文字列です。
 */
export interface GoodsItem {
  fieldId: "goodsItem";
  name: string;
  color?: string;
  size?: string;
  price?: string;
  note?: string;
  isNew?: boolean;
  image?: MicroCMSImage;
}

/**
 * チケット券種（著名人企画LP用）
 *
 * microCMS カスタムフィールド `ticketPlan` に対応します。
 * 学内前売・学外一般・再販告知を、いずれもこの型の繰り返しで表現します。
 *
 * 券種ごとに埋まる項目が異なります（学内販売には発売日が無く、
 * 一般販売には販売場所が無いなど）。`name` 以外はすべて任意です。
 */
export interface TicketPlan {
  fieldId: "ticketPlan";
  name: string;
  price?: string;
  salesPeriod?: string;
  /** リッチエディタのHTML */
  method?: string;
  note?: string;
  buttonLabel?: string;
  /** 未入力の場合は購入ボタンごと非表示にすること */
  buttonUrl?: string;
}

/**
 * 注意事項ブロック（著名人企画LP用）
 *
 * microCMS カスタムフィールド `noticeSection` に対応します。
 * 年齢制限・車椅子でのご来場・不正転売の禁止といった見出し単位のブロックです。
 */
export interface NoticeSection {
  fieldId: "noticeSection";
  heading: string;
  /** リッチエディタのHTML */
  body?: string;
}

/**
 * 著名人企画の詳細（LP用の追加情報）
 *
 * microCMS カスタムフィールド `specialDetail` に対応し、`type` が `special` の
 * 企画にのみ入力されます。
 *
 * アーティスト写真（メイン）・紹介文・開演時刻・会場は Event の既存フィールド
 * （`thumbnail` / `content` / `sessions` / `place` / `building`）を使うため、
 * ここには含まれません。
 *
 * すべて任意です。未入力の項目はページ側でセクションごと非表示にします。
 */
export interface SpecialDetail {
  fieldId: "specialDetail";
  logo?: MicroCMSImage;
  photos?: MicroCMSImage[];
  openTime?: string;
  goods?: GoodsItem[];
  /** リッチエディタのHTML */
  goodsNote?: string;
  tickets?: TicketPlan[];
  /** リッチエディタのHTML */
  ticketNote?: string;
  notices?: NoticeSection[];
}

/**
 * 開催枠1つ（microCMS の生データ）
 *
 * microCMS カスタムフィールド `session` に対応し、繰り返しフィールド `sessions` の1行になります。
 * 管理画面で行を追加しただけで値を入れていない場合もあるため、どちらも任意です。
 */
export interface RawEventSession {
  fieldId: "session";
  startTime?: string;
  endTime?: string;
}

/**
 * 開催枠1つ（正規化済み）
 *
 * 値は trim 済みの文字列で、未入力は空文字です。**HH:mm として読めることは保証しません。**
 * 詳細ページは入稿されたとおりに表示し、タイムテーブルは読めない枠を警告して落とします
 * （`filterStageEvents()`）。
 */
export interface EventSession {
  startTime: string;
  endTime: string;
}

/**
 * microCMSから返される生のEvent型
 * dateとtypeフィールドが配列形式で返される可能性がある
 */
export interface RawEvent {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド（microCMSの生データ）
  date: string[] | string;
  type: string[] | string;
  place: string;
  building: string;
  title: string;
  organizer: string;
  thumbnail?: MicroCMSImage;
  description: string;
  content: string;
  // 開催枠が1つだけだった頃の欄。`sessions` が未入力のときだけ使う（`normalizeEvent()`）
  startTime?: string;
  endTime?: string;
  // 開催枠の繰り返し。未入力だとキーごと返らないことがある
  sessions?: RawEventSession[];
  sns?: string; // microCMSでは単一の文字列で返される可能性がある
  special?: SpecialDetail; // type が special の企画にのみ入力される
}

/**
 * 企画（Events API）
 * アプリケーション内で使用する正規化された型
 */
export interface Event {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド
  date: EventDate;
  type: EventType;
  place: string; // 場所（教室番号等）
  building: string; // 建物名
  title: string;
  organizer: string; // 主催団体名
  thumbnail?: MicroCMSImage;
  description: string;
  content: string;
  /**
   * 開催枠（開始時刻の昇順）。時刻未定なら空配列
   *
   * **`startTime` / `endTime` はこの型に存在しません。** 2部制の企画（#281）を表せるよう
   * `normalizeEvent()` がここへ一本化しています。先頭の枠だけを読むと第2部以降が消えるため、
   * 表示には `src/lib/event-sessions.ts` のヘルパーを使ってください。
   */
  sessions: EventSession[];
  sns?: SNSLinks;
  special?: SpecialDetail; // 著名人企画LP用の追加情報（type が special のときのみ）
}

/**
 * 企画一覧のレスポンス型（microCMS生データ）
 */
export type RawEventListResponse = MicroCMSListResponse<RawEvent>;

/**
 * 企画一覧のレスポンス型（正規化済み）
 */
export type EventListResponse = MicroCMSListResponse<Event>;
