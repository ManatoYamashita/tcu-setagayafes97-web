import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildSemanticRequest,
  interpretSemanticAnswers,
  normalizeSemanticQuery,
  selectSemanticEvents,
  SEMANTIC_CHOICE_ID,
  SEMANTIC_MATCH_THRESHOLD,
  SEMANTIC_MAX_EVENTS,
  SEMANTIC_MAX_RESULTS,
  SEMANTIC_NOUL_ID,
  shouldAskSemanticSearch,
} from "@/lib/semantic-search";
import type { TypeSafeAnswer } from "@/lib/typesafe";
import type { Event } from "@/types/events";

/**
 * 意味検索のダミー企画
 *
 * `src/lib/search.test.ts` と同じ理由で自前に組みます。**フィールドが欠落した企画を
 * 作れる必要がある**ためです（microCMS は未入力フィールドをキーごと返さない。#166）。
 */
function event(id: string, overrides: Partial<Event> = {}): Event {
  return {
    id,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    date: "day1",
    type: "stage",
    place: "TCUホール",
    building: "",
    title: "ダミー企画",
    organizer: "ダミー団体",
    description: "ダミーの説明文です。",
    content: "",
    ...overrides,
  };
}

const ids = (events: Event[]): string[] => events.map((e) => e.id);

const events: Event[] = [
  event("dance", {
    place: "９号館アリーナ",
    title: "UPBEAT ダンスステージ",
    organizer: "ダンスサークル UPBEAT",
    description: "ヒップホップとジャズダンスの発表です。",
  }),
  event("karaoke", {
    place: "TCUホール",
    title: "TCUカラオケGP",
    organizer: "放送研究会",
    description: "のど自慢大会を開催します。",
    content: "<p>飛び入り参加を<strong>歓迎</strong>します</p>",
  }),
  event("tent", {
    place: "テント１",
    type: "store",
    title: "同好会連合のだんご",
    organizer: "同好会連合",
    description: "みたらしだんごを販売します。",
  }),
];

describe("normalizeSemanticQuery", () => {
  it("正規化して返す", () => {
    expect(normalizeSemanticQuery("　９号館ノダンス　")).toBe("9号館のだんす");
  });

  it("1文字は問い合わせない", () => {
    expect(normalizeSemanticQuery("食")).toBeNull();
  });

  it("記号だけのクエリは問い合わせない", () => {
    expect(normalizeSemanticQuery("???")).toBeNull();
  });

  it("長すぎるクエリは問い合わせない", () => {
    expect(normalizeSemanticQuery("あ".repeat(61))).toBeNull();
    expect(normalizeSemanticQuery("あ".repeat(60))).toHaveLength(60);
  });

  it("空・未指定は問い合わせない", () => {
    expect(normalizeSemanticQuery("")).toBeNull();
    expect(normalizeSemanticQuery(undefined)).toBeNull();
  });
});

describe("shouldAskSemanticSearch", () => {
  /*
   * この5本が「段1〜3で当たったら絶対に呼ばない」という受け入れ条件そのものです。
   * ここが緩むと、認証の無い従量課金口を全クエリで叩くことになります。
   */
  it("段1（クエリ全体の部分一致）で当たるなら呼ばない", () => {
    expect(shouldAskSemanticSearch(events, "のど自慢")).toBe(false);
  });

  it("段2（全語AND）で当たるなら呼ばない", () => {
    expect(shouldAskSemanticSearch(events, "9号館 ダンス")).toBe(false);
  });

  it("段3（いずれかOR）で当たるなら呼ばない", () => {
    expect(shouldAskSemanticSearch(events, "9号館でやってるダンスのやつ")).toBe(false);
  });

  it("リテラルがどこにも当たらないときだけ呼ぶ", () => {
    expect(shouldAskSemanticSearch(events, "食べ物")).toBe(true);
  });

  it("検索語を取り出せないクエリは呼ばない（searchEvents が全件を返すため）", () => {
    // 「おすすめの企画を教えて」は不要語しか残らない。0件ではなく「条件が無い」の意味
    expect(shouldAskSemanticSearch(events, "おすすめの企画を教えて")).toBe(false);
  });

  it("キーワードが空なら呼ばない", () => {
    expect(shouldAskSemanticSearch(events, "")).toBe(false);
  });

  it("母集団が0件なら呼ばない", () => {
    expect(shouldAskSemanticSearch([], "食べ物")).toBe(false);
  });
});

