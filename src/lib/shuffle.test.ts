import { describe, expect, it } from "vitest";
import { createShuffleSeed, seededShuffle } from "@/lib/shuffle";

const ITEMS = Array.from({ length: 20 }, (_, i) => `event-${i}`);

describe("seededShuffle", () => {
  it("同じシードなら同じ順番になる（再レンダリングで一覧が並び替わらない）", () => {
    expect(seededShuffle(ITEMS, 12345)).toEqual(seededShuffle(ITEMS, 12345));
  });

  it("シードが違えば順番が変わる", () => {
    expect(seededShuffle(ITEMS, 1)).not.toEqual(seededShuffle(ITEMS, 2));
  });

  it("要素の過不足が無い", () => {
    const shuffled = seededShuffle(ITEMS, 42);
    expect(shuffled).toHaveLength(ITEMS.length);
    expect([...shuffled].sort()).toEqual([...ITEMS].sort());
  });

  it("入力の配列を変更しない", () => {
    const input = [...ITEMS];
    seededShuffle(input, 42);
    expect(input).toEqual(ITEMS);
  });

  it("空配列と1要素の配列を扱える", () => {
    expect(seededShuffle([], 42)).toEqual([]);
    expect(seededShuffle(["only"], 42)).toEqual(["only"]);
  });

  it("どの要素もどの位置へほぼ均等に来る（先頭に出やすい企画が無い）", () => {
    const size = 5;
    const trials = 10_000;
    const items = Array.from({ length: size }, (_, i) => i);
    const counts = Array.from({ length: size }, () => new Array<number>(size).fill(0));

    for (let seed = 0; seed < trials; seed++) {
      seededShuffle(items, seed).forEach((item, position) => {
        counts[item][position]++;
      });
    }

    const expected = trials / size;
    for (const row of counts) {
      for (const count of row) {
        expect(Math.abs(count - expected) / expected).toBeLessThan(0.1);
      }
    }
  });
});

describe("createShuffleSeed", () => {
  it("32bit 符号なし整数を返す", () => {
    const seed = createShuffleSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });
});
