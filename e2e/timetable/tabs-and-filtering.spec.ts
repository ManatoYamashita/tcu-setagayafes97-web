import { expect, test } from "../fixtures";
import { calculateBoardHeight } from "@/lib/timetable-layout";

const DATE_TABS = "[data-timetable-date-tabs]";
const STAGE_TABS = "[data-timetable-stage-tabs]";

/**
 * タブと絞り込み
 *
 * `aria-pressed` はタブ群にスコープして数えます。開発サーバでは AgentationDevTool が
 * オーバーレイを差し込むため、ページ全体から素で数えると将来壊れます。
 */
test.describe("タブと絞り込み", () => {
  test("選択中のステージが当日0件でも押下状態で残る", async ({ page, gotoTimetable }) => {
    // day2 に体育館の企画は無い。タブ一覧から落とすと、どのタブも aria-pressed に
    // ならず、何で絞り込まれているのか画面から読めなくなる（#154 のレビュー指摘）
    await gotoTimetable(`?date=day2&stage=${encodeURIComponent("体育館")}`);

    await expect(page.locator(`${DATE_TABS} button[aria-pressed="true"]`)).toHaveCount(1);
    await expect(page.locator(`${STAGE_TABS} button[aria-pressed="true"]`)).toHaveCount(1);
    await expect(page.locator(`${STAGE_TABS} button[aria-pressed="true"]`)).toHaveText("体育館");
    await expect(page.locator("[data-timetable-event]")).toHaveCount(0);
  });

  test("「その他」タブが空にならない", async ({ page, gotoTimetable }) => {
    // 絞り込みを extractStageId() へ戻すと、グループ化では「その他」へ入る企画が
    // 絞り込みでは null !== "other" で必ず外れ、このタブが常に空になる
    await gotoTimetable("?date=day1&stage=other");

    await expect(page.locator("[data-timetable-event]")).toHaveCount(1);
    await expect(page.locator("[data-timetable-event]")).toContainText("【TEST】");
  });

  test("レンジをステージ絞り込みの前に算出している", async ({ page, gotoTimetable }) => {
    // 「その他」には 11:00-12:00 の1件しかない。絞り込み後から算出する実装だと
    // 盤面高さが 1時間ぶん（96px）に縮み、タブを切り替えるたびに縦のスケールが動く
    await gotoTimetable("?date=day1&stage=other");

    const height = await page
      .locator("[data-timetable-column]")
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));

    expect(height).toBe(calculateBoardHeight({ startHour: 9, endHour: 19 }));
  });

  test("ステージタブで盤面が1列に絞られる", async ({ timetablePage: page }) => {
    await page.locator(`${STAGE_TABS} button`, { hasText: "7号館A（7A）" }).click();

    await expect(page.locator("[data-timetable-column]")).toHaveCount(1);
    await expect(page.locator(`${STAGE_TABS} button[aria-pressed="true"]`)).toHaveText(
      "7号館A（7A）"
    );
  });
});
