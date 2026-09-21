import { describe, expect, it } from "vitest";
import { searchEvents, tokenizeQuery } from "@/lib/search";
import type { Event } from "@/types/events";

/**
 * 検索用のダミー企画
 *
 * `src/components/timetable/__fixtures__/stage-events.ts` を使わず自前で組むのは、
 * **フィールドが欠落した企画を作れる必要がある**ため。microCMS は未入力フィールドを
 * キーごと返さないので、`Event` の型宣言は実行時に守られていない（#166）。
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
  }),
  event("bingo", {
    place: "TCUホール",
    title: "ミステリーBINGO",
    organizer: "実行委員会",
    description: "こども向けの景品を用意したビンゴ大会です。",
    content: "<p>会場は9号館ではありません</p>",
  }),
  event("tent", {
    place: "テント１",
    title: "同好会連合のだんご",
    organizer: "同好会連合",
    description: "みたらしだんごを販売します。",
  }),
];

describe("tokenizeQuery", () => {
  it("空白で区切る", () => {
    expect(tokenizeQuery("9号館 ダンス")).toEqual(["9号館", "だんす"]);
  });

  it("助詞で区切る", () => {
    expect(tokenizeQuery("9号館のダンス")).toEqual(["9号館", "だんす"]);
  });

  it("助詞が語頭にあっても割らない（のど自慢を守る）", () => {
    // 「の」で無条件に割ると「ど自慢」になり、意図した企画が引けなくなる。
    // 短い区切り語は左に2文字以上残せるときだけ働く
    expect(tokenizeQuery("のど自慢")).toEqual(["のど自慢"]);
  });

  it("3文字以上の口語表現は語頭からでも落とす", () => {
    expect(tokenizeQuery("やってるダンス")).toEqual(["だんす"]);
  });

  it("不要語を捨てる", () => {
    expect(tokenizeQuery("おすすめの企画を教えて")).toEqual([]);
  });

  it("助詞が不要語へ吸着した語も捨てる", () => {
    // 「の企画」はどの企画にも一致しえない。助詞は語頭では切り離せないため生まれる
    expect(tokenizeQuery("の企画")).toEqual([]);
    // ただし助詞を無条件に剥がしてはいけない
    expect(tokenizeQuery("の企画とのど自慢")).toEqual(["のど自慢"]);
  });

  it("中身の無いクエリは空配列（0件ではなく「条件なし」の意味）", () => {
    expect(tokenizeQuery("企画")).toEqual([]);
  });

  it("空のクエリは空配列", () => {
    expect(tokenizeQuery("")).toEqual([]);
    expect(tokenizeQuery("   ")).toEqual([]);
  });
});

describe("searchEvents", () => {
  it("欠落フィールドがあっても例外を投げない（#166 の再発防止）", () => {
    // microCMS の未入力フィールドはキーごと返ってこない。型宣言を信じて
    // .toLowerCase() を呼ぶと TypeError になり、企画一覧ごとエラー画面へ落ちる
    const broken = [
      {
        id: "broken",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
        date: "day1",
        type: "stage",
      } as unknown as Event,
    ];

    expect(() => searchEvents(broken, "ダンス")).not.toThrow();
    expect(searchEvents(broken, "ダンス")).toEqual([]);
  });

  it("1文字のクエリでも動く", () => {
    // /events?keyword=こ が例外で落ちていた（#166）
    expect(() => searchEvents(events, "こ")).not.toThrow();
    expect(ids(searchEvents(events, "こ"))).toEqual(["bingo"]);
  });

  it("段1: クエリ全体の部分一致を優先する", () => {
    expect(ids(searchEvents(events, "のど自慢"))).toEqual(["karaoke"]);
  });

  it("段2: 複数語をすべて含む企画だけを返す", () => {
    expect(ids(searchEvents(events, "9号館 ダンス"))).toEqual(["dance"]);
  });

  it("段3: 文章クエリでは一致した語が多い企画を先頭に置く", () => {
    const result = ids(searchEvents(events, "9号館でやってるダンスのやつ"));

    expect(result[0]).toBe("dance");
  });

  it("表記ゆれを吸収する（全角数字・カタカナ・大小文字）", () => {
    // 「９号館アリーナ」を半角の「9号館」で引ける
    expect(ids(searchEvents(events, "9号館"))).toContain("dance");
    expect(ids(searchEvents(events, "だんす"))).toContain("dance");
    expect(ids(searchEvents(events, "upbeat"))).toEqual(["dance"]);
  });

  it("場所で当たった企画を本文で当たった企画より上に置く", () => {
    // bingo の content にも "9号館" が出てくるが、place と建物で当たる dance が先
    expect(ids(searchEvents(events, "9号館"))).toEqual(["dance", "bingo"]);
  });

  it("place から導出した建物名でも引ける", () => {
    // place は「９号館アリーナ」だが、建物として「9号館」でも当たる
    expect(ids(searchEvents(events, "9号館"))).toContain("dance");
  });

  it("タイトルで当たった企画を概要で当たった企画より上に置く", () => {
    const result = ids(searchEvents(events, "だんご"));

    expect(result[0]).toBe("tent");
  });

  it("本文（content）も対象にする", () => {
    // 段1で拾えるのは bingo の content だけ
    expect(ids(searchEvents(events, "ではありません"))).toEqual(["bingo"]);
  });

  it("該当が無ければ空配列", () => {
    expect(searchEvents(events, "存在しない語")).toEqual([]);
  });

  it("検索語を取り出せないクエリでは絞り込まない", () => {
    // 「おすすめの企画を教えて」で0件を返すと検索が壊れて見える。
    // 条件が無いのだから全件を返すのが正しい
    expect(ids(searchEvents(events, "おすすめの企画を教えて"))).toEqual(ids(events));
  });

  it("クエリが空なら入力をそのまま返す", () => {
    expect(searchEvents(events, "")).toBe(events);
    expect(searchEvents(events, "   ")).toBe(events);
  });

  it("引数の配列を破壊しない", () => {
    const before = ids(events);
    searchEvents(events, "ダンス");
    expect(ids(events)).toEqual(before);
  });
});

/*
 * #251 の再発防止
 *
 * 区切り語で切った**右側**が意味を持つ保証は無く、無意味な断片が別の語へ部分一致して
 * 「0件のはずが1件出る」誤爆を作っていた。来場者は誤りに気づけない。
 *
 * 2026-09-20 に本番データ99件で実測した表を、ここで固定する。
 */
