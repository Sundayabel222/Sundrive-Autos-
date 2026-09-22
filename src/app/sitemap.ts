import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
import { VehicleStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/** Sitemap covering the static pages plus every publicly listed vehicle. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/inventory`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site.url}/sourcing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/inspection`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...vehicles.map((vehicle) => ({
      url: `${site.url}/cars/${vehicle.slug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
