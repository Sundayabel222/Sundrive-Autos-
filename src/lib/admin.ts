import type { Prisma } from "@/generated/prisma/client";
import {
  InspectionStatus,
  MessageStatus,
  SourcingStatus,
  VehicleStatus,
} from "./constants";
import { prisma } from "./prisma";

/**
 * Read queries and small helpers for the admin dashboard (PRD §12–§18).
 *
 * Kept out of src/lib/queries.ts, which is the public showroom's query layer —
 * the admin needs different filters (every status is visible, sold cars
 * included) and different shapes (counts, aggregations, merged lead feeds).
 */

export const ADMIN_PAGE_SIZE = 12;

/* -------------------------------------------------------------------------- */
/* Search-param helpers                                                        */
/* -------------------------------------------------------------------------- */

/** First non-empty string value, or undefined. Search params arrive as `string | string[]`. */
export function paramText(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.trim().length > 0 ? first.trim() : undefined;
}

export function paramPage(value: unknown): number {
  const parsed = Number(paramText(value));
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

/** Build an admin list href, dropping empty values and the default first page. */
export function listHref(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const text = String(value).trim();
    if (!text || (key === "page" && text === "1")) continue;
    search.set(key, text);
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function inList<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export const isVehicleStatus = (value: unknown) => inList(Object.values(VehicleStatus), value);
export const isInspectionStatus = (value: unknown) =>
  inList(Object.values(InspectionStatus), value);
export const isSourcingStatus = (value: unknown) => inList(Object.values(SourcingStatus), value);
export const isMessageStatus = (value: unknown) => inList(Object.values(MessageStatus), value);

/** `IN_PROGRESS` -> `In progress`, for filter chips and selects. */
export function statusLabel(status: string) {
  const words = status.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

function paginate<T>(items: T[], total: number, page: number, pageSize = ADMIN_PAGE_SIZE): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Shared `findMany` + `count` in one round trip, with the page clamped to the data. */
async function paginateQuery<T>(
  page: number,
  query: { findMany: (skip: number, take: number) => Promise<T[]>; count: () => Promise<number> },
): Promise<Paginated<T>> {
  const total = await query.count();
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = await query.findMany((safePage - 1) * ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZE);

  return paginate(items, total, safePage);
}

/* -------------------------------------------------------------------------- */
/* Sidebar badge counts                                                        */
/* -------------------------------------------------------------------------- */

export async function getAdminCounts() {
  const [pendingInspections, newSourcing, newMessages] = await Promise.all([
    prisma.inspection.count({ where: { status: InspectionStatus.PENDING } }),
    prisma.sourcingRequest.count({ where: { status: SourcingStatus.NEW } }),
    prisma.contactMessage.count({ where: { status: MessageStatus.NEW } }),
  ]);

  return { pendingInspections, newSourcing, newMessages };
}

/* -------------------------------------------------------------------------- */
/* Dashboard overview (PRD §12)                                                */
/* -------------------------------------------------------------------------- */

export type LeadFeedItem = {
  id: string;
  kind: "inspection" | "sourcing" | "message";
  label: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  href: string;
};

export async function getDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const listed = [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED];

  const [
    totalVehicles,
    availableCount,
    reservedCount,
    soldCount,
    featuredCount,
    inventoryValue,
    soldValue,
    soldTotalCount,
    soldThisMonth,
    inspectionCount,
    pendingInspections,
    upcomingInspections,
    sourcingCount,
    newSourcing,
    openSourcing,
    messageCount,
    newMessages,
    customerCount,
    recentInspections,
    recentSourcing,
    recentMessages,
    topViewed,
    makeMix,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.RESERVED } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.SOLD } }),
    prisma.vehicle.count({ where: { featured: true } }),
    prisma.vehicle.aggregate({ where: { status: { in: listed } }, _sum: { price: true } }),
    prisma.vehicle.aggregate({ where: { status: VehicleStatus.SOLD }, _sum: { price: true } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.SOLD } }),
    prisma.vehicle.findMany({
      where: { status: VehicleStatus.SOLD, updatedAt: { gte: startOfMonth } },
      select: { price: true },
    }),
    prisma.inspection.count(),
    prisma.inspection.count({ where: { status: InspectionStatus.PENDING } }),
    prisma.inspection.findMany({
      where: {
        status: {
          in: [InspectionStatus.PENDING, InspectionStatus.APPROVED, InspectionStatus.RESCHEDULED],
        },
        preferredDate: { gte: startOfToday },
      },
      orderBy: { preferredDate: "asc" },
      take: 5,
    }),
    prisma.sourcingRequest.count(),
    prisma.sourcingRequest.count({ where: { status: SourcingStatus.NEW } }),
    prisma.sourcingRequest.count({
      where: { status: { in: [SourcingStatus.NEW, SourcingStatus.IN_PROGRESS] } },
    }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: MessageStatus.NEW } }),
    prisma.customer.count(),
    prisma.inspection.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.sourcingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.vehicle.findMany({
      orderBy: { views: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        make: true,
        model: true,
        trim: true,
        year: true,
        price: true,
        status: true,
        views: true,
      },
    }),
    prisma.vehicle.groupBy({
      by: ["make"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  // One chronological feed across all three lead queues (PRD §12 "new messages").
  const feed: LeadFeedItem[] = [
    ...recentInspections.map((item) => ({
      id: item.id,
      kind: "inspection" as const,
      label: item.vehicleLabel,
      name: item.customerName,
      email: item.email,
      status: item.status,
      createdAt: item.createdAt,
      href: `/admin/inspections?q=${encodeURIComponent(item.email)}`,
    })),
    ...recentSourcing.map((item) => ({
      id: item.id,
      kind: "sourcing" as const,
      label: `${item.make} ${item.model}`,
      name: item.customerName,
      email: item.email,
      status: item.status,
      createdAt: item.createdAt,
      href: `/admin/sourcing?q=${encodeURIComponent(item.email)}`,
    })),
    ...recentMessages.map((item) => ({
      id: item.id,
      kind: "message" as const,
      label: item.subject ?? "General enquiry",
      name: item.name,
      email: item.email,
      status: item.status,
      createdAt: item.createdAt,
      href: `/admin/messages?q=${encodeURIComponent(item.email)}`,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const soldThisMonthValue = soldThisMonth.reduce((sum, item) => sum + item.price, 0);

  return {
    inventory: {
      total: totalVehicles,
      available: availableCount,
      reserved: reservedCount,
      sold: soldCount,
      featured: featuredCount,
      listedValue: inventoryValue._sum.price ?? 0,
    },
    sales: {
      soldTotal: soldTotalCount,
      soldValue: soldValue._sum.price ?? 0,
      soldThisMonth: soldThisMonth.length,
      soldThisMonthValue,
      averageSoldPrice:
        soldTotalCount > 0 ? Math.round((soldValue._sum.price ?? 0) / soldTotalCount) : 0,
    },
    leads: {
      inspections: inspectionCount,
      pendingInspections,
      sourcing: sourcingCount,
      newSourcing,
      openSourcing,
      messages: messageCount,
      newMessages,
      customers: customerCount,
      total: inspectionCount + sourcingCount + messageCount,
    },
    upcomingInspections,
    feed,
    topViewed,
    makeMix: makeMix.map((row) => ({ make: row.make, count: row._count.id })),
  };
}

/* -------------------------------------------------------------------------- */
/* Inventory management (PRD §13)                                              */
/* -------------------------------------------------------------------------- */

export async function listAdminVehicles(params: { q?: string; status?: string; page?: number }) {
  const and: Prisma.VehicleWhereInput[] = [];

  if (isVehicleStatus(params.status)) and.push({ status: params.status });

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { make: { contains: q } },
        { model: { contains: q } },
        { trim: { contains: q } },
        { slug: { contains: q } },
        { vin: { contains: q } },
        { location: { contains: q } },
      ],
    });
  }

  const where: Prisma.VehicleWhereInput = and.length > 0 ? { AND: and } : {};

  return paginateQuery(params.page ?? 1, {
    count: () => prisma.vehicle.count({ where }),
    findMany: (skip, take) =>
      prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
  });
}

/** Row counts for the status filter tabs, in one query. */
export async function getVehicleStatusCounts() {
  const [rows, total] = await Promise.all([
    prisma.vehicle.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.vehicle.count(),
  ]);

  const counts: Record<string, number> = {
    [VehicleStatus.AVAILABLE]: 0,
    [VehicleStatus.RESERVED]: 0,
    [VehicleStatus.SOLD]: 0,
  };

  for (const row of rows) counts[row.status] = row._count.id;

  return { counts, total };
}

export function getVehicleForAdmin(id: string) {
  return prisma.vehicle.findUnique({ where: { id } });
}

/* -------------------------------------------------------------------------- */
/* Lead queues                                                                 */
/* -------------------------------------------------------------------------- */

export async function listAdminInspections(params: { q?: string; status?: string; page?: number }) {
  const and: Prisma.InspectionWhereInput[] = [];

  if (isInspectionStatus(params.status)) and.push({ status: params.status });

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { customerName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { vehicleLabel: { contains: q } },
      ],
    });
  }

  const where: Prisma.InspectionWhereInput = and.length > 0 ? { AND: and } : {};

  return paginateQuery(params.page ?? 1, {
    count: () => prisma.inspection.count({ where }),
    findMany: (skip, take) =>
      prisma.inspection.findMany({
        where,
        orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
        skip,
        take,
        include: { vehicle: { select: { slug: true, make: true, model: true, trim: true, year: true } } },
      }),
  });
}

