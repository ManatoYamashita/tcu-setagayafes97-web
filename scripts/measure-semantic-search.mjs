/**
 * 意味検索（キーワード検索の第4段）を実データで計測する
 *
 * **このスクリプトは課金が発生します。** CI からも `pnpm build` からも呼ばれません。
 * 人が明示的に実行したときだけ走ります。
 *
 * 目的は2つです。
 *
 * 1. 足切りの閾値（`SEMANTIC_MATCH_THRESHOLD` / `SEMANTIC_MIN_PROBABILITY`）を
 *    実データで決めること。**推測で置いた閾値は、実データの分布を知らないただの願望です。**
 * 2. ユニットテスト用の fixture を採ること。`--write` を付けたときだけ書き出します。
 *
 * ```bash
 * node scripts/measure-semantic-search.mjs            # 計測して表を出すだけ
 * node scripts/measure-semantic-search.mjs --write    # fixture も書き出す
 * ```
 *
 * ## Node 24 が要ります
 *
 * `src/lib/*.ts` を型除去でそのまま読むためです（`scripts/ts-module-loader.mjs`）。
 * ロジックを書き写さないための選択で、package.json の engines も `>=24.0.0` です。
 *
 * ## 解禁前の企画名を公開リポジトリへ置かないための歯止め
 *
 * fixture に**企画名は入れません。** 保存するのは `E00` 形式の参照名と microCMS の
 * コンテンツID、そして答えの確率だけです。さらに `--write` は、母集団に著名人企画
 * （`type = special`）が1件でも含まれていたら**書き出しを拒否します**。
 * 著名人は解禁日が契約で決まっており、名前どころかIDの露出も避ける必要があるためです。
 * 計測そのものは拒否しません（解禁後の品質を測る用途があるため）。
 */

/*
 * `@next/env` は CommonJS のため `.mjs` から名前付き import できない。
 * scripts/assert-events-static-html.mjs と同じく default 経由で取り出す。
 */
import nextEnv from "@next/env";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import "./ts-module-loader.mjs";

const { loadEnvConfig } = nextEnv;

/** 型除去に必要な Node のメジャーバージョン */
const REQUIRED_NODE_MAJOR = 24;

/** fixture の保存先 */
const FIXTURE_DIR = path.resolve(import.meta.dirname, "../src/lib/__fixtures__/typesafe");

/** 入力トークンの単価（USD / 1M tokens）。https://docs.typesafe.ai/models.md */
const USD_PER_MTOK = 0.042;

/** 1件あたりの取得上限。/events のページと同じ値にする */
const EVENTS_LIMIT = 200;

/**
 * 計測するクエリ
 *
 * `expected` は「人が見たときに該当があるべきか」で、モデルの答えではありません。
 * ここがズレたら、閾値ではなく質問文のほうを疑います。
 */
const QUERIES = [
  { query: "食べ物", expected: "match" },
  { query: "たこ焼き", expected: "match" },
  { query: "9号館のダンス", expected: "match" },
  { query: "のど自慢", expected: "match" },
  { query: "子どもが楽しめるもの", expected: "match" },
  { query: "体を動かしたい", expected: "match" },
  { query: "静かに座って見られる企画", expected: "match" },
  { query: "友達と盛り上がれるやつ", expected: "match" },
  { query: "雨でも大丈夫なところ", expected: "match" },
  { query: "プールで泳ぎたい", expected: "no-match" },
  { query: "スキー場", expected: "no-match" },
  { query: "確定申告の相談", expected: "no-match" },
];

/** ファイル名に使える形へ落とす。日本語はそのままでは扱いづらいので連番を前置する */
function toFixtureName(index, query) {
  const slug = query.replace(/[^\p{L}\p{N}]/gu, "");
  return `${String(index).padStart(2, "0")}-${slug}.json`;
}

function fail(message) {
  console.error(`\n[measure] ${message}\n`);
  process.exit(1);
}

