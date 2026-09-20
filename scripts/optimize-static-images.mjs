#!/usr/bin/env node
/**
 * `assets/source/` の原画像を、表示寸法の AVIF へ焼いて `public/` へ置く（#241）
 *
 * ```
 * pnpm images:optimize             # 焼き直す
 * pnpm images:optimize --report    # 焼かずに、いまの寸法とバイト数を表で出す
 * pnpm images:optimize --force     # 出力が新しくても焼き直す
 * ```
 *
 * ## なぜビルド時ではなく手元で焼くのか
 *
 * 1. **`public/` は Vercel のビルドキャッシュの対象ではない。** ビルド時に書き出すと
 *    デプロイのたびに全画像を再エンコードする。ビルド時間45分の制約に対してただの損である
 * 2. **`sharp` はプラットフォーム別のバイナリを持つ。** ビルド時生成にすると、その取得の
 *    失敗がそのまま**本番デプロイの失敗**になる。焼いてコミットすれば
 *    **本番ビルドは sharp に一切依存しない**
 * 3. **差分がレビューできる。** PR にバイト数が出る
 * 4. `pnpm check:images` が CI で実体を検査できる（ビルドより前に落とせる）
 *
 * ## 冪等性について
 *
 * 再エンコードは sharp / libvips のバージョン差でビット同一にならない。だから
 * **CI はビット比較をしない。** CI が見るのは `scripts/assert-static-image-budget.mjs` の
 * 5項目（役割・形式・寸法・バイト予算・参照の解決）である。
 * このスクリプトは原画像より出力が新しければ既定で飛ばす（`--force` で上書き）。
 *
 * 設計と背景は docs/frontend/image-delivery.md を参照。
 */

import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { STATIC_IMAGES } from "./static-image-manifest.mjs";

const LABEL = "[optimize-static-images]";
const ROOT = process.cwd();

const args = new Set(process.argv.slice(2));
const isReport = args.has("--report");
const isForce = args.has("--force");

/** 表示用。1,234,567 の形にそろえる */
const n = (value) => value.toLocaleString("en-US");

/**
 * AVIF のエンコード設定。
 *
 * `chromaSubsampling` を出しどころで変える。ロゴ・線画（`kind: "art"`）で
 * 既定の `4:2:0` を使うと、彩度の高い輪郭が滲んで**文字が読めなくなる**。
 * 写真は滲んでも判別できるうえ、`4:2:0` のほうが目に見えて軽い。
 *
 * `effort: 6`（既定は 4）はエンコードに時間をかけて小さくする設定。
 * 手元で一度焼くだけなので、時間を払って構わない。
 */
function avifOptions(entry) {
  return {
    quality: entry.quality,
    effort: 6,
    chromaSubsampling: entry.kind === "art" ? "4:4:4" : "4:2:0",
  };
}

async function readMeta(file) {
  const meta = await sharp(file).metadata();
  return { width: meta.width, height: meta.height, format: meta.format, hasAlpha: meta.hasAlpha };
}

async function bake(entry) {
  const source = path.join(ROOT, entry.source);
  const output = path.join(ROOT, entry.path);

  if (!existsSync(source)) {
    console.error(`${LABEL} FAIL: 原画像がありません: ${entry.source}`);
    console.error(
      `  manifest の source を直すか、原画像を ${path.dirname(entry.source)}/ へ置いてください。`
    );
    process.exit(1);
  }

  if (!isForce && existsSync(output) && statSync(output).mtimeMs >= statSync(source).mtimeMs) {
    return { entry, skipped: true };
  }

  mkdirSync(path.dirname(output), { recursive: true });

  /*
   * `withoutEnlargement: true` は必須である。入稿された原画像の寸法は一定ではなく、
   * box より小さいものがある（`favicon-outline` は 500x500 で、広い画面の表示寸法に
   * 届かない）。付けないと水増しした画像を余計な転送量で配ることになる
   * （imgix 側の `fit=max` と同じ理屈）。
   */
  await sharp(source)
    .resize({ ...entry.box, fit: entry.fit, withoutEnlargement: true })
    .avif(avifOptions(entry))
    .toFile(output);

  return { entry, skipped: false };
}

async function main() {
  const targets = STATIC_IMAGES.filter((entry) => entry.role === "app");

  if (!isReport) {
    for (const entry of targets) await bake(entry);
  }

  console.log(`${LABEL} ${isReport ? "現状" : "焼き上がり"}（${targets.length} ファイル）\n`);
  console.log(
    ["出力", "原画", "→ 出力", "寸法", "品質", "バイト数", "予算", ""].length && // 見出しは下で整形する
      [
        "出力".padEnd(44),
        "原画".padStart(9),
        "出力".padStart(9),
        "削減".padStart(6),
        "寸法".padStart(11),
        "予算".padStart(8),
      ].join(" ")
  );
  console.log("-".repeat(92));

  let sourceTotal = 0;
  let outputTotal = 0;
  let over = 0;

  for (const entry of targets) {
    const sourceSize = existsSync(entry.source) ? statSync(entry.source).size : 0;
    const outputSize = existsSync(entry.path) ? statSync(entry.path).size : 0;
    const meta = existsSync(entry.path) ? await readMeta(entry.path) : null;
    sourceTotal += sourceSize;
    outputTotal += outputSize;

    const cut = sourceSize ? `${Math.round((1 - outputSize / sourceSize) * 100)}%` : "-";
    const budget = outputSize > entry.maxBytes ? `超過!` : "ok";
    if (outputSize > entry.maxBytes) over += 1;

    console.log(
      [
        entry.path.replace(/^public\//, "").padEnd(44),
        n(sourceSize).padStart(9),
        n(outputSize).padStart(9),
        cut.padStart(6),
        (meta ? `${meta.width}x${meta.height}` : "-").padStart(11),
        budget.padStart(8),
      ].join(" ")
    );
  }

  console.log("-".repeat(92));
  console.log(
    `${"合計".padEnd(44)} ${n(sourceTotal).padStart(9)} ${n(outputTotal).padStart(9)} ` +
      `${`${Math.round((1 - outputTotal / sourceTotal) * 100)}%`.padStart(6)}`
  );

  if (over > 0) {
    console.error(
      `\n${LABEL} ${over} ファイルが maxBytes を超えています。` +
        `manifest の quality を下げるか、超過が妥当なら maxBytes を実測値へ引き上げてください。`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${LABEL} FAIL:`, error);
  process.exit(1);
});
