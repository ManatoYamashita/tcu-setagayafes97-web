#!/usr/bin/env node
/**
 * `public/` の画像が manifest の契約どおりであることを検査する（#241 の再発防止装置）
 *
 * `pnpm check:images`。CI の Static Checks から走る（`git ls-files` 以外を要求しない）。
 *
 * ## なぜ必要か
 *
 * 静的画像は Vercel の Image Optimization をやめ、`scripts/optimize-static-images.mjs` が
 * 焼いた実体をそのまま配るようになった。配信するバイトが**リポジトリの中身そのもの**に
 * なったので、次の事故が起きうる。
 *
 * - 画像を `public/` へ足したが manifest に書かず、原寸のまま配られる
 * - `.webp → .avif` の張り替えを1箇所直し忘れ、**本番で 404 になる**
 *   （ビルドも ESLint も型検査も通る。生成物にも `/_next/image` は出ない）
 * - **OGP や favicon まで AVIF 化してしまう**（X・Slack・LINE のクローラと
 *   apple-touch-icon は AVIF を解さない）
 * - 原画像を差し替えたら焼き直し忘れ、予算を超えたまま配られる
 *
 * どれも画面上は気づけない。OGP の退行にいたっては、SNS へ貼るまで誰も分からない。
 *
 * ## 5つ見ている
 *
 * 1. **完全性** — `public/` の画像がすべて manifest にあり、manifest の `path` が実在する
 * 2. **クローラ用シンクの逆引き** — manifest を信じず、`src/` の実物
 *    （OGP / favicon / 構造化データ / サイトマップ / `<video poster>`）を読んで照合する
 * 3. **形式** — `role: "app"` は `.avif`、`crawler` / `dual` は `.avif` でない
 * 4. **参照の解決** — `src/` に書かれた画像パスの実体が `public/` にある
 * 5. **寸法とバイト予算** — 実寸が `box` を超えず、バイト数が `maxBytes` 以下。
 *    ファーストビューの合計が `FIRST_VIEW_BUDGET_BYTES` 以下
 *
 * ## `git ls-files` を歩く理由
 *
 * 作業ツリーを再帰すると `.gitignore` 対象のローカルコピーを拾い、**CI では再現せず
 * 手元で走らせた人間だけが嘘を見る**。`assert-no-restricted-colors.mjs` と同じ立場。
 *
 * 裏返しとして、**まだ `git add` していない画像はこの検査から見えない。**
 * push すれば必ず追跡下に入るので CI では落ちる。手元で先に試したいときは
 * `git add -N <file>` してから走らせること。
 *
 * 背景と設計は docs/frontend/image-delivery.md を参照。
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

import {
  FIRST_VIEW_BUDGET_BYTES,
  FIRST_VIEW_IMAGES,
  IMAGE_EXTENSIONS,
  STATIC_IMAGES,
} from "./static-image-manifest.mjs";

const LABEL = "[assert-static-image-budget]";
const problems = [];

function problem(title, detail) {
  problems.push(detail ? `${title}\n${detail}` : title);
}

/** `git ls-files` の結果。作業ツリーを再帰しない */
function gitFiles(pattern) {
  return execFileSync("git", ["ls-files", pattern], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

const manifestByPath = new Map(STATIC_IMAGES.map((entry) => [entry.path, entry]));

// ---------------------------------------------------------------------------
// 0. manifest 自身の形
//
//    ここを飛ばすと、役割ごとの必須項目が欠けたときに検査が **例外で死ぬ**。
//    死に方が TypeError だと「検査が落ちた」のか「検査が対象を落とした」のか
//    読み手に区別がつかない。先に形だけ確かめて、問題として並べる。
// ---------------------------------------------------------------------------

const REQUIRED_BY_ROLE = {
  app: ["source", "box", "fit", "kind", "quality", "maxBytes"],
  crawler: ["maxBytes"],
  dual: ["maxBytes"],
};

let manifestIsSound = true;

for (const entry of STATIC_IMAGES) {
  const required = REQUIRED_BY_ROLE[entry.role];
  if (!required) {
    manifestIsSound = false;
    problem(
      `role が不正です: ${entry.path}（role: ${JSON.stringify(entry.role)}）`,
      `  使えるのは ${Object.keys(REQUIRED_BY_ROLE).join(" / ")} です。`
    );
    continue;
  }
  const lacking = required.filter((key) => entry[key] === undefined);
  if (lacking.length > 0) {
    manifestIsSound = false;
    problem(
      `manifest の項目が足りません: ${entry.path}（role: "${entry.role}"）`,
      `    不足: ${lacking.join(", ")}\n` +
        `  role: "${entry.role}" には ${required.join(", ")} が要ります。` +
        (entry.role === "app"
          ? "\n  クローラ用の画像を app にしていませんか。その場合は role を crawler / dual へ戻してください。"
          : "")
    );
  }
}

const duplicates = STATIC_IMAGES.map((entry) => entry.path).filter(
  (value, index, all) => all.indexOf(value) !== index
);
if (duplicates.length > 0) {
  manifestIsSound = false;
  problem(`manifest に同じ path が複数あります: ${[...new Set(duplicates)].join(", ")}`);
}

// ---------------------------------------------------------------------------
// 1. 完全性
// ---------------------------------------------------------------------------

const publicImages = gitFiles("public/**").filter((file) =>
  IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
);

const unlisted = publicImages.filter((file) => !manifestByPath.has(file));
if (unlisted.length > 0) {
  problem(
    `manifest に無い画像が public/ にあります（${unlisted.length} 件）。`,
    [
      ...unlisted.map((file) => `    ${file}`),
      "",
      "  scripts/static-image-manifest.mjs へ role を宣言して追加してください。",
      '    role: "app"     … AppImage からのみ描かれる → AVIF へ焼く',
      '    role: "crawler" … OGP / favicon / 構造化データ → AVIF 化してはいけない',
      '    role: "dual"    … AppImage と非 AppImage の両方が読む → AVIF 化してはいけない',
    ].join("\n")
  );
}

const missing = STATIC_IMAGES.filter((entry) => !existsSync(entry.path));
if (missing.length > 0) {
  problem(
    `manifest にあるのに実体が無い画像があります（${missing.length} 件）。`,
    [
      ...missing.map((entry) => `    ${entry.path}`),
      "",
      '  role: "app" なら `pnpm images:optimize` で焼いてください。',
    ].join("\n")
  );
}

// ---------------------------------------------------------------------------
// 2. クローラ用シンクの逆引き（除外漏れの本体）
//
//    manifest を信じない。src/ の実物を読んで「クローラ・OS が読むパス」を集め、
//    それが role: "app"（= AVIF 化の対象）になっていたら落とす。
// ---------------------------------------------------------------------------

/** 各シンクの読み取り方。`expect` は「ここからは必ず1本以上出る」という表明 */
const SINKS = [
  {
    name: "OGP / 検索サムネイル（src/data/site.ts）",
    file: "src/data/site.ts",
    pattern: /(?:ogImage|searchThumbnail):\s*"([^"]+)"/g,
    expect: 2,
  },
  {
    name: "favicon / apple-touch-icon（src/app/layout.tsx の icons）",
    file: "src/app/layout.tsx",
    pattern: /url:\s*"(\/[^"]+)"/g,
    expect: 1,
  },
  {
    name: "構造化データ（src/lib/structured-data.ts）",
    file: "src/lib/structured-data.ts",
    pattern: /absoluteSiteUrl\("(\/[^"]+\.[a-z0-9]+)"\)/g,
    expect: 1,
  },
  {
    name: "画像サイトマップ（src/lib/sitemap-entries.ts）",
    file: "src/lib/sitemap-entries.ts",
    pattern: /"(\/[A-Za-z0-9/_.-]+\.(?:avif|webp|png|jpe?g|gif|ico))"/g,
    expect: 1,
  },
];

