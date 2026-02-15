import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://ai.cloudmusic.cl/",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://ai.cloudmusic.cl/es-cl",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://ai.cloudmusic.cl/es-es",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
