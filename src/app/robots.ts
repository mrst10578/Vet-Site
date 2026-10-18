import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/clinic", "/pets", "/my-pets", "/login", "/api", "/v1"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
// Robots is a crawler hint only; all private routes must authenticate in the API.
