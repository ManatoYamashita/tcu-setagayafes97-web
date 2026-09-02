/**
 * microCMS の API（エンドポイント名）と、その内容を描画しているページの対応表。
 *
 * `src/app/api/revalidate/route.ts` が Webhook を受けたときに、ここを引いて
 * `revalidatePath()` を呼ぶ。`src/i18n/localized-pathnames.ts` と同じ性格のモジュールで、
 * 「app ディレクトリの実態と同期していなければならない知識」を1箇所に閉じ込めている。
 *
 * ## 仕組み: revalidatePath はパスの API ではなくタグの API である
 *
 * Next.js は各キャッシュエントリに `_N_T_` 接頭辞の暗黙タグを付けて保存し、
 * `revalidatePath(path, type)` はそこから組み立てたタグ1つを失効させる。
 * ビルド成果物の `.next/server/app/**\/*.meta` に実際の値が入っている。
 *
 * | エントリ            | 記録されているタグ（抜粋）                                          |
 * | ------------------- | ------------------------------------------------------------------- |
 * | `ja/about.meta`     | `_N_T_/[locale]/about/layout`, `_N_T_/[locale]/about/page`, `_N_T_/ja/about` |
 * | `sitemap.xml.meta`  | `_N_T_/sitemap.xml/route`, `_N_T_/sitemap.xml`                       |
 *
 * **この表を更新したら、上記 `.meta` に対象タグが実在するかを文字列一致で確認すること。**
 * 存在しないタグを指定してもエラーにはならず、そのページだけ静かに古いまま残る。
 *
 * ```bash
 * pnpm build
 * grep -rho 'x-next-cache-tags[^"]*' .next/server/app --include=*.meta
 * ```
 *
 * ## 動的ルートは「パターン形」で指定する
 *
 * `/events/[id]` は `RelatedEvents` で**他の**企画を、`/info/[id]` は関連ニュースを並べる。
 * つまり1件の変更で全詳細ページの関連セクションが古くなるため、
 * 該当 id だけを再検証しても足りない。パターン形 `["/events/[id]", "page"]` は
 * `_N_T_/events/[id]/page` を叩き、その全インスタンスにまとめて当たる。
 * 送るタグは1つだけで、再生成は実際にアクセスされたページでしか起きない。
 *
 * `type` を省略すると Next.js は警告を出したうえで**何も再検証しない**。動的ルートには必ず付ける。
 *
 * ## ロケール接頭辞のあるページに `/about` と書いてはいけない
 *
 * next-intl の `localePrefix: "as-needed"` により、`/about` の実体は `/ja/about` である。
 * キャッシュエントリが持つのも `_N_T_/ja/about` であって `_N_T_/about` ではないため、
 * `revalidatePath("/about")` は**一致するタグが存在せず何もしない。**
 * `["/[locale]/about", "page"]` なら ja/en/zh/ko の4つすべてに1回で当たる。
 *
 * ## 最終手段
 *
 * `revalidatePath("/", "layout")` は `_N_T_/layout` を叩く。これは全エントリが持つタグなので
 * サイト全体が失効し、この対応表のドリフトとは無縁になる。
 * **採用しない。** microCMS を読まない `/access` や `/info/guide` まで巻き込んで
 * 毎回の入稿で無駄に再生成させるため。対応表の維持が破綻したときの逃げ道としてだけ覚えておく。
 */

/** 本プロジェクトが使う microCMS の API。増やしたら REVALIDATE_TARGETS もビルドが通らなくなる */
export const MICROCMS_APIS = ["news", "events", "informations"] as const;

export type MicrocmsApi = (typeof MICROCMS_APIS)[number];

export interface RevalidateTarget {
  /** `revalidatePath()` へ渡すパス。動的ルートは `[id]` を含むパターン形で書く */
  readonly path: string;
  /** 動的ルートのパターン形に必須。静的パスとメタデータルートでは付けない */
  readonly type?: "page";
}

/**
 * API → 再検証するパス。
 *
 * ページ本体だけでなく、そのページが描画する Server Component が読むデータも数えること
 * （`/` の `SponsorBanner` や `FeaturedEvents` がその例）。
 *
 * `Record<MicrocmsApi, ...>` にしてあるので、`MICROCMS_APIS` へ4つ目を足すと
 * ここを埋めるまでビルドが通らない。ユニットテストの届かない対応表を、型がドリフトから守っている。
 */
export const REVALIDATE_TARGETS: Record<MicrocmsApi, readonly RevalidateTarget[]> = {
  // getNewsList / getLatestHeroNews / getNewsById
  news: [
    { path: "/" }, // Hero の最新お知らせ + News セクション
    { path: "/info" },
    { path: "/info/[id]", type: "page" }, // 詳細 + 関連ニュース一覧
    { path: "/sitemap.xml" },
  ],

  // getEventsList / getFeaturedEvents / getEventById / getSpecialEvents / getSpecialEventById
  events: [
    { path: "/" }, // FeaturedEvents + SpecialGuestSection
    { path: "/events" }, // 一覧 + SpecialGuestSection
    { path: "/events/[id]", type: "page" }, // 詳細 + RelatedEvents
    { path: "/timetable" },
    { path: "/special" },
    { path: "/special/[id]", type: "page" },
    { path: "/sitemap.xml" },
  ],

  // getSponsorsList / getFAQList
  informations: [
    { path: "/" }, // SponsorBanner
    { path: "/about/sponsors" },
    { path: "/[locale]/about", type: "page" }, // SponsorBanner（4ロケール）
    { path: "/[locale]/info/faq", type: "page" },
  ],
};

/**
 * 受け取った文字列が既知の microCMS API かどうか。
 *
 * `src/i18n/localized-pathnames.ts` の `isLocalizedPathname()` と同じ形の型ガード。
 */
export function isMicrocmsApi(value: string): value is MicrocmsApi {
  return (MICROCMS_APIS as readonly string[]).includes(value);
}
