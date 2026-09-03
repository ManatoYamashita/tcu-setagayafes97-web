import { expect, test, topWithinColumn } from "../fixtures";
import { HOUR_HEIGHT_PX, calculateBoardHeight } from "@/lib/timetable-layout";

/**
 * 盤面の幾何（#148 の再発防止装置の本体）
 *
 * フィクスチャの day1 は 09:30 開始・19:00 終了なので、レンジは 9-19 時。
 * 盤面高さは (19 - 9) × HOUR_HEIGHT_PX = 960px になります。
 */
const EXPECTED_BOARD_HEIGHT = calculateBoardHeight({ startHour: 9, endHour: 19 });
const EXPECTED_COLUMNS = 6; // 7A / 7B / 体育館 / ホール / 中庭 / その他
const EXPECTED_EVENTS = 9;

test.describe("盤面の幾何", () => {
  test("盤面に高さがある（#148 本体）", async ({ timetablePage: page }) => {
    // min-height だけを持つ親の下で height: 100% が 0px に解決される、という事故。
    // 「0 でない」だけでなく、全列が同一の期待値であることまで見る
    const heights = await page
      .locator("[data-timetable-column]")
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));

    expect(heights).toHaveLength(EXPECTED_COLUMNS);
    expect(heights).toEqual(Array(EXPECTED_COLUMNS).fill(EXPECTED_BOARD_HEIGHT));
  });

  test("企画が同一座標に重なっていない", async ({ timetablePage: page }) => {
    const positions = await page.locator("[data-timetable-event]").evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return `${Math.round(rect.left)},${Math.round(rect.top)}`;
      })
    );

    expect(positions).toHaveLength(EXPECTED_EVENTS);
    expect(new Set(positions).size).toBe(positions.length);
  });

  test("時刻が縦座標へ写像されている", async ({ timetablePage: page }) => {
    // 「重なっていない」だけでは、潰れ方によっては通ってしまう。
    // 時刻 → 座標という、このページの機能そのものを直接ピン留めする。
    //
    // レンジ開始は 9:00。1分あたり HOUR_HEIGHT_PX / 60 px。
    const pxPerMinute = HOUR_HEIGHT_PX / 60;

    // 09:30 は開始から 30 分
    expect(await topWithinColumn(page, "オープニングセレモニー")).toBe(30 * pxPerMinute);
    // 15:00 は開始から 360 分
    expect(await topWithinColumn(page, "著名人ステージ")).toBe(360 * pxPerMinute);
  });

  test("重なる企画が左右のレーンへ分かれる", async ({ timetablePage: page }) => {
    // 7A の 13:00-14:30 と 13:30-14:00
    const boxes = await page.locator("[data-timetable-event]").evaluateAll((els) =>
      els
        .filter((el) => /ダンスサークル|アカペラサークル/.test(el.textContent ?? ""))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { left: Math.round(rect.left), right: Math.round(rect.right) };
        })
        .sort((a, b) => a.left - b.left)
    );

    expect(boxes).toHaveLength(2);
    expect(boxes[0].right, "レーンが左右に分かれていない").toBeLessThanOrEqual(boxes[1].left);
  });

  test("時間レンジが企画から算出されている", async ({ timetablePage: page }) => {
    // 09:30 開始の企画があるのでレンジ下端は 9 時、19:00 終了があるので上端は 19 時。
    // 10-18 をベタ書きする実装へ戻すと、この目盛りが変わる
    const labels = await page
      .locator("[data-timetable-time-axis] span")
      .evaluateAll((els) => els.map((el) => (el.textContent ?? "").trim()));

    expect(labels).toHaveLength(11);
    expect(labels[0]).toBe("09:00");
    expect(labels[labels.length - 1]).toBe("19:00");
  });
});
