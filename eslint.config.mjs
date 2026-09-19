import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

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
    // 走査対象は文字列リテラルとテンプレート文字列。Tailwind のクラス名は
    // JIT が検出できるよう完全なリテラルで書く規約なので、これで全経路を覆える
    // （src/ 配下の .css に @apply は無い。2026-09-19 時点）。
    //
    // **@theme へ段を足したら、ここの禁止リストからその段を外すこと。**
    // 足したのに禁止されたままだと、正しい指定が lint で落ちる。
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // ブランドと色相差 7.5–11.6°。15° 未満は同一色として知覚されるうえ、
          // 彩度が約40%高いため「ブランド紫を出そうとして外した色」に見える。
          selector: "Literal[value=/(?:purple|violet|fuchsia)-(?:50|950|[1-9]00)(?![0-9])/]",
          message:
            "Tailwind 既定の purple / violet / fuchsia は使えません。ブランドと色相差が 15° 未満で、別色として認識されないためです。primary-* の同じ段へ置き換えてください（docs/frontend/design.md「紫はすべて primary-* を使う」）。",
        },
        {
          selector:
            "TemplateElement[value.raw=/(?:purple|violet|fuchsia)-(?:50|950|[1-9]00)(?![0-9])/]",
          message:
            "Tailwind 既定の purple / violet / fuchsia は使えません。ブランドと色相差が 15° 未満で、別色として認識されないためです。primary-* の同じ段へ置き換えてください（docs/frontend/design.md「紫はすべて primary-* を使う」）。",
        },
        {
          // @theme のニュートラルは 50/100/200/400/500/600/700/900 の8段。
          // 300 / 800 / 950 は欠番で、書くと既定の青みがかったスレートへ落ちる。
          selector: "Literal[value=/gray-(?:300|800|950)(?![0-9])/]",
          message:
            "gray-300 / gray-800 / gray-950 は @theme に定義がなく、既定の青みがかったスレートへ落ちます。gray-200 など定義済みの段へ寄せるか、globals.css の @theme へ段を足してこの規則から外してください（docs/frontend/design.md「Tailwind 既定パレットを直接使わない」）。",
        },
        {
          selector: "TemplateElement[value.raw=/gray-(?:300|800|950)(?![0-9])/]",
          message:
            "gray-300 / gray-800 / gray-950 は @theme に定義がなく、既定の青みがかったスレートへ落ちます。gray-200 など定義済みの段へ寄せるか、globals.css の @theme へ段を足してこの規則から外してください（docs/frontend/design.md「Tailwind 既定パレットを直接使わない」）。",
        },
      ],
    },
  },
];

export default config;
