import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Docker: http://backend:8000 / 로컬: http://127.0.0.1:8000 — 브라우저는 /api 로 요청하면 Next가 프록시 */
const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

const isProductionBuild = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  distDir: isProductionBuild ? ".next" : ".next-dev",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendInternalUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