const crawlerPaths = new Set();

for (const sink of SINKS) {
  if (!existsSync(sink.file)) {
    problem(
      `シンクのファイルが見つかりません: ${sink.file}（${sink.name}）`,
      "  ファイルを移動・改名したなら、この検査の SINKS も追従させてください。"
    );
    continue;
  }
  const source = readFileSync(sink.file, "utf8");
  const found = [...source.matchAll(sink.pattern)].map((m) => m[1]);
  if (found.length < sink.expect) {
    problem(
      `${sink.name} からパスを ${sink.expect} 本以上拾えませんでした（${found.length} 本）。`,
      "  書き方が変わると検査が空振りします。SINKS の pattern を実態へ合わせてください。"
    );
  }
  for (const value of found) crawlerPaths.add(value);
}

// `<video poster>` は場所を限定できないので src/ 全体から拾う
const posterPaths = [];
for (const file of gitFiles("src/**")) {
  if (!/\.(tsx?|jsx?)$/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/poster=\{?"(\/[^"]+)"/g)) posterPaths.push(match[1]);
}
for (const value of posterPaths) crawlerPaths.add(value);

for (const ref of crawlerPaths) {
  const entry = manifestByPath.get(`public${ref}`);
  if (!entry) continue; // 3 と 4 が拾う
  if (entry.role === "app") {
    problem(
      `クローラ・OS が読むパスが role: "app" になっています: ${ref}`,
      [
        "    この画像は AVIF 化してはいけません。X / Slack / LINE の OGP クローラと",
        "    apple-touch-icon は AVIF を解さず、<video poster> の AVIF 解決は未実測です。",
        "",
        '  manifest の role を "crawler" か "dual" へ変え、原形式のまま public/ へ戻してください。',
      ].join("\n")
    );
  }
}

