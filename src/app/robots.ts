import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/clinic", "/pets", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
// Robots is only a crawler hint. Authentication is mandatory for private content.
