import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";
import {
  createAboutStructuredData,
  createBreadcrumbStructuredData,
  createHomeStructuredData,
  serializeJsonLd,
} from "@/lib/structured-data";

/**
 * `@id` 参照が同じ `@graph` の中で解決できることを確認する
 *
 * ノードを足すたびに手で確かめるのは続かない。宙に浮いた参照は Google 側で
 * 解決されず、エンティティの結合が起きない。実際 `/about` の初回実装では
 * `isPartOf` が参照する WebSite ノードが同梱されておらず浮いていた。
 */
function danglingReferences(document: unknown): string[] {
  const graph = (document as { "@graph"?: unknown[] })["@graph"] ?? [document];
  const ids = new Set(
    graph
      .map((node) => (node as { "@id"?: string })["@id"])
      .filter((id): id is string => Boolean(id))
  );

  const references = new Set<string>();
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 1 && keys[0] === "@id") {
        references.add((value as { "@id": string })["@id"]);
        return;
      }
      Object.values(value).forEach(walk);
    }
  };
  walk(document);

  return [...references].filter((reference) => !ids.has(reference));
}

describe("serializeJsonLd", () => {
  it("`<` を退避して script 要素を閉じさせない", () => {
    const serialized = serializeJsonLd({ name: "</script><img onerror=alert(1)>" });
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c");
  });

  it("退避しても JSON として元の値へ戻る", () => {
    const value = { name: "MON7A <東京都市大学 第97回世田谷祭>" };
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });
});

describe("createHomeStructuredData", () => {
  it("宙に浮いた @id 参照が無い", () => {
    expect(danglingReferences(createHomeStructuredData())).toEqual([]);
  });

  it("年次をまたぐ名称と今年度の名称を同一エンティティとして宣言する", () => {
    const graph = createHomeStructuredData()["@graph"];
    const website = graph.find((node) => node["@type"] === "WebSite") as {
      alternateName: string[];
    };
    // 「第N回 世田谷祭」は毎年変わるので、値ではなく形だけを見る
    expect(website.alternateName.some((name) => /^第\d+回 世田谷祭$/.test(name))).toBe(true);
    expect(website.alternateName).toContain("東京都市大学 世田谷祭");
  });

  it("祭の Event は開始が終了より前である", () => {
    const graph = createHomeStructuredData()["@graph"];
    const event = graph.find((node) => node["@type"] === "Event") as {
      startDate: string;
      endDate: string;
    };
    expect(new Date(event.startDate).getTime()).toBeLessThan(new Date(event.endDate).getTime());
  });
});

describe("createAboutStructuredData", () => {
  it("どのロケールでも宙に浮いた @id 参照が無い", () => {
    for (const locale of routing.locales) {
      expect(danglingReferences(createAboutStructuredData(locale))).toEqual([]);
    }
  });

  it("url と inLanguage がロケールに追随する", () => {
    for (const locale of routing.locales) {
      const page = createAboutStructuredData(locale)["@graph"][0] as {
        url: string;
        inLanguage: string;
      };
      expect(page.inLanguage).toBe(locale);
      const expectedSegment = locale === routing.defaultLocale ? "/about" : `/${locale}/about`;
      expect(page.url.endsWith(expectedSegment)).toBe(true);
    }
  });

  it("Organization と Event はトップページと同じ @id を使う", () => {
    const homeIds = new Set(
      createHomeStructuredData()["@graph"].map((node) => (node as { "@id": string })["@id"])
    );
    const aboutIds = createAboutStructuredData(routing.defaultLocale)
      ["@graph"].filter((node) => node["@type"] !== "AboutPage")
      .map((node) => (node as { "@id": string })["@id"]);

    expect(aboutIds.every((id) => homeIds.has(id))).toBe(true);
  });
});

describe("createBreadcrumbStructuredData", () => {
  it("position は 1 起点の連番である", () => {
    const list = createBreadcrumbStructuredData([
      { name: "トップ", pathname: "/" },
      { name: "企画を探す", pathname: "/events" },
      { name: "ある企画" },
    ]);
    expect(list.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  it("pathname を持つ項目は絶対URLになる", () => {
    const list = createBreadcrumbStructuredData([{ name: "トップ", pathname: "/" }]);
    expect((list.itemListElement[0] as { item: string }).item).toMatch(/^https?:\/\//);
  });

  /**
   * Google が `item` の省略を許すのは末尾の項目だけである。中間項目でURLを
   * 持たせ忘れると無効なマークアップになる。
   */
  it("末尾以外の項目は必ず item を持つ", () => {
    const list = createBreadcrumbStructuredData([
      { name: "トップ", pathname: "/" },
      { name: "現在地" },
    ]);
    const head = list.itemListElement.slice(0, -1);
    expect(head.every((item) => "item" in item)).toBe(true);
  });
});
