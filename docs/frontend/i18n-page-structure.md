# 多言語ページの構成パターン

本ドキュメントでは、next-intl（`localePrefix: "as-needed"`）を前提とした多言語ページの構成ルールを定義します。ページビューの置き場所、共有データのロケール上書き、リンクの扱い、言語宣言までを対象とします。

レイアウト全般（Header/Hero統合、z-index、position、レスポンシブ高さ）は [layout-patterns.md](./layout-patterns.md) を参照してください。

---

## 前提: ルーティングの仕組み

| ファイル                          | 役割                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `src/i18n/routing.ts`             | `locales: ["ja","en","zh","ko"]`、`defaultLocale: "ja"`、`localePrefix: "as-needed"` |
| `src/proxy.ts`                    | 多言語対応ページのみをマッチングするミドルウェア。matcher は静的リテラルの列挙       |
| `src/i18n/localized-pathnames.ts` | `LOCALIZED_PATHNAMES` と `localizeNavHref()`。matcher とのドリフトを開発時に検知する |
| `src/i18n/navigation.ts`          | `createNavigation(routing)` による `Link` / `redirect` / `usePathname` 等            |
| `src/i18n/use-current-locale.ts`  | Provider 外でロケールを解決するフック（ヘッダー・フッター用）                        |
| `src/i18n/chrome-messages.ts`     | ヘッダー・フッター文言の辞書。`src/messages/chrome/*.json` を静的 import             |
| `src/i18n/request.ts`             | 本文と chrome のメッセージをマージして Provider へ渡す                               |

`localePrefix: "as-needed"` のため、**デフォルトロケール（ja）の正規URLは接頭辞なし**です。`/about` へのリクエストは proxy が内部で `/ja/about` へ rewrite し、`/ja/about` へ直接来たリクエストは 307 で `/about` へリダイレクトされます。

翻訳メッセージは2つに分かれています。

| ファイル                            | 内容                               | 読み方                                                 |
| ----------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `src/messages/<locale>.json`        | ページ本文                         | Provider 経由（`getTranslations` / `useTranslations`） |
| `src/messages/chrome/<locale>.json` | `navigation` / `header` / `footer` | クライアントから静的 import（`getChromeMessages`）     |

chrome 側を分けているのは、ヘッダー・フッターが Provider の外にあり静的 import で読む必要があるためです。ページ本文（約29KB）まで載せると全ページのバンドルが膨らみます。`request.ts` が両者をマージして Provider へ渡すので、`getTranslations("navigation")` は従来どおり動きます。

---

## ページビューの置き場所

### ルール

**ページビューは `page.tsx` に置く。2つ以上のルートが同じビューを描画する場合に限り、`src/components/<domain>/` へ抽出する。**

消費者が1つしかないビューを `page.tsx → XxxPageContent.tsx` に分けても、`locale` や `t` を props で配り直す手間が増えるだけで得るものがない。`src/components/<domain>/` は「複数箇所から使われる」または「ドメイン単位でまとめる価値がある」ものの置き場に保つ。

### 背景: 同名ルートの二重実装は静かにデッドコード化する

`src/app/<path>/page.tsx` と `src/app/[locale]/<path>/page.tsx` が同時に存在しても**エラーにならない**。proxy の matcher に載っているパスは `/ja/<path>` へ rewrite されるため、実際に描画されるのは `[locale]` 側だけで、非ロケール版はどのURLからも到達できなくなります。

lint もビルドも警告を出さないため、**非ロケール版を修正しても画面が変わらない**という原因不明のバグとして工数を溶かします。実際に Issue #34 で6ページがこの状態になり、デザインが2系統に分岐していました。

多言語対応ページを追加するときは、`src/app/` 直下に同名ルートを作らないこと。

### 例外: クライアントコンポーネント

`"use client"` 境界が必要なもの（`FAQContent.tsx`、`ContactForm.tsx` 等）は、共有しない場合でも `src/app/[locale]/<path>/` にコロケーションします。

これらの文言は props で渡さず `useTranslations` を使います。`src/app/[locale]/layout.tsx` が `getMessages()` の**全名前空間**を `NextIntlClientProvider` に渡しているため、`useTranslations` を使ってもペイロードは増えません。props で渡すと同じ文字列がRSCペイロードに二重に載ります。

> **注意:** `messages` を `pick()` 等で絞り込むと、クライアント側で `useTranslations` を呼んでいるコンポーネントが実行時に落ちます。絞る場合は参照している名前空間を必ず含めてください。

---

## `pageHeroes` のロケール上書き

