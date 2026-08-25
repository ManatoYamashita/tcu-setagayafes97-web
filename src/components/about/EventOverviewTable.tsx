import { aboutConfig } from "@/data/about";

/**
 * 開催概要テーブル — Aboutページ下部に表示
 *
 * テーブル形式で学園祭の基本情報（名称、テーマ、日時、場所等）を一覧表示する。
 * 参考画像に合わせ、左のアクセントラインと2列の情報だけで簡潔に構成する。
 */
export function EventOverviewTable() {
  const { items } = aboutConfig.overview;

  return (
    <section className="py-16 lg:py-24" aria-labelledby="event-overview-heading">
      <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
        <h2
          id="event-overview-heading"
          className="mb-10 text-center font-heading text-2xl font-bold text-gray-900 lg:text-3xl"
        >
          開催概要
        </h2>

        <div className="border-l-[3px] border-primary-600 pl-5 sm:pl-8">
          <table className="w-full">
            <tbody>
              {items.map((item) => (
                <tr key={item.label}>
                  <th
                    scope="row"
                    className="w-32 break-keep whitespace-pre-line py-3 pr-4 text-left align-top text-sm font-bold leading-6 text-primary-700 sm:w-40 sm:pr-8 sm:text-base"
                  >
                    {item.label}
                  </th>
                  <td className="whitespace-pre-line py-3 text-sm leading-7 text-gray-900 sm:text-base">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
