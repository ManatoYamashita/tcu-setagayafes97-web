import { describe, expect, it } from "vitest";
import { displayEventText, EVENT_DISPLAY_FALLBACKS } from "@/lib/event-display";

describe("displayEventText", () => {
  it("未入力の値を表示用フォールバックへ置き換える", () => {
    expect(displayEventText(undefined, EVENT_DISPLAY_FALLBACKS.title)).toBe("企画情報準備中");
    expect(displayEventText(null, EVENT_DISPLAY_FALLBACKS.description)).toBe(
      "企画の詳細情報は準備中です。"
    );
    expect(displayEventText("   ", EVENT_DISPLAY_FALLBACKS.organizer)).toBe("主催団体情報準備中");
  });

  it("入力済みの値は前後の空白を除いて表示する", () => {
    expect(displayEventText("  模擬店タイトル  ", EVENT_DISPLAY_FALLBACKS.title)).toBe(
      "模擬店タイトル"
    );
  });
});
