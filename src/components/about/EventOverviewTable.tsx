import { aboutConfig } from "@/data/about";

/**
 * 開催概要テーブル — Aboutページ下部に表示
 *
 * テーブル形式で学園祭の基本情報（名称、テーマ、日時、場所等）を一覧表示する。
 * レスポンシブ対応：モバイルでは縦積み、デスクトップではテーブルレイアウト。
 */
export function EventOverviewTable() {
  const { items } = aboutConfig.overview;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
        <h2 className="mb-10 text-center font-heading text-2xl font-bold text-gray-900 lg:text-3xl">
          開催概要
        </h2>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className={index !== items.length - 1 ? "border-b border-gray-100" : ""}
                >
                  <th
                    scope="row"
                    className="whitespace-pre-line bg-gray-50 px-5 py-4 text-left align-top text-sm font-semibold text-gray-700 sm:w-40 sm:px-6 lg:w-48"
                  >
                    {item.label}
                  </th>
                  <td className="whitespace-pre-line px-5 py-4 text-sm leading-relaxed text-gray-600 sm:px-6">
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
