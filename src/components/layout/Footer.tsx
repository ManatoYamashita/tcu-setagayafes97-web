import Link from "next/link";
import { siteConfig } from "@/data/site";
import { navigationConfig } from "@/data/navigation";
import { SocialIcons } from "@/components/ui/SocialIcons";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/20 bg-primary-600">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {navigationConfig.footer.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-bold text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* SNSセクション */}
          <div>
            <h3 className="mb-4 font-bold text-white">Follow Us</h3>
            <SocialIcons
              layout="horizontal"
              size="md"
              showLabel={false}
              variant="circle"
              className="text-white/70"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-8 text-center text-white/60">
          <p className="mb-2">{siteConfig.name}</p>
          <p className="text-sm">
            © {currentYear} 東京都市大学 世田谷祭実行委員会. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
