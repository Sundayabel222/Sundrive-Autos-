import { VehicleStatus } from "./constants";
import { prisma } from "./prisma";
import type { Prisma, Vehicle } from "@/generated/prisma/client";
import type { InventoryFilters } from "./validation";

export const INVENTORY_PAGE_SIZE = 9;

/** Statuses shown in the public showroom. Sold cars stay out of listings. */
const PUBLICLY_LISTED: string[] = [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED];

const SORTS = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "mileage-asc": { mileage: "asc" },
  "year-desc": { year: "desc" },
} as const satisfies Record<string, Prisma.VehicleOrderByWithRelationInput>;

export type SortKey = keyof typeof SORTS;

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && value in SORTS;
}

/**
 * Translate validated search params into a Prisma `where` clause.
 *
 * `q` searches make/model/trim/description and also matches the year, so
 * "2014 lexus" works the way visitors expect.
 */
export function buildVehicleWhere(
  filters: InventoryFilters,
  options: { publicOnly?: boolean } = {},
): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};
  const and: Prisma.VehicleWhereInput[] = [];

  if (options.publicOnly) {
    and.push({ status: { in: PUBLICLY_LISTED } });
  }

  if (filters.make) and.push({ make: filters.make });
  if (filters.bodyType) and.push({ bodyType: filters.bodyType });
  if (filters.fuelType) and.push({ fuelType: filters.fuelType });
  if (filters.transmission) and.push({ transmission: filters.transmission });
  if (filters.condition) and.push({ condition: filters.condition });
  if (filters.location) and.push({ location: filters.location });

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    and.push({
      price: {
        ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
      },
    });
  }

  if (filters.yearMin !== undefined || filters.yearMax !== undefined) {
    and.push({
      year: {
        ...(filters.yearMin !== undefined ? { gte: filters.yearMin } : {}),
        ...(filters.yearMax !== undefined ? { lte: filters.yearMax } : {}),
      },
    });
  }

  const q = filters.q?.trim();
  if (q) {
    and.push({
      OR: [
        { make: { contains: q } },
        { model: { contains: q } },
        { trim: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
        ...(/^\d{4}$/.test(q) ? [{ year: Number(q) }] : []),
      ],
    });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

export async function listVehicles(
  filters: InventoryFilters,
  options: { publicOnly?: boolean; pageSize?: number } = {},
) {
  const pageSize = options.pageSize ?? INVENTORY_PAGE_SIZE;
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const where = buildVehicleWhere(filters, options);
  const orderBy = isSortKey(filters.sort) ? SORTS[filters.sort] : SORTS.newest;

  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getFeaturedVehicles(limit = 6) {
  return prisma.vehicle.findMany({
    where: { featured: true, status: { in: PUBLICLY_LISTED } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getRecentVehicles(limit = 6) {
  return prisma.vehicle.findMany({
    where: { status: { in: PUBLICLY_LISTED } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getVehicleBySlug(slug: string) {
  return prisma.vehicle.findUnique({ where: { slug } });
}

/**
 * "Similar cars" (PRD §7). Prefers the same body type, then the same make, and
 * finally falls back to anything in the same price band so the rail is never
 * empty on a sparse inventory.
 */
export async function getSimilarVehicles(vehicle: Vehicle, limit = 3) {
  const priceFloor = Math.round(vehicle.price * 0.6);
  const priceCeiling = Math.round(vehicle.price * 1.4);

  const shared = {
    id: { not: vehicle.id },
    status: { in: PUBLICLY_LISTED },
  } satisfies Prisma.VehicleWhereInput;

  const tiers: Prisma.VehicleWhereInput[] = [
    { ...shared, bodyType: vehicle.bodyType, make: vehicle.make },
    { ...shared, bodyType: vehicle.bodyType },
    { ...shared, make: vehicle.make },
    { ...shared, price: { gte: priceFloor, lte: priceCeiling } },
  ];

  const collected: Vehicle[] = [];
  const seen = new Set<string>([vehicle.id]);

  for (const where of tiers) {
    if (collected.length >= limit) break;
    const batch = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit - collected.length,
    });
    for (const item of batch) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      collected.push(item);
    }
  }

  return collected.slice(0, limit);
}

/** Distinct values + price/year bounds used to build the filter sidebar. */
export async function getInventoryFacets() {
  const [makes, locations, prices, years] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: { in: PUBLICLY_LISTED } },
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    }),
    prisma.vehicle.findMany({
      where: { status: { in: PUBLICLY_LISTED } },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    }),
    prisma.vehicle.aggregate({
      where: { status: { in: PUBLICLY_LISTED } },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.vehicle.aggregate({
      where: { status: { in: PUBLICLY_LISTED } },
      _min: { year: true },
      _max: { year: true },
    }),
  ]);

  return {
    makes: makes.map((m) => m.make),
    locations: locations.map((l) => l.location),
    priceMin: prices._min.price ?? 0,
    priceMax: prices._max.price ?? 0,
    yearMin: years._min.year ?? new Date().getFullYear() - 15,
    yearMax: years._max.year ?? new Date().getFullYear(),
  };
}

/** Record a detail-page view. Used by the analytics widgets in the admin. */
export async function recordVehicleView(vehicleId: string) {
  await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: vehicleId },
      data: { views: { increment: 1 } },
    }),
    prisma.vehicleView.create({ data: { vehicleId } }),
  ]);
}
