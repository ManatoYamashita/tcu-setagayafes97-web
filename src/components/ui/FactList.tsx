/**
 * ラベル・値の2列リスト
 *
 * About の開催概要（src/components/about/FestivalIntroSection.tsx）と同じ構成で、
 * 角丸・影・セル背景を持たず、左の一本線と余白だけでまとまりを示す
 * （docs/frontend/design.md「開催概要の情報リスト」）。
 * `alert` は危険・緊急の意味を持つ情報にだけ使う。赤は危険の意味を担う色なので、
 * 区別のためだけに使わないこと。
 * Tailwind がクラスを検出できるよう、値は完全なリテラルで書く。
 */
const factTones = {
  default: { rule: "border-primary-600", label: "text-primary-700" },
  alert: { rule: "border-red-700", label: "text-red-700" },
} as const;

export interface FactListItem {
  label: string;
  value: string;
}

export function FactList({
  items,
  tone = "default",
}: {
  items: readonly FactListItem[];
  tone?: keyof typeof factTones;
}) {
  const style = factTones[tone];
  return (
    <dl className={`space-y-3 border-l-[3px] pl-5 sm:pl-8 ${style.rule}`}>
      {items.map((item) => (
        <div key={item.label} className="sm:flex sm:gap-8">
          <dt
            className={`w-32 shrink-0 break-keep text-sm font-bold leading-6 sm:w-40 sm:text-base sm:leading-7 ${style.label}`}
          >
            {item.label}
          </dt>
          <dd className="text-sm leading-7 text-gray-900 sm:text-base">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
