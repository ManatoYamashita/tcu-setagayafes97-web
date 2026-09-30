# コンテンツ反映の仕組み（オンデマンド再検証）

microCMS の入稿を本番へ反映させる経路と、その設定をまとめる。
**検証の手順と障害切り分けは [content-revalidation-ops.md](./content-revalidation-ops.md)** にある。

- 実装: [`src/app/api/revalidate/route.ts`](../../src/app/api/revalidate/route.ts)
- 対応表: [`src/lib/revalidate-targets.ts`](../../src/lib/revalidate-targets.ts)
- 経緯: [Issue #141](https://github.com/ManatoYamashita/tcu-setagayafes97-web/issues/141)

## 二段構え

| 系統     | 手段                                                           | 反映までの時間               |
| -------- | -------------------------------------------------------------- | ---------------------------- |
| **主系** | microCMS Webhook → `POST /api/revalidate` → `revalidatePath()` | 十数秒（実測10〜15秒）       |
| **保険** | microCMS を読むページとサイトマップの `revalidate = 600`       | 10分経過後のアクセスで再生成 |

**microCMS の Webhook は失敗しても再送されない。** 通知が届かなかった場合に永久に古いままにならないよう、
時間ベース ISR は削除せず残してある。Webhook を入れたからといって `revalidate` 宣言を消してはいけない。

### 導入前の状態（2026-08-30 実測）

```
$ curl -sI https://setagayafes.org/ | grep -iE '^(age|x-vercel-cache)'
age: 4104
x-vercel-cache: STALE
```

時間ベース ISR は stale-while-revalidate なので、実効遅延は
「`revalidate` の経過 **＋ 誰かが1回アクセスすること**」。期限切れ後の最初の訪問者は古い画面を受け取り、
再生成に成功した後の訪問から新しい内容が出る。10分は厳密な反映期限ではない。

Webhook 経由の再検証はこれと挙動が違う。**プロファイル無しの `revalidatePath()` は即時失効**であり、
キャッシュ読み取りは SWR ではなくハードミスになる。**発火後の最初の訪問者から新しい内容が出る。**
ローカルの本番ビルドで実測済み（[content-revalidation-ops.md](./content-revalidation-ops.md) の「ローカル」）。

> `revalidateTag(tag, "max")` のようにプロファイルを渡すと SWR 挙動に戻る。
> 将来タグ方式へ移行する場合はここを取り違えないこと。

## 下書きと公開状態

microCMS の「下書き中」と「公開中かつ下書き中」は異なる。前者は通常の API で 404 となるため、
Webhook または時間ベース ISR による再検証後、公開ページから消える。一方、後者は公開版を API が
引き続き返す。編集内容を下書き保存しただけでは公開版を非公開にできず、キャッシュを消しても公開版は残る。
非公開にするには microCMS で公開終了にするか、公開中のコンテンツを下書き状態へ変更する。

下書きコンテンツの全取得権限を持つ API キーや `draftKey` を使う場合は通常の挙動と異なるため、
本番の API キー権限も確認する。公開終了・削除の Webhook 通知タイミングは既定で OFF なので、
それらが ON か実行履歴で確認する。

## 再検証の仕組み — `revalidatePath` はパスの API ではない

Next.js は各キャッシュエントリに `_N_T_` 接頭辞の暗黙タグを付けて保存し、
`revalidatePath(path, type)` はそこから組み立てたタグ1つを失効させる。
実際の値はビルド成果物 `.next/server/app/**/*.meta` の `x-next-cache-tags` に入っている。

この性質から、次の3つが**エラーにならず静かに何もしない**。

| 書き方                                   | 生成されるタグ           | 結果                                                       |
| ---------------------------------------- | ------------------------ | ---------------------------------------------------------- |
| `revalidatePath("/about")`               | `_N_T_/about`            | **no-op。** 実体は `/ja/about` で、タグも `_N_T_/ja/about` |
| `revalidatePath("/events/[id]")`         | （警告のみ）             | **no-op。** 動的ルートには `type` が要る                   |
| `revalidatePath("/sitemap.xml", "page")` | `_N_T_/sitemap.xml/page` | **no-op。** メタデータルートの派生タグは `/route`          |

正しい書き方は `src/lib/revalidate-targets.ts` の表にある。**この表を更新したら必ず実測で裏を取ること。**

```bash
pnpm build
# 対応表の全パスを、実際に記録されたタグと突き合わせる
grep -rho '"x-next-cache-tags":"[^"]*"' .next/server/app --include=*.meta | tr ',' '\n' | sort -u
```

> 公開フラグが `false` の間は `generateStaticParams()` が空を返し、
> `/events/[id]` `/info/[id]` のページが1枚も生成されない＝タグも記録されない。
> 動的ルートを検証するときは `NEXT_PUBLIC_EVENTS_VISIBLE=true NEXT_PUBLIC_NEWS_VISIBLE=true pnpm build` で確認する。

## microCMS 側の設定手順

> [!IMPORTANT]
> **Vercel への環境変数登録を先に済ませること。** 順序を逆にすると、シークレット未設定の間の入稿が
> 500 で拒否され、再送もされないまま静かに失われる。

1. シークレットを生成する

   ```bash
   openssl rand -hex 32
   ```

2. Vercel の `Settings > Environment Variables` に `MICROCMS_WEBHOOK_SECRET` を登録する
   （**Production と Preview の両方**）

3. microCMS 管理画面で `news` / `events` / `informations` の **3 API それぞれに**
   Webhook を追加する（Webhook は API ごとの設定で、1つで3 API を賄うことはできない）

   `https://setagayafes97.microcms.io/apis/{endpoint}/settings/webhook` → 「追加」→「カスタム通知」

   | 項目                       | 値                                       |
   | -------------------------- | ---------------------------------------- |
   | Webhook の名前             | `Vercel 再検証` など任意                 |
   | URL                        | `https://setagayafes.org/api/revalidate` |
   | シークレット               | 手順1で生成した値                        |
   | カスタムリクエストヘッダー | 不要（署名検証を採用しているため）       |

4. **通知タイミングを設定する。既定のままでは不十分。**

   | カテゴリ                                | 設定    | 理由                                               |
   | --------------------------------------- | ------- | -------------------------------------------------- |
   | コンテンツの公開時・更新時（7項目）     | ✅ ON   | 既定で ON。**予約設定による公開もこの7項目に含む** |
   | コンテンツの公開終了時（5項目）         | ✅ ON   | **既定 OFF。** 非公開化の反映に必須                |
   | 公開中コンテンツの削除時（2項目）       | ✅ ON   | **既定 OFF。**「消したのに本番に残る」の解消に必須 |
   | 公開終了コンテンツの削除時（2項目）     | ✅ ON   | **既定 OFF**                                       |
   | コンテンツの下書き保存時                | ❌ OFF  | 下書きは本番に出ない。執筆中に無駄な発火をする     |
   | 下書きコンテンツの削除時 / 下書き破棄時 | ❌ OFF  | 同上                                               |
   | APIの設定変更時 / APIの削除時           | ⚠️ 任意 | 運用上ほぼ発生しない                               |

   「並び替え」「コンテンツIDの変更」「公開日時の変更」は一覧の並び順や URL に直結するため**すべて ON**。

   **予約公開（スケジュール）でも Webhook は飛ぶ。** 通知タイミングの3番目
   「コンテンツの公開（予約設定による操作）」がそれで、既定で ON である。
   2026-09-19 に `news` の管理画面で実機確認した（26個のチェックボックスのうち `index 3`）。

   > [!IMPORTANT]
   > **microCMS が予約を実行する時刻そのものには、公式な精度保証が無い。**
   > [Webhook設定のマニュアル](https://document.microcms.io/manual/webhook-setting)にも
   > 遅延の記載は無い。発火してからの経路（[content-revalidation-ops.md](./content-revalidation-ops.md) の「本番（マージ後）」の実測値）は保証できるが、
   > **「12:00ちょうどに出す」を約束する必要がある場合は予約公開に頼らず、
   > その時刻に手で公開すること。**

> [!WARNING]
> **削除系の3カテゴリを ON にし忘れると、Webhook を入れても「削除したのに本番に残る」は直らない。**
> 導入後の検証で必ず削除を試すこと（[content-revalidation-ops.md](./content-revalidation-ops.md) の「本番を汚さない導通確認」）。

## Webhook では解決しないこと

- **公開フラグ `NEXT_PUBLIC_*_VISIBLE` はビルド時に評価される。**
  Webhook では切り替わらない。解禁作業には従来どおり再デプロイが要る（[ci-env.md](./ci-env.md)）。
- `EVENTS_VISIBLE=false` の間は `getEventsList()` が microCMS へ問い合わせず `[]` を返すため、
  再検証しても表示は「準備中」のまま。これは正常な挙動。
- **トップの「おすすめ企画」は再検証のたびに並びが変わる。**
  `getFeaturedEvents()` が毎レンダーでシャッフルする仕様のため（`src/lib/events.ts`）。

## 再生成中に microCMS が失敗したとき

取得関数は 429 / 5xx を投げる（#287）。時間ベース ISR では再生成が失敗して**古いページが残り**、
Webhook 直後は **500 がキャッシュされずに返り**、microCMS が戻った最初のアクセスで正常化する。
以前は両経路とも**正常なページが 404 に置き換わり、回復後も残っていた**（2026-09-30 実測）。
詳細は [microcms-fetch-failures.md](./microcms-fetch-failures.md)。

## microCMS を読むページを増やすとき

`src/lib/revalidate-targets.ts` の対応表を**同じコミットで**更新すること。
漏れてもエラーにはならず、そのページだけ静かに古いまま残る。

ページ本体だけでなく、**そのページが描画する Server Component が読むデータも数える。**
`/` の `SponsorBanner`（`informations`）や `FeaturedEvents`（`events`）がその例で、
ページファイルの import だけを見ていると取りこぼす。

```bash
# microCMS を読むコンポーネントの洗い出し
grep -rn 'from "@/lib/\(events\|news\|informations\)"' src/
```

## 関連ドキュメント

- [docs/dev/content-revalidation-ops.md](./content-revalidation-ops.md) — 検証の手順と障害切り分け
- [docs/dev/microcms.md](./microcms.md) — microCMS API の制約と実装パターン
- [docs/dev/microcms-fetch-failures.md](./microcms-fetch-failures.md) — 取得に失敗したときの扱い（#287）
- [docs/dev/ci-env.md](./ci-env.md) — 環境変数の登録先と Vercel の本番反映
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — プロジェクト全体のガイド

---

**最終更新日**: 2026-09-30（検証と障害切り分けを content-revalidation-ops.md へ分割）
