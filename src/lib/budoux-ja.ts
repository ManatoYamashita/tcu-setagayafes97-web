/*
 * パッケージの入口（"budoux"）を経由せず、パーサーと日本語モデルのファイルを直接読む。
 * 入口は全言語のモデルと HTML 処理（ブラウザ外では linkedom）を読み込み、Turbopack は
 * これを木の刈り込みで落とさない（入口経由では gzip 107 KB のチャンクになった）。
 * package.json の exports がこの2ファイルを公開していないため、相対パスで指す。
 * どちらのファイルも import を持たない。
 */
import { model } from "../../node_modules/budoux/module/data/models/ja.js";
import { Parser } from "../../node_modules/budoux/module/parser.js";

export function createJapaneseParser(): Parser {
  return new Parser(model);
}
