import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

import { RESTRICTED_COLOR_TOKENS } from "./scripts/restricted-color-tokens.mjs";

/**
 * `<Suspense>` の fallback として描かれるツリー
 *
 * `src/app/events/(list)/page.tsx` の fallback は `EventsView` を起点に、この6ファイルだけを描く。
 * クエリを読んでよいのは境界の内側にいる `EventsContent` だけなので、ここには含めない。
 * 意味検索を叩く `useSemanticSearch.ts` も `EventsContent` からだけ呼ばれるため含めない。
 */
const EVENTS_FALLBACK_TREE = [
  "src/components/events/EventsView.tsx",
  "src/components/events/EventFilters.tsx",
  "src/components/events/EventInfiniteList.tsx",
  "src/components/events/EventGrid.tsx",
  "src/components/events/EventCard.tsx",
  "src/components/events/SemanticSearchNotice.tsx",
];

/**
 * `next/image` と画像の静的 import の禁止（#237 / #241）
 *
 * **定義をここへ出しているのは、flat config が同じ規則名を後勝ちで「丸ごと」置き換えるため。**
 * `no-restricted-imports` を別のブロックでもう一度書くと、先に書いた側の設定は
 * エラーも警告も出さずに消える。実際 2026-09-20 まで、EVENTS_FALLBACK_TREE の
 * `useSearchParams` 禁止（#156）はこのブロックに上書きされて**一度も効いていなかった**
 * （`eslint --print-config` で確認。退行を注入しても exit 0 だった）。
 *
 * 規則名がぶつかるブロックを足すときは、必ずこの定義を展開して合成すること。
 */
const RESTRICTED_IMAGE_IMPORTS = {
  paths: [
    {
      name: "next/image",
      message:
        "next/image を直接使うと Vercel の画像最適化を通り、変換枠を消費します。枠が枯れると 402 でその画像だけが壊れます（#237）。@/components/ui/AppImage の AppImage を使ってください。",
    },
  ],
  /*
   * 画像の静的 import（`import logo from "./logo.avif"`）を禁じる。
   *
   * 静的 import の画像は `/_next/static/media/<hash>` へ出るため、
   * **`public/` を歩く `pnpm check:images` の射程から完全に外れる。**
   * 寸法もバイト数も予算も誰も見ておらず、原寸のまま配信される
   * （`AppImage` は文字列でない `src` も `unoptimized` 側へ落とす）。
   *
   * 2026-09-20 時点で該当は 0 件。増える前に塞いでおく。
   */
  patterns: [
    {
      group: ["*.avif", "*.webp", "*.png", "*.jpg", "*.jpeg", "*.gif"],
      message:
        "画像を静的 import すると pnpm check:images の射程（public/ 配下）から外れ、寸法もバイト予算も検査されないまま配信されます。public/ へ置き、scripts/static-image-manifest.mjs へ登録して、パス文字列で参照してください（#241）。",
    },
  ],
};

/**
 * 禁止色トークンのセレクタ（#179 B / #230）
 *
 * 一次定義は scripts/restricted-color-tokens.mjs。同じ定義を
 * scripts/assert-no-restricted-colors.mjs も読むので、**@theme へ段を足したときに
 * 触るのはあちら1箇所だけでよい。** ここへ正規表現を書き戻すと、片方だけ直して
 * 片方がすり抜ける形へ戻る。
 *
 * 上の RESTRICTED_IMAGE_IMPORTS と同じ理由でここへ出す。`no-restricted-syntax` は
 * EventInfiniteList.tsx 用のブロック（#239）でも使うため、あちらでもこれを展開する。
 * **展開を忘れると、そのファイルだけ色の検査が黙って消える**（2026-09-20 まで実際に消えていた）。
 */
const RESTRICTED_COLOR_SELECTORS = RESTRICTED_COLOR_TOKENS.flatMap(({ pattern, message }) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
]);

