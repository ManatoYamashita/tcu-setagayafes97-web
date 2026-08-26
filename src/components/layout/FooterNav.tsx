"use client";

import Link from "next/link";
import { useChromeNav } from "@/components/layout/useChromeNav";

/**
 * フッターのナビゲーション部分
 *
 * Footer 本体はサーバーコンポーネントのまま保つため、ロケール解決が必要な
 * この部分だけを切り出している。Footer ごとクライアント化すると
 * `new Date().getFullYear()` がハイドレーション時に再評価され、ビルドが12月・
 * 閲覧が1月というだけでコピーライトの年が食い違う。
 *
 * Footer から props を渡せない（サーバーコンポーネントはフックを呼べない）ため、
 * ここで自前に useChromeNav() を呼ぶ。
 */
export function FooterNav() {
  const { footerSections } = useChromeNav();

  return (
    <>
      {footerSections.map((section) => (
        <div key={section.id}>
          <h3 className="mb-4 font-bold text-white">{section.title}</h3>
          <ul className="space-y-2">
            {section.links.map((link) => (
              // key は href ではなく id。href はロケールで変わるため
              <li key={link.id}>
                <Link
                  href={link.href}
                  hrefLang={link.hrefLang}
                  className="text-white/85 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
