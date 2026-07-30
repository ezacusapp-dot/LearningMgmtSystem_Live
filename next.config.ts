import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["paseto", "@sparticuz/chromium", "puppeteer-core"],
  allowedDevOrigins: ["*"], // ✅ allow all origins
  outputFileTracingIncludes: {
    "/api/certificate/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;