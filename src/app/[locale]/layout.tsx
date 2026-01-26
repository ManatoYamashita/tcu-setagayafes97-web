import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

/**
 * 静的パラメータ生成
 * 全ロケールのページを事前生成
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * ロケール対応レイアウト
 *
 * - 多言語対応ページ専用のレイアウト
 * - NextIntlClientProviderで翻訳メッセージを提供
 * - setRequestLocaleで静的レンダリングを有効化
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // ロケールの検証
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // 静的レンダリングを有効化
  setRequestLocale(locale);

  // 翻訳メッセージを取得
  const messages = await getMessages();

  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
