import { siteConfig } from "@/data/site";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-center text-5xl font-bold text-primary">{siteConfig.name}</h1>

        <div className="mb-8 text-center">
          <p className="mb-2 text-xl">第{siteConfig.edition}回</p>
          <p className="text-gray-600">
            {siteConfig.dates.day1} - {siteConfig.dates.day2}
          </p>
          <p className="mt-4 text-gray-600">{siteConfig.venue}</p>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-500">
            セットアップが完了しました。開発を開始してください。
          </p>
        </div>
      </div>
    </main>
  );
}
