import type { TicketPlan } from "@/types/events";

interface TicketTableProps {
  tickets?: TicketPlan[];
  /** チケットの補足（リッチエディタHTML） */
  note?: string;
}

/**
 * チケット販売テーブル
 *
 * 第96回と同じく **券種を列** に並べた比較表です。学内前売・学外一般・再販告知を、
 * すべて同じ券種の繰り返しで表現します。
 *
 * 行は「その項目に値を持つ券種が1つでもあるか」で出し分けます。学内販売には発売日が無く、
 * 一般販売には販売場所が無い、といった非対称な入稿に対応するためです。
 *
 * 購入ボタンは `buttonUrl` が入力された券種にのみ表示します。学内の手売り・現金のみの
 * 券種ではボタンごと消えます。
 */
export function TicketTable({ tickets, note }: TicketTableProps) {
  if (!tickets || tickets.length === 0) return null;

  const hasPrice = tickets.some((ticket) => ticket.price);
  const hasSalesPeriod = tickets.some((ticket) => ticket.salesPeriod);
  const hasMethod = tickets.some((ticket) => ticket.method);
  const hasNote = tickets.some((ticket) => ticket.note);
  const hasButton = tickets.some((ticket) => ticket.buttonUrl);

  return (
    <section aria-labelledby="special-tickets" className="py-8">
      <h2 id="special-tickets" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
        チケット販売
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">券種ごとのチケット販売情報</caption>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-32 px-4 py-3 text-left font-semibold text-gray-900">
                <span className="sr-only">項目</span>
              </th>
              {tickets.map((ticket, index) => (
                <th
                  key={`head-${ticket.name}-${index}`}
                  scope="col"
                  className="min-w-[200px] px-4 py-3 text-left font-semibold text-gray-900"
                >
                  {ticket.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hasPrice && (
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900/70">
                  料金
                </th>
                {tickets.map((ticket, index) => (
                  <td
                    key={`price-${index}`}
                    className="whitespace-nowrap px-4 py-3 text-gray-900/80"
                  >
                    {ticket.price}
                  </td>
                ))}
              </tr>
            )}

            {hasSalesPeriod && (
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900/70">
                  発売日・販売期間
                </th>
                {tickets.map((ticket, index) => (
                  <td key={`period-${index}`} className="px-4 py-3 text-gray-900/80">
                    {ticket.salesPeriod}
                  </td>
                ))}
              </tr>
            )}

            {hasMethod && (
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900/70">
                  販売方法・販売場所
                </th>
                {tickets.map((ticket, index) => (
                  <td key={`method-${index}`} className="px-4 py-3 text-gray-900/80">
                    {ticket.method && (
                      <div
                        className="prose prose-sm max-w-none prose-p:my-1 prose-p:text-gray-900/80"
                        dangerouslySetInnerHTML={{ __html: ticket.method }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            )}

            {hasNote && (
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900/70">
                  注意事項
                </th>
                {tickets.map((ticket, index) => (
                  <td
                    key={`note-${index}`}
                    className="whitespace-pre-line px-4 py-3 text-gray-900/80"
                  >
                    {ticket.note}
                  </td>
                ))}
              </tr>
            )}

            {hasButton && (
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900/70">
                  <span className="sr-only">購入</span>
                </th>
                {tickets.map((ticket, index) => (
                  <td key={`button-${index}`} className="px-4 py-3">
                    {ticket.buttonUrl && (
                      <a
                        href={ticket.buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                      >
                        {ticket.buttonLabel || "チケットを購入する"}
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <span className="sr-only">（外部サイトが開きます）</span>
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {note && (
        <div
          className="prose prose-sm mt-4 max-w-none prose-p:text-gray-900/80"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      )}
    </section>
  );
}
