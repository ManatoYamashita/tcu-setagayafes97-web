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

## 2026-08-26 残存CSS・強制リフロー（PR #105）

PR #104 の本番再計測で残った未使用CSS（推定 97 KiB）と強制リフローのうち、初期描画の仕事量を
PR #105で先行して削減した。

- `NewsUnavailable`、協賛バナー、企画セクションへ `content-visibility: auto` と
  `contain-intrinsic-size` を適用し、初期ビューポート外のスタイル計算・レイアウト・描画を遅延する。
  企画公開時も同じCSSルールを使い、Three.jsキャンバスの初期ペイントをスクロール位置に合わせる。
- `LogoLoop` の寸法更新を読み取りフェーズと書き込みフェーズに分ける。垂直方向で高さを
  inline styleへ書き込んだ直後に `clientHeight` を読む順序をなくし、ResizeObserver由来の
  同期レイアウトを避ける。

`content-visibility` は初期レンダリングの仕事量を減らすもので、グローバルCSSの転送バイト数そのものを
削減する機能ではない。未使用CSS 97 KiB、レンダリングをブロックするリクエスト、WebフォントCSSの
配信量は本番PageSpeed Insightsで再計測し、必要ならCSS分割またはフォント構成を本PRで検討する。

ローカル本番ビルドと `agent-browser` で、390x844 / 1440x900 の表示、対象セクションのスクロール後の
表示、横溢れ、コンソールエラーを確認する。PageSpeed Insightsのスコア改善は本番反映後の同条件計測で
判定する。

## 2026-08-26 未使用CSS・強制リフロー・render-blocking対応PR

PR #105 の本番 mobile 計測（Performance 81、FCP 2.1 秒、LCP 4.7 秒）では、未使用CSS 97 KiB、
レンダリングをブロックするリクエストの削減余地 1,750 ms、強制リフロー 96 ms が残った。
内訳は、初期HTMLに一括で含めていた Kaisei Opti / Dela Gothic One のフォントCSSと、
スクロール前の ABOUT / NEWS アニメーションである。

本性能改善PRでは次を行う。

- Kaisei Opti / Dela Gothic One をルートレイアウトから外し、クライアント側の遅延チャンクで適用する。
  初期HTMLのスタイルシートを Noto Sans JP・共通CSS・ロゴ列CSSに限定し、フォントの見た目は維持する。
- ABOUT / NEWS の ScrollTrigger を IntersectionObserver で対象セクションの接近時だけ初期化する。
  `gsap/ScrollTrigger` の登録とレイアウト読み取りを初期表示から外し、スクロール時の演出は維持する。
- `prefers-reduced-motion` と IntersectionObserver 非対応時は従来どおり安全なフォールバックを使う。

ローカル本番ビルドではトップページの初期HTMLに含まれるCSSリンクが5本から3本へ減り、Kaisei / Dela の
フォントCSS（約281 KiB、非圧縮）は遅延チャンクへ移動した。390x844 の実機相当ブラウザでフォント適用、
ABOUT / NEWS のスクロール演出、横溢れ、コンソールエラーを再確認する。マージ後は同一URL・mobile presetで
PageSpeed Insightsを再計測し、未使用CSS、render-blocking、強制リフローの内訳を比較する。

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
- 初期表示に不要な装飾フォントは、遅延チャンクで変数を付け、初期HTMLのrender-blocking CSSに含めない。
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

## 2026-08-26 フォントCSSの分割・削減

PR #106 の本番 mobile 計測では、初期HTMLのCSSリンクは3本に減った一方、遅延後に読み込まれる
フォントCSSが未使用CSSとして約97 KiB残った。ブラウザ実測で `font-sans` はシステムフォントへ
解決しており、Noto Sans JP の `@font-face`（転送約31 KiB）は使用されていなかった。

本PRでは次を行う。

- 未使用だった Noto Sans JP の `next/font` import と変数を削除し、`font-sans` を明示的なシステム
  フォントスタックへ戻す。