`src/data/page-heroes.ts` の `pageHeroes` は**日本語ハードコード**であり、`/events` `/timetable` `/info` など多言語非対応ページからも参照されている共有データです。`Record<Locale, …>` 化すると影響範囲が跳ね上がるため、**`[locale]` 配下では利用側で上書きします**。

```tsx
const hero: PageHeroData = {
  ...pageHeroes.privacy, // 画像・英字サブラベル（"Privacy Policy" 等）は継承
  title: t("title"),
  description: t("subtitle"), // messages の subtitle は PageHeroData の description に対応
};

return <PageSheetLayout hero={hero}>{/* ... */}</PageSheetLayout>;
```

**`hero={pageHeroes.privacy}` と素で書くと `/en/about/privacy` のヒーローに日本語が出ます。** 多言語ページで `PageSheetLayout` を使うときは必ず上書きしてください。

`messages` 側の `subtitle` が `PageHeroData` の `description` に対応する点（名前のねじれ）にも注意。`PageHeroData.subtitle` はロケール非依存の英字ラベルであり、上書き対象ではありません。

実装例: `src/components/access/AccessPageContent.tsx`、`src/app/[locale]/info/guide/page.tsx`

---

## リンクの扱い

リンクの書き方は **Provider の内か外か**で2通りに分かれます。

| 場所                                           | 使うもの                                     |
| ---------------------------------------------- | -------------------------------------------- |
| `src/app/[locale]/` 配下（Provider の子孫）    | `@/i18n/navigation` の `Link`                |
| ルートレイアウト直下の共通 UI（Provider の外） | `next/link` の `Link` ＋ `localizeNavHref()` |

`[locale]` 配下で素の `next/link` を使うと、`/en/info/guide` から `/info/faq` へ遷移した瞬間に日本語ページへ落ちます。

### Provider の外（ヘッダー・フッター）

`Header` / `Footer` / `DesktopNav` / `NavDropdown` / `StaggeredMobileMenu` は `src/app/layout.tsx` 直下にあり、`NextIntlClientProvider` を提供する `[locale]/layout.tsx` の子孫ではありません。`@/i18n/navigation` の `Link` も `useTranslations` も内部で `useLocale()` を呼ぶため**実行時に例外を投げます**。

代わりに次の組み合わせを使います。

```tsx
const { locale } = useCurrentLocale(); // src/i18n/use-current-locale.ts
const { href, hrefLang } = localizeNavHref("/access", locale);
<Link href={href} hrefLang={hrefLang}>
  …
</Link>; // next/link
```

- **`localizeNavHref()`（`src/i18n/localized-pathnames.ts`）が接頭辞の要否を判定する。** 接頭辞を付けてよいのは `LOCALIZED_PATHNAMES` の6つだけで、`/` や `/events` に付けると proxy の matcher 外なので即404になります。呼び出し側で `isLocalizedPathname()` を書かないこと
- **多言語版が無いページへのリンクには `hrefLang="ja"` が付く。** 遷移先が日本語であることの宣言で、判定条件が接頭辞の要否と同一なため `{ href, hrefLang }` を組で返しています
- 文言は `getChromeMessages(locale)`（`src/i18n/chrome-messages.ts`）から引く。`src/messages/chrome/*.json` を素の TS として静的 import しており、`useTranslations` は使いません

ヘッダー・フッターは `src/components/layout/useChromeNav.ts` がこれらを合成しています。**Header が1回だけフックを呼び、子へは props で流す**構造なので、新しいナビ項目を足すときは `src/data/navigation.ts` に `labelKey` と `href` を書くだけで済みます。

### それでも `next/link` のまま残すもの

