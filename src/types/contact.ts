import { z } from "zod";

/**
 * お問い合わせ種別
 */
export const contactTypes = ["general", "media", "lost-and-found"] as const;
export type ContactType = (typeof contactTypes)[number];

/**
 * お問い合わせフォームバリデーションスキーマ
 */
export const contactFormSchema = z.object({
  // お問い合わせ種別
  type: z.enum(contactTypes, {
    message: "お問い合わせ種別を選択してください",
  }),

  // お名前
  name: z
    .string()
    .min(1, { message: "お名前を入力してください" })
    .max(100, { message: "お名前は100文字以内で入力してください" }),

  // メールアドレス
  email: z
    .string()
    .min(1, { message: "メールアドレスを入力してください" })
    .email({ message: "有効なメールアドレスを入力してください" }),

  // 電話番号（任意）
  phone: z
    .string()
    .regex(/^[0-9-]*$/, { message: "電話番号は数字とハイフンのみ入力可能です" })
    .max(15, { message: "電話番号は15文字以内で入力してください" })
    .optional()
    .or(z.literal("")),

  // 件名
  subject: z
    .string()
    .min(1, { message: "件名を入力してください" })
    .max(200, { message: "件名は200文字以内で入力してください" }),

  // お問い合わせ内容
  message: z
    .string()
    .min(10, { message: "お問い合わせ内容は10文字以上で入力してください" })
    .max(2000, { message: "お問い合わせ内容は2000文字以内で入力してください" }),

  // プライバシーポリシー同意
  agreeToPrivacyPolicy: z.boolean().refine((val) => val === true, {
    message: "プライバシーポリシーに同意してください",
  }),
});

/**
 * お問い合わせフォームデータ型
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * お問い合わせ種別ラベル
 */
export const contactTypeLabels: Record<ContactType, string> = {
  general: "一般・来場者向け",
  media: "取材・メディア向け",
  "lost-and-found": "落とし物のお問い合わせ",
};