export async function listAdminSourcing(params: { q?: string; status?: string; page?: number }) {
  const and: Prisma.SourcingRequestWhereInput[] = [];

  if (isSourcingStatus(params.status)) and.push({ status: params.status });

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { customerName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { make: { contains: q } },
        { model: { contains: q } },
        { location: { contains: q } },
      ],
    });
  }

  const where: Prisma.SourcingRequestWhereInput = and.length > 0 ? { AND: and } : {};

  return paginateQuery(params.page ?? 1, {
    count: () => prisma.sourcingRequest.count({ where }),
    findMany: (skip, take) =>
      prisma.sourcingRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
  });
}

export async function listAdminMessages(params: { q?: string; status?: string; page?: number }) {
  const and: Prisma.ContactMessageWhereInput[] = [];

  if (isMessageStatus(params.status)) and.push({ status: params.status });

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { subject: { contains: q } },
        { message: { contains: q } },
      ],
    });
  }

  const where: Prisma.ContactMessageWhereInput = and.length > 0 ? { AND: and } : {};

  return paginateQuery(params.page ?? 1, {
    count: () => prisma.contactMessage.count({ where }),
    findMany: (skip, take) =>
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
  });
}

/* -------------------------------------------------------------------------- */
/* Queue tab counts                                                            */
/* -------------------------------------------------------------------------- */

