# オープナーは入口でだけ再生する（#402）

オープナー（`src/components/layout/Opener.tsx`）は、**サイトに入ってきた瞬間の演出**である。
サイト内でページを移っただけで再生されてはいけない。

関連: [performance.md](./performance.md)（`willRunOpener()` と `opener-done` の待機） /
[page-transition.md](./page-transition.md)（クライアント遷移の演出） /
[layout-e2e.md](./layout-e2e.md)（再発防止装置の置き場）

---

## 症状

デスクトップで、検索したりページを移ったりすると、**たまに**オープナーが再生された。

## 原因: Next.js がクライアント遷移を諦めてフルロードへ落とす

オープナーはルートレイアウト（`src/app/layout.tsx` の `<OpenerLoader />`）にあるため、
`<Link>` / `router.push()` / `router.replace()` によるクライアント遷移では再マウントされない。
再生されるのは**ドキュメントのフルロードが起きたとき**だけである。

サイトのコードにフルロードを起こす経路は無い。フルロードは Next.js 自身のフォールバックによる。
`next/dist/client/components/router-reducer/fetch-server-response.js`（16.1.0）は、
次のいずれかでブラウザ遷移（`location.href` への代入相当）へ切り替える。

| 条件                                          | このサイトで起きる場面                                        |
| --------------------------------------------- | ------------------------------------------------------------- |
| RSC 応答のビルドID（`b`）がクライアントと違う | **デプロイのたび。** 開いたままのタブで次に遷移・検索した瞬間 |
| RSC 応答が 200 でない / Flight 形式でない     | 404 になる詳細ページへの遷移、5xx                             |
| fetch が失敗した                              | 回線断・タイムアウト                                          |

`next.config.ts` に `generateBuildId` / `deploymentId` は無く、ビルドIDはデプロイのたびに変わる。
本番は1日に十数回デプロイされるため（2026-10-04 は5時間で13回）、「たまに」起きる。
`/events` のキーワード検索も `router.replace()` で RSC を取得するので、同じ経路でフルロードになる。

### 実測（2026-10-04、ローカルの本番ビルド）

ビルドを2回作り、1回目のビルドで開いたページに `window` の目印を置いてから操作した。

| 操作（ビルドIDを変えた後の旧ページで） | 目印       | `navigation.type` | `document.referrer` | 修正前   | 修正後 |
| -------------------------------------- | ---------- | ----------------- | ------------------- | -------- | ------ |
| `<Link>` で `/access` → `/about`       | **消える** | `navigate`        | 同一オリジン        | **出る** | 出ない |
| `/events` でキーワードを入力           | **消える** | `navigate`        | 同一オリジン        | 未計測   | 出ない |
| （対照）ビルドID同一のまま `<Link>`    | 残る       | —                 | —                   | 出ない   | —      |

修正後のビルドでは、リロードすると従来どおり再生されること、遷移先の入場要素が待たされず
`opacity: 1` で表示されていることも確かめた。

## 対策: サイト内から来たフルロードを判定して、オープナーを走らせない

フルロード自体は Next.js として正しい挙動なので止めない。止めるのは「入口の演出が流れること」だけである。

判定は `src/lib/motion.ts` の `isInSiteArrival()` で、次の両方を満たすときに真になる。

- `PerformanceNavigationTiming.type` が `navigate` または `back_forward`
- `document.referrer` のオリジンが `location.origin` と同じ

| 入り方                                   | 再生   |
| ---------------------------------------- | ------ |
| URL直打ち・ブックマーク（referrer が空） | する   |
| 外部サイト・別オリジンからのリンク       | する   |
| リロード（`reload`）                     | する   |
| サイト内の遷移から落ちたフルロード       | しない |
| サイト内のリンクを新しいタブで開いた     | しない |

リロードは、referrer が同一オリジンのまま残っていても**利用者の明示的な操作**なので再生する。
Referrer-Policy ヘッダは設定していない（ブラウザ既定の `strict-origin-when-cross-origin`）ため、
同一オリジンの referrer は欠けない。**Referrer-Policy を `no-referrer` などへ変えるとこの判定は常に偽になり、
フルロードのたびにオープナーが戻る。**

### 判定を `willRunOpener()` に入れる理由

`willRunOpener()` は `OpenerLoader` のロード条件と、各ページの入場が使う `shouldWaitForOpener()` が
共有する述語である。`OpenerLoader` 側だけで判定すると、オープナーは出ないのに
Hero / About / Access / Special の入場が `opener-done` を待ち、`OPENER_FAILSAFE_MS` まで止まる。

## 再発防止装置

| 装置                                | 確かめること                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `src/lib/motion.test.ts`            | `isInSiteArrival()` の入力と答えの表                                             |
| `e2e/opener/in-site-reload.spec.ts` | 直接アクセス＝再生 / `location.href` の同一オリジン遷移＝非再生 / リロード＝再生 |

E2E はビルドIDの不一致そのものを作れない（dev サーバのビルドIDは固定）。Next.js のフォールバックと同じく
`location.href` の代入で同一オリジンのフルロードを起こし、遷移種別と referrer が本番の実測と同じ形であることも確かめる。

「再生しない」の判定に、networkidle 時点の DOM や合図フラグを使ってはいけない。オープナーは約1.6秒で消え、
合図は mount の0.8秒後に撃たれるため、走ったのに見えない瞬間がある。退行を注入したところ、
`[data-opener-active]` の検査は素通りした。`addInitScript` の MutationObserver で **mount の事実**を記録して見ている。
