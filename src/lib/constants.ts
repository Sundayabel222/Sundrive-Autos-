/**
 * SQLite has no enum type, so option lists live here as the single source of
 * truth and are reused by form selects, inventory filters, admin badges and
 * zod validation.
 */

export const CURRENCY = {
  /**
   * ISO 4217 code. The PRD doesn't state a market; the WhatsApp-led flow and
   * "foreign used" terminology suggest Nigeria, so this defaults to NGN.
   * Change this one value (plus `locale`) to switch markets.
   */
  code: "NGN",
  locale: "en-NG",
  /** Prices are stored as whole units, so no fractional digits. */
  maximumFractionDigits: 0,
} as const;

export const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Coupe",
  "Hatchback",
  "Crossover",
  "Pickup",
  "Convertible",
  "Wagon",
  "Minivan",
] as const;

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;

export const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Dual-Clutch"] as const;

export const DRIVE_TYPES = ["FWD", "RWD", "AWD", "4WD"] as const;

export const CONDITIONS = ["Brand New", "Foreign Used", "Nigerian Used"] as const;

export const VehicleStatus = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
} as const;
export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export const InspectionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  RESCHEDULED: "RESCHEDULED",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const;
export type InspectionStatus = (typeof InspectionStatus)[keyof typeof InspectionStatus];

export const SourcingStatus = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  SOURCED: "SOURCED",
  CLOSED: "CLOSED",
} as const;
export type SourcingStatus = (typeof SourcingStatus)[keyof typeof SourcingStatus];

export const MessageStatus = {
  NEW: "NEW",
  READ: "READ",
  REPLIED: "REPLIED",
  ARCHIVED: "ARCHIVED",
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

/** Colour treatment for status pills in the admin UI. */
export const STATUS_TONE: Record<string, "blue" | "amber" | "green" | "red" | "gray"> = {
  // Vehicle
  AVAILABLE: "green",
  RESERVED: "amber",
  SOLD: "gray",
  // Inspection
  PENDING: "amber",
  APPROVED: "green",
  RESCHEDULED: "blue",
  COMPLETED: "blue",
  REJECTED: "red",
  // Sourcing
  NEW: "amber",
  IN_PROGRESS: "blue",
  SOURCED: "green",
  CLOSED: "gray",
  // Message
  READ: "blue",
  REPLIED: "green",
  ARCHIVED: "gray",
};

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "Vehicle Sourcing", href: "/sourcing" },
  { label: "Book Inspection", href: "/inspection" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const whyChooseUs = [
  {
    title: "Verified Vehicles",
    description:
      "Every unit is physically inspected and history-checked before it reaches the showroom floor.",
    icon: "shield",
  },
  {
    title: "Competitive Pricing",
    description:
      "Transparent, market-researched pricing with no hidden dealer charges or last-minute additions.",
    icon: "tag",
  },
  {
    title: "Nationwide Delivery",
    description:
      "Doorstep delivery anywhere in the country, fully tracked and insured from our lot to yours.",
    icon: "truck",
  },
  {
    title: "Vehicle Inspection",
    description:
      "Book a slot online and inspect the vehicle yourself, with our specialists on hand to answer questions.",
    icon: "clipboard",
  },
  {
    title: "Vehicle Sourcing",
    description:
      "Can't find it in stock? Tell us the spec and budget, and we'll import or source it for you.",
    icon: "search",
  },
  {
    title: "Financing Support",
    description:
      "Flexible payment plans through our partner lenders, arranged in days rather than weeks.",
    icon: "card",
  },
] as const;

/** Booking slots offered on the inspection form (PRD §9). */
export const INSPECTION_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

/** Inventory sort options, mirrored by the SORTS map in src/lib/queries.ts. */
export const INVENTORY_SORTS = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "mileage-asc", label: "Mileage: lowest first" },
  { value: "year-desc", label: "Year: newest first" },
] as const;

export const coreValues = [
  { title: "Integrity", description: "What we list is what you get. No surprises, ever." },
  { title: "Excellence", description: "We hold every vehicle and every interaction to a high standard." },
  { title: "Transparency", description: "Full disclosure on condition, history and pricing." },
  { title: "Customer First", description: "Advice that serves your interest, not our margin." },
] as const;
