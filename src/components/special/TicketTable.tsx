import type { TicketPlan } from "@/types/events";

interface TicketTableProps {
  tickets?: TicketPlan[];
  /** チケットの補足（リッチエディタHTML） */
  note?: string;
}

/**
 * チケット販売テーブル
 *
 * モバイルでは各券種を縦カード、デスクトップでは第96回と同じく **券種を列** に
 * 並べた比較表として表示します。学内前売・学外一般・再販告知を、すべて同じ券種の
 * 繰り返しで表現します。
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
    <section
      aria-labelledby="special-tickets"
      className="py-8"
      data-special-reveal="up"
      data-special-ticket-section
    >
      <h2
        id="special-tickets"
        className="mb-4 scroll-mt-28 text-xl font-bold text-gray-900 md:text-2xl"
      >
        チケット販売
      </h2>

      <div className="space-y-4 md:hidden">
        {tickets.map((ticket, index) => (
          <article
            key={`mobile-${ticket.name}-${index}`}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="text-lg font-bold text-gray-900">{ticket.name}</h3>

            <dl className="mt-4 space-y-4">
              {ticket.price && (
                <div>
                  <dt className="text-xs font-semibold text-primary-700">料金</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-gray-900">{ticket.price}</dd>
                </div>
              )}

              {ticket.salesPeriod && (
                <div>
                  <dt className="text-xs font-semibold text-primary-700">発売日・販売期間</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-gray-900">
                    {ticket.salesPeriod}
                  </dd>
                </div>
              )}

              {ticket.method && (
                <div>
                  <dt className="text-xs font-semibold text-primary-700">販売方法・販売場所</dt>
                  <dd
                    className="prose mt-1 text-sm text-gray-900 [&_p]:my-1"
                    dangerouslySetInnerHTML={{ __html: ticket.method }}
                  />
                </div>
              )}

              {ticket.note && (
                <div>
                  <dt className="text-xs font-semibold text-primary-700">注意事項</dt>
                  <dd className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-900">
                    {ticket.note}
                  </dd>
                </div>
              )}
            </dl>

            {ticket.buttonUrl && (
              <a
                href={ticket.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-special-ticket-purchase
                className="mt-5 flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,scale] duration-150 ease-out hover:bg-primary-700 active:scale-[0.96] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-700 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                {ticket.buttonLabel || "チケットを購入する"}
                <svg
                  className="size-4 shrink-0"
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
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
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
                  className="min-w-[220px] px-4 py-3 text-left font-semibold text-gray-900"
                >
                  {ticket.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-special-stagger>
            {hasPrice && (
              <tr>
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900/70"
                >
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
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900/70"
                >
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
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900/70"
                >
                  販売方法・販売場所
                </th>
                {tickets.map((ticket, index) => (
                  <td key={`method-${index}`} className="px-4 py-3 text-gray-900/80">
                    {ticket.method && (
                      <div
                        className="prose max-w-none [&_p]:my-1"
                        dangerouslySetInnerHTML={{ __html: ticket.method }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            )}

            {hasNote && (
              <tr>
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900/70"
                >
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
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900/70"
                >
                  <span className="sr-only">購入</span>
                </th>
                {tickets.map((ticket, index) => (
                  <td key={`button-${index}`} className="px-4 py-3">
                    {ticket.buttonUrl && (
                      <a
                        href={ticket.buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-special-ticket-purchase
                        // ラベルは折り返さない。列に min-w-[220px] を確保してあるため
                        // 通常の文言なら1行に収まり、超える場合は表の横スクロールで読める
                        className="inline-flex min-h-11 touch-manipulation items-center gap-2 whitespace-nowrap rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,scale] duration-150 ease-out hover:bg-primary-700 active:scale-[0.96] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-700 motion-reduce:transition-none motion-reduce:active:scale-100"
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

      {note && <div className="prose mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: note }} />}
    </section>
  );
}
