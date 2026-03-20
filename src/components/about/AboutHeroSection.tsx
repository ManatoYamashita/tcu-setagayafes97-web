import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * About Us ヒーローセクション
 * 2カラム構成: テキスト（左） / プレースホルダー画像（右）
 * レスポンシブ: モバイル1カラム / lg以上2カラム
 */
export function AboutHeroSection() {
  return (
    <section className="w-full bg-secondary pt-20">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* 左カラム: テキスト */}
          <div>
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-gray-600">
              About Us
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 lg:text-5xl xl:text-6xl">
              世田谷祭
              <br />
              こころを動かす
              <br />
              からくり
            </h1>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/events"
                aria-label="企画一覧を見る"
                className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-500 bg-primary-400 text-white transition-colors hover:bg-primary-500"
              >
                <ArrowRight className="h-6 w-6" />
              </Link>
              <span className="text-base font-semibold uppercase tracking-wider text-gray-900">
                View More
              </span>
            </div>
          </div>

          {/* 右カラム: プレースホルダー画像 */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-300 via-primary-400 to-purple-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-medium text-white/60">Photo Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
