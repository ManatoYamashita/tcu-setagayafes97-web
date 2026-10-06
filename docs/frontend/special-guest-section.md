# 著名人企画の告知セクション（SpecialGuestSection）

トップページ（Hero の直下）と `/events` の最下部に置く、著名人企画 LP への導線（#414 / #419）。
実装は `src/components/special/SpecialGuestSection.tsx`、文言と画像は `src/data/special-banner.ts`、
入場モーションは `src/components/special/SpecialGuestMotion.tsx`。
`/events` 冒頭の音楽ポスター風バナーは別物で、[events-special-banner.md](./events-special-banner.md) を参照。

## 構成

歯車の形に切り抜いた写真を左、見出し・本文・チケット・注記・CTA を右に置く。

| 要素        | 中身                                   | 備考                                                                   |
| ----------- | -------------------------------------- | ---------------------------------------------------------------------- |
| 見出し `h2` | 出演者ロゴ（白塗り版）＋右へ伸びる横罫 | ロゴの `alt`（出演者名）が見出しのアクセシブル名。横罫は `aria-hidden` |
| 分類ラベル  | `著名人企画`（縦書き）                 | `writing-mode: vertical-rl`                                            |
| 本文        | 日時・会場（1要素 = 1行）              | `specialBanner.headline`                                               |
| チケット    | 一般・学内生の価格と販売方法（`dl`）   | `specialBanner.tickets`。**券種は必ず両方**                            |
| 注記        | 入場の条件（`ul`、先頭に `※`）         | `specialBanner.notes`                                                  |
| CTA         | `詳しくはこちら →`                     | `/special/[id]` へ                                                     |

画面幅ごとの配置:

- 〜767px: 縦積み。写真（正方形、最大 384px）→ テキスト
- 768px〜: 12列グリッド。写真が左 6列、テキストが右 6列（縦は中央揃え）。
  見出しだけを `-ml-*` で左へ引き出し、写真の右端に寄せる

DOM 順は「見出し → 本文 → チケット → 注記 → CTA → 写真」で固定し、縦積みのときだけ写真に
`order-first` を付けて見た目を入れ替える。DOM を並べ替えると h2 より先に写真が読み上げられる。

## 判断の記録

### チケットは両券種を並べる

#414 で一度外したが、#419 で「日時・会場の下にもっと情報を」という要望を受けて戻した。
LP のチケット表と注意事項（microCMS の `special.tickets` / `special.notices`）を要約したもので、
LP 側を変えたら `special-banner.ts` も追随させる。**片方の券種だけを載せてはいけない**
（一般来場者が学内の手売りを自分向けと誤読する。`special-banner.ts` 冒頭のコメント）。

375px の `/events`（白いシートの内側で約 280px）に収まるよう、販売方法は「イープラスにて販売」
のように短く書く。「プレイガイド【イープラス】にて販売」は語の途中で折り返した（2026-10-06 実測）。

### 写真は歯車の形で切り抜く

`gearClipPath()`（`src/lib/gear-profile.ts`）が CSS `clip-path: polygon()` の値を返す。
歯形はトップの 3D 歯車（`src/components/three/gear-geometry.ts`）と同じ定義を共有しており、
歯数や比率を変えると両方が変わる。切り抜きには中心穴を付けない（被写体の顔が抜ける）。
回転 0 で歯が真上・真横を向くよう、1つ目の歯の中心角を打ち消している。

背景色で塗る方式ではなく clip-path で透かすため、トップ（`.hero-about-bg` のグラデーション）でも
`/events`（白いシート）でも同じ形になる。#414 の「右上の四分円の欠け」（mask）はこれに置き換えた。

### 歯車のリビール

画面に入ると、歯車の窓が中心の1点から 1.1 秒で回転（-90° → 0°）しながら広がり、写真が現れる。
回すのは窓だけで写真は回さない。実装は `SpecialGuestMotion.tsx` の `useGearReveal`。

- SSR の HTML は完成形の clip-path を持つ。JS が窓を閉じるのは effect の中なので、
  JS が無い・失敗したときは写真がそのまま見える
- `prefers-reduced-motion: reduce` では何もしない（完成形のまま）。この判定より前で gsap に触れない
- `gsap/ScrollTrigger` のチャンク取得に失敗したら、閉じた窓を完成形へ戻す
- clip-path の点の数は scale・回転によらず一定（32点）なので、毎フレーム文字列を差し替えても形が飛ばない。
  SVG の `<clipPath>` を transform で動かす方式は、Safari で再描画が追従しないことがあるため使わない

### ロゴは2種類持つ

| ファイル                                       | 中身                     | 使う場所                                        |
| ---------------------------------------------- | ------------------------ | ----------------------------------------------- |
| `public/images/special/mon7a-logo.avif`        | 黒の線画、内側は透過     | `/events` 冒頭の `SpecialEventBanner`（白抜き） |
| `public/images/special/mon7a-logo-filled.avif` | 黒縁の内側を白で塗った版 | このセクションの見出し                          |

白塗り版は、原画（`assets/source/images/special/mon7a-logo.webp`）の外周から透明な画素を
塗りつぶし探索し、届かなかった（黒縁に囲まれた）画素を白の上に合成して作った。白い紙に置いたときの
見た目と一致する。`SpecialEventBanner` は `brightness-0 invert` で白抜きにしているため、
白塗り版を渡すと文字が白い塊になって読めない。取り違えないこと。

### 会場名を語の途中で折り返さない

会場名「世田谷キャンパス第1アリーナ」（14字）は、`text-xl` のままだと 768px と 1024px で
「アリー｜ナ」と折り返した（2026-10-06 実測）。列幅に合わせて md `text-base` / lg `text-lg` /
xl `text-xl` へ段階的に詰めて1行に収めている。**文言を長くしたら 768px と 1024px で確認すること。**

### 参考レイアウトのページャーは置かない

参考画像にはスライドのページャー（01 02 …）があるが、企画が1件しかなく押す先が無いため省いた。

## `/events` での遅延描画

`/events` では `.deferred-section--special` が `content-visibility: auto` の推定高さを持つ。
縦積みと横並びで高さが大きく変わり、xl 以上は写真が列幅とともに伸びるため、推定高さを base / md / xl で
分けている（実測値は `globals.css` のコメント）。レイアウトや文言を変えたら `/events` で実測し直すこと。
推定が実寸から離れると、入場モーションの ScrollTrigger が画面外の推定値でトリガー位置を測る。
