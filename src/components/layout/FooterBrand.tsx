"use client";

import { AppImage } from "@/components/ui/AppImage";
import { useChromeNav } from "@/components/layout/useChromeNav";

/**
 * フッターのロゴ。alt をロケール別にするため、ロケール解決が要る部分として切り出している。
 *
 * Footer 本体はサーバーコンポーネントのまま保つ（FooterNav と同じ理由）。
 */
export function FooterLogo({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className: string;
}) {
  const { locale, messages } = useChromeNav();

  return (
    <AppImage
      lang={locale}
      src="/images/brand/logo-white.avif"
      alt={messages.brand.logoAlt}
      width={width}
      height={height}
      sizes={`${width}px`}
      className={className}
    />
  );
}

/**
 * フッター下部のサイト名とコピーライト
 *
 * 年は props で受け取る。ここで `new Date().getFullYear()` を呼ぶと、ビルド時と閲覧時で
 * 年をまたいだときにハイドレーション不一致になる（Footer がサーバーで一度だけ決めて渡す）。
 */
export function FooterCopyright({ year }: { year: number }) {
  const { locale, messages } = useChromeNav();

  return (
    <>
      <p lang={locale} className="mb-2">
        {messages.brand.name}
      </p>
      <p lang={locale} className="text-sm">
        {messages.footer.copyright.replace("{year}", String(year))}
      </p>
    </>
  );
}
