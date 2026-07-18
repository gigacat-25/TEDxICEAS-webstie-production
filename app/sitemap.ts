import { headers } from "next/headers";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get("host") || "tedxiceas.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;
  const currentDate = new Date();

  const routes = [
    "",
    "/speakers",
    "/about",
    "/tickets",
    "/sponsors",
    "/team",
    "/chat",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" || route === "/speakers" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route === "/speakers" || route === "/tickets" ? 0.9 : route === "/about" ? 0.8 : 0.7,
  }));
}
