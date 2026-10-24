# 広告掲載の出し方（#481）

microCMS `informations` の `category = ad`（広告掲載）は3か所に出る。参考にしたのは
[明大祭サイト](https://www.meidaisai.jp/about)（全ページのフッター直前に広告バナーの枠、モバイルではバナー1枚を画面下部に固定）。

| 置き場所             | 部品                                      | 出るページ                               | 並び                        |
| -------------------- | ----------------------------------------- | ---------------------------------------- | --------------------------- |
| フッター上の広告欄   | `src/components/ads/AdBannersView.tsx`    | 全ページ（協賛バーの直前）               | `priority` 順               |
| モバイルの固定バナー | `src/components/ads/MobileAdDock.tsx`     | `md` 未満。`/` と `/special/[id]` を除く | 読み込むたびにランダムな1件 |
| 協賛・協力ページの節 | `src/components/sponsors/SponsorList.tsx` | `/about/sponsors`                        | `priority` 順               |

**協賛バー（流れるロゴ帯）には広告掲載を流さない**（協賛企業とスペシャルサンクスだけ）。
#478 で一度流したが、専用の枠と固定バナーを置いたので外した。

データは `src/components/ads/AdBanners.tsx`（サーバーコンポーネント）が `getAdsList()` で取り、
広告欄と固定バナーへ渡す。協賛バーと同じリクエストを共有するので HTTP 要求は増えず、
Webhook の `sponsors` タグの失効もそのまま効く。0件なら広告欄も固定バナーも出ない。

## バナー1枚（`AdBannerLink`）

- 横長の枠（9:2）に `image` を `object-contain` で収める。画像が無ければ団体名を文字で出す
- `url` があれば外部リンク（`rel="noopener noreferrer sponsored"`）。リンクの名前は団体名
- 広告だと分かるように、広告欄は見出し「広告掲載」、固定バナーは左上の「広告」ラベルを付ける

## モバイルの固定バナー

### 出さないページ

`shouldShowMobileAdDock()`（`src/lib/ad-placements.ts`）が決める。

- `/`: Hero の上に重なる（参考サイトも同じ）
- `/special/[id]`: `MobileTicketCTA` が同じ位置に固定される。2枚重ねない

### 表示中は切り替えない

読み込むたびに1件を選び、表示中は切り替えない。参考サイトは10秒ごとに切り替えているが、
自動で変わる内容には一時停止の手段が要る（WCAG 2.2.2）。乱数は hydrate の後に引く
（サーバーとクライアントで別の広告になり HTML が食い違うのを避けるため）。

### 退かせ方とキーボード

フッターの広告欄から下（`Footer.tsx` の `data-ad-dock-stop`）が画面に入ったら、画面の下へ退かせる。
判定は `MobileTicketCTA` と同じ IntersectionObserver（`rootMargin: 0 0 -96px 0`）。

**退かせてもアンマウントしない。** 固定バナーの DOM はフッターの中にあるので、Tab でここへ
来るころにはフッター側が見えている。アンマウントしていると閉じるボタンへキーボードで一度も
届かない（最初の実装でそうなっていた。マウスでは閉じられた）。いまは画面外へ退かせたまま
Tab の順に残し、フォーカスが入ったら引き上げる。DOM の位置は広告欄の直前で、Tab の順は
「本文 → 固定バナー（リンク・閉じる） → 広告欄」になる。

- 出ている間は `<html>` に `scroll-padding-bottom`（バナーの高さ）を付け、Tab で移った
  フォーカスがバナーの下に隠れないようにする（WCAG 2.4.11）
- 閉じたらそのタブの間は出さない（`sessionStorage`。読み書きは try/catch）。
  閉じた後のフォーカスは広告欄の見出し（`tabIndex={-1}`）へ移す
- 退かせる動きは `motion-safe:` の `transform` だけ。`prefers-reduced-motion` では動かさない

## 検証（2026-10-24）

本番には広告のデータが無かったので、コミットしない差し替えデータで dev を起動した。

- 1280px: 広告欄が3列で出る。固定バナーは `display: none`
- 390px / 320px: 固定バナーは高さ 89px / 73px。横スクロールなし。閉じるボタンは 44×44
- `/` と `/special/[id]` では出ない（`/special/[id]` の固定はチケット購入だけ）
- キーボード: 本文の最後の次に固定バナーのリンクと閉じるボタンへ届き、フォーカスリングが出る。
  閉じると見出しへ移り、次の Tab で広告欄の先頭へ進む

> [!NOTE]
> **agent-browser のタブは `document.visibilityState` が `hidden` になり、IntersectionObserver も
> scroll イベントも動かない。** 退かせる動きは、`--init-script` で setInterval 駆動の
> IntersectionObserver に差し替えて確かめた。差し替えないと「フッターが見えても隠れない」という
> 実在しない不具合を掴む。
