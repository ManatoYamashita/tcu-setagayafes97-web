import type { Metadata } from "next";
import { Noto_Sans_JP, Kaisei_Opti, Dela_Gothic_One } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";
import { Header } from "@/components/layout/Header";
import { HtmlLangSync } from "@/components/layout/HtmlLangSync";
import { Footer } from "@/components/layout/Footer";
import { Opener } from "@/components/layout/Opener";
import { AgentationDevTool } from "@/components/dev/AgentationDevTool";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-noto-sans-jp",
  display: "swap",
  // 日本語フォントは unicode-range ごとに多数のファイルへ分割される。
  // 全分割ファイルを preload せず、実際に使う文字だけブラウザに選ばせる。
  preload: false,
});

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dela-gothic-one",
  display: "swap",
  preload: false,
});

const kaiseiOpti = Kaisei_Opti({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kaisei-opti",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.metadata.siteName,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.metadata.siteName,
    description: siteConfig.description,
    url: siteConfig.metadata.siteUrl,
    siteName: siteConfig.metadata.siteName,
    images: [
      {
        url: siteConfig.metadata.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.metadata.siteName,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.metadata.siteName,
    description: siteConfig.description,
    images: [siteConfig.metadata.ogImage],
  },
  metadataBase: new URL(siteConfig.metadata.siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 初期値は既定ロケール。実際のロケールへは HtmlLangSync が同期する
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${kaiseiOpti.variable} ${delaGothicOne.variable} font-sans antialiased text-gray-900`}
      >
        <HtmlLangSync />
        <Opener />
        <Header />
        {children}
        <Footer />
        <AgentationDevTool />
      </body>
    </html>
  );
}
