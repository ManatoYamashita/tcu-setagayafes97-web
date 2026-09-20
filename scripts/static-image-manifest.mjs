/**
 * `public/` に置く画像の一次定義（#237 / #241 の続き）
 *
 * ## なぜこのファイルが要るのか
 *
 * 2026-09-20、静的画像は Vercel の Image Optimization を使うのをやめた。
 * 変換枠（Hobby は月5,000）が枯れると `402` が返り、**未変換の組み合わせだけが壊れる**。
 * 枠は直近30日のローリング窓なので、一度枯れると約1か月戻らない。
 * 詳しい経緯は docs/frontend/image-delivery.md を参照。
 *
 * 変換をやめた代わりに、**配信する実体を手元で作る**ことにした。
 * `assets/source/` の原画像を `scripts/optimize-static-images.mjs` が
 * 表示寸法まで縮めて AVIF へ焼き、`public/` へ置く。このファイルはその指示書であり、
 * 同時に `scripts/assert-static-image-budget.mjs` が守る契約でもある。
 *
 * ## 3つの role
 *
 * | role      | 意味                                       | 形式         |
 * | --------- | ------------------------------------------ | ------------ |
 * | `app`     | `AppImage` からのみ描かれる                | `.avif` 必須 |
 * | `crawler` | クローラ・OS が読む（OGP / favicon など）  | `.avif` 禁止 |
 * | `dual`    | `AppImage` と非 `AppImage` の両方から読まれる | `.avif` 禁止 |
 *
 * **`crawler` と `dual` を AVIF にしてはいけない。** X / Slack / LINE の
 * OGP クローラと apple-touch-icon は AVIF を解さない。`<video poster>` の
 * AVIF 解決は `<img>` と別経路で、このプロジェクトでは実測していない。
 *
 * ## 追加・変更するときは
 *
 * **`public/` へ画像を置いたら、必ずここへ1行足すこと。** 足さないと
 * `pnpm check:images` が「manifest に無い画像がある」で落ちる。役割の宣言を
 * 強制するためにそうしてある（除外リスト方式だと書き漏らしが事故になる）。
 *
 * `box` は「最大表示寸法 × 2（DPR2）」で決める。求め方は
 * docs/frontend/image-delivery.md の「事前最適化の運用」を参照。
 * `maxBytes` は実際に焼いた値を見て、少し余裕を持たせた上限を書く。
 */

/**
 * `assets/source/` からの相対パスを `public/` の出力パスから導く。
 *
 * 原画像は `public/` と同じ階層構造で `assets/source/` に置く。
 * 拡張子だけが違う（原画像は WebP / PNG、出力は AVIF）ので、対応は
 * 手で二重に書かず `source` フィールドで明示する。
 */

