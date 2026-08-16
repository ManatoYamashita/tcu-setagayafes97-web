import Link from "next/link";
import { NavDropdown } from "@/components/layout/NavDropdown";
import type { ChromeNavItem } from "@/components/layout/useChromeNav";

interface DesktopNavProps {
  items: readonly ChromeNavItem[];
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
export function DesktopNav({ items }: DesktopNavProps) {
  return (
    <nav className="hidden lg:block">
      {/*
        gap は lg 帯だけ詰める。デスクトップナビは lg (1024px) から出るが、
        実測（2026-08-16）で必要幅は padding 48 + ロゴ 208 + ナビ + 言語切替 90。
        gap-8 のままだとナビ 674px で合計 1020px となり、1024px での余白が 4px しかない。
        gap-6 なら 988px となり 36px の余裕ができる。xl 以降は元の間隔へ戻す。
      */}
      <ul className="flex gap-6 xl:gap-8">
        {items.map((item) => (
          // key は href ではなく id。href はロケールで変わるため
          <li key={item.id}>
            {item.children ? (
              <NavDropdown item={item} />
            ) : (
              <Link
                href={item.href}
                hrefLang={item.hrefLang}
                className="text-gray-900/80 transition-colors hover:text-gray-900"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
