import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["paseto"],

  allowedDevOrigins: ["*"],

  async headers() {
    return [
      {
        source: "/api/:path*",

        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              "https://learning-mgmt-system-alpha.vercel.app",
          },

          {
            key: "Access-Control-Allow-Methods",
            value:
              "GET, POST, PUT, DELETE, OPTIONS",
          },

          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization",
          },

          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
