import type { AboutPageContent } from "@/data/about";

/**
 * 開催概要 — Aboutページ下部に表示
 *
 * 学園祭の基本情報（名称、テーマ、日時、場所等）をラベルと値の組で一覧表示する。
 * 参考画像に合わせ、左のアクセントラインと2列の情報だけで簡潔に構成する（狭い画面では縦に積む）。
 */
export function EventOverviewTable({ content }: { content: AboutPageContent["overview"] }) {
  const { heading, items } = content;

  return (
    <section className="py-16 lg:py-24" aria-labelledby="event-overview-heading">
      <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
        <h2
          id="event-overview-heading"
          className="mb-10 text-center font-heading text-2xl font-bold text-gray-900 lg:text-3xl"
        >
          {heading}
        </h2>

        {/*
          ラベルと値の組なので dl で組む。640px 以上は「ラベル 8rem | 値」の2列、それ未満はラベルの下に値を積む。
          2列のまま 320px へ持ち込むと、値の列が約 90px しか残らず「世田谷キャンパ｜ス」のように細切れに折れ、
          さらにメールアドレス（途中で改行できない英数字）が列を押し広げて横にはみ出した（#425）。
          ラベルの break-keep は「キャンパステーマ」を語の途中で折らないため。
          値の overflow-wrap:anywhere は、メールアドレスや SNS のハンドルを必要なら途中で折るため
          （anywhere は break-word と違い、最小内容幅の計算にも効く）
        */}
        <dl className="border-l-[3px] border-primary-600 pl-5 sm:pl-8">
          {items.map((item) => (
            <div key={item.label} className="py-3 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-x-8">
              <dt className="break-keep whitespace-pre-line text-sm leading-6 font-bold text-primary-700 sm:text-base">
                {item.label}
              </dt>
              <dd className="mt-1 whitespace-pre-line text-sm leading-7 [overflow-wrap:anywhere] text-gray-900 sm:mt-0 sm:text-base">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
