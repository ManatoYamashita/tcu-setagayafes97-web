"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { eventsHref, type FilterParams } from "@/lib/filters";
import type { BuildingFilterOption } from "@/data/filter-options";
import { EventFilterFields } from "./EventFilterFields";
import { EventFilterSheet } from "./EventFilterSheet";

interface EventFiltersProps {
  /** 現在のフィルター。遷移先URLの組み立てと選択状態の表示に使う */
  filters: FilterParams;
  /** 建物の選択肢。実データに存在する建物だけが渡ってくる（`listBuildingOptions`） */
  buildingOptions: BuildingFilterOption[];
  /** 現在の絞り込み結果の件数。lg 未満のシートの閉じるボタンに出す */
  resultCount: number;
  /** 意味検索（第4段）の応答待ち。件数が確定していない */
  isSearching: boolean;
}

/** キーワード入力からURL反映までのデバウンス時間（ms） */
const KEYWORD_DEBOUNCE_MS = 300;

/**
 * 企画フィルターコンポーネント
 * URL Search Params で状態管理
 *
 * **現在値は `useSearchParams()` ではなく props で受け取ります。** このコンポーネントは
 * `EventsView` 経由で `<Suspense>` の fallback にも描かれるため、ここでクエリを読むと
 * fallback 自身が bailout し、ページ本体が静的HTMLから消えます（#156）。
 * `useRouter()` / `useState()` / `useEffect()` は bailout を起こさないのでそのまま使えます。
 *
 * **このパネルは親の `<aside>` ごと sticky で画面内に留まる**（#239）。スクロールしても
 * 絞り込みへ戻れるようにするためです。
 *
 * ブレークポイントで形が変わります（#376）。
 *
 * - `lg` 以上: サイドバーに全項目を並べる（高さの上限 `max-h` は sticky とセットで要る）
 * - `lg` 未満: キーワード入力と「条件」ボタンだけの細いバーが追従し、開催日・種別・建物は
 *   ボトムシート（`EventFilterSheet`）で選ぶ。全項目を追従させると、開いた瞬間に画面の
 *   7割を占めてカードが見えなくなるため（390x844 で 612px。2026-10-04 実測）
 *
 * 2つの形は**DOM の並び順と表示切替だけ**で作り分けます。キーワード入力は1要素のままで、
 * 両方の形で同じものを使います（IME・デバウンスの状態を二重に持たないため）。
 * 設計は docs/frontend/events-filter-sheet.md を参照。
 */
