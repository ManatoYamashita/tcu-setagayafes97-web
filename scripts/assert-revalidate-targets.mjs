/**
 * #252: microCMS を読む Route Handler のタグ失効と即時失効を守る。
 * TypeScript AST でコメントを除外し、ローカルの静的 import / export をたどる。
 * 動的 import、任意の URL への fetch、関数単位のデータフローは検査対象外。
 * pnpm install だけで実行でき、ネットワークやビルド成果物は不要。
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const read = (file) =>
  ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
const nodes = (source, predicate) => {
  const found = [];
  const visit = (node) => {
    if (predicate(node)) found.push(node);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
};
const property = (object, name) =>
  object.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText().replace(/["']/g, "") === name
  )?.initializer;
const hasTag = (source) =>
  nodes(source, ts.isObjectLiteralExpression).some((object) => {
    const kind = property(object, "kind");
    return kind && ts.isStringLiteral(kind) && kind.text === "tag" && property(object, "tag");
  });
const isHardExpiry = (call) => {
  const options = call.arguments[1];
  if (call.arguments.length !== 2 || !options || !ts.isObjectLiteralExpression(options))
    return false;
  const expire = property(options, "expire");
  return (
    options.properties.length === 1 && expire && ts.isNumericLiteral(expire) && expire.text === "0"
  );
};
const resolve = (file, specifier) => {
  const base = specifier.startsWith("@/")
    ? path.join(root, "src", specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(file), specifier)
      : null;
  return (
    base &&
    [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")].find(
      (candidate) => existsSync(candidate) && /\.[cm]?[jt]sx?$/.test(candidate)
    )
  );
};
const readsMicrocms = (file, seen = new Set()) => {
  if (seen.has(file)) return false;
  seen.add(file);
  if (file === path.join(root, "src/lib/microcms.ts")) return true;
  return nodes(read(file), (n) => ts.isImportDeclaration(n) || ts.isExportDeclaration(n)).some(
    (n) => {
      if (
        n.isTypeOnly ||
        n.importClause?.isTypeOnly ||
        !n.moduleSpecifier ||
        !ts.isStringLiteral(n.moduleSpecifier)
      )
        return false;
      const specifier = n.moduleSpecifier.text;
      if (specifier === "microcms-js-sdk") return true;
      const dependency = resolve(file, specifier);
      return dependency ? readsMicrocms(dependency, seen) : false;
    }
  );
};
const routes = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? routes(file) : /^route\.[jt]sx?$/.test(entry.name) ? [file] : [];
  });
const errors = [];
const targets = read(path.join(root, "src/lib/revalidate-targets.ts"));
const readers = routes(path.join(root, "src/app")).filter((file) => readsMicrocms(file));
if (readers.length && !hasTag(targets))
  errors.push("microCMS を読む Route Handler があるのに kind: tag がありません。");
const receiver = read(path.join(root, "src/app/api/revalidate/route.ts"));
const calls = nodes(
  receiver,
  (n) => ts.isCallExpression(n) && n.expression.getText(receiver) === "revalidateTag"
);
if (!calls.length || calls.some((call) => !isHardExpiry(call)))
  errors.push("受け口は revalidateTag(tag, { expire: 0 }) で即時失効してください。");
if (errors.length) {
  errors.forEach((error) => console.error(`[revalidate-targets] FAIL: ${error}`));
  process.exit(1);
}
console.log(`[revalidate-targets] OK: microCMS 読み手 ${readers.length}件、タグと即時失効を確認。`);
