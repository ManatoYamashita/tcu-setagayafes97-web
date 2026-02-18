import Link from "next/link";
import { siteConfig } from "@/data/site";
import { navigationConfig } from "@/data/navigation";
import { SocialIcons } from "@/components/ui/SocialIcons";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const colCount = navigationConfig.footer.length + 1;

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div
          className="grid grid-cols-1 gap-8"
          style={{
            gridTemplateColumns: undefined,
          }}
          data-footer-grid
        >
          {navigationConfig.footer.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-bold text-gray-900">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-600 hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* SNSセクション */}
          <div>
            <h3 className="mb-4 font-bold text-gray-900">Follow Us</h3>
            <SocialIcons layout="vertical" size="md" showLabel className="text-gray-600" />
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-gray-600">
          <p className="mb-2">{siteConfig.name}</p>
          <p className="text-sm">
            © {currentYear} 東京都市大学 世田谷祭実行委員会. All rights reserved.
          </p>
        </div>
      </div>

      {/* フッターセクション数に応じた動的グリッド */}
      <style>{`
        @media (min-width: 768px) {
          [data-footer-grid] {
            grid-template-columns: repeat(${colCount}, minmax(0, 1fr));
          }
        }
      `}</style>
    </footer>
  );
}