describe("buildSemanticRequest", () => {
  it("来場者の入力を state の visitor_query へ置く（instructions へ混ぜない）", () => {
    const plan = buildSemanticRequest("食べ物", events);

    expect(plan.state.visitor_query).toBe("食べ物");
    expect(JSON.stringify(plan.questions)).not.toContain("食べ物");
  });

  it("参照名は E00 形式の連番で、件数の桁へゼロ詰めする", () => {
    const plan = buildSemanticRequest("食べ物", events);

    expect(plan.state.events.map((entry) => entry.ref)).toEqual(["E0", "E1", "E2"]);
    expect([...plan.refToId]).toEqual([
      ["E0", "dance"],
      ["E1", "karaoke"],
      ["E2", "tent"],
    ]);
  });

  it("桁数は件数に追従する", () => {
    const many = Array.from({ length: 12 }, (_, i) => event(`e${i}`));
    const plan = buildSemanticRequest("食べ物", many);

    expect(plan.state.events[0].ref).toBe("E00");
    expect(plan.state.events[11].ref).toBe("E11");
  });

  it("microCMS のコンテンツIDを外部へ送らない", () => {
    const plan = buildSemanticRequest("食べ物", events);
    const payload = JSON.stringify({ state: plan.state, questions: plan.questions });

    for (const id of ids(events)) {
      expect(payload).not.toContain(id);
    }
  });

  it("選択肢は参照名だけで、説明を持たない（state 側と二重に送らない）", () => {
    const plan = buildSemanticRequest("食べ物", events);

    expect(plan.questions[SEMANTIC_CHOICE_ID].criteria).toEqual({ E0: null, E1: null, E2: null });
  });

  it("content は HTML を落として載せる", () => {
    const plan = buildSemanticRequest("食べ物", events);

    expect(plan.state.events[1].detail).toBe("飛び入り参加を 歓迎 します");
  });

  it("content が長ければ切り詰める", () => {
    const plan = buildSemanticRequest("食べ物", [event("long", { content: "あ".repeat(300) })]);

    expect(plan.state.events[0].detail).toHaveLength(160);
  });

  it("空のフィールドは送信するJSONから消える", () => {
    const plan = buildSemanticRequest("食べ物", [
      event("bare", { organizer: "", description: "", content: "" }),
    ]);
    // 値が undefined のキーは JSON.stringify が落とす。判定は実際に送られる形で行う
    const sent = JSON.parse(JSON.stringify(plan.state)).events[0];

    expect(Object.keys(sent).sort()).toEqual([
      "building",
      "category",
      "day",
      "place",
      "ref",
      "title",
    ]);
  });

  it("建物が解決できない企画に「その他」を渡さない", () => {
    // 「その他」は建物名ではなく振り分け先の名前。渡すと建物名として読まれる
    const plan = buildSemanticRequest("食べ物", [event("unknown", { place: "どこか" })]);

    expect(plan.state.events[0].building).toBeUndefined();
  });

  it("日程と種別はラベルへ落とす", () => {
    const plan = buildSemanticRequest("食べ物", events);

    expect(plan.state.events[2].category).toBe("模擬店");
    expect(plan.state.events[2].day).toBe("1日目");
  });

  it("企画が0件なら組み立てない", () => {
    expect(() => buildSemanticRequest("食べ物", [])).toThrow(RangeError);
  });

  it("Choice の選択肢上限を超えたら黙って切り捨てず失敗する", () => {
    const tooMany = Array.from({ length: SEMANTIC_MAX_EVENTS + 1 }, (_, i) => event(`e${i}`));

    expect(() => buildSemanticRequest("食べ物", tooMany)).toThrow(RangeError);
  });
});

