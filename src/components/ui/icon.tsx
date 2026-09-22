import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/**
 * One inline SVG set for the whole app — avoids an icon dependency and keeps
 * every glyph on the same 24x24 grid with a consistent stroke weight.
 *
 * Stroke icons use `currentColor`; brand icons are filled and drawn as-is.
 */
type IconDef = {
  /** Path data for stroke icons, or JSX for multi-shape/filled icons. */
  body: React.ReactNode;
  filled?: boolean;
};

const ICONS = {
  /* ---- UI ---------------------------------------------------------------- */
  menu: { body: <path d="M3 6h18M3 12h18M3 18h18" /> },
  close: { body: <path d="M18 6 6 18M6 6l12 12" /> },
  arrowRight: { body: <path d="M5 12h14M12 5l7 7-7 7" /> },
  arrowUpRight: { body: <path d="M7 17 17 7M9 7h8v8" /> },
  chevronDown: { body: <path d="m6 9 6 6 6-6" /> },
  chevronRight: { body: <path d="m9 18 6-6-6-6" /> },
  chevronLeft: { body: <path d="m15 18-6-6 6-6" /> },
  check: { body: <path d="M20 6 9 17l-5-5" /> },
  plus: { body: <path d="M12 5v14M5 12h14" /> },
  minus: { body: <path d="M5 12h14" /> },
  filter: { body: <path d="M4 5h16M7 12h10M10 19h4" /> },
  spinner: { body: <path d="M21 12a9 9 0 1 1-6.2-8.6" /> },

  /* ---- Contact / site --------------------------------------------------- */
  phone: {
    body: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    ),
  },
  mail: {
    body: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2.5 6.5 9.5 7 9.5-7" />
      </>
    ),
  },
  mapPin: {
    body: (
      <>
        <path d="M20 10.5c0 5.5-8 11.5-8 11.5s-8-6-8-11.5a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10.5" r="2.8" />
      </>
    ),
  },
  clock: {
    body: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
  },

  /* ---- Features --------------------------------------------------------- */
  shield: { body: <path d="M12 22s8-3.8 8-10V5.5L12 2.5 4 5.5V12c0 6.2 8 10 8 10Z" /> },
  tag: {
    body: (
      <>
        <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4.8A2 2 0 0 1 4.8 2.8H12a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8Z" />
        <circle cx="7.8" cy="7.8" r="1.4" />
      </>
    ),
  },
  truck: {
    body: (
      <>
        <path d="M2 6.5h11v10H2zM13 10h4l4 3.5v3h-8" />
        <circle cx="6" cy="18.5" r="1.8" />
        <circle cx="17.5" cy="18.5" r="1.8" />
      </>
    ),
  },
  clipboard: {
    body: (
      <>
        <path d="M9 3.5h6v3H9z" />
        <path d="M15 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
        <path d="M9 12h6M9 16h4" />
      </>
    ),
  },
  search: {
    body: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
  },
  card: {
    body: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h3" />
      </>
    ),
  },
  gauge: {
    body: (
      <>
        <path d="M12 21a9 9 0 1 1 9-9" />
        <path d="M12 12l4-3" />
        <circle cx="12" cy="12" r="1.4" />
      </>
    ),
  },
  eye: {
    body: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  calendar: {
    body: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  star: {
    body: (
      <path d="m12 3.6 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8Z" />
    ),
    filled: true,
  },
  car: {
    body: (
      <>
        <path d="M5 16.5h14M4 16.5v-4l2-5h12l2 5v4" />
        <circle cx="7.5" cy="17.5" r="1.6" />
        <circle cx="16.5" cy="17.5" r="1.6" />
        <path d="M4.5 12.5h15" />
      </>
    ),
  },
  fuel: {
    body: (
      <>
        <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
        <path d="M3 21h12M5 9h8" />
        <path d="M14 8h2.5a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0v-6l-2.5-2.5" />
      </>
    ),
  },
  gear: {
    body: (
      <>
        <path d="M6 4v16M6 8h6a4 4 0 0 1 4 4v8M14 15l2.5 2.5L19 15" />
        <circle cx="6" cy="4" r="1.4" />
      </>
    ),
  },
  verified: {
    body: (
      <>
        <path d="m12 2.8 2.3 1.7 2.8-.3 1 2.7 2.4 1.5-.9 2.7.9 2.7-2.4 1.5-1 2.7-2.8-.3L12 21.2l-2.3-1.7-2.8.3-1-2.7L3.5 15l.9-2.7-.9-2.7 2.4-1.5 1-2.7 2.8.3Z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </>
    ),
  },

  /* ---- Admin ------------------------------------------------------------ */
  dashboard: {
    body: (
      <>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </>
    ),
  },
  users: {
    body: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20.5a6.5 6.5 0 0 1 13 0" />
        <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 20.5a6.5 6.5 0 0 0-2.2-4.9" />
      </>
    ),
  },
  inbox: {
    body: (
      <>
        <path d="M3 12h5l1.5 3h5L16 12h5" />
        <path d="M5.5 4.5h13l2.5 7.5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z" />
      </>
    ),
  },
  edit: {
    body: (
      <>
        <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16Z" />
        <path d="m14.5 5.5 4 4" />
      </>
    ),
  },
  trash: {
    body: (
      <>
        <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
  },
  logout: {
    body: (
      <>
        <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </>
    ),
  },
  sparkle: {
    body: (
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    ),
  },
  image: {
    body: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="9.5" r="1.6" />
        <path d="m4 18 5-5 4.5 4.5L17 14l3 3" />
      </>
    ),
  },
  upload: {
    body: (
      <>
        <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
        <path d="M4 16v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V16" />
      </>
    ),
  },

  /* ---- Brand (filled) --------------------------------------------------- */
  whatsapp: {
    filled: true,
    body: (
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.55 3.75 1.5 5.28L2 22l5.03-1.63a9.8 9.8 0 0 0 5.01 1.37c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2Zm5.7 13.9c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.78-4.2-4.92-4.4-.14-.19-1.16-1.55-1.16-2.95s.73-2.09 1-2.38c.26-.29.57-.36.76-.36l.55.01c.17 0 .41-.07.64.49.24.58.8 1.99.87 2.13.07.15.12.32.02.51-.1.2-.15.32-.29.5l-.44.5c-.14.15-.3.31-.13.6.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.29 2.33 1.44.29.14.46.12.63-.07.17-.2.72-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
    ),
  },
  instagram: {
    filled: true,
    body: (
      <path d="M12 2.2c-2.7 0-3 0-4.05.06-1.05.05-1.77.22-2.4.46a4.8 4.8 0 0 0-1.75 1.14A4.8 4.8 0 0 0 2.66 5.6c-.24.63-.4 1.35-.46 2.4C2.15 9.05 2.14 9.35 2.14 12s0 2.95.06 4.05c.05 1.05.22 1.77.46 2.4a4.8 4.8 0 0 0 1.14 1.75 4.8 4.8 0 0 0 1.75 1.14c.63.24 1.35.4 2.4.46 1.05.06 1.35.06 4.05.06s2.95 0 4.05-.06c1.05-.05 1.77-.22 2.4-.46a5 5 0 0 0 1.75-1.14 4.8 4.8 0 0 0 1.14-1.75c.24-.63.4-1.35.46-2.4.06-1.05.06-1.35.06-4.05s0-2.95-.06-4.05c-.05-1.05-.22-1.77-.46-2.4a4.8 4.8 0 0 0-1.14-1.75A4.8 4.8 0 0 0 18.45 2.7c-.63-.24-1.35-.4-2.4-.46C14.95 2.2 14.65 2.2 12 2.2Zm0 1.8c2.65 0 2.96.01 4 .06.97.04 1.5.2 1.85.34.46.18.8.4 1.15.74.35.35.56.68.74 1.15.14.35.3.88.34 1.85.05 1.05.06 1.36.06 4s-.01 2.96-.06 4c-.04.97-.2 1.5-.34 1.85-.18.46-.4.8-.74 1.15-.35.35-.69.56-1.15.74-.35.14-.88.3-1.85.34-1.04.05-1.35.06-4 .06s-2.96-.01-4-.06c-.97-.04-1.5-.2-1.85-.34-.46-.18-.8-.4-1.15-.74a3 3 0 0 1-.74-1.15c-.14-.35-.3-.88-.34-1.85-.05-1.04-.06-1.35-.06-4s.01-2.96.06-4c.04-.97.2-1.5.34-1.85.18-.46.4-.8.74-1.15a3 3 0 0 1 1.15-.74c.35-.14.88-.3 1.85-.34 1.04-.05 1.35-.06 4-.06Zm0 3.06a4.94 4.94 0 1 0 0 9.88 4.94 4.94 0 0 0 0-9.88Zm0 8.14a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6.28-8.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
    ),
  },
  facebook: {
    filled: true,
    body: (
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    ),
  },
  x: {
    filled: true,
    body: (
      <path d="M17.53 3h3.2l-6.99 7.99L21.94 21h-6.4l-5.02-6.56L4.8 21H1.6l7.28-8.32L2.06 3h6.56l4.66 6.16L17.53 3Zm-1.12 16.06h1.77L7.7 4.84H5.8l10.61 14.22Z" />
    ),
  },
  tiktok: {
    filled: true,
    body: (
      <path d="M16.6 2h-3.3v13.2a2.85 2.85 0 1 1-2.3-2.8V9a6.2 6.2 0 1 0 5.6 6.17V8.7a7.3 7.3 0 0 0 4.3 1.38V6.7a4.2 4.2 0 0 1-4.3-4.7Z" />
    ),
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  const def = ICONS[name] as IconDef;
  const isFilled = def.filled === true;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5 shrink-0", className)}
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={isFilled ? undefined : 1.8}
      strokeLinecap={isFilled ? undefined : "round"}
      strokeLinejoin={isFilled ? undefined : "round"}
      {...props}
    >
      {def.body}
    </svg>
  );
}