async function main() {
  const major = Number(process.versions.node.split(".")[0]);

  if (major < REQUIRED_NODE_MAJOR) {
    fail(
      `Node ${REQUIRED_NODE_MAJOR} 以上が要ります（現在 v${process.versions.node}）。` +
        ` 型除去で src/lib/*.ts を直接読むためです。nvm なら \`nvm use ${REQUIRED_NODE_MAJOR}\`。`
    );
  }

  const shouldWrite = process.argv.includes("--write");

  // .env.local を含めて読む。素の process.env では next build と値が食い違う
  loadEnvConfig(process.cwd(), false, {
    info: () => {},
    error: (...args) => console.error(...args),
  });

  // 環境変数を読んだ後に import する。src/data/site.ts は公開フラグをモジュール読み込み時に評価する
  const { getEventsList } = await import("../src/lib/events.ts");
  const { buildSemanticRequest, interpretSemanticAnswers } =
    await import("../src/lib/semantic-search.ts");
  const { askSystemOne, TYPESAFE_MODEL } = await import("../src/lib/typesafe.ts");

  if (!process.env.TYPESAFE_API_KEY) {
    fail("TYPESAFE_API_KEY が未設定です。.env.local へ入れてください。");
  }

  const events = await getEventsList(EVENTS_LIMIT);

  if (events.length === 0) {
    fail(
      "企画を1件も取得できませんでした。NEXT_PUBLIC_EVENTS_VISIBLE=true と microCMS の資格情報を確認してください。"
    );
  }

  const specialCount = events.filter((event) => event.type === "special").length;

  if (shouldWrite && specialCount > 0) {
    fail(
      `著名人企画が ${specialCount} 件含まれています。fixture は公開リポジトリへ入るため、` +
        " NEXT_PUBLIC_SPECIAL_VISIBLE=false で測り直してください。"
    );
  }

  console.log(`[measure] 母集団 ${events.length} 件（うち著名人企画 ${specialCount} 件）`);
  console.log(`[measure] モデル ${TYPESAFE_MODEL} / ${QUERIES.length} クエリ / 課金あり\n`);

  const rows = [];

  for (const [index, { query, expected }] of QUERIES.entries()) {
    const plan = buildSemanticRequest(query, events);
    const startedAt = Date.now();

    let response;
    try {
      response = await askSystemOne({ state: plan.state, questions: plan.questions });
    } catch (error) {
      console.error(`[measure] ${query}: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    const latencyMs = Date.now() - startedAt;
    const result = interpretSemanticAnswers(response.answers, plan.refToId);
    const choice = response.answers.best_match;
    const topRef = choice?.type === "choice" ? choice.choice : "-";
    const topProbability = choice?.type === "choice" ? choice.probabilities[topRef] : 0;
    const confidence = choice?.type === "choice" ? choice.confidence : 0;

    rows.push({
      query,
      expected,
      topRef,
      topProbability,
      confidence,
      matchProbability: result.matchProbability,
      hasMatch: result.hasMatch,
      resultCount: result.ranking.length,
      latencyMs,
      inputTokens: response.usage.input_tokens,
    });

    if (shouldWrite) {
      mkdirSync(FIXTURE_DIR, { recursive: true });
      writeFileSync(
        path.join(FIXTURE_DIR, toFixtureName(index, query)),
        `${JSON.stringify(
          {
            // 企画名は入れない。冒頭コメントの「解禁前の企画名を置かない」を参照
            query,
            expected,
            model: response.model,
            measuredAt: new Date().toISOString().slice(0, 10),
            eventCount: events.length,
            refToId: Object.fromEntries(plan.refToId),
            answers: response.answers,
            usage: response.usage,
          },
          null,
          2
        )}\n`,
        "utf8"
      );
    }
  }

  const header =
    "| クエリ | 想定 | 第1位 | 第1位確率 | confidence | has_match | 判定 | 件数 | ms | 入力tok |";
  const divider = "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const body = rows.map((row) => {
    const verdict = row.hasMatch ? "該当あり" : "該当なし";
    const agrees = (row.expected === "match") === row.hasMatch ? "" : " ← 想定と不一致";

    return (
      `| \`${row.query}\` | ${row.expected} | ${row.topRef} | ${row.topProbability.toFixed(2)} |` +
      ` ${row.confidence.toFixed(2)} | **${row.matchProbability.toFixed(2)}** | ${verdict}${agrees} |` +
      ` ${row.resultCount} | ${row.latencyMs} | ${row.inputTokens} |`
    );
  });

  console.log([header, divider, ...body].join("\n"));

  if (rows.length === 0) return;

  const latencies = rows.map((row) => row.latencyMs).sort((a, b) => a - b);
  const tokens = rows.reduce((sum, row) => sum + row.inputTokens, 0) / rows.length;
  const usdPerQuery = (tokens * USD_PER_MTOK) / 1_000_000;

  console.log(
    [
      "",
      `[measure] 入力トークン 平均 ${Math.round(tokens)}`,
      `[measure] レイテンシ ${latencies[0]}〜${latencies[latencies.length - 1]}ms` +
        ` / 中央値 ${latencies[Math.floor(latencies.length / 2)]}ms`,
      `[measure] 1クエリ $${usdPerQuery.toFixed(6)} / 1万クエリ $${(usdPerQuery * 10_000).toFixed(2)}`,
      "",
      "[measure] 足切りの判断材料:",
      `  該当あり群の has_match: ${rows
        .filter((row) => row.expected === "match")
        .map((row) => row.matchProbability.toFixed(2))
        .join(", ")}`,
      `  該当なし群の has_match: ${rows
        .filter((row) => row.expected === "no-match")
        .map((row) => row.matchProbability.toFixed(2))
        .join(", ")}`,
      `  該当なし群の confidence: ${rows
        .filter((row) => row.expected === "no-match")
        .map((row) => row.confidence.toFixed(2))
        .join(", ")}  ← これを足切りに使ってはいけない`,
    ].join("\n")
  );
}

await main();
