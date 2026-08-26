# フロントエンド性能

## Lighthouse 基準値

トップページの性能改善では、同じ URL・同じ form factor の結果を比較する。
スコアは実行ごとに変動するため、スコアだけでなく LCP の内訳と転送量も記録する。

2026-08-26 10:38 JST に PageSpeed Insights で取得した desktop の基準値:

| 指標        | 基準値 |
| ----------- | -----: |
| Performance |     69 |
| FCP         | 0.4 秒 |
| LCP         | 4.7 秒 |
| TBT         |  10 ms |
| CLS         |  0.001 |
| Speed Index | 3.7 秒 |

LCP 要素はトップページ中央の `favicon-outline.webp`。内訳は TTFB 10 ms、
リソース読み込み待ち 190 ms、読み込み 410 ms、要素の描画遅延 2,020 ms だった。
ネットワークより、初期状態を `opacity: 0` にしてオープナー完了を待つ実装の影響が大きい。

## 2026-08-26 改善後の検証

Lighthouse 13.4.1 の desktop preset をローカル本番ビルドへ3回実行した中央値:

| 指標           |                    改善後 |
| -------------- | ------------------------: |
| Performance    |                        95 |
| Accessibility  |                       100 |
| Best Practices |                       100 |
| SEO            |                       100 |
| FCP            |                   0.53 秒 |
| LCP            |                   1.17 秒 |
| TBT            |                      0 ms |
| CLS            |                         0 |
| Speed Index    |                   1.60 秒 |
| 総転送量       |                約 735 KiB |
| Webフォント    | 13リクエスト / 約 183 KiB |

同じ CLI・端末で未反映の本番 URL を測ると、Performance 56、総転送量 5,895 KiB、
Webフォント 250リクエスト / 約 4,597 KiB だった。日本語フォントの全分割ファイルを
preload していたことが総転送量の主因で、`preload: false` と可変フォント化により解消した。

ローカル環境には microCMS の認証情報を置いていないため、協賛ロゴ・ニュースを含む本番同等の
再計測ではない。スコアは改善傾向の確認値として扱い、本番反映後に PageSpeed Insights を再実行する。

## 2026-08-26 モバイル残存候補への対応

PR #102 の本番反映後に PageSpeed Insights の mobile preset を取得したところ、次の状態だった。

| 指標           | 本番計測値 |
| -------------- | ---------: |
| Performance    |         64 |
| Accessibility  |         93 |
| Best Practices |        100 |
| SEO            |        100 |
| FCP            |     3.6 秒 |
| LCP            |     5.8 秒 |
| TBT            |     120 ms |
| CLS            |          0 |
| Speed Index    |     7.6 秒 |

LCP は `favicon-outline.webp` で、要素の描画遅延が約 1.78 秒だった。レンダリングを
ブロックするCSS（推定 2,440 ms）、未使用CSS（推定 97 KiB）、画像配信（推定 39 KiB）も
残っていた。今回の追加対応では、モバイル（767px以下）のオープナーを省略し、オープナー画像を
低優先度の遅延読み込みへ変更した。併せて、閉じたモバイルメニューへ `inert` を付け、CTAの
背景色を `primary-600` へ変更してアクセシビリティ監査の指摘を解消する。

CSS分割・日本語フォントの転送量・GSAP由来の強制リフローは、デザインとサイト全体への影響を
確認しながら別途検討する。企画公開フラグが有効なPreviewでは、モバイルでも装飾用Three.js
チャンクが読み込まれることが分かったため、`FeaturedGearScene` は768px未満で描画を止め、
R3F/Three.jsの初期転送を避ける。

## 2026-08-26 残存候補の次PR

本番反映後の再計測では、レンダリングをブロックするリクエスト（推定 2,500 ms）、画像配信
（推定 33 KiB）、未使用CSS（推定 97 KiB）、未使用JavaScript（推定 22 KiB）、強制リフローが
残った。次のPRでは、次の2点を先に対応する。

- `NEWS_VISIBLE=false` の本番では、ニュースの静的な準備中表示だけをServer Componentで返し、
  GSAP / ScrollTrigger / フィルタのクライアント実装を公開データがある場合だけ読み込む。
- ヒーローの表示幅に合わせて `next/image` の `sizes` を `min(500px, 100vw)` に固定し、
  モバイルで実寸より大きい候補画像を選ばない。装飾用LCP画像の品質も `40` に下げ、輪郭を
  保ったまま転送量を抑える。

ニュースを公開するPreviewでは、インタラクティブな一覧・絞り込み・入場演出が従来どおり動くことを
確認し、本番モバイルではニュース用クライアントチャンクが初期転送されないことを確認する。

## 実装ルール

### LCP 要素

- LCP 候補はサーバーHTMLから可視状態にする。
- オープナーや入場演出の完了を LCP 表示条件にしない。
- `next/image` の `sizes` は実際のブレークポイント別表示幅に合わせる。
- ファーストビューの LCP 画像には高優先度を明示する。

### 動画とアニメーション

- ヘッダーの常設ロゴに動画を自動読み込みしない。ブランド演出はオープナーへ集約する。
- スクロール連動の補間は `transform` / `opacity` を使い、`width` をアニメーションしない。
- オープナーは `window.load` を待たず、ハイドレーション後に開始する。

### 画像

- ローカル画像と許可済みリモート画像は原則 `next/image` を使う。
- 固定表示サイズでも `width` / `height` / `sizes` を明示する。
- microCMS の画像を原寸のままロゴ一覧へ渡さず、表示寸法に応じて最適化する。

### 無限ロゴ列

- `aria-hidden="true"` の複製列にはリンクやボタンを置かない。
- キーボード・支援技術で操作可能なのはアクセシビリティツリーに残す先頭列だけとする。
- ポインター操作は、複製列から非フォーカス要素を通じて先頭列と同じ処理へ委譲してよい。
- 複製画像の `alt` は空にする。

### Webフォント

- `next/font` の変数をルート要素へ付けると、対応するフォントCSSが全ページへ配信される。
- 使用箇所のないフォントは import・変数・CSS utility を残さない。
- 日本語フォントは `unicode-range` ごとの分割ファイルが多いため、原則 `preload: false` とし、
  実際に使う文字範囲だけをブラウザに取得させる。
- 複数ウェイトを使う可変フォントは、静的ウェイトを列挙せず variable font を優先する。
- ブランド上必要なフォントでも、使用ウェイトと preload 対象を最小限にする。

## 検証

1. `pnpm lint`、`pnpm format:check`、`pnpm build` を通す。
2. ローカル本番ビルドを desktop / mobile で表示し、画像寸法・横スクロール・操作性を確認する。
3. `visibilityState` と `framesIn1s` を記録してから、オープナーとスクロール演出を確認する。
4. Lighthouse を同条件で複数回実行し、中央値を比較する。
5. 本番反映後は PageSpeed Insights で LCP 内訳、画像削減量、アクセシビリティ監査を再確認する。

## 関連

- GitHub Issue #101
- [browser-observation-limits.md](./browser-observation-limits.md)
- [agent-browser-workflow.md](./agent-browser-workflow.md)
