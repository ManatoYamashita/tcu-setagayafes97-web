import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/data/site";
import { Header } from "@/components/layout/Header";
import { HtmlLangSync } from "@/components/layout/HtmlLangSync";
import { NoImageDrag } from "@/components/layout/NoImageDrag";
import { Footer } from "@/components/layout/Footer";
import { OpenerLoader } from "@/components/layout/OpenerLoader";
import { AgentationDevTool } from "@/components/dev/AgentationDevTool";
import { DeferredKaiseiFontsLoader } from "@/components/layout/DeferredKaiseiFontsLoader";

export const metadata: Metadata = {
  applicationName: siteConfig.metadata.searchSiteName,
  title: {
    default: siteConfig.metadata.siteName,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.metadata.siteName,
    description: siteConfig.description,
    url: siteConfig.metadata.siteUrl,
    siteName: siteConfig.metadata.searchSiteName,
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
  creator: siteConfig.organization.name,
  publisher: siteConfig.organization.name,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/images/brand/favicon.png",
        type: "image/png",
        sizes: "500x500",
      },
    ],
    apple: [
      {
        url: "/images/brand/favicon.png",
        type: "image/png",
        sizes: "500x500",
      },
    ],
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
      <body className="font-sans antialiased text-gray-900">
        <HtmlLangSync />
        <NoImageDrag />
        <DeferredKaiseiFontsLoader />
        <OpenerLoader />
        <Header />
        {children}
        <Footer />
        <AgentationDevTool />
      </body>
    </html>
  );
}
