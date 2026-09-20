/**
 * Node から `src/` の TypeScript を直接 import するための解決フック
 *
 * `scripts/` の計測スクリプトが `src/lib/*.ts` を**そのまま**読むためだけに存在します。
 * 同じロジックをスクリプト側へ書き写すと、実装を直したときに計測だけが古い式のまま
 * 残り、fixture が「実装が作らないリクエスト」に対する答えになってしまいます。
 *
 * Node 本体が肩代わりしてくれないのは次の2つだけです。
 *
 * | 解決できないもの        | 例                         | ここでやること              |
 * | ----------------------- | -------------------------- | --------------------------- |
 * | `tsconfig.json` の paths | `@/data/filter-options`    | `src/` からの相対へ書き換え |
 * | 拡張子なしの相対 import | `./text`                   | `.ts` / `index.ts` を補う   |
 *
 * 型の除去（type stripping）は Node 24 本体が行います。**Node 24 未満では動きません**
 * （package.json の engines も `>=24.0.0`）。
 *
 * ビルドにも CI にも関与しません。`pnpm build` / `pnpm test` からは呼ばれません。
 */

import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC_DIR = path.resolve(import.meta.dirname, "../src");

/** 拡張子の無いパスへ `.ts` / `/index.ts` を補う。実在しなければそのまま返す */
function withExtension(absolutePath) {
  const candidates = [absolutePath, `${absolutePath}.ts`, path.join(absolutePath, "index.ts")];

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }

  return absolutePath;
}

/**
 * `.ts` には format を明示する
 *
 * package.json に `"type": "module"` が無いため、明示しないと Node が中身を読んで
 * CommonJS として解釈を試み、失敗してから ES モジュールとして読み直す。
 * 動きはするが、実行のたびに MODULE_TYPELESS_PACKAGE_JSON の警告が出る。
 *
 * **`"module"` ではなく `"module-typescript"` です。** `"module"` を渡すと Node は
 * 型除去を飛ばして素の JavaScript として解釈し、`import type { … }` で構文エラーになります。
 */
function asModule(resolved) {
  return resolved.url.endsWith(".ts") ? { ...resolved, format: "module-typescript" } : resolved;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = withExtension(path.join(SRC_DIR, specifier.slice(2)));
      return asModule(nextResolve(pathToFileURL(resolved).href, context));
    }

    // 相対 import は、呼び出し元が .ts のときだけ補う。scripts/ 同士の import には触らない
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const resolved = withExtension(path.resolve(parentDir, specifier));
      return asModule(nextResolve(pathToFileURL(resolved).href, context));
    }

    return asModule(nextResolve(specifier, context));
  },
});