// 逆向き。crawler 専用のはずの画像が AppImage から直接描かれていないか
for (const file of gitFiles("src/**")) {
  if (!/\.tsx$/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/<AppImage[^>]*?\ssrc="(\/[^"]+)"/gs)) {
    const entry = manifestByPath.get(`public${match[1]}`);
    if (entry?.role === "crawler") {
      problem(
        `role: "crawler" の画像が AppImage から描かれています: ${match[1]}（${file}）`,
        '  両方から読むなら role を "dual" へ変えてください（AVIF 化の対象からは外れたままです）。'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 3. 形式
// ---------------------------------------------------------------------------

for (const entry of STATIC_IMAGES) {
  const isAvif = path.extname(entry.path).toLowerCase() === ".avif";
  if (entry.role === "app" && !isAvif) {
    problem(`role: "app" なのに AVIF ではありません: ${entry.path}`);
  }
  if (entry.role !== "app" && isAvif) {
    problem(
      `role: "${entry.role}" なのに AVIF です: ${entry.path}`,
      "  クローラ・OS が読む画像を AVIF にしてはいけません。"
    );
  }
}

// ---------------------------------------------------------------------------
// 4. 参照の解決
//
//    `.webp → .avif` の張り替え漏れはビルドも lint も型検査も通り、本番で 404 になる。
//    これだけが拾う。
// ---------------------------------------------------------------------------

const LITERAL = /["'`](\/[A-Za-z0-9/_.-]+\.(?:avif|webp|png|jpe?g|gif|ico))["'`]/g;
const unresolved = new Map();

for (const file of gitFiles("src/**")) {
  if (!/\.(tsx?|jsx?|mjs)$/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(LITERAL)) {
    const ref = match[1];
    /*
     * `/_next/static/media/...` はビルドが吐く成果物のパスで、`public/` には実体が無い。
     * 画像の静的 import がこの形になる（eslint.config.mjs が禁じているが、
     * テストの入力としては現れる）。`public/` の参照だけを見る検査なので外す。
     */
    if (ref.startsWith("/_next/")) continue;
    if (existsSync(path.join("public", ref))) continue;
    if (!unresolved.has(ref)) unresolved.set(ref, new Set());
    unresolved.get(ref).add(file);
  }
}

if (unresolved.size > 0) {
  problem(
    `src/ が参照している画像の実体がありません（${unresolved.size} 件）。**本番で 404 になります。**`,
    [
      ...[...unresolved.entries()].map(([ref, files]) => `    ${ref}  ← ${[...files].join(", ")}`),
      "",
      "  よくある原因: .webp → .avif の張り替えを1箇所直し忘れた",
    ].join("\n")
  );
}

// ---------------------------------------------------------------------------
// 5. 寸法とバイト予算
// ---------------------------------------------------------------------------

const sizes = new Map();

for (const entry of STATIC_IMAGES) {
  if (!existsSync(entry.path)) continue;
  const bytes = statSync(entry.path).size;
  sizes.set(entry.path, bytes);

  if (bytes > entry.maxBytes) {
    problem(
      `バイト予算を超えています: ${entry.path}`,
      `    ${bytes.toLocaleString()} B > ${entry.maxBytes.toLocaleString()} B\n` +
        "  pnpm images:optimize で焼き直すか、超過が妥当なら manifest の maxBytes を上げてください。"
    );
  }

  if (entry.role !== "app" || !manifestIsSound) continue;
  const meta = await sharp(entry.path).metadata();
  if (meta.width > entry.box.width || meta.height > entry.box.height) {
    problem(
      `box より大きい画像です: ${entry.path}`,
      `    実寸 ${meta.width}x${meta.height} > box ${entry.box.width}x${entry.box.height}\n` +
        "  pnpm images:optimize で焼き直してください。"
    );
  }
  if (meta.format !== "heif") {
    // sharp は AVIF を HEIF コンテナとして報告する
    problem(`AVIF として読めません: ${entry.path}（format=${meta.format}）`);
  }
  if (entry.requiresAlpha && !meta.hasAlpha) {
    problem(`透過画像として読めません: ${entry.path}（hasAlpha=${meta.hasAlpha}）`);
  }
}

const firstViewTotal = FIRST_VIEW_IMAGES.reduce((sum, file) => sum + (sizes.get(file) ?? 0), 0);
if (firstViewTotal > FIRST_VIEW_BUDGET_BYTES) {
  problem(
    `ファーストビューの合計が予算を超えています: ${firstViewTotal.toLocaleString()} B > ${FIRST_VIEW_BUDGET_BYTES.toLocaleString()} B`,
    [
      ...FIRST_VIEW_IMAGES.map(
        (file) => `    ${(sizes.get(file) ?? 0).toLocaleString().padStart(9)} B  ${file}`
      ),
      "",
      "  manifest の quality を下げるか、box を実際の表示寸法まで詰めてください。",
    ].join("\n")
  );
}

// ---------------------------------------------------------------------------

if (problems.length > 0) {
  console.error(`${LABEL} FAIL: ${problems.length} 件\n`);
  for (const [index, text] of problems.entries()) {
    console.error(`  ${index + 1}. ${text}\n`);
  }
  console.error("  詳細: docs/frontend/image-delivery.md");
  process.exit(1);
}

const appCount = STATIC_IMAGES.filter((entry) => entry.role === "app").length;
console.log(
  `${LABEL} OK: public/ の画像 ${STATIC_IMAGES.length} 件（AVIF ${appCount} / 原形式 ${
    STATIC_IMAGES.length - appCount
  }）。` +
    ` ファーストビュー ${firstViewTotal.toLocaleString()} B / 予算 ${FIRST_VIEW_BUDGET_BYTES.toLocaleString()} B。`
);
