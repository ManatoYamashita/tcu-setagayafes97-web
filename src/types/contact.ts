import { z } from "zod";

/**
 * お問い合わせ種別
 */
export const contactTypes = ["general", "media", "lost-and-found"] as const;
export type ContactType = (typeof contactTypes)[number];

/**
 * 検証メッセージの組
 *
 * クライアントはロケール別の組（`contact.validation.*`）を渡し、サーバーは既定の日本語を使う。
 * キーを足したら `src/messages/*.json` の `contact.validation` へ4言語で足すこと。
 */
export interface ContactValidationMessages {
  type: string;
  nameRequired: string;
  nameMax: string;
  emailRequired: string;
  emailInvalid: string;
  phoneFormat: string;
  phoneMax: string;
  subjectRequired: string;
  subjectMax: string;
  messageMin: string;
  messageMax: string;
  agreeToPrivacyPolicy: string;
}

/** サーバー側（`/api/contact`）が使う既定の検証メッセージ。運営向けのログ・応答は日本語 */
export const defaultContactValidationMessages: ContactValidationMessages = {
  type: "お問い合わせ種別を選択してください",
  nameRequired: "お名前を入力してください",
  nameMax: "お名前は100文字以内で入力してください",
  emailRequired: "メールアドレスを入力してください",
  emailInvalid: "有効なメールアドレスを入力してください",
  phoneFormat: "電話番号は数字とハイフンのみ入力可能です",
  phoneMax: "電話番号は15文字以内で入力してください",
  subjectRequired: "件名を入力してください",
  subjectMax: "件名は200文字以内で入力してください",
  messageMin: "お問い合わせ内容は10文字以上で入力してください",
  messageMax: "お問い合わせ内容は2000文字以内で入力してください",
  agreeToPrivacyPolicy: "プライバシーポリシーに同意してください",
};

/**
 * お問い合わせフォームバリデーションスキーマを作る
 *
 * 文字数などの制約はロケールによらず同じで、メッセージだけを差し替える。
 */
export function createContactFormSchema(
  messages: ContactValidationMessages = defaultContactValidationMessages
) {
  return z.object({
    // お問い合わせ種別
    type: z.enum(contactTypes, { message: messages.type }),

    // お名前
    name: z
      .string()
      .min(1, { message: messages.nameRequired })
      .max(100, { message: messages.nameMax }),

    // メールアドレス
    email: z
      .string()
      .min(1, { message: messages.emailRequired })
      .email({ message: messages.emailInvalid }),

    // 電話番号（任意）
    phone: z
      .string()
      .regex(/^[0-9-]*$/, { message: messages.phoneFormat })
      .max(15, { message: messages.phoneMax })
      .optional()
      .or(z.literal("")),

    // 件名
    subject: z
      .string()
      .min(1, { message: messages.subjectRequired })
      .max(200, { message: messages.subjectMax }),

    // お問い合わせ内容
    message: z
      .string()
      .min(10, { message: messages.messageMin })
      .max(2000, { message: messages.messageMax }),

    // プライバシーポリシー同意
    agreeToPrivacyPolicy: z.boolean().refine((val) => val === true, {
      message: messages.agreeToPrivacyPolicy,
    }),
  });
}

/**
 * お問い合わせフォームバリデーションスキーマ（既定の日本語メッセージ）
 */
export const contactFormSchema = createContactFormSchema();

/**
 * `/api/contact` が失敗したときに返す `code`
 *
 * クライアントはこれを `contact.errors.*` のキーへ対応づけて、ロケール別の文言を出す。
 */
export const contactErrorCodes = [
  "rate_limited",
  "invalid",
  "rejected",
  "unavailable",
  "server_error",
] as const;
export type ContactErrorCode = (typeof contactErrorCodes)[number];

/**
 * お問い合わせフォームデータ型
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * `/api/contact` が受け取る本文
 *
 * 人が入力する項目（`contactFormSchema`）に、自動投稿よけの2項目を足したものです。
 *
 * **`contactFormSchema` 側へ足してはいけません。** あちらは react-hook-form の
 * `zodResolver` が使うため、足すと**来場者に見えない欄のエラーが画面へ出ます。**
 * 判定は `src/lib/contact-guard.ts` が行い、ここでは型だけを受け取ります。
 */
export const contactSubmissionSchema = contactFormSchema.extend({
  /** ハニーポット。画面外にあり、人は入力できない */
  botField: z.string().max(200).optional(),
  /** フォームが描画されてから送信までのミリ秒。描画を経ない POST では欠落する */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

/**
 * お問い合わせ種別ラベル
 */
export const contactTypeLabels: Record<ContactType, string> = {
  general: "一般・来場者向け",
  media: "取材・メディア向け",
  "lost-and-found": "落とし物のお問い合わせ",
};
