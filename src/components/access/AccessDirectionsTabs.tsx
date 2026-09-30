"use client";

import { gsap } from "gsap";
import { Bus, Train } from "lucide-react";
import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { buildRouteEntrance, resetRouteCounts } from "@/components/access/route-entrance";
import {
  RideSegmentLabel,
  TimelineStep,
  WalkSegmentLabel,
} from "@/components/access/RouteTimeline";
import type { AccessPageContent, BusRoute, TrainRoute } from "@/data/access";

const TABS = [
  { id: "train", Icon: Train },
  { id: "bus", Icon: Bus },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_ID_PREFIX = "access-directions-tab-";
const PANEL_ID_PREFIX = "access-directions-panel-";

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";

const tablistClassName =
  "inline-flex w-full gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 sm:w-auto";

const tabBaseClassName =
  `inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 ` +
  `text-sm font-bold transition-colors sm:flex-none sm:px-7 ${focusRing}`;

const listClassName = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

// バッジを枠線の上へ重ねるため relative を持たせる
const cardClassName = "relative flex h-full flex-col rounded-2xl bg-white p-5 sm:p-6";

const cardBorderClassName = "border border-gray-200";

// おすすめカードも枠線の幅は他と同じ 1px に揃え、太い枠は下の重ね要素で描く。
// 枠線そのものを太くすると、その差だけタイムラインの開始位置が他のカードとずれる
const recommendedBorderClassName = "border border-transparent";

// -inset-px で 1px の透明な枠線まで覆い、カードの外形と角丸を一致させる
const recommendedFrameClassName =
  "pointer-events-none absolute -inset-px rounded-2xl border-4 border-primary-600";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** 経路カードの入場演出を始める、パネルの見えている割合 */
const ENTRANCE_THRESHOLD = 0.25;

const recommendedBadgeClassName =
  "absolute -top-3 right-5 inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white shadow-sm";

interface AccessDirectionsTabsProps {
  content: AccessPageContent["directions"];
  /** 経路タイムラインの終点に表示する会場名 */
  venue: string;
  trainRoutes: readonly TrainRoute[];
  busRoutes: readonly BusRoute[];
}

/**
 * 会場までの経路を「電車」「バス」のタブで切り替えて表示する。
 *
 * WAI-ARIA の Tabs パターン（自動アクティベーション）に準拠し、
 * 非アクティブなパネルは hidden 属性で DOM 上に残す。
 * これによりJavaScriptが動作しない環境でも両方の経路情報を読み取れる。
 */
export function AccessDirectionsTabs({
  content,
  venue,
  trainRoutes,
  busRoutes,
}: AccessDirectionsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("train");
  const [shouldBlinkRecommended, setShouldBlinkRecommended] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<Partial<Record<TabId, HTMLDivElement | null>>>({});
  /** 経路カードが一度でも画面に入ったか。入った後のタブ切替は、待たずにその場で再生する */
  const hasEnteredRef = useRef(false);

  // 表示中のパネルの入場演出（route-entrance.ts）を組み、見えたら再生する。
  // タブを切り替えるたびに組み直すので、切替時も同じ演出で入れ替わる。
  // useLayoutEffect なのは、切り替えた直後のコマに完成形を一瞬描かせないため
  useLayoutEffect(() => {
    const panel = panelRefs.current[activeTab];
    if (!panel) return;

    // この判定より前で gsap にも IntersectionObserver にも触れないこと。
    // ここで return すれば SSR の完成形が残る（use-scroll-reveal.ts と同じ順序）
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let entrance: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      entrance = buildRouteEntrance(panel, {
        // おすすめ枠は、電車の経路を描き終えてから点滅させる
        onComplete: activeTab === "train" ? () => setShouldBlinkRecommended(true) : undefined,
      });
    }, panel);

    let observer: IntersectionObserver | undefined;

    if (hasEnteredRef.current || !("IntersectionObserver" in window)) {
      entrance?.play();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          hasEnteredRef.current = true;
          observer?.disconnect();
          entrance?.play();
        },
        { threshold: ENTRANCE_THRESHOLD }
      );
      observer.observe(panel);
    }

    return () => {
      observer?.disconnect();
      ctx.revert();
      resetRouteCounts(panel);
      // 隠れたパネルの CSS アニメーションは、再表示のときに頭から再生される。
      // クラスを外しておき、電車へ戻ったときも描き終えてから点滅させる
      if (activeTab === "train") setShouldBlinkRecommended(false);
    };
  }, [activeTab]);

  // 矢印キー・Home・End でタブ間を移動し、フォーカス移動と同時に選択も切り替える
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = TABS.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(TABS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div>
      {/* 入場は AccessPageMotion のリビールに任せる。カードは上の演出で出すため、
          塊全体ではなくタブの列だけにリビールを掛ける */}
      <div
        role="tablist"
        aria-label={content.title}
        className={tablistClassName}
        data-access-reveal="up"
      >
        {TABS.map(({ id, Icon }, index) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${TAB_ID_PREFIX}${id}`}
              aria-selected={isActive}
              aria-controls={`${PANEL_ID_PREFIX}${id}`}
              tabIndex={isActive ? 0 : -1}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`${tabBaseClassName} ${
                isActive
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-white hover:text-primary-700"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {id === "train" ? content.trainTitle : content.busTitle}
            </button>
          );
        })}
      </div>

      {TABS.map(({ id }) => (
        <div
          key={id}
          role="tabpanel"
          id={`${PANEL_ID_PREFIX}${id}`}
          ref={(node) => {
            panelRefs.current[id] = node;
          }}
          aria-labelledby={`${TAB_ID_PREFIX}${id}`}
          tabIndex={0}
          hidden={activeTab !== id}
          className={`mt-6 rounded-2xl ${focusRing}`}
        >
          {id === "train" ? (
            <TrainRouteList
              content={content}
              venue={venue}
              routes={trainRoutes}
              shouldBlinkRecommended={shouldBlinkRecommended}
            />
          ) : (
            <BusRouteList content={content} venue={venue} routes={busRoutes} />
          )}
        </div>
      ))}
    </div>
  );
}

