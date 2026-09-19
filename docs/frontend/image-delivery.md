# 画像配信の経路

画像の変換を **どこにやらせるか** を決めているドキュメント。
Lighthouse 基準値や個別の最適化手法は [`performance.md`](./performance.md) を参照。

## 経路は2本ある

| 画像の出どころ                          | 変換する場所                     | 枚数 | Vercel の変換枠 |
| --------------------------------------- | -------------------------------- | ---- | --------------- |
| microCMS（`images.microcms-assets.io`） | imgix（microCMS のメディア配信） | 93+  | **使わない**    |
| `public/` 配下の静的画像                | Vercel の Image Optimization     | 22   | 使う            |

振り分けは [`src/lib/image-loader.ts`](../../src/lib/image-loader.ts) の `appImageLoader` が行う。

> [!IMPORTANT]
> **microCMS 由来の画像を描く `<Image>` には `loader={appImageLoader}` を渡すこと。**
> 渡し忘れた画像は Vercel の変換枠を消費する。現在の対象は12ファイル14箇所。
> 渡し忘れは `pnpm build` の末尾で走るガードが落とす（後述）。

同じ `<Image>` に microCMS の画像とローカルのフォールバック画像の両方が入りうるため
（`FeaturedCarousel` と `NewsCard` がその例）、**ローダーは両方を扱う。**
ローカル画像が来た場合は `/_next/image` へ回すので、既定と同じ挙動になる。

### なぜ `loaderFile`（全体適用）ではないのか

`next.config.ts` の `images.loaderFile` に登録すれば、すべての `next/image` が自動的に
ローダーを通り、渡し忘れは構造的に起きない。**それでも採用していない。**

**`images.loader: "custom"` を設定すると `/_next/image` エンドポイントが 404 になるためである。**
2026-09-19 に実測した。

| `next.config.ts` の設定 | `/_next/image?url=%2Fimages%2Fbrand%2Flogo.webp&w=64&q=60` |
| ----------------------- | ---------------------------------------------------------- |
| `loaderFile` あり       | **404**（`dev` / `start` とも）                            |
| `loaderFile` なし       | `200` / `image/jpeg` / 622B                                |

つまり全体適用にすると、**imgix を使えない `public/` の22枚が巻き添えで最適化を失う。**
渡し忘れのリスクは機械で拾えるが、失った最適化は拾えない。

なお `loader` prop は **Server Component から渡しても動く**。`getImgProps` がサーバー側で
実行されるため、`Functions cannot be passed directly to Client Components` にはならない
（`NewsCard` で実測）。対象12ファイルのうち6つは Server Component である。

## なぜ分けたか（#237）

2026-09-19、本番の企画サムネイルが一部だけ表示されなくなった。原因は
**Vercel Free Plan の変換枠（Image Transformations）の枯渇**である。

```
$ curl -sI 'https://setagayafes.org/_next/image?url=<microCMS画像>&w=384&q=75'
HTTP/2 402
x-vercel-error: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
```

### 「一部だけ」になる理由を理解しておくこと

課金単位は画像1枚ではなく **変換1回**、すなわち `(元画像, 幅, 品質, フォーマット)` の
組み合わせ1つである。そして変換済みの結果は CDN に残る。したがって枯渇後はこうなる。

- 枯渇**前**に変換済み → CDN から `200` で配信され、いまも表示される
- 未変換の組み合わせ → `402` で壊れる

同一ファイルでも幅で生死が分かれる。`favicon-outline.webp` の実測（2026-09-19）。

```
200  w=320 / 384 / 420 / 512 / 640 / 750 / 1080
402  w=256 / 1200 / 1920 / 2048 / 3840
```

**画面幅と DPR で表示される画像が入れ替わるため、「ときどき一部が壊れる」という
再現しにくい形で表面化する。** 枯渇を疑う前に画像やコードを探すと何も見つからない。
`x-vercel-error` ヘッダを最初に見ること。

### 何が枠を食っていたか

`sizes` に固定 px を書いても、srcset には `deviceSizes` + `imageSizes` の**全候補**が並ぶ。
当時は18本あった。これに AVIF / WebP の2フォーマットが掛かる。
microCMS の企画サムネイルだけで93枚あり、News と協賛ロゴが上乗せされる。
一方 `public/` の静的画像は22枚しかない。**消費の主体は microCMS 側だった。**

## imgix 側のパラメータ

ローダーが付けるのは `w` / `q` / `fm=webp` / `auto=compress` / `fit=max` の5つ。
いずれも実測で決めている（対象は `写真部.jpg` 1081x1081 / 原寸 70,481B、`w=340`）。

### `auto=format` は使えない

imgix の `auto=format` は Accept ヘッダを見て AVIF / WebP を出し分ける機能だが、
**microCMS の前段にある CloudFront が Accept を転送しないため機能しない。**
`Accept: image/avif,image/webp,...` を明示しても応答は `image/jpeg` のままで、
`Vary` ヘッダも返らなかった。

