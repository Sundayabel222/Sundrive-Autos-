/**
 * Every piece of business information lives here so it can be edited in one
 * place without touching components.
 *
 * TODO(owner): these are placeholders — replace with the real Sundrive Autos
 * details (and drop the real logo at /public/logo.svg, photos in /public/uploads).
 */

export const site = {
  name: "Sundrive Autos",
  /** Short mark used in the header/footer logo lockup. */
  nameParts: { leading: "SUN", accent: "DRIVE", trailing: "AUTOS" },
  tagline: "Your Trusted Destination For Premium Cars",
  description:
    "Sundrive Autos is a premium automotive dealership specialising in high-end vehicles and imports. Browse our curated inventory, book an inspection, or request a vehicle we don't stock yet.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  established: 2025,
} as const;

export const contact = {
  phoneDisplay: "09024077324",
  phone: "09024077324",
  whatsapp: "2349024077324",
  email: "sundriveauto@gmail.com",
  salesEmail: "sundriveauto@gmail.com",
  addressLines: ["Online showroom", "Serving clients nationwide"],
  /** Plain text address used for the map query + schema.org. */
  address: "Nigeria",
  hours: [
    { days: "Open 24/7", time: "Always available online" },
    { days: "WhatsApp", time: "Ready to assist anytime" },
    { days: "Delivery", time: "Nationwide support" },
  ],
} as const;

/**
 * Marketing claims shown in the hero/trust bar. Inventory counts are read live
 * from the database; these two are business facts you should confirm.
 */
export const businessClaims = {
  vehiclesDelivered: 450,
  inspectionPassRate: 100,
} as const;

/**
 * Leadership shown on the About page (PRD §11).
 *
 * TODO(owner): replace with your real team, roles and photos. Drop headshots in
 * /public/uploads and set `photo` to that path.
 */
export const team = [
  {
    name: "Emeka Sundrive",
    role: "Founder & Managing Director",
    bio: "Fifteen years in vehicle imports and clearing, and the reason every car on the lot is bought in person.",
    photo: null,
  },
  {
    name: "Aisha Bello",
    role: "Head of Sourcing & Imports",
    bio: "Runs our overseas dealer network and auction channels, and quotes the landed cost you actually pay.",
    photo: null,
  },
  {
    name: "Tolu Adeyemi",
    role: "Sales Manager",
    bio: "Guides buyers through comparison, financing and delivery — no pressure, no hidden charges.",
    photo: null,
  },
  {
    name: "Kunle Ogunlesi",
    role: "Workshop & Inspection Lead",
    bio: "Every vehicle is checked and signed off by Kunle before it is allowed onto the showroom floor.",
    photo: null,
  },
] as const;

/** Headline achievements for the About page. Confirm before publishing. */
export const achievements = [
  "Direct import partners across the US, Canada, Europe and the UAE",
  "Every vehicle independently inspected before it is listed",
  "Nationwide delivery with registration and paperwork handled",
  "Financing arranged through vetted partner lenders",
] as const;

export const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sundriveauto?stkn=MW9jbzhrb3NuY3FnYw==",
    icon: "instagram",
  },
  { label: "TikTok", href: "https://www.tiktok.com/@sundriveauto?_r=1&_t=ZS-99wmLsKIOQv", icon: "tiktok" },
] as const;

/** Prefilled WhatsApp deep link, optionally about a specific vehicle. */
export function whatsappLink(message?: string) {
  const text = encodeURIComponent(
    message ?? `Hi ${site.name}, I'd like to make an enquiry about a vehicle.`,
  );
  return `https://wa.me/${contact.whatsapp}?text=${text}`;
}

export const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  contact.address,
)}&output=embed`;

export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  contact.address,
)}`;