/**
 * ブランドカラーの上の白文字の禁止（#95）
 *
 * `--color-primary` の実配信値 `#bf73e3` と白のコントラストは **3.10:1** で、
 * WCAG AA（通常テキスト 4.5:1）に届かない。`--color-accent` と `--color-primary`
 * はどちらも `primary-400` の別名であり、`primary-300` 以下はさらに淡い。
 *
 * | 背景          | 白文字との比 | 判定 |
 * | ------------- | ------------ | ---- |
 * | `primary-400` | 3.10:1       | NG   |
 * | `primary-500` | 4.88:1       | 可   |
 * | `primary-600` | 7.45:1       | 推奨 |
 * | `primary-700` | 11.2:1       | 推奨 |
 *
 * `globals.css` の `--color-primary` にも `docs/frontend/design.md` にも
 * 「前景テキストに使ってはいけない」と書いてあったが、**文書は人間が読まなければ効かない。**
 * 2026-09-22 の監査で5箇所（privacy / faq / FeaturedCarousel / SponsorModal /
 * TicketTable）が残っていた。#95 は同じ欠陥を 2026-08-24 に起票し、
 * そこに列挙された3件だけが直って Issue は開いたままだった。
 *
 * **射程外（意図的）**
 *
 * - `hover:bg-primary text-white` — 基底状態ではないので落とさない
 * - 親要素に `bg-primary`、子要素に `text-white` — className が別文字列なので見えない
 * - `` `bg-primary ${x} text-white` `` — TemplateElement が分割され、片方ずつになる
 *
 * いずれも「1つの className 文字列に両方が入る」という最頻の形を塞ぐことを優先した。
 * **射程を広げるより、確実に落ちる形を1つ持つほうがよい。**
 */
const WHITE_ON_BRAND_PATTERN =
  "(?=[\\s\\S]*(?:^|\\s)bg-(?:primary|accent)(?:-(?:400|300|200|100|50))?(?![-\\w]))(?=[\\s\\S]*(?:^|\\s)text-white(?![-\\w]))";

const WHITE_ON_BRAND_MESSAGE =
  "ブランドカラー（--color-primary / --color-accent = 実配信 #bf73e3）の上に白文字を置くと 3.10:1 で、WCAG AA の 4.5:1 に届きません（#95）。bg-primary-600（7.45:1）か bg-primary-700（11.2:1）を使ってください。値の一覧は docs/frontend/design.md「コントラスト比」。";

/**
 * 前景色に別名 `text-primary` / `text-accent` を使うことの禁止（#270）
 *
 * `--color-primary` と `--color-accent` はどちらも `primary-400`（実配信 `#bf73e3`）の
 * 別名である。白地の通常テキストで **3.10:1** しかなく AA（4.5:1）に届かない。
 * `globals.css` の定義にも「前景テキスト・アイコンに使ってはいけない」と書いてあるが、
 * 2026-09-22 の監査時点で**別名だけで19箇所**あった。
 *
 * ## なぜ「別名の禁止」という形なのか
 *
 * **本来守りたいのは「ブランド紫を通常テキストに使わない」だが、それは装置にできない。**
 * 同じ `#bf73e3` でも可否が下地で変わり、**下地は同じ className に書かれていない。**
 *
 * 2026-09-22 に「アイコン（`h-<数字>` と `w-<数字>` が両方ある）と大テキスト
 * （`text-2xl` 以上）を除外する」近似規則を実装して走らせたところ、20件中5件が
 * **正しいコードを落とす偽陽性**だった。
 *
 * | 偽陽性 | 実際の下地 | 実際の比 |
 * | --- | --- | --- |
 * | `AccessPageContent.tsx:161` | 親が `bg-gray-900` | 約 13:1 |
 * | `ContactForm.tsx:318` | 親が `bg-primary-700` | 9.57:1 |
 * | `ComingSoon.tsx:31` | `text-primary/5` の装飾SVG | 装飾 |
 * | `HeroSection.tsx:41` | 子が `text-5xl`（大テキスト） | 3:1 で可 |
 * | `NewsSection.tsx:20` | `w-72` だけの装飾SVG | 装飾 |
 *
 * **初回から5件の disable を要求する装置は、disable を習慣にするだけで機能しない。**
 * そこで射程を「別名を使わない」へ狭めた。下地に一切依存しないので偽陽性が出ない。
 *
 * **これはコントラストの保証ではない。** `text-primary-400` と明示的に書けば通る。
 * 保証するのは「どの段を選んだかがコードに書いてある」ことだけで、
 * これにより**以降の監査が数値トークンの正確な grep で済む。**
 * 残っている実際のコントラスト不足は #270 で追跡する。
 */