| 指定                         | 応答         | サイズ  |
| ---------------------------- | ------------ | ------- |
| `auto=format`（Accept 明示） | `image/jpeg` | 15,772B |
| `fm=webp&q=75`               | `image/webp` | 11,170B |
| `fm=webp&q=75&auto=compress` | `image/webp` | 8,506B  |
| `fm=avif&q=75&auto=compress` | `image/avif` | 5,651B  |

出し分けができない以上フォーマットは固定するしかない。**WebP を選んでいる。**
サポート下限（iOS Safari 16.4 / Chrome 111 / Firefox 128）はいずれも AVIF にも対応して
いるが、`<picture>` によるフォールバックを持てない固定指定では、画像プロキシや
古い WebView のような想定外の環境で**表示自体を失う**損失のほうが大きい。

> [!NOTE]
> AVIF へ上げれば1枚あたり 2.9KB 縮む（8,506B → 5,651B）。転送量が問題になった場合の
> 選択肢として残しておくが、**下げ幅と引き換えに失うのはフォールバックである。**
> 切り替えるなら実機での確認を伴うこと。

### `fit=max` は必須

imgix は既定で**拡大もする**。入稿画像の寸法は入稿者任せで、`deviceSizes` の上端（3840）に
届かないものが大半である。

| 指定                  | 実寸      | サイズ  |
| --------------------- | --------- | ------- |
| `w=1920&fm=webp&q=75` | 1920x1920 | 65,952B |
| 同上 + `fit=max`      | 1081x1081 | 35,886B |

`fit=max` が無いと、劣化した水増し画像を倍近い転送量で配ることになる。

## 幅の候補（`deviceSizes` / `imageSizes`）

**ここへ幅を足す行為は、静的画像の変換数を掛け算で増やす。** 追加するときは用途を PR に書くこと。

#237 で 512（`deviceSizes`）と 320（`imageSizes`）を落とした。隣接する 640 / 384 との差が
小さく、丸め先との差はそれぞれ 25% / 20% にとどまるため。
**2048 と 3840 は残している。** `PageHero` が `100vw` を使っており、4K・Retina 環境で
目に見えて甘くなるからである。

`qualities: [40, 60, 75]` はそのまま。40 は `HeroSection`、60 は Header / Footer / Opener、
75 がその他という使い分けが既にある。

## 再発防止装置は2つあり、射程が違う

| 装置                                                | 走る場所            | 守るもの                           |
| --------------------------------------------------- | ------------------- | ---------------------------------- |
| `src/lib/image-loader.test.ts`                      | `pnpm test`         | ローダー関数の**契約**             |
| `scripts/assert-remote-images-bypass-optimizer.mjs` | `pnpm build` の末尾 | ローダーが**実際に効いている**こと |

**ユニットテストだけでは足りない。** 次の3つはローダー関数を一切変えないため、
テストは緑のまま素通りする。

1. 新しく `<Image>` を書いた人が `loader` prop を渡し忘れる（最も起こりやすい）
2. 既存の `<Image>` から `loader` prop が消える
3. 新しいリモート画像ホストを増やし、ローダーの分岐に入れ忘れる

いずれもビルドは通り、画面も（枠が残っているうちは）正常に見える。生成物を読む以外に
確かめる方法が無い。ガードは事前描画された全HTMLを走査し、
`/_next/image?url=https%3A%2F%2F`（リモート画像を Vercel の最適化へ渡すURL）が
1本も無いことを検査する。**ホストを microCMS に限定していないのは、将来ホストを
増やしたときにも漏れを捕まえるためである。**

### 検証の記録（2026-09-19）

- 正常時: `[assert-remote-images-bypass-optimizer] OK`
- ローダーを外して再ビルド: **109ファイルで違反を検出し exit 1**
- 生成された imgix URL を実際に取得: すべて `200` / `image/webp`

### ガードが空振りする条件

公開フラグがすべて false だと microCMS の画像がHTMLに出ず、検査対象が消える。
その場合ガードは `NOTE:` を出して成功扱いにする（入稿0件や取得失敗と区別が付かないため
合否条件にしない）。**ログに `NOTE` が出ているときは、検査が効いていないと考えること。**

## 残っている制約

- Vercel の変換枠を使うのは `public/` の静的画像22枚だけになった。枠を再び使い切るには
  相当な追加が要る
- **枠のリセット時期は Vercel ダッシュボードの Usage でしか分からない。** 402 が出たら
  まずそこを見る
- imgix 側には変換数の課金が無く、配信も microCMS の CDN から出る。
  つまり **Vercel の帯域（100GB/月）も消費しない**

## 関連

- [`performance.md`](./performance.md) - Lighthouse 基準値とフロントエンド性能ルール
- [`../dev/microcms.md`](../dev/microcms.md) - microCMS API の制約と実装パターン
