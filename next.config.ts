import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["paseto", "@sparticuz/chromium", "puppeteer-core"],
  allowedDevOrigins: ["*"], // ✅ allow all origins
  outputFileTracingIncludes: {
    "/api/certificate/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   serverExternalPackages: [
//     "paseto",
//     "@sparticuz/chromium",
//     "puppeteer-core",
//     "@vercel/blob",
//   ],
//   allowedDevOrigins: ["*"], // ✅ allow all origins
//   outputFileTracingIncludes: {
//     // Covers every route under /api that calls puppeteer (both
//     // /api/certificate/pdf and the course-certificate download route),
//     // so the Chromium binary gets bundled into the deployed function.
//     "/api/**": ["./node_modules/@sparticuz/chromium/bin/**/*"],
//   },
// };

// export default nextConfig;