import { getAdsList } from "@/lib/informations";
import { AdBannersView } from "./AdBannersView";
import { MobileAdDock } from "./MobileAdDock";

/**
 * 広告掲載（サーバーコンポーネント。#481）
 *
 * データ取得だけを担い、全ページのフッター上の広告欄と、モバイルの画面下部の固定バナーへ渡す。
 * 取得は協賛バーと同じリクエストを共有する（`src/lib/informations.ts`）。0件なら何も出さない。
 */
export async function AdBanners() {
  const ads = await getAdsList();

  if (ads.length === 0) {
    return null;
  }

  return (
    <>
      {/* 固定バナーを先に置く。Tab の順で、本文の次・広告欄の前に来る */}
      <MobileAdDock ads={ads} />
      <AdBannersView ads={ads} />
    </>
  );
}
