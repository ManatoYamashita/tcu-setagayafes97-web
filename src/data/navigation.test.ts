import { describe, expect, it } from "vitest";
import { languageOptions } from "@/data/navigation";
import { LOCALE_FALLBACK_PATHNAME } from "@/i18n/localized-pathnames";
import en from "@/messages/en.json";
import ko from "@/messages/ko.json";
import zh from "@/messages/zh.json";

const guideTitles = { en: en.guide.title, zh: zh.guide.title, ko: ko.guide.title } as const;

describe("languageOptions の fallbackNote", () => {
  it("着地先が「ご来場の方へ」である前提で書かれている", () => {
    expect(LOCALE_FALLBACK_PATHNAME).toBe("/info/guide");
  });

  it("日本語以外は、着地先のページ名（guide.title）をそのまま含む", () => {
    for (const option of languageOptions) {
      if (option.code === "ja") {
        expect(option.fallbackNote).toBeUndefined();
        continue;
      }
      expect(option.fallbackNote).toContain(guideTitles[option.code]);
    }
  });
});