/*
 * 実測レスポンスによる退行テスト
 *
 * fixture は `node scripts/measure-semantic-search.mjs --write` が本番データ98件に対して
 * 採った生の答えです（2026-09-20、jev-1.13.0）。**企画名は入っていません。**
 * 解禁前の企画名を公開リポジトリへ置かないためで、判定はすべてIDで行います。
 */
const FIXTURE_DIR = path.join(import.meta.dirname, "__fixtures__/typesafe");

interface MeasuredFixture {
  query: string;
  expected: "match" | "no-match";
  model: string;
  measuredAt: string;
  eventCount: number;
  refToId: Record<string, string>;
  answers: Record<string, TypeSafeAnswer>;
  usage: { input_tokens: number; output_tokens: number };
}

const fixtures: MeasuredFixture[] = readdirSync(FIXTURE_DIR)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(readFileSync(path.join(FIXTURE_DIR, name), "utf8")));

const fixtureFor = (query: string): MeasuredFixture => {
  const found = fixtures.find((fixture) => fixture.query === query);
  if (!found) throw new Error(`fixture が見つかりません: ${query}`);
  return found;
};

const refMap = (fixture: MeasuredFixture) => new Map(Object.entries(fixture.refToId));

describe("interpretSemanticAnswers（実測レスポンス）", () => {
  it("12クエリぶんの実測が揃っている", () => {
    expect(fixtures).toHaveLength(12);
    expect(fixtures.every((fixture) => fixture.model === "jev-1.13.0")).toBe(true);
  });

  it.each(
    fixtures.filter((fixture) => fixture.expected === "match").map((f) => [f.query, f] as const)
  )("「%s」は該当ありと判定し、結果を返す", (_query, fixture) => {
    const result = interpretSemanticAnswers(fixture.answers, refMap(fixture));

    expect(result.hasMatch).toBe(true);
    expect(result.ranking.length).toBeGreaterThan(0);
    expect(result.ranking.length).toBeLessThanOrEqual(SEMANTIC_MAX_RESULTS);
  });

  it.each(
    fixtures.filter((fixture) => fixture.expected === "no-match").map((f) => [f.query, f] as const)
  )("「%s」は該当なしと判定し、1件も返さない", (_query, fixture) => {
    const result = interpretSemanticAnswers(fixture.answers, refMap(fixture));

    expect(result.hasMatch).toBe(false);
    expect(result.ranking).toEqual([]);
  });

  /*
   * 足切りの根拠そのもの。
   *
   * `スキー場` と `確定申告の相談` は Choice が confidence 0.79 で1件を選びます。
   * 同じ実測の中で `体を動かしたい` の confidence は 0.39 です。**confidence で足切りをすると、
   * 実在しない企画を出しながら実在する企画を捨てます。**
   *
   * ここを `has_match` から `confidence` へ差し替えると、このテストが落ちます。
   */
  it("該当なしのクエリでも Choice は高い confidence で1件を選んでいる", () => {
    for (const query of ["スキー場", "確定申告の相談"]) {
      const fixture = fixtureFor(query);
      const choice = fixture.answers[SEMANTIC_CHOICE_ID];

      expect(choice.type).toBe("choice");
      if (choice.type !== "choice") return;

      expect(choice.confidence).toBeGreaterThan(SEMANTIC_MATCH_THRESHOLD);
      expect(interpretSemanticAnswers(fixture.answers, refMap(fixture)).ranking).toEqual([]);
    }
  });

  it("該当ありのクエリの confidence は、該当なしのクエリより低いことがある", () => {
    const move = fixtureFor("体を動かしたい").answers[SEMANTIC_CHOICE_ID];
    const ski = fixtureFor("スキー場").answers[SEMANTIC_CHOICE_ID];

    if (move.type !== "choice" || ski.type !== "choice") throw new Error("choice ではない");

    expect(move.confidence).toBeLessThan(ski.confidence);
  });

  it("結果は確率の高い順に並び、先頭は Choice が選んだ企画になる", () => {
    const fixture = fixtureFor("食べ物");
    const choice = fixture.answers[SEMANTIC_CHOICE_ID];
    if (choice.type !== "choice") throw new Error("choice ではない");

    const result = interpretSemanticAnswers(fixture.answers, refMap(fixture));
    const probabilities = result.ranking.map((entry) => entry.probability);

    expect(result.ranking[0].id).toBe(fixture.refToId[choice.choice]);
    expect(probabilities).toEqual([...probabilities].sort((a, b) => b - a));
  });

  it("絞り込まれたクエリは少数だけ返す", () => {
    const fixture = fixtureFor("たこ焼き");

    expect(interpretSemanticAnswers(fixture.answers, refMap(fixture)).ranking).toHaveLength(1);
  });
});