| 対象                                    | 理由                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/ui/PageHero.tsx`        | `/events` `/timetable` `/info` など Provider 外のページからも描画される共有コンポーネント。CTA の遷移先 `/events` は多言語版が存在しないルートでもある |
| `fetch("/api/contact")` 等のAPI呼び出し | API ルートは proxy の matcher 対象外。絶対パスのままが正しい                                                                                           |

### 言語切替だけは扱いが違う

`LanguageSwitcher` は `useCurrentLocale()` を共有しますが、href の組み立てに `localizeNavHref()` は**使いません**。ナビゲーションは多言語版が無いページへ実在パスで直リンクするのに対し、言語切替は着地先が無いと切替自体が成立しないため `LOCALE_FALLBACK_PATHNAME`（`/info/guide`）へ倒します。**この差は意図的なので統一しないこと。**

### 期待される挙動: `/events` へ移ると UI が日本語に戻る

`/en/info/guide` からヘッダーの `Events` を押すと、遷移先の `/events` には多言語版が無いためヘッダー・フッターを含む UI 全体が日本語になります。これはバグではなく、多言語版が6パスしか存在しないことの帰結です。リンクには `hrefLang="ja"` が付いており、支援技術と検索エンジンには遷移先の言語が正しく伝わります。

---

## 翻訳しないもの

翻訳キーに出してはいけないものがあります。**コンテンツに対する照合ロジック**です。

`src/app/[locale]/info/faq/FAQContent.tsx` の `FAQ_FILTERS[].keywords`（`"入場"` `"アクセス"` 等）は、microCMS の日本語コンテンツをカテゴリ分類するための照合キーワードです。UI文言ではないため、翻訳すると en/zh/ko で全FAQが「その他」に倒れます。**表示ロケールに関わらず日本語のまま維持してください。**

同様に、CMS 由来のコンテンツ（`news` / `events` / `informations`）と `src/data/` 配下の本文は日本語専用です。`[locale]` 配下のページでも本文は日本語のまま表示されます。

---

## 言語宣言（`lang` 属性）

### 制約: ルートレイアウトはロケールを知らない

`<html>` を持つ `src/app/layout.tsx` はロケールを受け取らず、ロケールを知る `src/app/[locale]/layout.tsx` は `<html>` を持ちません。そのため `<html lang>` は `"ja"` 固定になり、`/en/access` でも英語の本文が日本語の音声エンジンで読み上げられます。

### 却下した案: `headers()` から `X-NEXT-INTL-LOCALE` を読む

**ルートレイアウトで `headers()` を呼ぶとサイト全体が動的レンダリングへ落ちます。** 実測では、トップ・企画・タイムテーブル・お知らせを含む**ほぼ全ページが `○ (Static)` から `ƒ (Dynamic)` へ変化**しました。`cacheComponents` を有効化していない構成では、レイアウトの動的APIがその配下すべてに伝播するためです。

Vercel Free Plan の帯域（100GB/月）とサーバーレス関数の制約、および「ISR/SSGを積極的に活用する」という方針に反するので採用しません。**ルートレイアウトで `headers()` / `cookies()` / `searchParams` を使わないこと。**

この制約は個別ページにも及びます。FAQ の検索・絞り込みを URL クエリ駆動にしたくなりますが、**クライアント state のまま**にしてください。

### 採用した案: 要素レベルの `lang` ＋ クライアント側同期の二段構え

| 層                 | 実装                                                                               | 効く条件       | 役割                                                         |
| ------------------ | ---------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------ |
| 静的HTML           | `src/app/[locale]/layout.tsx` が `<div lang={locale}>` で children を包む          | JavaScript不要 | 支援技術への言語範囲の宣言。静的生成を維持したまま実現できる |
| ハイドレーション後 | `src/components/layout/HtmlLangSync.tsx` が `document.documentElement.lang` を同期 | JavaScript必要 | ブラウザの翻訳UI、JSを実行するクローラ向けの補完             |

`lang` はどの要素にも指定でき、支援技術は要素レベルの宣言を尊重します。ヘッダー・フッターのナビゲーションは多言語ページでも日本語のままなので、文書全体を `lang="en"` にするより**この範囲指定のほうが実態に即しています**。

`HtmlLangSync` は `usePathname()` と `splitLocalePrefix()` からロケールを導くため、クライアントサイド遷移で多言語ページを離れると `ja` へ戻ります。

---

## 多言語ページを追加する手順

1. `src/app/[locale]/<path>/page.tsx` を作る（`src/app/<path>/` には作らない）
2. `generateStaticParams()` と `generateMetadata()` を実装する
3. `setRequestLocale(locale)` を本体の冒頭で呼ぶ（静的レンダリングの維持）
4. `src/messages/{ja,en,zh,ko}.json` に名前空間を追加する（4言語すべて。過不足はキー集合の比較で確認）
5. `src/i18n/localized-pathnames.ts` の `LOCALIZED_PATHNAMES` に追加する
6. `src/proxy.ts` の matcher に**2行**追加する（`"/<path>"` と `"/(en|zh|ko)/<path>"`）
7. `src/app/sitemap.ts` に非接頭辞URLを追加する
8. ヘッダー・フッターに載せるなら `src/messages/chrome/*.json` の `navigation` にラベルを足し、`src/data/navigation.ts` に `labelKey` と `href` を追加する

`LOCALIZED_PATHNAMES` に追加した時点で、ヘッダー・フッターの該当リンクには自動でロケール接頭辞が付き `hrefLang="ja"` が外れます（`localizeNavHref()` が判定するため）。逆に**手順5を忘れるとナビだけ日本語ページへ飛び続けます**。

### proxy.ts を編集するときの禁止事項

- **`/` を matcher に追加しない。** `src/app/[locale]/page.tsx` が存在しないため、トップページが404になります
- **`:path*` は `/ja/:path*` 以外で使わない。** `/(en|zh|ko)/about/:path*` のような書き方は、対応ページが存在しない `/en/about/sponsors` まで拾います。ミドルウェアを通過した404には hreflang の `Link:` ヘッダが付き、検索エンジンへ誤った代替情報を送ります
- **matcher からパスを外さない。** 非ロケール版のページを削除済みのため、6つの正規日本語URLの到達性は matcher に全面的に依存しています

matcher と `LOCALIZED_PATHNAMES` のドリフトは `proxy.ts` 末尾の検知ロジックが開発時に `console.error` で知らせます。

---

## 検証

```bash
# メッセージファイルのキー集合が4言語で一致し、本文と chrome が互いに素であること
python3 -c "
import json
def flat(d,p=''):
    for k,v in d.items():
        n=f'{p}.{k}' if p else k
        yield from (flat(v,n) if isinstance(v,dict) else [n])
L=('ja','en','zh','ko')
for d in ('src/messages','src/messages/chrome'):
    ks={l:set(flat(json.load(open(f'{d}/{l}.json')))) for l in L}
    print(d)
    for l in L: print(' ',l,len(ks[l]),'missing:',sorted(ks['ja']-ks[l]),'extra:',sorted(ks[l]-ks['ja']))
for l in L:
    a=set(json.load(open(f'src/messages/{l}.json'))); b=set(json.load(open(f'src/messages/chrome/{l}.json')))
    if a&b: print('COLLISION',l,sorted(a&b))
"
```

`chrome/` 側のキー欠落は `src/i18n/chrome-messages.ts` の `Record<Locale, ChromeMessages>` が `pnpm build` で落とします。上のスクリプトは本文側の検証と、余剰キー・名前空間衝突の検出が主目的です。名前空間が衝突すると浅いマージで片方が丸ごと消えるため、開発時は `request.ts` が `console.error` でも知らせます。

ヘッダー・フッターのロケール対応は静的HTMLへの grep で検証できます。

```bash
rm -rf .next && pnpm build && cd .next/server/app

# 接頭辞が付くのは LOCALIZED_PATHNAMES の6つだけ
grep -oE 'href="/(en/)?(events|timetable|access|info|info/guide|info/faq|info/contact|about|about/privacy)"' en/access.html | sort -u

# 禁止パターン（1件でも出れば 404 になる）— 出力ゼロが正
grep -oE 'href="/(en|zh|ko)/(events|timetable|info|info/pamphlet)"|href="/(en|zh|ko)"' en/access.html

# ハイドレーション不一致のカナリア — 出力ゼロが正
# splitLocalePrefix による正規化を忘れると href が "/ja/..." で焼き付く
grep -rl 'href="/ja/' . 2>/dev/null | grep '\.html$'

# ナビラベルのロケール
grep -c '企画を探す' en/access.html   # 0
grep -c '企画を探す' ja/access.html   # >= 2
```

**モバイルメニューは curl で検証できません。** `next/dynamic({ ssr: false })` のため SSG HTML に含まれず（`grep -c 'sm-panel-item' en/access.html` は 0）、ドロップダウンの子リンクも閉じた状態では描画されません。ブラウザで開いて確認してください。

このとき、**リンクの href やラベルはブラウザ自動化で確認できますが、開閉アニメーションの再生を検証できるかどうかは実行環境によります。** `requestAnimationFrame` が停止しているセッションでは 1 フレームも進まないため、観測値が無効になります。測る前に `framesIn1s` を確認し、`0` なら実機で目視してください。手順は [browser-observation-limits.md の「観測の前提を測る」](./browser-observation-limits.md#観測の前提を測る先に読むこと) を参照。

ルーティングの検証は**本番ビルドで行うこと**（`pnpm dev` では rewrite/redirect の挙動が本番と異なる場合がある）。ルートファイルを削除した後は `.next` を消してからビルドします。

```bash
rm -rf .next && pnpm build && pnpm start

# 正規URL: 200
for p in / /about /about/privacy /access /info/guide /info/faq /info/contact; do
  printf "%-18s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"
done
# ja 接頭辞: 307
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/ja/about
# 多言語版が存在しないページ: 404（救済されてはいけない）
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/en/about/sponsors
```

ビルド出力で `/[locale]/*` が `● (SSG)` として4ロケール分生成されていることも確認します。

---

**関連ドキュメント:**

- [layout-patterns.md](./layout-patterns.md) - レイアウトパターンと設計原則
- [agent-browser-workflow.md](./agent-browser-workflow.md) - デザイン再現とデバッグの標準フロー

---

**作成日:** 2026-08-03
**最終更新:** 2026-09-06
