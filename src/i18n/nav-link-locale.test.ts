import { describe, expect, it } from "vitest";
import { nextPreferredLocale, resolveNavLinkLocale } from "@/i18n/nav-link-locale";

describe("resolveNavLinkLocale", () => {
  it("外国語の URL では、記憶より URL の言語を使う", () => {
    expect(resolveNavLinkLocale("en", "/access", null)).toBe("en");
    expect(resolveNavLinkLocale("zh", "/info/guide", "ko")).toBe("zh");
  });

  it("日本語専用ページでは、記憶した言語を使う（#441 の再現経路）", () => {
    expect(resolveNavLinkLocale("ja", "/events", "en")).toBe("en");
    expect(resolveNavLinkLocale("ja", "/timetable", "ko")).toBe("ko");
    expect(resolveNavLinkLocale("ja", "/", "zh")).toBe("zh");
  });

  it("多言語版がある日本語ページでは、記憶があっても日本語を使う", () => {
    expect(resolveNavLinkLocale("ja", "/access", "en")).toBe("ja");
  });

  it("外国語を一度も選んでいなければ、今までどおり日本語", () => {
    expect(resolveNavLinkLocale("ja", "/events", null)).toBe("ja");
    expect(resolveNavLinkLocale("ja", "/access", null)).toBe("ja");
  });
});

describe("nextPreferredLocale", () => {
  it("外国語のページにいれば、その言語を記憶する", () => {
    expect(nextPreferredLocale("en", "/info/guide")).toBe("en");
  });

  it("多言語版がある日本語ページにいれば、記憶を消す", () => {
    expect(nextPreferredLocale("ja", "/about")).toBeNull();
  });

  it("日本語専用ページでは記憶を変えない", () => {
    expect(nextPreferredLocale("ja", "/events")).toBeUndefined();
    expect(nextPreferredLocale("ja", "/")).toBeUndefined();
  });
});