const fragmentEvents: Event[] = [
  event("dice", {
    place: "テント２",
    type: "store",
    title: "計測研のジュ〜シ〜サイコロ",
    organizer: "計測研究部",
    description: "サイコロステーキを販売します。",
  }),
  event("pool-free", {
    place: "TCUホール",
    title: "アカペラステージ",
    organizer: "アカペラサークル",
    description: "歌を披露します。",
  }),
  event("friends", {
    place: "9号館アリーナ",
    title: "UPBEAT ダンスステージ",
    organizer: "ダンスサークル UPBEAT",
    description: "友達と盛り上がれる企画です。",
  }),
];

describe("tokenizeQuery: 無意味な断片を作らない（#251）", () => {
  it("『雨でも大丈夫なところ』が ころ を作らない", () => {
    expect(tokenizeQuery("雨でも大丈夫なところ")).not.toContain("ころ");
  });

  it("『プールで泳ぎたい』が ぷる を作らない", () => {
    // 長音符は normalizeText が落とすため、プール は ぷる になって短いひらがな断片になる
    expect(tokenizeQuery("プールで泳ぎたい")).not.toContain("ぷる");
    expect(tokenizeQuery("プールで泳ぎたい")).toContain("泳ぎたい");
  });

  it("『友達と盛り上がれるやつ』が れる を作らない", () => {
    expect(tokenizeQuery("友達と盛り上がれるやつ")).not.toContain("れる");
    expect(tokenizeQuery("友達と盛り上がれるやつ")).toContain("友達");
  });

  it("2文字でもひらがなだけでなければ残す", () => {
    // 「友達」「静か」を落とすと、意味のある語まで消える
    expect(tokenizeQuery("友達と盛り上がれるやつ")).toContain("友達");
    expect(tokenizeQuery("静かに座って見られる企画")).toContain("静か");
  });

  it("3文字のひらがなは残す", () => {
    // ダンス → だんす。長さで守る
    expect(tokenizeQuery("9号館でやってるダンスのやつ")).toContain("だんす");
  });

  it("切っていない語句はふるいに掛けない", () => {
    // 来場者が自分で区切って入力した短い語は尊重する
    expect(tokenizeQuery("すし さしみ")).toEqual(["すし", "さしみ"]);
  });

  it("のど自慢は今までどおり割らない", () => {
    expect(tokenizeQuery("のど自慢")).toEqual(["のど自慢"]);
  });

  it("9号館 ダンスは今までどおり2語へ割る", () => {
    expect(tokenizeQuery("9号館 ダンス")).toEqual(["9号館", "だんす"]);
  });
});

describe("searchEvents: 断片による誤爆を返さない（#251）", () => {
  it("『雨でも大丈夫なところ』がサイコロを返さない", () => {
    // ころ が「ジュ〜シ〜サイコロ」へ部分一致していた
    expect(ids(searchEvents(fragmentEvents, "雨でも大丈夫なところ"))).not.toContain("dice");
  });

  it("『プールで泳ぎたい』が無関係な企画を返さない", () => {
    expect(searchEvents(fragmentEvents, "プールで泳ぎたい")).toEqual([]);
  });

  it("意味のある語での一致は残る", () => {
    expect(ids(searchEvents(fragmentEvents, "友達と盛り上がれるやつ"))).toEqual(["friends"]);
  });

  it("段1（クエリ全体の部分一致）は無傷", () => {
    expect(ids(searchEvents(fragmentEvents, "サイコロ"))).toEqual(["dice"]);
  });
});
