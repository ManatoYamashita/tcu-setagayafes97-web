/**
 * 画像の無い協賛企業を、ロゴ帯の中で社名の文字として見せる
 *
 * `.logoloop__item` は `font-size: var(--logoloop-logoHeight)`（40px）を持つため、
 * 文字サイズはこの要素自身に明示する。外すと社名がロゴ帯の高さと同じ大きさになる。
 */
export function SponsorWordmark({ title }: { title: string }) {
  return (
    <span className="inline-flex h-10 items-center text-lg leading-none font-bold whitespace-nowrap text-gray-700">
      {title}
    </span>
  );
}
