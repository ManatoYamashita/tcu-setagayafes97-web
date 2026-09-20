import { defineConfig, devices } from "@playwright/test";

/**
 * 実ブラウザでしか捕まえられない事故に対する再発防止装置
 *
 * これは「E2E を増やしていく基盤」ではありません。載せてよいのは、
 * **lint / 型 / ユニットテスト / build のすべてを通過してしまう事故**だけです。
 *
 * - e2e/timetable/ — #148。盤面が height: 100% の解決失敗で 0px に潰れ、全企画が
 *   同一座標へ重なった。CSS の百分率高さが解決されるかはレイアウトエンジンの仕事で、
 *   型でもユニットテストでも表現できない
 * - e2e/landmarks/ — #177 A。<main id="content"> の付け忘れ・二重・空振り。
 *   **生HTMLを数えると答えが違う**ため（/events は生HTML 2個・ライブDOM 1個、
 *   動的404は生HTML 0個・ライブDOM 1個）、curl や生成物の検査では代替できない
 * - e2e/not-found/ — #249。モバイルの読み順・見出し間隔・画像幅。
 *   実際の上下関係と表示幅はブラウザのレイアウト結果を測らないと保証できない
 *
 * 設計判断は docs/frontend/layout-e2e.md を参照。
 */

/** 開発者が 3000 で回している dev サーバと衝突させない */
const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",

  // リトライしません。#148 のような確定的なバグを「たまに落ちるテスト」に
  // 見せかけてしまい、放置される原因になります。落ちたら必ず原因を潰すこと。
  retries: 0,

  // dev サーバは1本しか立ちません。並列で殺到させるとコンパイル待ちが重なります。
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: false,

  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,

  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,

    // オープナー（GSAP）を待つのではなく、存在しない状態にします。
    // src/lib/motion.ts の willRunOpener() が prefers-reduced-motion を見ているため、
    // GSAP のチャンクごと読み込まれなくなります。ポーリングより決定的です。
    // 副作用としてオープナー演出そのものは検証対象外になりますが、
    // rAF 依存の演出は実機目視の領分であり、役割分担として正しい判断です。
    contextOptions: { reducedMotion: "reduce" },

    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // trace にスクリーンショットが入るため video は不要（成果物の容量を抑える）
    video: "off",
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      // 1024px 未満では盤面が display:none になり getBoundingClientRect() が 0 を返すため、
      // 盤面に関するアサーションはすべて偽陰性になります
      // （docs/frontend/timetable-gantt.md「実測アサーション」）。
      //
      // 1280 を選ぶのは、盤面の最小幅 1152px（72 + 6列 × 180）に対して
      // スクローラが約 1072px となり、「横スクロールが盤面内で完結すること」を
      // 実際に検証できる幅だからです。
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
      // responsive-parity はモバイル幅でしか成立しない
      testIgnore: /responsive-parity\.spec\.ts/,
    },
    {
      // 対応下限の320px。lg 未満なので盤面ではなく縦スタックが出て、404もモバイル配置になります。
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 } },
      testMatch: /responsive-parity\.spec\.ts/,
    },
  ],

  webServer: {
    command: `pnpm dev --port ${PORT}`,

    // ポートではなく /timetable の 200 を待ちます。これが「dev の初回コンパイルが遅い」
    // ことへの対処そのもので、最初のテストが走る時点で対象ルートのコンパイルは
    // 必ず終わっています。port: を使うと最初のテストがコンパイル待ちを被ります。
    url: `${BASE_URL}/timetable?date=day1&stage=all`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,

    // dev サーバのログをジョブログへ残す。「コンパイルが遅かった」のか
    // 「レイアウトが壊れた」のかを追加設定なしで切り分けるため。
    stdout: "pipe",
    stderr: "pipe",

    env: {
      // フィクスチャ経路。この2つが揃うと getEventsList() は呼ばれないため、
      // microCMS のシークレットが要りません（fork PR でも走ります）。
      NEXT_PUBLIC_EVENTS_VISIBLE: "true",
      NEXT_PUBLIC_TIMETABLE_FIXTURE: "1",

      // ローカルの .env.local と CI とで DOM が変わらないよう、残りのフラグも固定する
      NEXT_PUBLIC_NEWS_VISIBLE: "false",
      NEXT_PUBLIC_SPECIAL_VISIBLE: "false",
      NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE: "false",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
