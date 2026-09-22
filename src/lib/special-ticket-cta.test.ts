import { describe, expect, it } from "vitest";
import { resolveMobileTicketCta } from "@/lib/special-ticket-cta";
import type { TicketPlan } from "@/types/events";

const ticket = (overrides: Partial<TicketPlan> = {}): TicketPlan => ({
  fieldId: "ticketPlan",
  name: "学外一般",
  ...overrides,
});

describe("resolveMobileTicketCta", () => {
  it("購入URLが無い場合はCTAを表示しない", () => {
    expect(resolveMobileTicketCta()).toBeNull();
    expect(resolveMobileTicketCta([ticket()])).toBeNull();
    expect(resolveMobileTicketCta([ticket({ buttonUrl: "   " })])).toBeNull();
  });

  it("購入可能な券種が1つなら販売ページへ直接案内する", () => {
    expect(
      resolveMobileTicketCta([
        ticket({
          buttonUrl: " https://example.com/tickets ",
          buttonLabel: "一般販売で購入する",
        }),
      ])
    ).toEqual({
      href: "https://example.com/tickets",
      label: "一般販売で購入する",
      ticketName: "学外一般",
      external: true,
    });
  });

  it("購入可能な券種が複数なら券種一覧へ案内する", () => {
    expect(
      resolveMobileTicketCta([
        ticket({ buttonUrl: "https://example.com/advance" }),
        ticket({ name: "当日券", buttonUrl: "https://example.com/door" }),
        ticket({ name: "学内販売" }),
      ])
    ).toEqual({
      href: "#special-tickets",
      label: "券種を選ぶ",
      ticketName: "2種類のチケット",
      external: false,
    });
  });
});
