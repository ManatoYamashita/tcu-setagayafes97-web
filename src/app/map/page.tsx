import type { Metadata } from "next";
import { buildingsConfig } from "@/data/buildings";
import { facilitiesConfig } from "@/data/facilities";
import { CampusMapClient } from "./CampusMapClient";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "キャンパスマップ | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 世田谷キャンパスのマップ。建物の配置、施設の位置を確認できます。建物をクリックすると、その建物で開催される企画を検索できます。",
  openGraph: {
    title: "キャンパスマップ | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 世田谷キャンパスのマップ。建物の配置、施設の位置を確認できます。建物をクリックすると、その建物で開催される企画を検索できます。",
    type: "website",
  },
};

/**
 * キャンパスマップページ
 */
export default function CampusMapPage() {
  return (
    <PageSheetLayout hero={pageHeroes.map}>
      {/* マップコンテンツ */}
      <CampusMapClient buildings={buildingsConfig} infoDesks={facilitiesConfig.infoDesks} />
    </PageSheetLayout>
  );
}
