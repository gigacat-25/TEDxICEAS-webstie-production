import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tedxiceas.com";
  const currentDate = new Date();

  const routes = [
    "",
    "/about",
    "/tickets",
    "/sponsors",
    "/team",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/tickets" ? 0.9 : 0.8,
  }));
}
