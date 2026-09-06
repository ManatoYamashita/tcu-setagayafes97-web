# テスト方針

本プロジェクトのテストは **#148 の再発を CI で落とす**ために導入した（#157）。
「網羅率を上げる」ためのものではないので、増やす前に必ず本ファイルの判断基準を読むこと。

## なぜ入れたか

`/timetable` の盤面が `height: 100%` の解決失敗で 0px に潰れ、全ステージ企画が同一座標へ
重なった（#148）。**この事故は `pnpm lint` / `format:check` / `build` のすべてを通過していた。**
「ビルドが通る壊れたページ」が本番相当のコードに存在できてしまう、というのが問題の本体である。

PR #154 は不変条件を JSDoc とドキュメントで守ったが、それらは人間が読まなければ効かない。

## 何をテストし、何をテストしないか

| 対象                                   | 手段               | 理由                                                     |
| -------------------------------------- | ------------------ | -------------------------------------------------------- |
| 幾何計算・データ選択などの**純粋関数** | Vitest（`node`）   | 算術で表せる不変条件は、DOM 無しで完全に固定できる       |
| **盤面が実際に 0px でないこと**        | 実ブラウザでの実測 | レイアウトエンジンが要る。ユニットテストでは原理的に不可 |
| アニメーションの再生・見え方           | 実機での目視       | rAF 依存。自動化しても得るものが少ない                   |

> [!IMPORTANT]
> **jsdom / happy-dom を入れてはいけない。** レイアウトエンジンを持たないため
> `getBoundingClientRect()` が常に 0 を返し、**#148 を原理的に検出できない。**
> それでいて「DOM のテストを書けている」ように見えるので、実ブラウザでの検証を
> やめる口実になる。`vitest.config.mts` が `environment: "node"` に固定しているのはこのため。

盤面の実測は [`docs/frontend/timetable-gantt.md`](../frontend/timetable-gantt.md) の
「実測アサーション」を参照。

## コマンド

| コマンド          | 用途                                      |
| ----------------- | ----------------------------------------- |
| `pnpm test`       | ワンショット実行。CI とエージェントはこれ |
| `pnpm test:watch` | 対話的に回す                              |
| `pnpm type-check` | `next typegen` してから `tsc --noEmit`    |

`test` が watch にならないよう `vitest run` を明示している。`.claude/CLAUDE.md` の
コマンド一覧を読んだエージェントが `pnpm test` を叩くため、watch だとハングする。
`--passWithNoTests` は付けない（`include` の設定ミスで0件になったら緑ではなく赤にしたい）。

## 配置と書き方

- **ソースと同じディレクトリに `*.test.ts`** を置く（`src/lib/timetable-layout.test.ts`）。
  関数を直した人の視界にテストが入らなければ、`docs/` に何を書いても読まれない
- **`src/app/` 配下には置かない**。ルートとして解釈される
- `describe` / `it` / `expect` は `vitest` から**明示 import** する。`globals: true` にすると
  `tsconfig.json`（`next typegen` が書き換えるファイル）か、二重管理されている ESLint 設定の
  どちらかを触ることになる。**設定変更ゼロで済ませる**
- フィクスチャは `src/components/timetable/__fixtures__/stage-events.ts` を再利用する。
  境界値の算術はテスト側で `fixture()` を呼んで作る（フィクスチャに専用データを増やさない）

### 「いまのデータ」ではなく「不変条件」を固定する

`src/data/stages.ts` と `src/data/site.ts` は第98回で必ず変わる。
`["7A","7B",…]` とベタ書きしたテストは**年次更新の税**になるだけで、何も守らない。

```ts
// 悪い: 会場が入れ替わっただけで落ちる
expect(groups.map((g) => g.id)).toEqual(["7A", "7B", "体育館"]);

// 良い: 並び順の契約だけを見る
const expected = STAGE_ORDER.filter((id) => actual.includes(id));
expect(actual).toEqual(expected);
```

同じ理由で `DEFAULT_TIME_RANGE` は `{10, 20}` と書かず、`siteConfig` の開催時間を
**包含していること**だけを検証している。

## 踏み抜きやすい落とし穴

### `warnOnce` はモジュールスコープに状態を溜める

`src/lib/timetable.ts` の `warnedMessages` は `Set` に文言を溜め続け、同じ文言は
2度目以降出さない。**静的 import のままだと、2本目以降の警告テストが必ず
「`console.warn` が呼ばれない」で落ちる。**

`console.warn` を観測するテストは1つの `describe` に隔離し、`beforeEach` で
`vi.resetModules()` してから**動的 import** でモジュール実体を作り直すこと。

