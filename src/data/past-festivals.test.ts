import { describe, expect, it } from "vitest";
import { pastFestivalSites, pastFestivalsContents } from "@/data/past-festivals";
import { STATIC_IMAGES } from "../../scripts/static-image-manifest.mjs";

/**
 * 過去の世田谷祭の一覧の不変条件
 *
 * URL とサムネイルのパスは回数から機械的に作っている。序数の綴り（81st / 82nd / 83rd）を
 * 誤るとリンク切れ・画像切れになるが、画面は壊れず誰も気づかないため、ここで固定する。
 */
describe("pastFestivalSites", () => {
  it("新しい回から順に並び、第87回（サイトが現存しない）を含まない", () => {
    const editions = pastFestivalSites.map((site) => site.edition);
    expect(editions).toEqual([...editions].sort((a, b) => b - a));
    expect(editions).not.toContain(87);
    expect(editions[0]).toBe(96);
    expect(editions.at(-1)).toBe(76);
  });

  it("開催年は 回数 + 1929", () => {
    const byEdition = new Map(pastFestivalSites.map((site) => [site.edition, site]));
    expect(byEdition.get(96)?.year).toBe(2025);
    expect(byEdition.get(89)?.year).toBe(2018);
  });

  it("アーカイブのディレクトリ名は英語の序数で、第96回だけ別ホスト", () => {
    const byEdition = new Map(pastFestivalSites.map((site) => [site.edition, site.href]));
    expect(byEdition.get(96)).toBe("https://96th.setagayafes.org/");
    expect(byEdition.get(81)).toBe("https://archive.setagayafes.org/81st/");
    expect(byEdition.get(82)).toBe("https://archive.setagayafes.org/82nd/");
    expect(byEdition.get(83)).toBe("https://archive.setagayafes.org/83rd/");
    expect(byEdition.get(84)).toBe("https://archive.setagayafes.org/84th/");
    expect(byEdition.get(93)).toBe("https://archive.setagayafes.org/93rd/");
  });

  it("サムネイルはすべて manifest にあり、寸法が box と一致する", () => {
    // box を持つのは role: "app" のエントリだけ
    const boxes = new Map(
      STATIC_IMAGES.map((entry) => [entry.path, "box" in entry ? entry.box : undefined])
    );
    for (const site of pastFestivalSites) {
      expect(boxes.get(`public${site.image.src}`), site.image.src).toEqual({
        width: site.image.width,
        height: site.image.height,
      });
    }
  });
});

describe("pastFestivalsContents", () => {
  it("英語の回数表記は序数になる", () => {
    const { editionLabel } = pastFestivalsContents.en;
    expect([81, 82, 83, 84, 91, 92, 93, 96].map(editionLabel)).toEqual([
      "81st",
      "82nd",
      "83rd",
      "84th",
      "91st",
      "92nd",
      "93rd",
      "96th",
    ]);
  });
});