const BRAND_TEXT_ALIAS_PATTERN = "(?:^|\\s)(?:[a-z-]+:)*text-(?:primary|accent)(?![-\\w])";

const BRAND_TEXT_ALIAS_MESSAGE =
  "前景色に別名 text-primary / text-accent を使わないでください（#270）。どちらも primary-400（実配信 #bf73e3）で、白地の通常テキストでは 3.10:1 となり AA の 4.5:1 に届きません。通常テキストは text-primary-600（7.45:1）、アイコンや大テキスト（要求 3:1）で意図して使う場合は text-primary-400 と明示的に書いてください。";

/**
 * 上の2つと同じ理由でここへ出す。`no-restricted-syntax` を使うブロックすべてで展開すること。
 */
const RESTRICTED_BRAND_TEXT_SELECTORS = [
  { selector: `Literal[value=/${BRAND_TEXT_ALIAS_PATTERN}/]`, message: BRAND_TEXT_ALIAS_MESSAGE },
  {
    selector: `TemplateElement[value.raw=/${BRAND_TEXT_ALIAS_PATTERN}/]`,
    message: BRAND_TEXT_ALIAS_MESSAGE,
  },
];

/**
 * 上の2つと同じ理由でここへ出す。`no-restricted-syntax` は
 * `src/**` 用と `EventInfiniteList.tsx` 用の2ブロックで使うため、**両方で展開すること。**
 * 片方に足し忘れると、そのファイルだけ検査が黙って消える。
 */
const RESTRICTED_CONTRAST_SELECTORS = [
  { selector: `Literal[value=/${WHITE_ON_BRAND_PATTERN}/]`, message: WHITE_ON_BRAND_MESSAGE },
  {
    selector: `TemplateElement[value.raw=/${WHITE_ON_BRAND_PATTERN}/]`,
    message: WHITE_ON_BRAND_MESSAGE,
  },
];

/**
 * `focus:` でネイティブのフォーカス表示を消すことの禁止（#176）
 *
 * `focus:outline-none` はキーボードでもマウスでも UA 既定のアウトラインを消す。
 * 2026-09-05 の監査では、共有プリミティブ `Button` を含む10ファイルがこれで消したうえで
 * `ring-white` / `ring-white/20` / `ring-primary/20` を代わりに描いており、
 * **白いシート上で 1.00〜1.23:1** と、WCAG 1.4.11 の 3:1 に全箇所で届いていなかった。
 * `focus:` なのでマウスクリックでもリングが出ていた。
 *
 * 正しい形は `focus-visible:outline-3 focus-visible:outline-offset-3
 * focus-visible:outline-primary-600`（暗色の下地では `outline-white`）。
 * 値の選び方は docs/frontend/access-page-design.md「フォーカスリング」。
 *
 * **射程外（意図的）**
 *
 * - `focus-visible:outline-none` — スキップリンクの着地点（`<main tabIndex={-1}>`）で
 *   意図的に使っている。これを落とすと全ページが disable を要求する
 * - 代替リングの色が下地に対して 3:1 あるか — 下地は同じ className に無いので判定できない
 *   （#270 の偽陽性の実測を参照）。そこは #176 の手順どおり実測で確かめる
 */
const FOCUS_OUTLINE_REMOVAL_PATTERN =
  "(?:^|\\s)(?:[a-z-]+:)*focus:outline-(?:none|hidden)(?![-\\w])";

