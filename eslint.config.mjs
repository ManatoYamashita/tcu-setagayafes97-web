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
];

export default config;
