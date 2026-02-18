import Link from "next/link";
import { navigationConfig } from "@/data/navigation";
import { NavDropdown } from "@/components/layout/NavDropdown";

interface DesktopNavProps {
  isScrolled?: boolean;
}

/**
 * デスクトップ用ナビゲーションコンポーネント
 *
 * navigationConfig.header からナビゲーションを生成
 * - children がない項目: 通常リンク
 * - children がある項目: NavDropdown を使用
 * - isScrolled で文字色を切替（透明Header時は白、スクロール後は黒）
 */
export function DesktopNav({ isScrolled = true }: DesktopNavProps) {
  const textClass = isScrolled
    ? "text-gray-700 hover:text-primary"
    : "text-white/90 hover:text-white";

  return (
    <nav className="hidden md:block">
      <ul className="flex gap-8">
        {navigationConfig.header.map((item) => {
          const hasChildren = "children" in item && item.children;
          return (
            <li key={item.href}>
              {hasChildren ? (
                <NavDropdown
                  item={
                    item as {
                      label: string;
                      href: string;
                      children: readonly { label: string; href: string }[];
                    }
                  }
                  isScrolled={isScrolled}
                />
              ) : (
                <Link href={item.href} className={`transition-colors ${textClass}`}>
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
