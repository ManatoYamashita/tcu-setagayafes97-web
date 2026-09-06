"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { eventsHref, type FilterParams } from "@/lib/filters";
import {
  dateFilterOptions,
  typeFilterOptions,
  type BuildingFilterOption,
} from "@/data/filter-options";

interface EventFiltersProps {
  /** 現在のフィルター。遷移先URLの組み立てと選択状態の表示に使う */
  filters: FilterParams;
  /** 建物の選択肢。実データに存在する建物だけが渡ってくる（`listBuildingOptions`） */
  buildingOptions: BuildingFilterOption[];
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
 * `lg` 未満では開閉可能なパネルにする。開催日・種別・建物・キーワードの4項目が
 * 常に全展開されていると、モバイルで最初のカードが画面外に押し出されるため。
 * 既定は折りたたみだが、URLに絞り込み条件が既にある場合（深いリンク・戻る/進む）は
 * 自動展開してその場で文脈が見えるようにする。
 */
export function EventFilters({ filters, buildingOptions }: EventFiltersProps) {
  const router = useRouter();

  const currentDate = filters.date ?? "all";
  const currentType = filters.type ?? "all";
  const currentBuilding = filters.building ?? "all";
  const currentKeyword = filters.keyword ?? "";

  const activeFilterCount = [
    currentDate !== "all",
    currentType !== "all",
    currentBuilding !== "all",
    currentKeyword !== "",
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const [isOpen, setIsOpen] = useState(hasActiveFilters);

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
      router.replace(eventsHref({ ...filters, keyword: keywordDraft }));
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
    router.push(eventsHref({ ...filters, ...patch }));
  };

  /**
   * フィルターをリセット
   */
  const handleReset = () => {
    lastSentRef.current = "";
    setKeywordDraft("");
    router.push("/events");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="hidden text-lg font-bold text-gray-900 lg:block">絞り込み</h2>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="event-filters-panel"
          className="flex items-center gap-2 text-lg font-bold text-gray-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 lg:hidden"
        >
          <span>絞り込み</span>
          {hasActiveFilters && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        <button
          onClick={handleReset}
          className="text-sm text-gray-900 underline hover:text-gray-900/80 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
          aria-label="フィルターをリセット"
        >
          リセット
        </button>
      </div>

      <div id="event-filters-panel" className={`space-y-6 lg:block ${isOpen ? "" : "hidden"}`}>
        {/* 日程フィルター */}
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="m-0 mb-2 block p-0 text-sm font-semibold text-gray-900/90">
            開催日
          </legend>
          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange({ date: option.value })}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
                  currentDate === option.value
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
                }`}
                aria-pressed={currentDate === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* 企画種別フィルター */}
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="m-0 mb-2 block p-0 text-sm font-semibold text-gray-900/90">
            企画種別
          </legend>
          <div className="flex flex-wrap gap-2">
            {typeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange({ type: option.value })}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
                  currentType === option.value
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
                }`}
                aria-pressed={currentType === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* 建物フィルター（企画が1件以上ある建物だけを出す） */}
        <div>
          <label
            htmlFor="building-filter"
            className="mb-2 block text-sm font-semibold text-gray-900/90"
          >
            建物
          </label>
          <select
            id="building-filter"
            value={currentBuilding}
            onChange={(e) => handleFilterChange({ building: e.target.value })}
            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-600 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600"
          >
            {buildingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* キーワード検索 */}
        <div>
          <label
            htmlFor="keyword-search"
            className="mb-2 block text-sm font-semibold text-gray-900/90"
          >
            キーワード検索
          </label>
          <input
            type="text"
            id="keyword-search"
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
            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:border-gray-600 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600"
          />
          <p className="mt-2 text-xs text-gray-700">
            企画名・団体名・場所・紹介文から探します。文章のまま入力できます。
          </p>
        </div>
      </div>
    </div>
  );
}
