"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import {
  contactFormSchema,
  contactTypeLabels,
  type ContactFormData,
  type ContactType,
} from "@/types/contact";

/**
 * お問い合わせフォームコンポーネント
 */
export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: "general",
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      agreeToPrivacyPolicy: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: 実際のフォーム送信処理（Vercel Serverless Functionsまたは外部サービス）
      // 現在はダミー実装（成功を返す）
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form data:", data);

      setSubmitStatus("success");
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* 成功メッセージ */}
      {submitStatus === "success" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">送信完了</p>
              <p className="text-sm text-green-700">
                お問い合わせを受け付けました。3営業日以内にご返信いたします。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {submitStatus === "error" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">送信エラー</p>
              <p className="text-sm text-red-700">
                送信中にエラーが発生しました。時間をおいて再度お試しください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* お問い合わせ種別 */}
        <div>
          <label htmlFor="type" className="mb-2 block text-sm font-semibold text-gray-700">
            お問い合わせ種別 <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            {...register("type")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {(Object.keys(contactTypeLabels) as ContactType[]).map((type) => (
              <option key={type} value={type}>
                {contactTypeLabels[type]}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {/* お名前 */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            placeholder="山田 太郎"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="example@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* 電話番号（任意） */}
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
            電話番号 <span className="text-sm text-gray-500">（任意）</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="090-1234-5678"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        {/* 件名 */}
        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-gray-700">
            件名 <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            {...register("subject")}
            placeholder="企画について"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-semibold text-gray-700">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            {...register("message")}
            rows={8}
            placeholder="お問い合わせ内容を入力してください（10文字以上）"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
        </div>

        {/* プライバシーポリシー同意 */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register("agreeToPrivacyPolicy")}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-sm text-gray-700">
              <Link href="/about/privacy" className="text-primary hover:underline">
                プライバシーポリシー
              </Link>
              に同意する <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.agreeToPrivacyPolicy && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToPrivacyPolicy.message}</p>
          )}
        </div>

        {/* 送信ボタン */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>送信する</span>
              </>
            )}
          </button>
        </div>

        {/* 注意事項 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="text-red-500">*</span> は必須項目です。
            <br />
            お問い合わせ内容によっては、回答までお時間をいただく場合がございます。
          </p>
        </div>
      </form>
    </div>
  );
}
