/**
 * 企画データが未入力のときに公開画面で使う表示文言。
 * 入稿不備を隠すのではなく、来場者へ準備中であることを伝える。
 */
export const EVENT_DISPLAY_FALLBACKS = {
  title: "企画情報準備中",
  organizer: "主催団体情報準備中",
  description: "企画の詳細情報は準備中です。",
  thumbnail: "画像準備中",
  venue: "会場未定",
} as const;

/**
 * 空文字・空白だけの文字列も未入力として扱い、表示用の既定値を返す。
 */
export function displayEventText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}
