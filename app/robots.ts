import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: "https://ai.cloudmusic.cl/sitemap.xml",
    host: "https://ai.cloudmusic.cl",
  };
}
