# 画像配信の経路

画像の変換を **どこにやらせるか** を決めているドキュメント。
Lighthouse 基準値や個別の最適化手法は [`performance.md`](./performance.md) を参照。

## 結論から

**Vercel の Image Optimization は一切使っていない。**

| 画像の出どころ                          | 変換する場所             | 枚数 |
| --------------------------------------- | ------------------------ | ---- |
| microCMS（`images.microcms-assets.io`） | imgix（microCMS の配信） | 93+  |
| `public/` 配下の静的画像                | **変換しない**（原寸）   | 9    |

すべての画像は [`src/components/ui/AppImage.tsx`](../../src/components/ui/AppImage.tsx) の
`AppImage` で描く。出どころの判定は実行時に `src` を見て行うため、呼び出し側が区別する
必要は無い。

> [!IMPORTANT]
> **`next/image` を直接 import してはいけない。** `eslint.config.mjs` の
> `no-restricted-imports` が error で止める（例外は `AppImage.tsx` のみ）。

## なぜこうなったか（#237）

2026-09-19、本番の企画サムネイルが一部だけ表示されなくなった。原因は
**Vercel Free Plan の変換枠（Hobby は月5,000変換）の枯渇**である。

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

同一ファイルでも幅で生死が分かれる。`favicon-outline.webp` の実測。

```
200  w=320 / 384 / 420 / 512 / 640 / 750 / 1080
402  w=256 / 1200 / 1920 / 2048 / 3840
```

**画面幅と DPR で表示される画像が入れ替わるため、「ときどき一部が壊れる」という
再現しにくい形で表面化する。** 枯渇を疑う前に画像やコードを探すと何も見つからない。
**`x-vercel-error` ヘッダを最初に見ること。**

### 何が枠を食っていたか

`sizes` に固定 px を書いても、srcset には `deviceSizes` + `imageSizes` の**全候補**が並ぶ。
当時は18本あった。これに AVIF / WebP の2フォーマットが掛かる。
microCMS の企画サムネイルだけで93枚あり、News と協賛ロゴが上乗せされていた。

## imgix 側のパラメータ

`AppImage` が microCMS の画像へ付けるのは `w` / `q` / `fm=webp` / `auto=compress` /
`fit=max` の5つ。いずれも実測で決めている（`写真部.jpg` 1081x1081 / 原寸 70,481B、`w=340`）。

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

### `fit=max` は必須

imgix は既定で**拡大もする**。入稿画像の寸法は入稿者任せで、`deviceSizes` の上端（3840）に
届かないものが大半である。

| 指定                  | 実寸      | サイズ  |
| --------------------- | --------- | ------- |
| `w=1920&fm=webp&q=75` | 1920x1920 | 65,952B |
| 同上 + `fit=max`      | 1081x1081 | 35,886B |

`fit=max` が無いと、劣化した水増し画像を倍近い転送量で配ることになる。

## 静的画像を `unoptimized` にした理由

`/_next/image` へ回しても**枠の枯渇からは逃れられない。** Preview で実測した結果が次である。
**ブラウザが実際に選ぶ帯がすべて 402 で、ヘッダーロゴもヒーロー画像も壊れていた**
（`w=3840` だけ 200 なのは、検証のために叩いて変換させてしまったため）。

```
画像                                     w=640   w=828  w=1080  w=1920  w=3840
/images/brand/logo.webp q=60               402     402     402     402     200
/images/photos/tcu-7.webp q=75             402     402     402     402     200
/materials/geers.webp q=75                 402     402     402     402     402
```

枠を一切使わない状態にすることを選んだ。**代償として静的画像は原寸で配信される**
（9種・合計 617KB）。表示寸法に対して過大なものがあるため、事前縮小は別途行う。

| 画像                                    | 原寸      | サイズ   |
| --------------------------------------- | --------- | -------- |
| `images/photos/tcu-7.webp`              | 1100x620  | 202,386B |
| `images/special/mon7a.webp`             | 1280x1280 | 136,784B |
| `images/brand/favicon-outline.webp`     | 500x500   | 76,520B  |
| `images/brand/logo-white.webp`          | 1000x400  | 54,688B  |
| `images/photos/setagayafe97-image.webp` | 1024x1024 | 53,118B  |
| `images/brand/logo.webp`                | 1000x400  | 51,520B  |
| `materials/geers.webp`                  | 500x500   | 28,184B  |
| `materials/geer1.webp`                  | 500x500   | 19,694B  |
| `images/special/mon7a-logo.webp`        | 1524x405  | 9,296B   |