/** Counts per status for a queue's filter tabs, plus the overall total. */
export async function getInspectionStatusCounts() {
  const [rows, total] = await Promise.all([
    prisma.inspection.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.inspection.count(),
  ]);

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = row._count.id;
  return { counts, total };
}

export async function getSourcingStatusCounts() {
  const [rows, total] = await Promise.all([
    prisma.sourcingRequest.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.sourcingRequest.count(),
  ]);

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = row._count.id;
  return { counts, total };
}

export async function getMessageStatusCounts() {
  const [rows, total] = await Promise.all([
    prisma.contactMessage.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.contactMessage.count(),
  ]);

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = row._count.id;
  return { counts, total };
}

/**
 * Deep link that opens WhatsApp with the customer, for one-tap follow-ups from
 * the console. Returns null when we have no usable number on file.
 */
export function customerWhatsAppHref(phone: string | null | undefined, message?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/* -------------------------------------------------------------------------- */
/* Customer management (PRD §14)                                               */
/* -------------------------------------------------------------------------- */

export async function listAdminCustomers(params: { q?: string; page?: number }) {
  const q = params.q?.trim();
  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  return paginateQuery(params.page ?? 1, {
    count: () => prisma.customer.count({ where }),
    findMany: (skip, take) =>
      prisma.customer.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take,
        include: {
          _count: { select: { inspections: true, sourcing: true, messages: true } },
        },
      }),
  });
}

export async function getCustomerDetail(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      inspections: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: { select: { slug: true, make: true, model: true, trim: true, year: true } } },
      },
      sourcing: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) return null;

  return {
    customer,
    counts: {
      inspections: customer.inspections.length,
      sourcing: customer.sourcing.length,
      messages: customer.messages.length,
    },
    lastSeen: [
      ...customer.inspections.map((i) => i.createdAt),
      ...customer.sourcing.map((s) => s.createdAt),
      ...customer.messages.map((m) => m.createdAt),
    ].sort((a, b) => b.getTime() - a.getTime())[0],
  };
}

