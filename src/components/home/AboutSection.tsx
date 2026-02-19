import Link from "next/link";

/**
 * ABOUTセクション
 * 世田谷祭の概要と理念をシンプルなタイポグラフィで紹介
 */
export function AboutSection() {
  return (
    <section className="bg-primary py-32">
      <div className="container mx-auto px-4">
        {/* ラベル */}
        <p className="mb-6 text-xs uppercase tracking-widest text-white/50">About</p>

        {/* 大見出し */}
        <h2 className="mb-12 text-5xl font-bold text-white md:text-6xl">世田谷祭について</h2>

        {/* 本文 */}
        <div className="max-w-2xl">
          <p className="mb-4 text-lg leading-relaxed text-white/90">
            東京都市大学 世田谷祭は、学生が主体となって企画・運営する、 年に一度の一大イベントです。
          </p>
          <p className="leading-relaxed text-white/80">
            教室企画、ステージ企画、模擬店など、様々な企画をご用意して
            皆様のご来場をお待ちしております。
          </p>
        </div>

        {/* CTA リンク */}
        <Link
          href="/about"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white underline hover:opacity-70"
        >
          委員会について →
        </Link>
      </div>
    </section>
  );
}
