# 多言語ページの構成パターン

本ドキュメントでは、next-intl（`localePrefix: "as-needed"`）を前提とした多言語ページの構成ルールを定義します。ページビューの置き場所、共有データのロケール上書き、リンクの扱い、言語宣言までを対象とします。

レイアウト全般（Header/Hero統合、z-index、position、レスポンシブ高さ）は [layout-patterns.md](./layout-patterns.md) を参照してください。

---

## 前提: ルーティングの仕組み

| ファイル                          | 役割                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `src/i18n/routing.ts`             | `locales: ["ja","en","zh","ko"]`、`defaultLocale: "ja"`、`localePrefix: "as-needed"` |
| `src/proxy.ts`                    | 多言語対応ページのみをマッチングするミドルウェア。matcher は静的リテラルの列挙       |
| `src/i18n/localized-pathnames.ts` | `LOCALIZED_PATHNAMES`。matcher とのドリフトを開発時に検知する                        |
| `src/i18n/navigation.ts`          | `createNavigation(routing)` による `Link` / `redirect` / `usePathname` 等            |

`localePrefix: "as-needed"` のため、**デフォルトロケール（ja）の正規URLは接頭辞なし**です。`/about` へのリクエストは proxy が内部で `/ja/about` へ rewrite し、`/ja/about` へ直接来たリクエストは 307 で `/about` へリダイレクトされます。

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

`[locale]` 配下では `next/link` ではなく `@/i18n/navigation` の `Link` を使います。素の `Link` だと `/en/info/guide` から `/info/faq` へ遷移した瞬間に日本語ページへ落ちます。

### 使ってはいけない場所

| 対象                                                                                   | 理由                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Header` / `Footer` / `DesktopNav` / `NavDropdown` / `CardNav` / `StaggeredMobileMenu` | ルートレイアウト直下にあり `NextIntlClientProvider` の子孫ではない。内部で `useLocale()` を呼ぶため実行時例外になる（`LanguageSwitcher.tsx` のコメント参照） |
| `src/components/ui/PageHero.tsx`                                                       | `/events` `/timetable` `/info` など Provider 外のページからも描画される共有コンポーネント。CTA の遷移先 `/events` は多言語版が存在しないルートでもある       |
| `fetch("/api/contact")` 等のAPI呼び出し                                                | API ルートは proxy の matcher 対象外。絶対パスのままが正しい                                                                                                 |

Header/Footer がロケール非対応である点は構造的な制約として現在も残っています（`navigation.*` / `footer.*` の翻訳キーは4言語揃っているが未使用）。対応するなら `LanguageSwitcher` と同じく `usePathname` + `buildLocaleHref` で href を自前組み立てします。

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

### proxy.ts を編集するときの禁止事項

- **`/` を matcher に追加しない。** `src/app/[locale]/page.tsx` が存在しないため、トップページが404になります
- **`:path*` は `/ja/:path*` 以外で使わない。** `/(en|zh|ko)/about/:path*` のような書き方は、対応ページが存在しない `/en/about/sponsors` まで拾います。ミドルウェアを通過した404には hreflang の `Link:` ヘッダが付き、検索エンジンへ誤った代替情報を送ります
- **matcher からパスを外さない。** 非ロケール版のページを削除済みのため、6つの正規日本語URLの到達性は matcher に全面的に依存しています

matcher と `LOCALIZED_PATHNAMES` のドリフトは `proxy.ts` 末尾の検知ロジックが開発時に `console.error` で知らせます。

---

## 検証

```bash
# メッセージファイルのキー集合が4言語で一致しているか
python3 -c "
import json
def flat(d,p=''):
    for k,v in d.items():
        n=f'{p}.{k}' if p else k
        if isinstance(v,dict): yield from flat(v,n)
        else: yield n
ks={l:set(flat(json.load(open(f'src/messages/{l}.json')))) for l in ('ja','en','zh','ko')}
base=ks['ja']
for l,s in ks.items(): print(l, len(s), 'missing:', sorted(base-s), 'extra:', sorted(s-base))
"
```

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
**最終更新:** 2026-08-03
