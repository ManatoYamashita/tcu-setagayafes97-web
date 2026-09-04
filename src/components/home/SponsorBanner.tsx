import { getSponsorsList } from "@/lib/informations";
import { SponsorLogoLoopLoader } from "./SponsorLogoLoopLoader";

/**
 * 協賛企業バナーセクション（サーバーコンポーネント）
 * データ取得のみ担当し、表示はクライアントコンポーネントに委譲
 */
export async function SponsorBanner() {
  const sponsors = await getSponsorsList();

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className="deferred-section deferred-section--sponsors overflow-hidden bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-3xl font-bold">協賛・協力</h2>
      </div>
      <SponsorLogoLoopLoader sponsors={sponsors} />
    </section>
  );
}
