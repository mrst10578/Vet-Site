import type { NextConfig } from "next";

const staticExport = process.env.CF_PAGES_STATIC === "1";
const internalApi = process.env.INTERNAL_API_URL?.replace(/\/$/, "");

if (internalApi && !/^https?:\/\/[^/]+$/i.test(internalApi)) {
  throw new Error("INTERNAL_API_URL must be an absolute HTTP(S) origin");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  ...(staticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async rewrites() {
          if (!internalApi) return [];
          return [{ source: "/v1/:path*", destination: `${internalApi}/v1/:path*` }];
        },
      }),
};

export default nextConfig;
