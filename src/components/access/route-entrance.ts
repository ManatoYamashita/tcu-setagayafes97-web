import { gsap } from "gsap";

/**
 * 経路カードの入場演出（#294）。
 *
 * 1枚のタブパネルを対象に、次の3つを1本のタイムラインへまとめる。
 *
 * 1. カードを1枚ずつ少し遅らせて出す
 * 2. カードごとに、丸 → 線 → 丸 …… の順に経路を描く
 * 3. 徒歩の線を描くのと同時に、徒歩時間の数字を 0 から数え上げる
 *
 * 最初にスクロールで画面へ入ったときも、タブを切り替えたときも、このタイムラインを
 * 頭から再生する（起動の条件は AccessDirectionsTabs が持つ）。
 *
 * すべて `from` / `fromTo` で書く。何も実行しなければ SSR HTML の完成形がそのまま残るため、
 * JavaScript が無い環境やモーション軽減時にも破綻しない（use-scroll-reveal.ts と同じ方針）。
 * 対象は RouteTimeline / AccessDirectionsTabs が付ける data 属性で探す。
 */

const CARD_SELECTOR = "[data-route-card]";
const RAIL_SELECTOR = "[data-route-marker], [data-route-line]";
const COUNT_SELECTOR = "[data-route-count]";

/** 尺（秒） */
const TIMING = {
  /** カードのフェード */
  card: 0.5,
  /** 次のカードが出始めるまでの間 */
  cardStagger: 0.12,
  /** カードが出始めてから経路を描き始めるまでの間 */
  railDelay: 0.15,
  /** 丸が現れる尺 */
  marker: 0.25,
  /** 丸が現れ始めてから次の線を描き始めるまでの間（丸の尺より短くして重ねる） */
  markerStep: 0.2,
  /** 1区間の線を描く尺。徒歩時間の数え上げもこの尺に合わせる */
  line: 0.45,
} as const;

/** 数え上げの数字を、SSR の値（`data-route-count`）で上書きする */
function setCount(element: HTMLElement, value: number) {
  // React が描いた Text ノードを差し替えないよう、ノードの値だけを書き換える
  const node = element.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE) {
    node.nodeValue = String(value);
  } else {
    element.textContent = String(value);
  }
}

/**
 * 数え上げの数字を最終値へ戻す。
 *
 * 数え上げは textContent を書き換えるため、`gsap.context().revert()` では元に戻らない。
 * 途中でタブを切り替えた場合やアンマウント時に、呼び出し側が必ず呼ぶこと。
 */
export function resetRouteCounts(panel: HTMLElement) {
  panel.querySelectorAll<HTMLElement>(COUNT_SELECTOR).forEach((element) => {
    setCount(element, Number(element.dataset.routeCount));
  });
}

interface RouteEntranceOptions {
  /** タイムラインを最後まで再生したときに呼ぶ */
  onComplete?: () => void;
}

/**
 * パネル内の経路カードの入場タイムラインを、一時停止した状態で組んで返す。
 *
 * 組んだ時点で各要素は開始状態（非表示・丸は縮小・線は未描画・数字は 0）になる。
 * `gsap.context()` の中で呼び、後片付けは context の `revert()` と `resetRouteCounts()` で行う。
 */
export function buildRouteEntrance(
  panel: HTMLElement,
  { onComplete }: RouteEntranceOptions = {}
): gsap.core.Timeline {
  const timeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      resetRouteCounts(panel);
      onComplete?.();
    },
  });

  const cards = gsap.utils.toArray<HTMLElement>(CARD_SELECTOR, panel);

  cards.forEach((card, index) => {
    const cardStart = index * TIMING.cardStagger;

    timeline.from(
      card,
      {
        autoAlpha: 0,
        y: 24,
        duration: TIMING.card,
        ease: "power3.out",
        force3D: true,
        clearProps: "opacity,visibility,transform",
      },
      cardStart
    );

    // 丸と線は DOM 順（＝経路順）に並ぶので、そのまま前から順に描く
    let cursor = cardStart + TIMING.railDelay;

    card.querySelectorAll<HTMLElement>(RAIL_SELECTOR).forEach((rail) => {
      if (rail.hasAttribute("data-route-marker")) {
        timeline.from(
          rail,
          {
            scale: 0,
            duration: TIMING.marker,
            ease: "back.out(2)",
            clearProps: "transform",
          },
          cursor
        );
        cursor += TIMING.markerStep;
        return;
      }

      // 徒歩の点線は scaleY で伸ばすと点が潰れるため、上から切り抜きを広げて見せる
      timeline.fromTo(
        rail,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: TIMING.line,
          ease: "power1.inOut",
          clearProps: "clipPath",
        },
        cursor
      );

      // 線と同じステップ（<li>）にある徒歩時間を、線を描くのと同時に数え上げる
      const count = rail.closest("li")?.querySelector<HTMLElement>(COUNT_SELECTOR);

      if (count) {
        const target = Number(count.dataset.routeCount);
        const counter = { value: 0 };

        setCount(count, 0);
        timeline.to(
          counter,
          {
            value: target,
            duration: TIMING.line,
            ease: "power1.out",
            onUpdate: () => setCount(count, Math.round(counter.value)),
          },
          cursor
        );
      }

      cursor += TIMING.line;
    });
  });

  return timeline;
}