interface TrainRouteListProps {
  content: AccessPageContent["directions"];
  venue: string;
  routes: readonly TrainRoute[];
  /**
   * おすすめ枠を点滅させるか。入場演出が電車の経路を描き終えたときに立つ。
   * 点滅はクラスの付与で始まるため、JavaScript が無い環境やモーション軽減時は
   * 枠が表示されたまま点滅しない
   */
  shouldBlinkRecommended: boolean;
}

function TrainRouteList({ content, venue, routes, shouldBlinkRecommended }: TrainRouteListProps) {
  return (
    <ol role="list" className={listClassName}>
      {routes.map((route) => (
        <li
          key={route.station}
          data-route-card
          className={`${cardClassName} ${
            route.recommended ? recommendedBorderClassName : cardBorderClassName
          }`}
        >
          {route.recommended && (
            <>
              {/* バッジより先に置き、バッジが枠の上に重なるようにする */}
              <span
                aria-hidden="true"
                className={`${recommendedFrameClassName} ${
                  shouldBlinkRecommended ? "recommended-frame-blink" : ""
                }`}
              />
              <span className={recommendedBadgeClassName}>{content.recommended}</span>
            </>
          )}

          <ol>
            <TimelineStep
              marker="departure"
              title={route.station}
              subtitle={route.line}
              lineVariant="walk"
              segment={
                <WalkSegmentLabel
                  walkTimeLabel={content.walkTimeLabel}
                  minutes={route.walkTime}
                  minuteUnit={content.minuteUnit}
                />
              }
            />
            <TimelineStep marker="arrival" title={venue} />
          </ol>

          <p className="mt-auto pt-5 text-sm leading-6 text-gray-600">{route.description}</p>
        </li>
      ))}
    </ol>
  );
}

interface BusRouteListProps {
  content: AccessPageContent["directions"];
  venue: string;
  routes: readonly BusRoute[];
}

function BusRouteList({ content, venue, routes }: BusRouteListProps) {
  return (
    <ol role="list" className={listClassName}>
      {routes.map((route) => (
        <li
          key={`${route.lineCode}-${route.from}`}
          data-route-card
          className={`${cardClassName} ${cardBorderClassName}`}
        >
          <ol>
            <TimelineStep
              marker="departure"
              title={route.from}
              lineVariant="ride"
              segment={
                <RideSegmentLabel
                  lineCode={route.lineCode}
                  destinationLabel={content.destinationLabel}
                  destination={route.destination}
                  rideTimeLabel={content.rideTimeLabel}
                  minutes={route.rideTime}
                  minuteUnit={content.minuteUnit}
                />
              }
            />
            <TimelineStep
              marker="via"
              title={route.stop}
              lineVariant="walk"
              segment={
                <WalkSegmentLabel
                  walkTimeLabel={content.walkTimeLabel}
                  minutes={route.walkTime}
                  minuteUnit={content.minuteUnit}
                />
              }
            />
            <TimelineStep marker="arrival" title={venue} />
          </ol>

          <p className="mt-auto pt-5 text-xs font-bold text-gray-600">{route.operator}</p>
        </li>
      ))}
    </ol>
  );
}