## なぜ `AppImage` というラッパーなのか

適用方式は2つ試して、いずれも実測で否定している。

| 方式                                        | 結果                                                                                                                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.ts` の `loaderFile` で全体適用 | **不可。** `images.loader: "custom"` は `/_next/image` を 404 にする（`dev` / `start` 双方で実測。外すと同じURLが 200）。当時は静的画像をそこへ回す設計だったため巻き添えになった |
| `<Image loader={fn}>` に関数を直接渡す      | **不可。** Server Component からの受け渡しは prerender 時に `Functions cannot be passed directly to Client Components` で落ちる（`/about/sponsors` で実測）                       |

`AppImage` が `"use client"` を持つことで、呼び出し側は Server / Client を問わなくなる。
**この失敗は開発サーバーでは顕在化せず、`next build` で初めて出る。**

## 幅の候補（`deviceSizes` / `imageSizes`）

静的画像を `unoptimized` にした現在、この設定が効く場所は無い。**将来 Vercel の
最適化を再び使うなら、ここへ幅を足す行為が変換数を掛け算で増やすことを思い出すこと。**

#237 で 512（`deviceSizes`）と 320（`imageSizes`）を落とした。隣接する 640 / 384 との差が
小さく、丸め先との差はそれぞれ 25% / 20% にとどまるため。2048 と 3840 は残している。

## 再発防止装置は3つあり、射程が違う

| 装置                                                | 走る場所            | 守るもの                           |
| --------------------------------------------------- | ------------------- | ---------------------------------- |
| `eslint.config.mjs` の `no-restricted-imports`      | `pnpm lint`         | `next/image` の直接 import         |
| `src/lib/image-loader.test.ts`                      | `pnpm test`         | ローダー関数の**契約**             |
| `scripts/assert-remote-images-bypass-optimizer.mjs` | `pnpm build` の末尾 | ローダーが**実際に効いている**こと |

**ユニットテストだけでは足りない。** `AppImage` から `loader` / `unoptimized` の指定が
外れても、ローダー関数は無傷なのでテストは緑のまま素通りする。ビルドは通り、枠が
残っているうちは画面も正常に見える。生成物を読む以外に判定する方法が無い。

ガードは事前描画された全HTMLを走査し、`/_next/image?url=` が **1本も**無いことを検査する。
リモートに限定していないのは、静的画像を回しても枠の枯渇から逃れられないためである。

### 検証の記録（2026-09-19）

- 正常時: `OK`。生成物の `/_next/image` は **0件**、imgix URL は 1,514 種
- HTML へローカル画像の `/_next/image` を1本注入 → **検出して exit 1**
- `Header.tsx` で `next/image` を直接 import → **ESLint が error で停止**
- ローカル本番サーバーで主要6ページの画像を取得 → **54枚すべて 200**

### ガードが空振りする条件

公開フラグがすべて false だと microCMS の画像がHTMLに出ず、imgix 側の検査対象が消える。
その場合ガードは `NOTE:` を出して成功扱いにする（入稿0件や取得失敗と区別が付かないため
合否条件にしない）。**ログに `NOTE` が出ているときは、検査が効いていないと考えること。**

## 残っている制約

- **枠のリセット時期は Vercel ダッシュボードの Usage でしか分からない。** ただし本対応後は
  枠を使わないため、リセットを待つ必要も無い
- imgix 側には変換数の課金が無く、配信も microCMS の CDN から出る。
  つまり **Vercel の帯域（100GB/月）も消費しない**
- 静的画像9種は原寸配信のまま。表示寸法への事前縮小は未了

## 関連

- [`performance.md`](./performance.md) - Lighthouse 基準値とフロントエンド性能ルール
- [`../dev/microcms.md`](../dev/microcms.md) - microCMS API の制約と実装パターン