describe("interpretSemanticAnswers（境界）", () => {
  const refToId = new Map([
    ["E0", "a"],
    ["E1", "b"],
    ["E2", "c"],
  ]);

  const answers = (noul: number, probabilities: Record<string, number>) =>
    ({
      [SEMANTIC_NOUL_ID]: { type: "noul", noul },
      [SEMANTIC_CHOICE_ID]: {
        type: "choice",
        choice: Object.keys(probabilities)[0],
        probabilities,
        confidence: 0.9,
      },
    }) as Record<string, TypeSafeAnswer>;

  it("閾値ちょうどは該当ありとして扱う", () => {
    const result = interpretSemanticAnswers(answers(SEMANTIC_MATCH_THRESHOLD, { E0: 1 }), refToId);

    expect(result.hasMatch).toBe(true);
  });

  it("下限未満の確率は捨てる", () => {
    const result = interpretSemanticAnswers(answers(0.9, { E0: 0.99, E1: 0.009 }), refToId);

    expect(result.ranking.map((entry) => entry.id)).toEqual(["a"]);
  });

  it("知らない参照名は黙って捨てる", () => {
    const result = interpretSemanticAnswers(answers(0.9, { E0: 0.5, E9: 0.5 }), refToId);

    expect(result.ranking.map((entry) => entry.id)).toEqual(["a"]);
  });

  it("上限で打ち切る", () => {
    const wide = Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => [`E${i}`, 1 / 30])
    ) as Record<string, number>;
    const wideMap = new Map(Array.from({ length: 30 }, (_, i) => [`E${i}`, `id${i}`]));

    expect(interpretSemanticAnswers(answers(0.9, wide), wideMap).ranking).toHaveLength(
      SEMANTIC_MAX_RESULTS
    );
  });

  it("答えの型が想定と違えば失敗させる", () => {
    expect(() => interpretSemanticAnswers({}, refToId)).toThrow(TypeError);
    expect(() =>
      interpretSemanticAnswers({ [SEMANTIC_NOUL_ID]: { type: "noul", noul: 0.9 } }, refToId)
    ).toThrow(TypeError);
  });

  it("matchProbability は生値をそのまま残す", () => {
    expect(interpretSemanticAnswers(answers(0.24, { E0: 1 }), refToId).matchProbability).toBe(0.24);
  });
});

describe("selectSemanticEvents", () => {
  it("ランキング順に並べ替える", () => {
    const ranking = [
      { id: "tent", probability: 0.6 },
      { id: "dance", probability: 0.3 },
    ];

    expect(ids(selectSemanticEvents(ranking, events))).toEqual(["tent", "dance"]);
  });

  it("手元に無いIDは黙って捨てる（削除済み・未取得の企画）", () => {
    const ranking = [
      { id: "removed", probability: 0.9 },
      { id: "dance", probability: 0.1 },
    ];

    expect(ids(selectSemanticEvents(ranking, events))).toEqual(["dance"]);
  });

  it("絞り込み後の配列を渡すと積集合になる", () => {
    const ranking = [
      { id: "tent", probability: 0.6 },
      { id: "dance", probability: 0.3 },
    ];
    const onlyStage = events.filter((e) => e.type === "stage");

    expect(ids(selectSemanticEvents(ranking, onlyStage))).toEqual(["dance"]);
  });

  it("空のランキングは空を返す", () => {
    expect(selectSemanticEvents([], events)).toEqual([]);
  });
});