/** `role: "app"`。`AppImage` からのみ描かれる画像。AVIF へ焼いて原寸のまま配る */
const APP_IMAGES = [
  {
    path: "public/images/brand/favicon-outline.avif",
    source: "assets/source/images/brand/favicon-outline.webp",
    // 原画 500x500。Hero は `max-w-[75vw]→[30vw]` + `w-full` なので広い画面では
    // 拡大表示になるが、原画より大きくしても情報は増えない。寸法は据え置き、
    // AVIF への再エンコードだけで稼ぐ。
    box: { width: 500, height: 500 },
    fit: "inside",
    kind: "art",
    /*
     * 旧 `quality={40}`（HeroSection.tsx）。**トップページの LCP 要素である。**
     *
     * 一度 q=40（27,350 B / RMSE 5.08）で出したが、Vercel が配っていた 16,272 B に対して
     * +68% であり、LCP 要素にそれを払う理由が無かった。q=30 と q=40 を 500px 実寸で並べて
     * 比べても**見分けがつかない**（輪郭線と "SETAGAYA FES" の小さな文字を目視確認）。
     * RMSE は 5.08 → 7.00 へ悪化するが、そのぶん 18,509 B（以前の配信量 +14%）に収まる。
     * モバイルの低速回線では 8,841 B の差が LCP に直接効く。
     */
    quality: 30,
    maxBytes: 21000,
    note: "HeroSection の回転アイコン。トップページの LCP 要素",
  },
  {
    path: "public/images/brand/favicon-white.avif",
    source: "assets/source/images/brand/favicon-white.webp",
    // 原画 500x500。オープナーの枠は `w-64 h-64`（256px）で DPR2 なら 512px 要るが、
    // 原画が 500px なので上限はそこ。
    box: { width: 500, height: 500 },
    fit: "inside",
    kind: "art",
    // 旧 `quality={60}`（Opener.tsx）
    quality: 50,
    maxBytes: 11000,
    note: "オープナーのロゴ。2026-09-20 の本番障害の当事者",
  },
  {
    path: "public/images/brand/logo.avif",
    source: "assets/source/images/brand/logo.webp",
    // 原画 1000x400。ヘッダーは `w-52`（208px）固定で、スクロール後は
    // `scale-[0.538]` へ縮むだけ。208 x 2 = 416。
    box: { width: 416, height: 166 },
    fit: "inside",
    kind: "art",
    // 旧 `quality={60}`（Header.tsx）
    quality: 50,
    maxBytes: 13000,
    note: "ヘッダーのロゴ",
  },
  {
    path: "public/images/brand/logo-white.avif",
    source: "assets/source/images/brand/logo-white.webp",
    // 原画 1000x400。フッターは `w-48`（192px）と `w-12`（48px）の2箇所。
    // 大きいほうに合わせて 192 x 2 = 384。
    box: { width: 384, height: 154 },
    fit: "inside",
    kind: "art",
    // 旧 `quality={60}`（Footer.tsx、2箇所とも）
    quality: 50,
    maxBytes: 12000,
    note: "フッターのロゴ（192px と 48px の2箇所で共用）",
  },
  {
    path: "public/images/photos/tcu-7.avif",
    source: "assets/source/images/photos/tcu-7.webp",
    // 原画 1100x620。`fill` + `object-cover` + `transform: scale(1.3)` で
    // 画面幅いっぱいの帯に敷く。デスクトップでは原画のほうが小さいので据え置き。
    box: { width: 1100, height: 620 },
    fit: "inside",
    kind: "photo",
    // 背景写真。手前に clip-path のリビール演出と本文が乗るので品質は落とせる。
    quality: 30,
    maxBytes: 76000,
    note: "NewsSectionInteractive の背景帯",
  },
  {
    path: "public/images/photos/setagayafe97-image.avif",
    source: "assets/source/images/photos/setagayafe97-image.webp",
    // 原画 1024x1024。最大の使い手は PageHero（`lg:w-[70vw]` の `fill` + `priority`、9ルート）。
    // 1920 幅なら 1344 CSS px に `object-cover` で伸びるため、原画がすでに足りていない。
    // 寸法は据え置き。AboutSection の円形（最大420px）とカードのフォールバック（340px）
    // も同じ実体を使う。**1ファイル1寸法の代償がいちばん大きいのはこの画像である。**
    // 予算を超えるようなら `-card` を分けること（docs の「事前最適化の運用」）。
    box: { width: 1024, height: 1024 },
    fit: "inside",
    kind: "photo",
    quality: 50,
    maxBytes: 26000,
    note: "PageHero（9ルート）/ AboutSection の円形 / カードのフォールバック",
  },
  {
    path: "public/images/photos/setagayafes97-leader.avif",
    source: "assets/source/images/photos/setagayafes97-leader.webp",
    // 原画 1200x1800（縦長）。`aspect-square` + `object-cover` の丸窓に入るので、
    // **短辺**が表示寸法を決める。最大 330px（`lg:w-full` の実幅）x 2 = 660。
    box: { width: 660, height: 990 },
    fit: "inside",
    kind: "photo",
    quality: 50,
    maxBytes: 13000,
    note: "ChairpersonSection の丸い顔写真（短辺が効く）",
  },
  {
    path: "public/images/special/mon7a.avif",
    source: "assets/source/images/special/mon7a.webp",
    // 原画 1280x1280。`imageSizes` は lg で 460px に収束する（SpecialGuestSection の
    // コメント参照）。460 x 2 = 920。
    box: { width: 920, height: 920 },
    fit: "inside",
    kind: "photo",
    // 旧 `quality={75}`（SpecialGuestSection.tsx）。出演者の顔写真なので下げすぎない。
    quality: 50,
    maxBytes: 30000,
    note: "SpecialGuestSection のアーティスト写真",
  },
  {
    path: "public/images/special/mon7a-logo.avif",
    source: "assets/source/images/special/mon7a-logo.webp",
    // 原画 1524x405。`max-w-[360px]`（lg）x 2 = 720。
    box: { width: 720, height: 191 },
    fit: "inside",
    kind: "art",
    // 旧 `quality={75}`。見出しの代替なので輪郭が痩せると読めない。
    quality: 60,
    maxBytes: 3200,
    note: "SpecialGuestSection の出演者名ロゴ（h2 のアクセシブル名を alt が担う）",
  },
  {
    path: "public/materials/geer1.avif",
    source: "assets/source/materials/geer1.webp",
    // 原画 500x500。最大 96px（`lg:w-24`）x 2 = 192。
    box: { width: 192, height: 192 },
    fit: "inside",
    kind: "art",
    quality: 50,
    maxBytes: 4500,
    note: "歯車の装飾（AboutSection / NewsSectionInteractive の2箇所）",
  },
  {
    path: "public/materials/geers.avif",
    source: "assets/source/materials/geers.webp",
    // 原画 500x500。最大 192px（`lg:w-48`）x 2 = 384。
    box: { width: 384, height: 384 },
    fit: "inside",
    kind: "art",
    quality: 50,
    maxBytes: 12500,
    note: "歯車の装飾（NewsSectionInteractive）",
  },
];

