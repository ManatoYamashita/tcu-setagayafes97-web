import type { Metadata } from "next";
import { Noto_Sans_JP, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: true,
});

// サイトタイトル・見出し用フォント
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
});

// カウントダウン数字専用フォント
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable} font-sans antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
