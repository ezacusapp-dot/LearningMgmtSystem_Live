import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  allowedDevOrigins: ["*"],
  outputFileTracingIncludes: {
    "/api/student/certificates/[id]/download": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;