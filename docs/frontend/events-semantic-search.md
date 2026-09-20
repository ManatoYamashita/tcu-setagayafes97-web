# `/events` の意味検索（キーワード検索の第4段）

リテラル照合が0件になったときだけ、TypeSafe の System One モデル `jev-1.13.0`（Jev）へ
問い合わせて「意味の近い企画」を出す経路の設計と、そう決めた理由をまとめる（#253）。

**段1〜3（正規化・トークン化・カスケード）は
[events-search.md](./events-search.md) が扱う。この文書はその続きだけを扱う。**

## なぜ足したか

`searchEvents()` はリテラル照合しかできない。本番データ98件での実測で、
`食べ物` `体を動かしたい` `静かに座って見られる企画` `のど自慢` がいずれも **0件**を返した。
模擬店が並んでいるのに `食べ物` で0件を返すのは、来場者から見れば検索が壊れている。

Jev はテキストを生成せず、**型付きの判断**（Choice / Noul / Score）を返す。
`Choice` に全企画を選択肢として並べれば、1リクエストで全件のランキングが得られる。
公式クックブック [Line-by-line search](https://docs.typesafe.ai/cookbooks/semantic_find.md)
と同じ構造である。

## 実装の分担

| ファイル                                         | 役割                                                           |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `src/lib/typesafe.ts`                            | `POST /v1/systemone` の薄い `fetch()` ラッパ。**サーバー専用** |
| `src/lib/semantic-search.ts`                     | 純粋関数。リクエストの組み立て・答えの解釈・第4段のゲート判定  |
| `src/app/api/search/route.ts`                    | 公開の判断。検証の順序・レート制限・キャッシュヘッダ           |
| `src/lib/rate-limit.ts`                          | トークンバケット（保険）                                       |
| `src/components/events/useSemanticSearch.ts`     | クライアントからの問い合わせとキャッシュ                       |
| `src/components/events/SemanticSearchNotice.tsx` | 状態表示。**`EVENTS_FALLBACK_TREE` に登録済み**                |
| `src/components/events/EventsContent.tsx`        | ゲートの適用と、現在の絞り込みとの積集合                       |
| `scripts/measure-semantic-search.mjs`            | 実測と fixture の採取。**CI では走らない。課金あり**           |

## SDK は入れない

`@typesafe-ai/sdk` は評価したうえで採用しなかった。エンドポイントは
`POST https://api.typesafe.ai/v1/systemone` の1本しかなく、`fetch()` で足りる。
**バンドル増分 0・サプライチェーンの面積 0。**

代償として SDK の自動リトライが無いが、これは失うものではない。
この経路は来場者が結果を待っている同期パスで、**429 や 529 で待たせるくらいなら
失敗させて段3の結果へ戻すほうが速い。**

## 第4段のゲート — 段1〜3で当たったら絶対に呼ばない

`/api/search` は**認証の無い従量課金口**である。1リクエストがそのまま課金になる。

```
段1 クエリ全体の部分一致  ─┐
段2 全語 AND              ─┤ 当たったら即返す（無料・0ms）
段3 いずれか OR           ─┘
      ↓ searchEvents(全企画, keyword).length === 0 のときだけ
段4 Jev
```

判定は `shouldAskSemanticSearch()`（`src/lib/semantic-search.ts`）が持つ。

> [!IMPORTANT]
> **判定は絞り込み前の全企画に対して行う。** 日程や建物のフィルタで0件になっただけの
> ケースまで第4段へ落とすと、どのみち積集合で消える結果に課金することになる。
>
> **`tokenizeQuery()` の結果を判定に使ってはいけない。** 検索語が0個は「0件」ではなく
> 「絞り込む条件が無い」の意味で、`searchEvents()` はそのとき全件を返す
> （[events-search.md](./events-search.md)）。`おすすめの企画を教えて` で課金が発生する。

## 足切りは `has_match`（Noul）で行う。`confidence` を使ってはいけない

`Choice` は**該当が無くても必ず1件選ぶ。** しかも高い confidence で間違える。
2026-09-20 に本番データ98件・12クエリで実測した（`node scripts/measure-semantic-search.mjs`）。

| クエリ                     | 想定     | 第1位確率 | confidence | **has_match** | 判定     |
| -------------------------- | -------- | --------- | ---------- | ------------- | -------- |
| `食べ物`                   | match    | 0.42      | 0.41       | **0.98**      | 該当あり |
| `たこ焼き`                 | match    | 1.00      | 1.00       | **0.98**      | 該当あり |
| `9号館のダンス`            | match    | 0.57      | 0.56       | **0.98**      | 該当あり |
| `のど自慢`                 | match    | 0.92      | 0.91       | **0.82**      | 該当あり |
| `子どもが楽しめるもの`     | match    | 0.55      | 0.54       | **0.98**      | 該当あり |
| `体を動かしたい`           | match    | 0.40      | **0.39**   | **0.92**      | 該当あり |
| `静かに座って見られる企画` | match    | 0.47      | **0.45**   | **0.93**      | 該当あり |
| `友達と盛り上がれるやつ`   | match    | 0.66      | 0.65       | **0.95**      | 該当あり |
| `雨でも大丈夫なところ`     | match    | 0.58      | 0.56       | **0.95**      | 該当あり |
| `プールで泳ぎたい`         | no-match | 0.34      | 0.32       | **0.05**      | 該当なし |
| `スキー場`                 | no-match | 0.81      | **0.79**   | **0.24**      | 該当なし |
| `確定申告の相談`           | no-match | 0.80      | **0.79**   | **0.06**      | 該当なし |

**該当なしの `スキー場` と `確定申告の相談` の confidence 0.79 は、該当ありの
`体を動かしたい` 0.39・`静かに座って見られる企画` 0.45 を上回る。**
confidence で足切りをすると、実在しない企画を自信満々に出しながら、
実在する企画を捨てることになる。

`has_match` は該当あり **0.82〜0.98** / 該当なし **0.05〜0.24** に分かれ、
閾値 0.5 はその谷の真ん中に落ちる。

> [!WARNING]
> **Issue #253 が挙げていた「該当なし群 0.02〜0.06、10倍以上のマージン」は再現しない。**
> `スキー場` は 0.24 まで上がった。同じ閾値で正しく落ちるが、余裕は約3.4倍しかない。
> **閾値を 0.2 付近まで下げてはいけない。**

公式も「Choice は相対（どれか）、Noul は絶対（そもそもあるか）で別の問い」と明記している
（[jev-1.13 jaggedness](https://docs.typesafe.ai/model-jaggedness/jev-1.13.md)）。
**Noul で調整した閾値を Choice へ持ち越してはいけない。**

## リクエストの形

```jsonc
{
  "model": "jev-1.13.0",
  "state": {
    "visitor_query": "食べ物",
    "events": [
      {
        "ref": "E00",
        "title": "…",
        "organizer": "…",
        "place": "…",
        "building": "…",
        "category": "模擬店",
        "day": "1日目",
        "description": "…",
        "detail": "…",
      },
    ],
  },
  "questions": {
    "best_match": {
      "type": "choice",
      "instructions": "…`visitor_query`…",
      "criteria": { "E00": null },
    },
    "has_match": {
      "type": "noul",
      "instructions": "…`visitor_query`…",
      "criteria": { "true": "…", "false": "…" },
    },
  },
}
```

### 来場者の入力は `state` へ置く。`instructions` へ混ぜない

`state` は「データ」、`instructions` は「指示」である。来場者の入力を指示側へ連結すると、
「これまでの指示を無視して…」の類がそのまま指示として読まれる。
`visitor_query` という名前を付けて `state` に置き、質問文からはバッククォートで参照する。

**Jev は敵対的な入力を前提にしていないと公式が明記している。** 分離は万能ではないが、
指示文へ直接埋め込むよりは確実に良い。

### `ref` は連番。microCMS のコンテンツIDを送らない

`Choice` の選択肢名はモデルへ送られる。意味を持たないランダムIDに token を払う理由がなく、
内部IDを外部サービスへ渡す理由もない。`E00` 形式の連番にし、対応表はコード側が持つ。

### 時刻は載せない

Jev は数値と日付の比較が苦手だと公式に明記されている。時刻の判定は既存のタイムテーブル側が持つ。

### モデルはバージョンで固定する

`jev-latest` は新しいリリースで指す先が動く。**上の閾値はこのバージョンの実測値に対して
決めてある。** 動かすときは `scripts/measure-semantic-search.mjs` で測り直すこと。

## API は「クエリ → 全件のランキング」だけを返す

日程・種別・建物を `/api/search` へ渡さない。既知のルールはコードの仕事である。

- URL の種類が減り、**GET のまま CDN に載る**（`s-maxage=600`）
- 絞り込みを変えても追加のリクエストが飛ばない（積集合は `EventsContent` が取る）
- 削除済み企画のIDが返っても `selectSemanticEvents()` が黙って捨てる

## 費用とレイテンシ（2026-09-20 実測・98件）

| 項目                      | 実測値                          |
| ------------------------- | ------------------------------- |
| 1クエリあたり入力トークン | 15,455                          |
| 単価                      | $0.042 / 1M input（出力は無料） |
| 1クエリあたり             | **$0.000649 ≒ 0.097円**         |
| レイテンシ                | 261〜933ms（中央値 303ms）      |
| 1万クエリ                 | $6.49 ≒ 970円                   |

打ち切りは **3,000ms**。Issue #253 が挙げていた 1,500ms は、**その Issue 自身の実測最遅値
1,614ms を切り落とす。** 測る日で倍近く揺れる以上、最遅値へ張り付いた値は置けない。

### インデックスは存在しない

Jev に埋め込みも事前計算も無い。全件を毎回リクエストへ同梱する。
したがって「コンテンツ更新時の再インデックス」という工程が構造的に発生しない。
`Choice` の選択肢上限は255で、**超えたら黙って切り捨てず `RangeError` にする**
（切り捨てると「後ろの企画だけが永久に意味検索へ出てこない」状態が無言で生まれる）。

## 課金口の保護は4層

| 層  | 実装                                                | どこで効くか           | コードか   |
| --- | --------------------------------------------------- | ---------------------- | ---------- |
| 0   | 段1〜3で当たったら呼ばない                          | 大半のクエリが無料     | はい       |
| 1   | **Vercel WAF のレート制限**                         | 関数の起動前・エッジ   | **いいえ** |
| 2   | `src/lib/rate-limit.ts` のトークンバケット          | インスタンス単位の保険 | はい       |
| 3   | クエリ長の上下限・CDN 600秒・クライアントキャッシュ | 素朴な多重発火         | はい       |

> [!IMPORTANT]
> **層1はコードではない。このPRがマージされただけでは有効にならない。**
>
> Vercel ダッシュボード → プロジェクト → Firewall → Configure → New Rule
>
> - If: `Request Path` `equals` `/api/search`
> - Then: `Rate Limit` / Fixed Window / 60秒 / 20リクエスト / キーは `IP`
> - Action: `Deny`（まず `Log` で様子を見てから切り替えてもよい）
>
> **Hobby プランはプロジェクトあたり1ルールまで。** この枠を他で使っていないことを確認する
> （固定ウィンドウ 10秒〜10分、キーは IP / JA4、100万リクエストまで込み。2026-09-20 実測）。

層2は**厳密には効かない。** サーバーレスではインスタンスごとに Map が分かれるため、
実効の上限は「設定値 × 同時に生きているインスタンス数」になる。それでも置いてあるのは、
WAF の設定漏れと Preview 環境を素通りさせないためである。

`src/app/api/contact/route.ts` にも同種の実装があるが、**あちらは期限切れのエントリを
一度も消さない**（`delete` がどこにも無い）。踏襲せず、掃除を入れた新しいモジュールを作った。

### TypeSafe コンソール側の上限

**公式ドキュメントに記載が無い。** 設定できるかどうかはコンソールにログインしないと分からない。
確認して、可能なら設定すること。

## プライバシーポリシー

**来場者が入力した検索語は米国の TypeSafe, Inc. へ送信される。**
ゼロデータ保持（ZDR）は[エンタープライズ契約でのみ](https://docs.typesafe.ai/legal.md)
提供されるため、送信内容は保持される。

現行のポリシーは「原則として第三者への提供は行いません」と書いているため、
`src/data/privacy.ts` の `thirdParty.externalServices` に具体的な送信先を追記した。
**送信先を増やしたら必ずここへ足すこと。**

> [!NOTE]
> `privacyPolicyConfig.info.updateDate` は触っていない。ポリシーの改定日は
> 委員会が決める性質のもので、実装者が勝手に動かすものではない。**公開前に判断すること。**

## 触ってはいけないもの

### 静的HTML（#156）

`/api/search` は別ルートなので `/events` のプリレンダリングには影響しない。
ただし `EventsView` 配下は `<Suspense>` fallback としても描かれるため、
**`SemanticSearchNotice.tsx` は `eslint.config.mjs` の `EVENTS_FALLBACK_TREE` へ登録してある。**

> [!WARNING]
> **この規則は 2026-09-20 まで一度も効いていなかった。**
> flat config は同じ規則名を**後勝ちで丸ごと置き換える**ため、後から足された
> `no-restricted-imports`（#237 の `next/image` 禁止）が `useSearchParams` 禁止を
> 設定ごと消していた。同じ理由で `EventInfiniteList.tsx` の禁止色検査（#230）も
> 消えていた。どちらも `eslint --print-config` で確認し、退行注入が exit 0 で通ることを実測した。
>
> 現在は `RESTRICTED_IMAGE_IMPORTS` と `RESTRICTED_COLOR_SELECTORS` を冒頭に括り出し、
> 各ブロックで展開して合成してある。**`no-restricted-imports` / `no-restricted-syntax` を
> 新しいブロックで使うときは、必ずこの定義を展開すること。**

### 一覧の表示件数（#239）

`EventInfiniteList` は表示件数を `useState` の初期化子で1度だけ決め、props の変化では
上書きしない。第4段が走るのはリテラル検索が0件のときだけなので、**初回の表示件数は必ず0になる。**
`EventsView` の `listKey` に意味検索の到着（`|semantic`）を含めて再マウントさせている。
**外すと、結果が返っても一覧が0件のまま動かない。**

### データ追従（#252）

`/api/search` は microCMS を読む**初めての ISR 対象 Route Handler**になる。
`revalidatePath()` はそこへ届かず、`src/lib/revalidate-targets.ts` の `RevalidateTarget["type"]`
は `"page"` しか許していない（`"route"` の受け口が無い）。

そこで**本経路では fetch キャッシュを一切使わず、毎回 microCMS を読む。**
第4段はリテラルが0件のときだけ呼ばれるので、呼び出し頻度は低い。
#252 でタグ対応が入ったら、`next: { tags: [...] }` を付けて読み直しを減らせる。

## 検証

### 自動

| コマンド                                     | 見るもの                                                           |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm test`                                  | fixture に対する退行テスト。**ライブ API は叩かない**              |
| `pnpm lint`                                  | `SemanticSearchNotice.tsx` が `useSearchParams` を import できない |
| `NEXT_PUBLIC_EVENTS_VISIBLE=true pnpm build` | `assert-events-static-html.mjs` が `SKIP` ではなく合格する         |

### 退行注入（実測）

**テストの価値は「落ちること」でしか測れない**（[dev/testing.md](../dev/testing.md)）。
2026-09-20 に実測した。

| 注入した退行                                               | 落ちるもの                |
| ---------------------------------------------------------- | ------------------------- |
| 足切りを `has_match` → `choice.confidence`                 | ユニットテスト **7本**    |
| ゲートを外して常時発火（`shouldAskSemanticSearch` → true） | ユニットテスト **4本**    |
| 255件の上限検査を外す                                      | ユニットテスト **1本**    |
| `SemanticSearchNotice` が `useSearchParams` を import      | `pnpm lint`               |
| `EventGrid` が `next/image` を import                      | `pnpm lint`（合成の確認） |
| `EventInfiniteList` に `text-gray-300` を書く              | `pnpm lint`（合成の確認） |
| `EventInfiniteList` の効果で `hasMore` を読む              | `pnpm lint`               |

### fixture の採り方

```bash
# 計測のみ（課金あり）
node scripts/measure-semantic-search.mjs

# fixture も書き出す
NEXT_PUBLIC_SPECIAL_VISIBLE=false node scripts/measure-semantic-search.mjs --write
```

**Node 24 が要る**（型除去で `src/lib/*.ts` を直接読むため。`scripts/ts-module-loader.mjs`）。
ロジックをスクリプト側へ書き写さないための選択で、`package.json` の engines も `>=24.0.0`。

> [!IMPORTANT]
> **fixture に企画名は入れない。** 保存するのは `E00` 形式の参照名と microCMS のコンテンツID、
> そして答えの確率だけである。このリポジトリは公開されており、解禁前の企画名を置けない。
> `--write` は母集団に著名人企画（`type = special`）が1件でも含まれていたら**書き出しを拒否する。**
