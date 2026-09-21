/**
 * お問い合わせフォームの自動投稿よけ（状態を持たない検査）
 *
 * **これは主防御です。** IP 単位のレート制限（`src/lib/rate-limit.ts`）は補助にすぎません。
 * サーバーレスではリミッタの状態がインスタンスごとに別で、**上限を超えたIPが数秒後に通ります**
 * （2026-09-21 実測。#260）。一方このモジュールは状態を持たないため、どのインスタンスでも同じ判定になります。
 *
 * **これはセキュリティ機構ではありません。** 落とせるのは「ページを描画せずに POST する」
 * 素朴な自動投稿までです。フォームを実際に描画して待つ相手は通ります。
 * それでも置くのは、`/api/contact` が**メールを送る口**であり、
 * 1通ごとに SMTP の送信枠と委員会の受信箱を消費するためです。
 */

/**
 * 送信までに最低限かかるべき時間
 *
 * 氏名・メール・件名・本文（10文字以上が必須）を人が入力すると、どんなに速くても数秒はかかります。
 * **短くしすぎると人を弾き、長くしすぎると意味がありません。** 3秒は「人には届かないが、
 * 即時 POST は落ちる」位置です。
 */
export const MIN_SUBMIT_ELAPSED_MS = 3000;

/** 判定結果。**理由を分けるのはログのためです**（どの経路で落ちたかが分からないと調整できない） */
export type SubmissionVerdict = "ok" | "bot-field-filled" | "too-fast" | "missing-timing";

interface SubmissionSignals {
  /** ハニーポット。画面には見えないので、人が入れることは通常ありません */
  botField?: string;
  /** フォームが描画されてから送信までのミリ秒。描画を経ない POST では欠落します */
  elapsedMs?: number;
}

/**
 * 自動投稿かどうかを判定する
 *
 * @returns `"ok"` 以外なら受け付けない
 */
export function evaluateSubmission({ botField, elapsedMs }: SubmissionSignals): SubmissionVerdict {
  // 人には見えない欄に値が入っている。ブラウザの自動入力が誤って埋める可能性はあるため、
  // 拒否時の案内は「再読み込みしてから入力し直す」にしてある（下の RETRY_HINT）
  if (botField !== undefined && botField.trim() !== "") return "bot-field-filled";

  // 描画を経ずに直接 POST している
  if (elapsedMs === undefined) return "missing-timing";

  if (elapsedMs < MIN_SUBMIT_ELAPSED_MS) return "too-fast";

  return "ok";
}

/**
 * 拒否されたときに来場者へ見せる案内
 *
 * **「時間をおいて再度お試しください」と書いてはいけません。** 待っても直りません。
 * 自動入力の誤爆で弾かれた人が自力で復帰できるよう、**再読み込み**を促します
 * （再読み込みでハニーポットの値も経過時間もリセットされます）。
 */
export const RETRY_HINT =
  "送信内容を確認できませんでした。お手数ですが、ページを再読み込みしてから、もう一度入力して送信してください。";

/**
 * 送信設定が欠けているときに何をするか
 *
 * | 戻り値      | 状況                             | 応答                                  |
 * | ----------- | -------------------------------- | ------------------------------------- |
 * | `"send"`    | 設定が揃っている                 | 送信して 200                          |
 * | `"reject"`  | **本番で設定が欠けている**       | **503。成功を返さない**               |
 * | `"dev-log"` | 本番以外で設定が欠けている       | ログへ出して 200（開発の利便のため）  |
 *
 * > [!WARNING]
 * > **本番で `"dev-log"` を返してはいけません。** 2026-09-21 まで、本番でも設定が欠けたまま
 * > `success: true` を返しており、来場者には「送信完了。3営業日以内にご返信いたします。」と
 * > 表示されていました。実際には関数ログへ出るだけで委員会には届かず、
 * > **落とし物の届け出もそこで消えていました**（#261）。
 *
 * @param missing 未設定の環境変数名
 * @param isProduction `process.env.NODE_ENV === "production"`
 */
export function decideMailerAction(
  missing: readonly string[],
  isProduction: boolean
): "send" | "reject" | "dev-log" {
  if (missing.length === 0) return "send";

  return isProduction ? "reject" : "dev-log";
}
