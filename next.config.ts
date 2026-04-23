// next.config.ts
import { CurrentWebBaseURL } from "@shared/constants/url.constant";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      config.module.rules.push({
        test: /\.worker\.(js|ts|mjs)$/,
        use: { loader: "worker-loader" },
      });
    }
    return config;
  },
  transpilePackages: ["../shared"],
  basePath: "/" + CurrentWebBaseURL,
};

export default nextConfig;
