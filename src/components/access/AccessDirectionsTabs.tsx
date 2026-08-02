"use client";

import { Bus, Train } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
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

const recommendedBorderClassName = "border-2 border-primary-600";

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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
      <div role="tablist" aria-label={content.title} className={tablistClassName}>
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
          aria-labelledby={`${TAB_ID_PREFIX}${id}`}
          tabIndex={0}
          hidden={activeTab !== id}
          className={`mt-6 rounded-2xl ${focusRing}`}
        >
          {id === "train" ? (
            <TrainRouteList content={content} venue={venue} routes={trainRoutes} />
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
}

function TrainRouteList({ content, venue, routes }: TrainRouteListProps) {
  return (
    <ol role="list" className={listClassName}>
      {routes.map((route) => (
        <li
          key={route.station}
          className={`${cardClassName} ${
            route.recommended ? recommendedBorderClassName : cardBorderClassName
          }`}
        >
          {route.recommended && (
            <span className={recommendedBadgeClassName}>{content.recommended}</span>
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
