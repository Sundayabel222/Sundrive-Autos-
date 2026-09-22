import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { contact, site, socials } from "@/lib/config";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Sundrive Autos",
    "premium cars",
    "car dealership",
    "foreign used cars",
    "vehicle sourcing",
    "car inspection booking",
    "buy a car",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0099FF",
  width: "device-width",
  initialScale: 1,
};

/** AutoDealer structured data so search engines understand the business. */
function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.addressLines[0],
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    sameAs: socials.map((s) => s.href),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "16:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Content is a static object we control, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <StructuredData />
      </body>
    </html>
  );
}
