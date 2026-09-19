import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

import { RESTRICTED_COLOR_TOKENS } from "./scripts/restricted-color-tokens.mjs";

/**
 * `<Suspense>` の fallback として描かれるツリー
 *
 * `src/app/events/page.tsx` の fallback は `EventsView` を起点に、この5ファイルだけを描く。
 * クエリを読んでよいのは境界の内側にいる `EventsContent` だけなので、ここには含めない。
 */
const EVENTS_FALLBACK_TREE = [
  "src/components/events/EventsView.tsx",
  "src/components/events/EventFilters.tsx",
  "src/components/events/Pagination.tsx",
  "src/components/events/EventGrid.tsx",
  "src/components/events/EventCard.tsx",
];

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  prettierConfig,
  {
    ignores: ["node_modules/", ".next/", "out/"],
  },
  {
    // Playwright のフィクスチャは第2引数を `use` という名前で受け取る API である。
    // react-hooks はこれを React の use フックと取り違えて rules-of-hooks を誤発報する。
    // e2e に React は無いので、このディレクトリでだけ無効にする。
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  {
    // #156 の再発防止装置。
    //
    // `useSearchParams()` は静的レンダリング時に、最も近い <Suspense> 境界より内側を
    // クライアント描画へ落とす。`src/app/events/page.tsx` はその fallback に
    // 「クエリ無しで着地したときの完成形」（EventsView）を置くことで、企画カードの
    // リンクを静的HTMLへ載せている。**fallback の中で useSearchParams() を呼ぶと、
    // それ以上落ちる先が無いため fallback 自身が bailout し、ページ本体が
    // 静的HTMLから丸ごと消える。**
    //
    // この事故はエラーにならない。lint / format / 型 / ユニットテスト / build /
    // Layout E2E のすべてを通過したまま、/events のクロール経路だけが失われる。
    // #154 は同じ不変条件を JSDoc とドキュメントで守ろうとしたが、
    // それらは人間が読まなければ効かない（docs/dev/testing.md「なぜ入れたか」）。
    //
    // useRouter() は bailout を起こさないため制限しない。
    // 背景と実測は docs/frontend/static-html-and-search-params.md を参照。
    files: EVENTS_FALLBACK_TREE,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/navigation",
              importNames: ["useSearchParams"],
              message:
                "このツリーは /events の <Suspense> fallback として描かれます。ここでクエリを読むと fallback 自身が bailout し、ページ本体が静的HTMLから消えます（#156）。クエリは EventsContent で読み、props で渡してください。",
            },
          ],
        },
      ],
    },
  },
  {
    // #179 B の再発防止装置。
    //
    // `@theme`（src/app/globals.css）に無い色名を書いても、Tailwind は
    // **エラーも警告も出さずに既定パレットの値を出力する。** 書いた本人はブランドの紫や
    // 中性の灰を指定したつもりでも、画面には別の紫・青みがかったスレートが出る。
    //
    // この事故は lint / format / 型 / ユニットテスト / build / Layout E2E のすべてを
    // 通過する。#179 の監査で見つかったときには約50箇所まで広がっていた。
    // docs/frontend/design.md にも書いてあるが、**文書は人間が読まなければ効かない**
    // （#154 で同じ轍を踏んでいる。上の #156 の規則と同じ理由でここへ置く）。
    //
    // 走査対象は文字列リテラルとテンプレート文字列である。
    // **コメントは AST に現れないので、この規則からは見えない。** 一方 Tailwind の
    // ソース走査はテキスト走査でコメントも読むため、そこが死角になっていた（#230）。
    // 残りは scripts/assert-no-restricted-colors.mjs が src/ の生テキストで受け持つ。
    //
    // **@theme へ段を足したら、scripts/restricted-color-tokens.mjs から外すこと。**
    // 足したのに禁止されたままだと、正しい指定が lint で落ちる。
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // 禁止リストの一次定義は scripts/restricted-color-tokens.mjs（#230）。
      // 同じ定義を scripts/assert-no-restricted-colors.mjs も読むので、
      // **@theme へ段を足したときに触るのはあちら1箇所だけでよい。**
      // ここへ正規表現を書き戻すと、片方だけ直して片方がすり抜ける形へ戻る。
      "no-restricted-syntax": [
        "error",
        ...RESTRICTED_COLOR_TOKENS.flatMap(({ pattern, message }) => [
          { selector: `Literal[value=/${pattern}/]`, message },
          { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
        ]),
      ],
    },
  },
];

export default config;
