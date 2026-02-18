import Image from "next/image";

/**
 * ABOUTセクション
 * 世田谷祭の概要と理念を紹介
 */
export function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-32 text-white">
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 左側: 縦書きタイトル + テキスト */}
          <div className="flex gap-8">
            {/* 縦書きタイトル */}
            <h2
              className="text-6xl font-bold lg:text-7xl"
              style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
              aria-label="ABOUT"
            >
              ABOUT
            </h2>

            {/* テキスト */}
            <div className="flex flex-col justify-center space-y-6">
              <p className="text-lg leading-relaxed">
                東京都市大学 世田谷祭は、学生が主体となって企画・運営する、
                年に一度の一大イベントです。
              </p>
              <p className="leading-relaxed">
                教室企画、ステージ企画、模擬店など、様々な企画をご用意して
                皆様のご来場をお待ちしております。
              </p>
            </div>
          </div>

          {/* 右側: 画像 */}
          <div className="relative h-96 overflow-hidden rounded-2xl lg:h-full">
            <Image
              src="/images/placeholder/p.jpeg"
              alt="世田谷祭の様子"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