const FOCUS_OUTLINE_REMOVAL_MESSAGE =
  "focus:outline-none / focus:outline-hidden でネイティブのフォーカス表示を消さないでください（#176）。代替リングが 3:1 に届かない事故が10ファイルで起きていました。focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600（暗色の下地では outline-white）を使ってください。詳細は docs/frontend/access-page-design.md。";

/**
 * 上の3つと同じ理由でここへ出す。`no-restricted-syntax` を使うブロックすべてで展開すること。
 */
const RESTRICTED_FOCUS_SELECTORS = [
  {
    selector: `Literal[value=/${FOCUS_OUTLINE_REMOVAL_PATTERN}/]`,
    message: FOCUS_OUTLINE_REMOVAL_MESSAGE,
  },
  {
    selector: `TemplateElement[value.raw=/${FOCUS_OUTLINE_REMOVAL_PATTERN}/]`,
    message: FOCUS_OUTLINE_REMOVAL_MESSAGE,
  },
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
      // セレクタの組み立ては RESTRICTED_COLOR_SELECTORS（このファイル冒頭）。
      // 一次定義は scripts/restricted-color-tokens.mjs（#230）。
      // RESTRICTED_CONTRAST_SELECTORS は #95（ブランドカラーの上の白文字）。
      // RESTRICTED_FOCUS_SELECTORS は #176（focus: でフォーカス表示を消す）。
      "no-restricted-syntax": [
        "error",
        ...RESTRICTED_COLOR_SELECTORS,
        ...RESTRICTED_CONTRAST_SELECTORS,
        ...RESTRICTED_BRAND_TEXT_SELECTORS,
        ...RESTRICTED_FOCUS_SELECTORS,
      ],
    },
  },
  {
    // #237 の再発防止装置。
    //
    // `next/image` を直接使うと Vercel の Image Optimization を通る。Free Plan の
    // 変換枠（Hobby は月5,000変換）が枯れると `402` が返り、**その画像だけが壊れる。**
    // 課金単位は画像1枚ではなく変換1回、すなわち (元画像, 幅, 品質, フォーマット) の
    // 組み合わせ1つで、変換済みは CDN に残るため、枯渇後は未変換の組み合わせだけが
    // 壊れる。画面幅と DPR で表示される画像が入れ替わり、再現しにくい形で出る。
    //
    // 画像は `src/components/ui/AppImage.tsx` の `AppImage` で描く。microCMS のものは
    // imgix へ、`public/` の静的画像は `unoptimized` で事前最適化済みの実体をそのまま
    // 配る。どちらも枠を使わない。
    //
    // この事故は lint 以外のすべてを通過する。型も通り、ビルドも通り、枠が残っている
    // うちは画面も正常に見える。生成物を読む `scripts/assert-no-image-optimizer.mjs`
    // が最後の砦だが、**そちらはビルドしないと分からない。** import の時点で止めるため
    // ここへ置く（#156 / #179 の規則と同じ理由）。
    //
    // 背景と実測は docs/frontend/image-delivery.md を参照。
    // `.ts` も含める。JSX は書けないが re-export や `getImageProps` の利用で迂回できる。
    // 例外はラッパー本体と、型だけを使うローダー（`import type` のみ）。
    files: ["src/**/*.tsx", "src/**/*.ts"],
    ignores: ["src/components/ui/AppImage.tsx", "src/lib/image-loader.ts"],
    rules: {
      // 定義はこのファイル冒頭の RESTRICTED_IMAGE_IMPORTS。
      // **ここへ直接書き戻さないこと。** 下の EVENTS_FALLBACK_TREE 用ブロックが
      // 同じ規則名を使うため、定義が1箇所に無いと片方が黙って消える。
      "no-restricted-imports": ["error", RESTRICTED_IMAGE_IMPORTS],
    },
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
    //
    // **このブロックは、上の画像ブロックより後に置くこと。** flat config は同じ規則名を
    // 後勝ちで丸ごと置き換えるため、前に置くと `no-restricted-imports` の設定ごと
    // 消える。2026-09-20 まで実際に消えており、この規則は一度も効いていなかった。
    // 画像側の制限もここで展開して合成する。
    files: EVENTS_FALLBACK_TREE,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...RESTRICTED_IMAGE_IMPORTS.paths,
            {
              name: "next/navigation",
              importNames: ["useSearchParams"],
              message:
                "このツリーは /events の <Suspense> fallback として描かれます。ここでクエリを読むと fallback 自身が bailout し、ページ本体が静的HTMLから消えます（#156）。クエリは EventsContent で読み、props で渡してください。",
            },
          ],
          patterns: RESTRICTED_IMAGE_IMPORTS.patterns,
        },
      ],
    },
  },
  {
    // #239 の再発防止装置。
    //
    // `EventInfiniteList` の IntersectionObserver は、発火したら即 disconnect し、
    // **効果が組み直されるときにだけ張り直す。** その契機は `visibleCount` の変化
    // ひとつしかない。依存から落とすと observer が二度と繋ぎ直されず、
    // **1回だけ追加して永久に止まる**（2026-09-20 実測。12件 → 24件 で打ち止め）。
    //
    // この事故は型でもユニットテストでも表現できない。実ブラウザなら捕まるが、
    // **`/events` は microCMS を読むため CI では0件になり、E2E を置いても
    // 企画が無いまま緑になる**（`getEventsList` は `isMicrocmsConfigured` が
    // false なら `[]` を返す）。fail-open な検査を足すくらいなら、
    // 依存配列そのものを規則で縛るほうが確実である。
    //
    // **`exhaustive-deps` は既定では warning であり、`pnpm lint` を緑のまま通す。**
    // ここで error へ格上げして初めて CI が落ちる（格上げ前に退行を注入して実測済み）。
    // 対象をこの1ファイルへ絞るのは、既存コードに意図的な
    // `// eslint-disable-next-line react-hooks/exhaustive-deps` があるためである。
    //
    // **`exhaustive-deps` だけでは #239 そのものの形を止められない。** 打ち切り条件を
    // `hasMore` へ戻し、依存配列も `[hasMore, loadMore]` へ**揃えて**しまうと、
    // 依存は過不足なく揃っているため `exhaustive-deps` は何も言わない（2026-09-20 実測。
    // この形だけ exit 0 で通った。依存だけ・本体だけを触った中間状態は exit 1 になる）。
    // `hasMore` は同じファイルの上部に定義済みで描画側でも使うため、
    // 「整理のつもりで効果の中も揃える」は自然に起こる。
    //
    // そこで `no-restricted-syntax` で、効果の中から `hasMore` を読むこと自体を禁じる。
    // 描画側（`{hasMore && ...}`）は対象外なので、既存の書き方は変えなくてよい。
    files: ["src/components/events/EventInfiniteList.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "error",
      // **色・コントラスト・フォーカスのセレクタを必ず展開すること。** flat config は後勝ちで丸ごと
      // 置き換えるため、展開を落とすとこのファイルだけ検査が素通りする
      // （2026-09-20 まで禁止色が実際に素通りしていた）。
      "no-restricted-syntax": [
        "error",
        ...RESTRICTED_COLOR_SELECTORS,
        ...RESTRICTED_CONTRAST_SELECTORS,
        ...RESTRICTED_BRAND_TEXT_SELECTORS,
        ...RESTRICTED_FOCUS_SELECTORS,
        {
          selector: "CallExpression[callee.name='useEffect'] Identifier[name='hasMore']",
          message:
            "効果の中で hasMore を読まないでください（#239）。継ぎ足しても hasMore は値・参照とも変わらないため、効果が組み直されず observer が張り直されません。打ち切り条件は visibleCount >= total と書き、依存配列に visibleCount を残してください。",
        },
        {
          selector: "CallExpression[callee.name='useCallback'] Identifier[name='hasMore']",
          message:
            "useCallback の中で hasMore を読まないでください（#239）。依存に hasMore が入ると、継ぎ足しのたびに関数の参照が変わらず、効果の再実行の契機が失われます。",
        },
      ],
    },
  },
];

export default config;
