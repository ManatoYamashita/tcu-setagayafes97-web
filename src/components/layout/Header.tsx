"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";
import { cardNavItems } from "@/data/navigation";
import { LanguageSwitcherWrapper } from "@/components/layout/LanguageSwitcherWrapper";
import { CardNav } from "@/components/layout/CardNav";

/**
 * 共通ヘッダーコンポーネント（CardNav 浮遊型ナビゲーション）
 *
 * - GSAP アニメーション付き浮遊型カードナビゲーション
 * - ハンバーガーメニュー押下で3枚のカラーカードが展開
 * - position: fixed でページ上部に浮遊
 */
export function Header() {
  return (
    <CardNav
      items={cardNavItems}
      logo={
        <Link href="/" className="logo-link text-primary transition-colors hover:text-primary/80">
          {siteConfig.shortName}
        </Link>
      }
      ctaSlot={<LanguageSwitcherWrapper />}
      baseColor="#fff"
      menuColor="#000"
      ease="power3.out"
    />
  );
}
