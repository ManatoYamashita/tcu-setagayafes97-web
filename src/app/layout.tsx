import type { Metadata } from "next";
import { Noto_Sans_JP, Kaisei_Opti, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Opener } from "@/components/layout/Opener";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: true,
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-shippori-mincho",
  display: "swap",
  preload: false,
});

const kaiseiOpti = Kaisei_Opti({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-kaisei-opti",
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
        className={`${notoSansJP.variable} ${kaiseiOpti.variable} ${shipporiMincho.variable} font-sans antialiased text-gray-900`}
      >
        <Opener />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