/**
 * `role: "crawler"` と `role: "dual"`。**AVIF へ変換してはいけない画像。**
 *
 * `assert-static-image-budget.mjs` は manifest を信じない。`src/` のシンク
 * （OGP・favicon・構造化データ・`<video poster>`）を実際に読んで、そこから
 * 参照されているパスが `role: "app"` になっていたら落とす。ここの宣言は
 * その照合の片側でしかない。
 */
const NON_APP_IMAGES = [
  {
    path: "public/ogp.webp",
    role: "crawler",
    maxBytes: 40000,
    note: "OGP / twitter:image。X・Slack・LINE のクローラは AVIF を読まない（src/data/site.ts の ogImage）",
  },
  {
    path: "public/images/brand/search-thumbnail-97.webp",
    role: "crawler",
    maxBytes: 50000,
    note: "JSON-LD の primaryImageOfPage と画像サイトマップ専用。AppImage から一度も描かれない（src/data/site.ts の searchThumbnail）",
  },
  {
    path: "public/images/brand/favicon.png",
    role: "crawler",
    // 192,719 B は favicon としては大きいが、AVIF 化はできない。
    // PNG のまま減色する余地は残っている（別件）。
    maxBytes: 200000,
    note: "icons.icon / icons.apple（apple-touch-icon は AVIF 非対応）と JSON-LD の Organization.logo",
  },
  {
    path: "public/favicon.ico",
    role: "crawler",
    maxBytes: 8000,
    note: "ルートの favicon.ico。ブラウザが規約で直接取りに来る",
  },
  {
    path: "public/images/video-posters/access-tcu-setagaya.webp",
    role: "dual",
    maxBytes: 20000,
    note: "AccessRouteMedia が AppImage と <video poster> の両方で使う。poster の AVIF 解決は未実測で、12.9KB なので得も無い",
  },
];

/** manifest の全エントリ。`role` を省略したものは `app` とみなす */
export const STATIC_IMAGES = [
  ...APP_IMAGES.map((entry) => ({ role: "app", ...entry })),
  ...NON_APP_IMAGES,
];

/** `public/` で検査対象にする拡張子 */
export const IMAGE_EXTENSIONS = [".avif", ".webp", ".png", ".jpg", ".jpeg", ".gif", ".ico"];

/**
 * 受け入れ基準: トップページのファーストビューで取得される静的画像の実体合計。
 *
 * 139,856 B は Vercel の Image Optimization を通していたときの実測
 * （docs/frontend/image-delivery.md「外すと何を失うか」、390x844・DPR2 の8枚）。
 * 1ファイル1寸法になるぶん画面幅ごとの最適化は失うので、**43% の超過までは許す**
 * という判断で 200,000 B を上限に置いた。**これは実測ではなく判断である。**
 *
 * 2026-09-20 の実績は 167,878 B（Vercel 経由比 +20%、原画 724,228 B 比 −77%）。
 */
export const FIRST_VIEW_BUDGET_BYTES = 200000;

/**
 * ファーストビューで取得される画像（上の予算の対象）。
 *
 * docs の 139,856 B と同じ条件（390x844・DPR2 のトップページ）で数えた8枚。
 * オープナーはモバイルでは走らないのでこの集合には入らない。
 */
export const FIRST_VIEW_IMAGES = [
  "public/images/brand/logo.avif",
  "public/images/brand/favicon-outline.avif",
  "public/images/photos/tcu-7.avif",
  "public/images/special/mon7a.avif",
  "public/images/special/mon7a-logo.avif",
  "public/images/photos/setagayafe97-image.avif",
  "public/materials/geer1.avif",
  "public/materials/geers.avif",
];
