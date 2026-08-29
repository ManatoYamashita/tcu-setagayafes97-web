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
 * `generateStaticParams` が返さないロケールを Next.js のルーティング層で404にする。
 *
 * IMPORTANT: 下の `notFound()` だけでは 404 にならない。ルート直下の
 * `src/app/loading.tsx` によりストリーミングのシェルが先に送出されるため、
 * レンダリング中に投げた `notFound()` は HTTP ステータスへ反映されず、
 * 404の本文が 200 のまま返る。その結果 `/foo/about` や `/97th/access` が
 * `/about`・`/access` と同じ内容を200で重複配信していた。
 *
 * `dynamicParams` はレンダリングより前のルート照合で評価されるため、この影響を
 * 受けない。下の `notFound()` は型の絞り込みと将来の防御として残す。
 *
 * ロケールを増やすときは `src/i18n/routing.ts` の `locales` を更新すること。
 * `generateStaticParams` はそこから生成しているため、追随は自動で効く。
 */
export const dynamicParams = false;

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

  return (
    /*
      messages は全名前空間をそのまま渡している。pick() 等で絞り込むと、
      クライアントコンポーネントから useTranslations を呼んでいる
      info/faq/FAQContent.tsx（faq / navigation）が実行時に落ちる。
      絞る場合は各クライアントコンポーネントが参照する名前空間を必ず含めること。
    */
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/*
        言語範囲の宣言。ルートレイアウトの <html lang> はロケールを知らないため
        既定の "ja" 固定であり、支援技術が英語の本文を日本語の音声エンジンで
        読み上げてしまう。要素レベルの lang でこの範囲だけを上書きする。
        JavaScript を実行しない環境でも効くのはこちら。
      */}
      <div lang={locale}>{children}</div>
    </NextIntlClientProvider>
  );
}
