import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["paseto"],
  allowedDevOrigins: ["*"], // ✅ allow all origins
};

export default nextConfig;