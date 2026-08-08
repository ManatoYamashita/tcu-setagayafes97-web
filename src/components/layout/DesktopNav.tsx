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
      <ul className="flex gap-8">
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