```ts
beforeEach(() => {
  vi.resetModules();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

it("…", async () => {
  const { warnUnresolvedStagePlaces } = await import("@/lib/timetable");
});
```

> [!WARNING]
> **動的 import で得た値は、静的 import のものと別実体になる。**
> `expect(range).toBe(DEFAULT_TIME_RANGE)` のような**同一参照の検証を、この
> `describe` へ持ち込んではいけない。** 参照が一致せず落ちる。

### `process.env.NODE_ENV` へ直接代入すると型エラーになる

`NODE_ENV` は `readonly` として宣言されているため、`process.env.NODE_ENV = "production"`
と書くと `tsc` が **TS2540** で落ちる（`next typegen` の有無に関わらず。2026-09-03 実測）。
`vi.stubEnv("NODE_ENV", "production")` を使うこと。
`vitest.config.mts` の `unstubEnvs: true` がテストごとに巻き戻す。

### 「どちらも正しい」と書いた契約が、後で片方に寄ることがある

以前この節には「`filterEvents()` は `date` を厳密一致で扱い、`filterEventsByDate()` は
`both` を両方へ出す。**どちらも正しい**」と書いてあった。**#207 でこれは覆り、
両方が `matchesEventDate()`（`src/lib/filters.ts`）へ寄った。**

理由は UI の都合ではなく来場者の期待だった。「両日やっている企画」は「1日目にやっている企画」
でもあり、厳密一致にすると企画一覧とタイムテーブルで同じ日の件数が食い違う。
`/events` が「両日開催」を独立した選択肢として持つことは、`both` を Day1 に含めない理由には
ならない（`date=both` を選べば `both` だけが出る）。

**教訓は挙動そのものではなく、ここへ「どちらも正しい」と書いたことの方にある。**
差異をテストで固定した時点で満足し、**その差異が来場者から見て正しいかを問い直さなかった。**
テストは差異を固定するが、差異が妥当かどうかは何も言わない。似た名前の関数が違う契約を
持っていると気付いたら、まず「両方の契約を同時に見る人（来場者）から見て筋が通るか」を
確かめること。通らないなら、固定すべきは差異ではなく統合後の1つの規則である。

