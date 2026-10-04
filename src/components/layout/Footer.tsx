import { FooterNav } from "@/components/layout/FooterNav";
import { FooterCopyright, FooterLogo } from "@/components/layout/FooterBrand";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { SponsorBanner } from "@/components/layout/SponsorBanner";

/**
 * 共通フッター
 *
 * サーバーコンポーネントのまま保つこと。`new Date().getFullYear()` を
 * クライアントで再評価させると、ビルド時と閲覧時で年をまたいだ場合に
 * ハイドレーション不一致になる。ロケール解決が要る部分は FooterNav が担う。
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white">
      <SponsorBanner />
      <footer className="relative bg-primary-600 rounded-t-3xl">
        <div className="container mx-auto px-4 py-8">
          {/* ロゴ: 左上 */}
          <div className="mb-6">
            <FooterLogo width={192} height={77} className="h-auto w-48" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <FooterNav />

            {/* SNSセクション */}
            <div>
              <h2 className="mb-4 font-bold text-white">Follow Us</h2>
              <SocialIcons
                layout="horizontal"
                size="md"
                showLabel={false}
                variant="minimal"
                className="text-white/85"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center border-t border-white/20 pt-8 text-white/85">
            <FooterLogo width={48} height={19} className="mb-3 h-auto w-12" />
            <FooterCopyright year={currentYear} />
          </div>
        </div>
      </footer>
    </div>
  );
}
