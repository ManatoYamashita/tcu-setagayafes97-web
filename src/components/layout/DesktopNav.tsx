import Link from "next/link";
import { getFilteredHeaderNav } from "@/data/navigation";
import { NavDropdown } from "@/components/layout/NavDropdown";

/**
 * デスクトップ用ナビゲーションコンポーネント
 *
 * getFilteredHeaderNav() でデータ公開状態に応じたナビゲーションを生成
 * - children がない項目: 通常リンク
 * - children がある項目: NavDropdown を使用
 */
export function DesktopNav() {
  const headerItems = getFilteredHeaderNav();

  return (
    <nav className="hidden lg:block">
      <ul className="flex gap-8">
        {headerItems.map((item) => (
          <li key={item.href}>
            {"children" in item && item.children ? (
              <NavDropdown item={item} />
            ) : (
              <Link
                href={item.href}
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
