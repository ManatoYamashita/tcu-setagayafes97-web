import type { TicketPlan } from "@/types/events";

export interface MobileTicketCtaTarget {
  href: string;
  label: string;
  ticketName: string;
  external: boolean;
}

/**
 * モバイル固定CTAの遷移先を決める。
 *
 * 購入可能な券種が1つなら外部販売ページへ直接遷移し、複数なら誤った券種を
 * 選ばないようページ内のチケット一覧へ案内する。
 */
export function resolveMobileTicketCta(tickets?: TicketPlan[]): MobileTicketCtaTarget | null {
  const purchasableTickets = (tickets ?? []).flatMap((ticket) => {
    const href = ticket.buttonUrl?.trim();
    return href ? [{ ticket, href }] : [];
  });

  if (purchasableTickets.length === 0) return null;

  if (purchasableTickets.length === 1) {
    const [{ ticket, href }] = purchasableTickets;

    return {
      href,
      label: ticket.buttonLabel?.trim() || "チケットを購入する",
      ticketName: ticket.name.trim() || "チケット",
      external: true,
    };
  }

  return {
    href: "#special-tickets",
    label: "券種を選ぶ",
    ticketName: `${purchasableTickets.length}種類のチケット`,
    external: false,
  };
}
