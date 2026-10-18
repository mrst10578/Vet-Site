import type { NextConfig } from "next";

const internalApi = process.env.INTERNAL_API_URL?.replace(/\/$/, "");
if (internalApi && !/^https?:\/\/[^/]+$/i.test(internalApi)) {
  throw new Error("INTERNAL_API_URL must be an absolute HTTP(S) origin");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    if (!internalApi) return [];
    return [{ source: "/v1/:path*", destination: `${internalApi}/v1/:path*` }];
  },
};

export default nextConfig;