現在の規則は [../frontend/events-search.md](../frontend/events-search.md#日程の-both-は-day1--day2-の両方に出す) を参照。

### 引数を持つ関数は、その引数が**本番の呼び出し元から渡っているか**まで見る

`listBuildingOptions(events, selected)` の `selected` は「選択中の建物を該当0件でも
選択肢へ残す」ための引数で、テストも docs もその契約を書いていた。**それでも本番では
一度も渡っていなかった**（#207 のレビューで発覚）。唯一の呼び出し元 `src/app/events/page.tsx` は
`useSearchParams()` を読まない設計（#156）なので、選択値を知り得なかったためである。

症状は「`?building=7号館` で建物セレクトが『すべて』と表示されたまま0件」。
**`lint` / `type-check` / `build` / `test` はすべて緑のまま通る。** 省略可能な引数は
渡さなくても型エラーにならず、単体テストは自分で引数を渡してしまうからである。

```bash
# 引数を足したら、production の呼び出し元が渡しているかを必ず数える
grep -rn "listBuildingOptions(" src/ --include=*.ts --include=*.tsx | grep -v ".test."
```

**この形はユニットテストでは構造的に検出できない。** 検出したいなら
[`no-restricted-imports` のような構造ガード](../frontend/static-html-and-search-params.md#再発防止装置--no-restricted-imports)
へ寄せるか、実ブラウザで1度踏むしかない。最低限、**省略可能な引数を足したら
呼び出し元を grep する**ことを手順に含めること。

### `vitest.config.mts` の拡張子は `.ts` ではない

`.ts` にすると Vite が「CommonJS として読んだファイルに ESM 構文がある」と警告し、
将来のメジャーで既定が変わったときに壊れる。`.mts` にして `tsconfig.json` の
`include` へ `"**/*.mts"` を足してあるので、**この設定ファイル自体も型検査される**
（実測で確認済み）。`next typegen` はこの `include` を巻き戻さない。

### `@/` エイリアスの書き方

`vitest.config.mts` の `resolve.alias` は**正規表現 `/^@\//`** で指定する。
文字列キーの `"@"` にすると Vite が前方一致で置換するため、
`@hookform/resolvers` のようなスコープ付きパッケージ名まで書き換わる。

## テストの価値は「落ちること」でしか測れない

**テストを書いただけでは何も守れていない。** 実装を退行させて赤くなることを確認して、
初めてその不変条件が固定されたと言える。

2026-09-03 に、Issue #157 が挙げた退行をすべて実際に注入して検証した。

| 退行させた内容                             | 落ちたテスト                                                 |
| ------------------------------------------ | ------------------------------------------------------------ |
| 絞り込みを `extractStageId()` へ戻す       | 「その他」で受け皿の企画を取れる／グループ化と完全に一致する |
| 密度判定を枠で行う（`- CARD_GAP_PX` 削除） | 枠ではなくカード実寸で判定する／full の境界／compact の境界  |
| 重なり判定にクランプ後の px を使う         | 重なり判定に実時刻を使い、クランプ後の px を使わない         |
| グループ化を破壊的 `sort` に戻す           | 引数の配列を破壊しない                                       |
| `parseTimeToMinutes` が `NaN` を返す       | どんな入力に対しても NaN を返さない ほか                     |
| 壊れた入力に既定値を返す                   | 壊れた入力に既定値を返さず null を返す ほか                  |
| 選択中ステージをタブから落とす             | 選択中のステージを当日0件でも残す                            |
| レンジの最低1時間を外す                    | 同一の正時に収まる企画でも最低1時間を確保する                |

`src/lib/filters.ts` にも同じ手順を踏んだ（2026-09-03、#162）。

| 退行させた内容                                  | 落ちたテスト                                                    |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `paginateEvents` の1未満クランプを削除          | 1未満のページは空配列を返す／小数のページを切り捨てる           |
| `Math.floor` による小数の切り捨てをやめる       | 小数のページを切り捨てる                                        |
| `filterEvents` の `date` 判定から `both` を外す | 1日目・2日目に両日開催を含める（#207 で反転。上表は当時の記録） |
| `generatePageNumbers` の窓幅を 7 から 5 へ      | 上記4つの不変条件を検査するプロパティテストを含む6件            |

SEO シグナル（`metadata.ts` / `structured-data.ts` / `sitemap-entries.ts`）にも同じ手順を
踏んだ（2026-09-03、#164）。ここで直した欠陥は**すべて `lint` / `type-check` / `build` /
`format:check` を通過していた**もので、#148 と同じ形をしている。

| 退行させた内容                                           | 落ちたテスト                             |
| -------------------------------------------------------- | ---------------------------------------- |
| `buildLocalePath` がデフォルトロケールにも接頭辞を付ける | デフォルトロケールには接頭辞を付けない   |
| `x-default` を非デフォルトロケールのURLにする            | x-default はデフォルトロケールと一致する |
| `noindex` のときも canonical を出す                      | noindex のとき canonical を出さない      |
| `serializeJsonLd` のエスケープを外す                     | `<` を退避して script 要素を閉じさせない |
| `/about` の `@graph` から WebSite ノードを落とす         | 宙に浮いた `@id` 参照が無い              |
| sitemap の hreflang から自己参照を落とす                 | 自分自身を含む（相互参照）               |
| sitemap の `lastModified` を全件ビルド時刻へ戻す         | 全件が同一値ではない                     |
| パンくずの `position` を 0 起点にする                    | position は 1 起点の連番である           |

**新しくテストを足すときも同じ手順を踏むこと。** 壊しても赤くならないなら、
そのテストは何も固定していない。

## テストを足すかどうかの判断

足す価値があるのは、**壊れても `lint` / `build` が気付かず、かつ算術で表せる不変条件**である。

| 対象                                                                          | 判断           |
| ----------------------------------------------------------------------------- | -------------- |
| `src/lib/timetable-layout.ts` / `src/lib/timetable.ts` / `src/data/stages.ts` | 導入済み       |
| `src/lib/filters.ts`                                                          | 導入済み       |
| `src/lib/metadata.ts`                                                         | 導入済み       |
| `src/lib/structured-data.ts`                                                  | 導入済み       |
| `src/lib/sitemap-entries.ts`                                                  | 導入済み       |
| `src/lib/revalidate-targets.ts`                                               | 型が守っている |
| `src/lib/utils.ts`（`cn`）                                                    | 不要           |
| `sessionStorage` / `window` に依存するもの（`motion.ts` 等）                  | 実ブラウザ側   |

## pre-commit には足さない

husky + lint-staged は現在 `prettier --write` だけで sub-second に終わる。
複数のエージェントが同じ作業ツリーを触る運用（[git.md](./git.md)）で、コミットに
数十秒かかる状態は事故を増やす。**強制点は CI の1箇所に保つ。**

## 関連ドキュメント

- [docs/dev/git.md](./git.md) — ブランチ戦略と CI のジョブ構成
- [docs/frontend/timetable-gantt.md](../frontend/timetable-gantt.md) — 盤面の設計と実測アサーション
- [docs/frontend/layout-patterns.md](../frontend/layout-patterns.md) — 「同じ寸法を CSS と JS が別々に持たない」

---

**最終更新日**: 2026-09-06
