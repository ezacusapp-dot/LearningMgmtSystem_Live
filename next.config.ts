import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["paseto", "@sparticuz/chromium", "puppeteer-core"],
  allowedDevOrigins: ["*"], // ✅ allow all origins
};

export default nextConfig;