/* -------------------------------------------------------------------------- */
/* Analytics (PRD §18)                                                         */
/* -------------------------------------------------------------------------- */

const DAY_MS = 86_400_000;

export async function getAnalytics() {
  const now = new Date();
  const since = new Date(now.getTime() - 29 * DAY_MS);

  const [
    lifetimeViews,
    recentViews,
    topViewed,
    searchGroups,
    searchTotal,
    inspectionSources,
    sourcingSources,
    messageSources,
    inspectionTotal,
    sourcingTotal,
    messageTotal,
    customerTotal,
    makeMix,
    listedValue,
  ] = await Promise.all([
    prisma.vehicle.aggregate({ _sum: { views: true } }),
    prisma.vehicleView.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      take: 20_000,
    }),
    prisma.vehicle.findMany({
      orderBy: { views: "desc" },
      take: 8,
      select: {
        id: true,
        slug: true,
        make: true,
        model: true,
        trim: true,
        year: true,
        price: true,
        status: true,
        views: true,
      },
    }),
    prisma.searchLog.groupBy({
      by: ["term"],
      _count: { id: true },
      _avg: { resultCount: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.searchLog.count(),
    prisma.inspection.groupBy({ by: ["leadSource"], _count: { id: true } }),
    prisma.sourcingRequest.groupBy({ by: ["leadSource"], _count: { id: true } }),
    prisma.contactMessage.groupBy({ by: ["leadSource"], _count: { id: true } }),
    prisma.inspection.count(),
    prisma.sourcingRequest.count(),
    prisma.contactMessage.count(),
    prisma.customer.count(),
    prisma.vehicle.groupBy({
      by: ["make"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.vehicle.aggregate({
      where: { status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] } },
      _sum: { price: true },
    }),
  ]);

  // Bucket the last 14 days of detail-page views into daily totals. Done in JS
  // rather than SQL so the query works on both SQLite and Postgres.
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now.getTime() - (13 - index) * DAY_MS);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      date,
      views: 0,
    };
  });

  const byDay = new Map(days.map((day) => [day.key, day]));
  for (const row of recentViews) {
    const date = new Date(row.createdAt);
    const bucket = byDay.get(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
    if (bucket) bucket.views += 1;
  }

  // Lead sources are stored per model; fold them into one channel table.
  const sources = new Map<string, { source: string; inspections: number; sourcing: number; messages: number }>();
  const merge = (
    rows: Array<{ leadSource: string; _count: { id: number } }>,
    key: "inspections" | "sourcing" | "messages",
  ) => {
    for (const row of rows) {
      const source = row.leadSource || "unknown";
      const entry = sources.get(source) ?? { source, inspections: 0, sourcing: 0, messages: 0 };
      entry[key] += row._count.id;
      sources.set(source, entry);
    }
  };
  merge(inspectionSources, "inspections");
  merge(sourcingSources, "sourcing");
  merge(messageSources, "messages");

  const leads = inspectionTotal + sourcingTotal + messageTotal;
  const views = lifetimeViews._sum.views ?? 0;

  return {
    lifetimeViews: views,
    viewsLast30: recentViews.length,
    viewsByDay: days,
    searchTotal,
    topViewed,
    topSearches: searchGroups.map((row) => ({
      term: row.term,
      searches: row._count.id,
      averageResults: Math.round(row._avg.resultCount ?? 0),
    })),
    sources: [...sources.values()].sort(
      (a, b) => b.inspections + b.sourcing + b.messages - (a.inspections + a.sourcing + a.messages),
    ),
    leads: {
      total: leads,
      inspections: inspectionTotal,
      sourcing: sourcingTotal,
      messages: messageTotal,
      customers: customerTotal,
      // Leads per 100 detail-page views — the closest thing to a conversion
      // rate we can compute without a visitor session.
      perHundredViews: views > 0 ? Number(((leads / views) * 100).toFixed(2)) : 0,
    },
    makeMix: makeMix.map((row) => ({ make: row.make, count: row._count.id })),
    listedValue: listedValue._sum.price ?? 0,
  };
}
