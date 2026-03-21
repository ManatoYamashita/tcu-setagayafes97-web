import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: [
      "gsap",
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