- Dela Gothic One はホームの `HeroSection` だけで遅延ロードし、他ページへCSSを配信しない。
- Kaisei Opti はホームの初期ビューポートでは読み込まず、非ホームではハイドレーション後、ホームでは
  ABOUT / NEWS がビューポートへ近づいた時点で一度だけ読み込む。

これによりホーム初期表示からNoto Sans JPとKaisei OptiのフォントCSSを外し、ブランド見出しは
対象ページ・対象セクションで適用する。初期の見た目をシステムフォントで崩さないこと、ABOUT / NEWS
のスクロール演出とフォント適用が競合しないことをブラウザで確認する。

## 2026-08-26 残存CSS・JS・render-blocking・画像の対応

PR #107 の本番 mobile 計測（Performance 92、FCP 1.4 秒、LCP 2.9 秒、TBT 10 ms、CLS 0）では、
次の残存候補を確認した。

- 未使用CSS: 推定 31 KiB。Dela Gothic One のフォントCSS（約32 KiB）がほぼ全量未使用。
- 未使用JavaScript: 推定 22 KiB。初期チャンクに含まれる下部セクション・演出用コードが対象。
- render-blocking: 推定 170 ms。LogoLoop CSSを含む初期スタイルシートが対象。
- 画像配信: 推定 27 KiB。ヒーロー画像・ヘッダーロゴ・フッターロゴの圧縮余地。

次回の性能改善PRでは、以下の方針で対応する。

- ホームのヒーロー文字を端末標準の丸ゴシックへ切り替え、使用箇所のないDela Gothic Oneの
  `next/font` import・遅延ローダー・CSS utilityを削除する。
- オープナー、ABOUT、企画カルーセル、スポンサーのLogoLoopを動的ロードへ分離する。スポンサー欄は
  静的ロゴと高さをSSRし、IntersectionObserverで近接時だけ `ssr: false` のLogoLoopを読み込むことで、
  CSS/アニメーションJSを初期HTMLから外しつつ、遅延・失敗時もロゴ表示とレイアウトを保つ。
- `next/image` のAVIFを優先形式へ追加し、既存WebPを未対応ブラウザ向けフォールバックとして残す。
  ヘッダー・フッターの固定ロゴは品質を75から60へ下げ、表示寸法に対して過剰な転送を避ける。

下部セクションの見出しと本文はSSRを維持し、データ欠落時のレイアウトとSEOを変えない。今回の検証は
ローカル本番ビルドと静的HTMLの参照確認までとし、マージ・本番反映後に同一URL・mobile presetで
PageSpeed Insightsを再計測して、未使用CSS/JS、render-blocking、画像削減量を比較する。

## 2026-08-27 残存JavaScript・先読み・初期タスクの対応

PR #110 の本番 mobile 計測（Performance 98、FCP 0.9 秒、LCP 2.4 秒、TBT 0 ms、CLS 0）で、
未使用JavaScript約22 KiB、render-blocking約110 ms、長時間タスク1件が残った。実機相当ブラウザの
ネットワーク記録では、初期表示直後にモバイルメニュー・オープナーの演出チャンクと、表示中リンクから
複数ページの先読みチャンクが取得されていた。

次の性能改善PRでは、初期ビューポートで不要なJavaScriptと先読みを抑える。

- モバイルではオープナー本体（GSAPを含む）を読み込まず、デスクトップかつモーション軽減なしの場合だけ
  ハイドレーション後にロードする。空の `opener-container` で初期レイアウトを保つ。
- モバイルメニューは開く操作またはフォーカス・ポインター接近時まで本体チャンクを取得しない。
- ヘッダーとヒーローの初期表示リンクでは Next.js の自動 route prefetch を無効化し、ユーザー操作時の
  遷移は維持する。

ローカル本番ビルドの 390x844 では、初期4秒間にモバイルメニュー・オープナー・ページ先読みの追加チャンクが
発生しないこと、メニュー操作後にのみメニューチャンクが取得され操作できることを確認する。モバイルの
PageSpeed Insights は本番反映後に再計測し、未使用JavaScript・render-blocking・長時間タスクを比較する。

## 関連

- GitHub Issue #101
- [browser-observation-limits.md](./browser-observation-limits.md)
- [agent-browser-workflow.md](./agent-browser-workflow.md)
