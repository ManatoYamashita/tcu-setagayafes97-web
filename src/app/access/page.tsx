import type { Metadata } from "next";
import { AccessPageView } from "@/components/access/AccessPageContent";

export const metadata: Metadata = {
  title: "アクセス | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 世田谷キャンパスへのアクセス情報。最寄りの尾山台駅からの徒歩ルート、バス案内、会場地図をご確認いただけます。",
  openGraph: {
    title: "アクセス | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 世田谷キャンパスへのアクセス情報。最寄りの尾山台駅からの徒歩ルート、バス案内、会場地図をご確認いただけます。",
    type: "website",
  },
};

export default function AccessPage() {
  return <AccessPageView />;
}
