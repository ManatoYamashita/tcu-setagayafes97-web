import type { Metadata } from "next";
import { buildingsConfig } from "@/data/buildings";
import { facilitiesConfig } from "@/data/facilities";
import { CampusMapClient } from "./CampusMapClient";

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">キャンパスマップ</h1>
          <p className="text-center text-lg opacity-90">
            建物をクリックすると、開催企画を検索できます
          </p>
        </div>
      </div>

      {/* マップコンテンツ */}
      <CampusMapClient buildings={buildingsConfig} infoDesks={facilitiesConfig.infoDesks} />
    </div>
  );
}