export function EventFilters({
  filters,
  buildingOptions,
  resultCount,
  isSearching,
}: EventFiltersProps) {
  const router = useRouter();

  const currentDate = filters.date ?? "all";
  const currentType = filters.type ?? "all";
  const currentBuilding = filters.building ?? "all";
  const currentKeyword = filters.keyword ?? "";

  /**
   * シートで選ぶ項目のうち、選択中の数（「条件」ボタンのバッジ）
   *
   * キーワードは数えない。lg 未満でもバーに常に見えているため、数えると二重に知らせることになる。
   */
  const sheetFilterCount = [
    currentDate !== "all",
    currentType !== "all",
    currentBuilding !== "all",
  ].filter(Boolean).length;

  /**
   * lg 未満のシートの開閉
   *
   * **URL に条件があっても自動では開かない。** かつては深いリンクで自動展開していたが、
   * 展開したまま追従するため、`?type=stage` で来た来場者は最初のカードを画面外
   * （y=1388px / 844px）に押し出されていた。条件の有無はバッジで知らせる。
   */
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  /**
   * キーワードの入力中の値
   *
   * **URL を直接 `value` にしてはいけません。** 1文字ごとにナビゲーションが走るため、
   * 追いつかないと入力した文字が巻き戻ります。ここで保持し、落ち着いてから URL へ送ります。
   */
  const [keywordDraft, setKeywordDraft] = useState(currentKeyword);

  /**
   * IME 変換中かどうか
   *
   * **判定は `InputEvent.isComposing` から取ります。** `compositionstart` /
   * `compositionend` の発火順はブラウザで揃っておらず（Chrome は compositionend の後に
   * input、Safari は逆のことがある）、`compositionend` を送信再開の合図にすると
   * 環境によって検索が動かなくなります。`isComposing` は変換中の input には true、
   * 確定後の input には false が入るので、**入力イベントだけで確実に切り替わります。**
   * `onCompositionEnd` は、確定後の input が来ない環境に備えた保険です。
   *
   * **ref ではなく state で持ちます。** 確定を「送信を再開する合図」として使うため、
   * 値が変わったときに送信の副作用を組み直す必要があるからです。
   *
   * **`onChange` 側は止めません。** 止めると、確定した文字が入力欄へ入らない環境が出ます。
   * 入力欄は常に追従させ、URL へ送るのだけを待たせます。
   */
  const [isComposing, setIsComposing] = useState(false);

  /**
   * 入力した語が、まだ一覧へ反映されていない間
   *
   * 打鍵からデバウンス（300ms）を経て URL が変わるまで、一覧は動かない。その間に何も
   * 出さないと、検索が効いていないように見える。入力欄の中に回転表示を出して知らせる。
   * IME の変換中は送信自体が止まっているため、変換が済むまでは出さない。
   */
  const isKeywordPending = !isComposing && keywordDraft !== currentKeyword;

  /**
   * 最後に自分が URL へ送った値
   *
   * **これが無いと、入力の速さによって文字が巻き戻ります。** `ab` を送った直後に `abc` まで
   * 打った状態でナビゲーションが完了すると、遅れて届いた `ab` を「外からの変更」と誤認して
   * 入力欄を `ab` へ戻してしまうためです。自分が送った値のこだまは無視します。
   */
  const lastSentRef = useRef(currentKeyword);

  /**
   * 外から現在値が変わったら入力欄を追従させる
   *
   * リセットボタン・ブラウザの戻る・URL 直打ちで `filters.keyword` が変わる場合だけ反映します。
   */
  useEffect(() => {
    if (currentKeyword === lastSentRef.current) return;
    lastSentRef.current = currentKeyword;
    setKeywordDraft(currentKeyword);
  }, [currentKeyword]);

  /**
   * 入力が落ち着いてから URL を書き換える
   *
   * **`push` ではなく `replace` を使います。** `push` だと1文字ごとに履歴が積まれ、
   * 戻るボタンが「1文字ずつ戻る」だけの操作になり実質機能しなくなります。
   * 200件規模の再フィルタリングが都度走るのも避けられます。
   *
   * アンマウント時やもう一度打鍵されたときは、この効果のクリーンアップがタイマーを捨てます。
   */
  useEffect(() => {
    // 変換が確定すると isComposing が false になり、この効果が組み直されて送信が始まる
    if (isComposing) return;
    if (keywordDraft === currentKeyword) return;

    const timer = setTimeout(() => {
      lastSentRef.current = keywordDraft;
      router.replace(eventsHref({ ...filters, keyword: keywordDraft }), { scroll: false });
    }, KEYWORD_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // filters は毎レンダー新しい参照になるため依存に入れない。
    // 送信内容は keywordDraft と currentKeyword の差分だけで決まる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordDraft, currentKeyword, isComposing, router]);

  /**
   * フィルター変更ハンドラー
   *
   * ページ番号は引き継ぎません（絞り込みを変えたら1ページ目へ戻す）。
   * "all" と空文字は `eventsHref` がクエリから落とします。
   */
  const handleFilterChange = (patch: Partial<FilterParams>) => {
    router.push(eventsHref({ ...filters, ...patch }), { scroll: false });
  };

  /**
   * フィルターをリセット（lg 以上のサイドバー。キーワードも含めて全部戻す）
   */
  const handleReset = () => {
    lastSentRef.current = "";
    setKeywordDraft("");
    router.push("/events", { scroll: false });
  };

  /**
   * シートの項目だけを戻す（lg 未満）
   *
   * キーワードは戻さない。シートの外（検索バー）にあり、来場者が入力した語を
   * シートの操作で黙って消すと、何が起きたのか分からなくなるため。
   */
  const handleClearSheetFilters = () => {
    handleFilterChange({ date: "all", type: "all", building: "all" });
  };

  return (
    /*
      lg 未満: キーワード入力と「条件」ボタンを横に並べた細いバー（枠は入力欄とボタンが持つ）
      lg 以上: 枠つきのカードに見出し・全項目・キーワードを縦に並べる

      lg の高さの上限は sticky 化（#239）とセットで要る。親の <aside> が画面上部へ貼り付くため、
      これが無いと項目が多いときにパネルが画面を縦いっぱいに占める。
      ヘッダー（--header-height）と上下の余白を引いた残りが上限。
    */
    <div className="flex items-center gap-2 lg:block lg:max-h-[calc(100svh-var(--header-height)-2rem)] lg:overflow-y-auto lg:rounded-lg lg:border lg:border-gray-200 lg:bg-white lg:p-6">
      <div className="mb-4 hidden items-center justify-between lg:flex">
        <h2 className="text-lg font-bold text-gray-900">絞り込み</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-gray-900 underline hoverable:hover:text-gray-900/80 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
          aria-label="フィルターをリセット"
        >
          リセット
        </button>
      </div>

      {/* lg 以上のサイドバー。lg 未満では同じ項目をシートの中に描く */}
      <div className="hidden lg:block">
        <EventFilterFields
          filters={filters}
          buildingOptions={buildingOptions}
          onChange={handleFilterChange}
        />
      </div>

      {/*
        キーワード検索。両方の形で同じ1要素を使う。
        `id="keyword-search"` は scripts/assert-events-static-html.mjs が静的HTMLの目印にしている
      */}
      <div className="min-w-0 flex-1 lg:mt-6">
        <label
          htmlFor="keyword-search"
          className="sr-only lg:not-sr-only lg:mb-2 lg:block lg:text-sm lg:font-semibold lg:text-gray-900/90"
        >
          キーワード検索
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-600 lg:hidden"
            aria-hidden="true"
          />
          <input
            type="search"
            id="keyword-search"
            enterKeyHint="search"
            placeholder="例: 9号館のダンス"
            value={keywordDraft}
            onChange={(e) => {
              setKeywordDraft(e.target.value);
              setIsComposing(Boolean((e.nativeEvent as InputEvent).isComposing));
            }}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              setKeywordDraft(e.currentTarget.value);
            }}
            onKeyDown={(e) => {
              // 確定キーでソフトウェアキーボードを閉じ、結果を見せる。IME の確定とは区別する
              if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
            }}
            className={`h-11 w-full rounded-lg border border-gray-400 bg-white pl-9 text-base ${isKeywordPending ? "pr-10" : "pr-3"} text-gray-900 placeholder-gray-600 focus:border-gray-600 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600 lg:h-auto lg:py-2 lg:pl-4 lg:text-sm`}
          />
          {isKeywordPending && (
            <Loader2
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-600 motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
        </div>
        <p className="mt-2 hidden text-xs text-gray-700 lg:block">
          企画名・団体名・場所・紹介文から探します。文章のまま入力できます。
        </p>
      </div>

      {/*
        lg 未満: 開催日・種別・建物はシートで選ぶ。
        アイコンだけにしているのは入力欄の幅を確保するため。「条件」の文字を添えると
        102px を取り、390px 幅でもプレースホルダが途中で切れた（2026-10-04 実測）
      */}
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-haspopup="dialog"
        aria-label={
          sheetFilterCount > 0 ? `絞り込み条件（${sheetFilterCount}件を選択中）` : "絞り込み条件"
        }
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-gray-400 bg-white text-gray-900 transition-colors hoverable:hover:bg-gray-50 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600 lg:hidden"
      >
        <SlidersHorizontal className="size-5" aria-hidden="true" />
        {sheetFilterCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white tabular-nums ring-2 ring-white"
            aria-hidden="true"
            data-filter-count
          >
            {sheetFilterCount}
          </span>
        )}
      </button>

      <EventFilterSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        filters={filters}
        buildingOptions={buildingOptions}
        onChange={handleFilterChange}
        onClear={handleClearSheetFilters}
        activeCount={sheetFilterCount}
        resultCount={resultCount}
        isSearching={isSearching}
      />
    </div>
  );
}
