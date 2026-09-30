import Link from "next/link";
import { NavDropdown } from "@/components/layout/NavDropdown";
import {
  isChromePathActive,
  isChromePathCurrent,
  type ChromeNavItem,
} from "@/components/layout/useChromeNav";

interface DesktopNavProps {
  items: readonly ChromeNavItem[];
  /**
   * nav の aria-label。ページ内に nav が複数あるため名前が要る。
   * 例: /info/[id] にはパンくずの nav が同居する
   */
  label: string;
  pathname: string;
}

/**
 * デスクトップ用ナビゲーションコンポーネント
 *
 * ロケール解決済みの items を Header から受け取るだけの純プレゼンテーション。
 * 自前で useChromeNav() を呼ばないのは、Header と解決結果を共有していることを
 * 構造で保証するため。
 *
 * - children がない項目: 通常リンク
 * - children がある項目: NavDropdown を使用
 */
export function DesktopNav({ items, label, pathname }: DesktopNavProps) {
  return (
    <nav aria-label={label} className="hidden lg:block">
      {/*
        gap は lg 帯だけ詰める。デスクトップナビは lg (1024px) から出るが、
        実測（2026-08-16）で必要幅は padding 48 + ロゴ 208 + ナビ + 言語切替 90。
        gap-8 のままだとナビ 674px で合計 1020px となり、1024px での余白が 4px しかない。
        gap-6 なら 988px となり 36px の余裕ができる。xl 以降は元の間隔へ戻す。
      */}
      <ul className="flex gap-6 xl:gap-8">
        {items.map((item) => {
          const isActive =
            isChromePathActive(pathname, item.href) ||
            Boolean(item.children?.some((child) => isChromePathActive(pathname, child.href)));

          return (
            // key は href ではなく id。href はロケールで変わるため
            <li key={item.id}>
              {item.children ? (
                <NavDropdown item={item} pathname={pathname} isActive={isActive} />
              ) : (
                <Link
                  href={item.href}
                  prefetch={false}
                  hrefLang={item.hrefLang}
                  aria-current={isChromePathCurrent(pathname, item.href) ? "page" : undefined}
                  className={`underline-offset-4 transition-colors hover:underline ${
                    isActive
                      ? "font-bold text-primary-600 hover:text-primary-600"
                      : "text-gray-900/80 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
