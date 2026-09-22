# Sundrive Autos

Sundrive Autos is a premium automotive dealership website built with Next.js, Prisma, and Tailwind CSS. The website is designed to showcase luxury and performance vehicles, allow customers to browse inventory, request inspections, contact the business, and submit sourcing requests.

The business runs as an online-first dealership with real customer communication via WhatsApp, email, and social media. The site is optimized for mobile, desktop, and high-end brand presentation.

## Business Details

- Business name: Sundrive Autos
- Phone: 09024077324
- WhatsApp: +234 902 407 7324
- Email: sundriveauto@gmail.com
- Hours: Open 24/7
- Delivery model: Nationwide support
- Physical location: No fixed showroom currently; the business operates online with digital-first customer service
- Socials:
  - Instagram: https://www.instagram.com/sundriveauto?stkn=MW9jbzhrb3NuY3FnYw==
  - TikTok: https://www.tiktok.com/@sundriveauto?_r=1&_t=ZS-99wmLsKIOQv
- Years of trading: 1+ years

## Website Goals

This website helps Sundrive Autos:

- present a premium vehicle inventory to buyers
- highlight trust, quality, and dealership credibility
- generate leads through contact, WhatsApp, inspections, and sourcing forms
- support vehicle discovery using search and filtering
- provide a clean admin area for inventory and lead management
- create a polished online presence that feels modern and premium

## Features

### Public website

- Luxury dealership landing page with strong brand styling
- Responsive navigation and mobile-friendly layout
- Featured inventory and vehicle cards
- Search and filters for browsing available cars
- Individual car detail pages with key specs and gallery images
- Inspection booking form
- Contact form and direct WhatsApp contact flow
- Sourcing request form for vehicles customers want but are not currently listed
- About page with dealership positioning and trust messaging
- Social links integrated into the site footer and contact sections

### Admin dashboard

- Inventory management area
- Lead management and customer enquiries
- Inspection tracking
- Sourcing request tracking
- Analytics overview and platform metrics
- Upload support for vehicle images and business media

### Technical features

- App Router architecture with Next.js
- Server-side rendering and static generation support
- Prisma database integration
- SQLite for local development and data persistence
- Tailwind CSS styling for responsive design
- Zod validation for forms and inputs
- Image and uploads support for vehicle content

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Zod validation
- Node.js

## Project Structure

```bash
Sundrive-Autos-
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/
├── src/
│   ├── actions/
│   ├── app/
│   ├── components/
│   ├── generated/
│   ├── lib/
│   └── proxy.ts
├── .env
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── README.md
└── eslint.config.mjs
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A local environment with access to the project folder

### Install dependencies

```bash
npm install
```

### Set up the database

```bash
npm run db:push
npm run db:seed
```

### Start the local website

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev          # start the development server
npm run build        # create a production build
npm run start        # run the production build locally
npm run lint         # run ESLint checks
typecheck            # TypeScript type validation
npm run db:push      # push the Prisma schema to the database
npm run db:seed      # seed the database with starter vehicle and content data
npm run db:studio    # open Prisma Studio
npm run db:reset     # reset and reseed the database
npm run setup        # prepare the database for app use
```

## Environment Configuration

The application uses environment variables for site-level settings. A typical `.env` file can include values such as:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production deployment, update the public site URL to the live domain.

## Branding and Design Notes

The website is built around Sundrive Autos’ premium automotive identity, using strong dealership branding, a clean premium layout, and a dark luxury visual style. The project has been configured to use the business’s real brand details and the logo asset from the public folder so the website reflects the actual company identity.

## Website Flow

Typical customer journey on the site:

1. Visitor lands on the homepage and views featured inventory.
2. Buyer uses search and filters to browse cars.
3. Visitor opens a vehicle detail page.
4. Customer contacts the dealer through WhatsApp, email, or the contact form.
5. Buyer can request a vehicle inspection or submit a sourcing request.
6. Admin receives and manages the enquiry through the dashboard.

## Deployment

This project can be deployed on services such as:

- Vercel
- Railway
- Render
- Any Node.js compatible hosting provider

For production deployment, ensure:

- the database is configured correctly
- the app URL is set in environment variables
- the public assets and logo are present
- Prisma migrations or db push are completed on the deployment server

## Notes

This project is set up as a dealership management and marketing website for Sundrive Autos. It combines product presentation, lead generation, customer communication, and internal operations in one streamlined application.

## License

This project is intended for Sundrive Autos business use and internal project management unless otherwise stated by the business owner.
