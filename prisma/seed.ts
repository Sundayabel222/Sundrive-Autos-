import "dotenv/config";
import { hashPassword } from "@/lib/password";
import { vehicleSlug } from "@/lib/format";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/* Inventory                                                                   */
/* -------------------------------------------------------------------------- */

/** Photos live in /public/uploads once real ones are supplied. */
function photoFor(bodyType: string) {
  if (["SUV", "Pickup"].includes(bodyType)) {
    return bodyType === "Pickup" ? "/placeholder-pickup.svg" : "/placeholder-suv.svg";
  }
  if (["Coupe", "Convertible"].includes(bodyType)) return "/placeholder-coupe.svg";
  return "/placeholder-sedan.svg";
}

type SeedVehicle = {
  make: string;
  model: string;
  trim?: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  engine: string;
  exteriorColor: string;
  interiorColor?: string;
  condition: string;
  location: string;
  vin?: string;
  description: string;
  features: string[];
  status?: string;
  featured?: boolean;
  views?: number;
  daysAgo?: number;
};

const vehicles: SeedVehicle[] = [
  {
    make: "Lexus",
    model: "IS350",
    trim: "F-Sport",
    year: 2014,
    price: 28500000,
    mileage: 96000,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "RWD",
    engine: "3.5L V6 (2GR-FSE)",
    exteriorColor: "Ultra Blue",
    interiorColor: "Black Leather",
    condition: "Foreign Used",
    location: "Lagos",
    vin: "JTHBF1D20E5012345",
    description:
      "A clean, low-owner IS350 F-Sport imported directly from the United States. Fully loaded with the F-Sport package including adaptive suspension, sport-tuned steering and heated/ventilated seats. Accident-free with a full service history and recent major service completed.",
    features: [
      "F-Sport Package",
      "Adaptive Suspension",
      "Heated & Ventilated Seats",
      "Reverse Camera",
      "Blind Spot Monitor",
      "LED Headlights",
      "Paddle Shifters",
      "Keyless Entry & Push Start",
      "Premium Sound System",
    ],
    featured: true,
    views: 842,
    daysAgo: 3,
  },
  {
    make: "Mercedes-Benz",
    model: "GLE 450",
    trim: "4MATIC",
    year: 2019,
    price: 78000000,
    mileage: 52000,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    engine: "3.0L Inline-6 Turbo (EQ Boost)",
    exteriorColor: "Obsidian Black",
    interiorColor: "Macchiato Beige",
    condition: "Foreign Used",
    location: "Lagos",
    vin: "4JGFB4KB1LA123456",
    description:
      "Immaculate GLE 450 4MATIC with the mild-hybrid EQ Boost powertrain. Burmester sound, panoramic roof and the full MBUX twin-screen setup. Serviced exclusively at the main dealer, with documentation available for inspection.",
    features: [
      "MBUX Twin Display",
      "Burmester Surround Sound",
      "Panoramic Sunroof",
      "360° Camera",
      "Air Body Control",
      "Heated & Ventilated Seats",
      "Wireless Charging",
      "Ambient Lighting",
      "Power Tailgate",
    ],
    featured: true,
    views: 1240,
    daysAgo: 6,
  },
  {
    make: "BMW",
    model: "X5",
    trim: "xDrive40i M Sport",
    year: 2021,
    price: 105000000,
    mileage: 28000,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    engine: "3.0L TwinPower Turbo Inline-6",
    exteriorColor: "Mineral White",
    interiorColor: "Cognac Vernasca",
    condition: "Foreign Used",
    location: "Abuja",
    vin: "5UXCR6C09M9B12345",
    description:
      "Nearly new X5 xDrive40i with the M Sport package. One owner, garage kept, and still under manufacturer warranty. Features the full driving assistant professional suite and Harman Kardon audio.",
    features: [
      "M Sport Package",
      "Driving Assistant Professional",
      "Harman Kardon Audio",
      "Head-Up Display",
      "Panoramic Sky Lounge Roof",
      "Vernasca Leather",
      "Gesture Control",
      "Soft-Close Doors",
      "22-inch Alloys",
    ],
    featured: true,
    views: 986,
    daysAgo: 2,
  },
  {
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    year: 2018,
    price: 24900000,
    mileage: 84000,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "FWD",
    engine: "2.5L 4-Cylinder (A25A-FKS)",
    exteriorColor: "Predawn Gray",
    interiorColor: "Black Fabric",
    condition: "Foreign Used",
    location: "Lagos",
    description:
      "A dependable, economical Camry SE with the sport-tuned suspension and 18-inch alloys. Ideal daily driver with excellent fuel economy and a spotless interior. Recently fitted with new tyres all round.",
    features: [
      "Sport-Tuned Suspension",
      "18-inch Alloys",
      "Reverse Camera",
      "Lane Departure Alert",
      "Adaptive Cruise Control",
      "Apple CarPlay",
      "Push Start",
    ],
    views: 511,
    daysAgo: 9,
  },
  {
    make: "Land Rover",
    model: "Range Rover Velar",
    trim: "P250 R-Dynamic",
    year: 2020,
    price: 92000000,
    mileage: 41000,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    engine: "2.0L Ingenium Turbo",
    exteriorColor: "Santorini Black",
    interiorColor: "Ebony Leather",
    condition: "Foreign Used",
    location: "Lagos",
    vin: "SALYA2AN1LA123456",
    description:
      "Striking Velar P250 R-Dynamic SE finished in Santorini Black. The most design-led SUV in its class, with the twin-screen Touch Pro Duo infotainment and Meridian audio. Fully documented service history.",
    features: [
      "Touch Pro Duo Infotainment",
      "Meridian Audio",
      "Matrix LED Headlights",
      "Air Suspension",
      "Heated Steering Wheel",
      "Terrain Response 2",
      "Powered Tailgate",
      "R-Dynamic Body Kit",
    ],
    featured: true,
    views: 1075,
    daysAgo: 5,
  },
  {
    make: "Honda",
    model: "Accord",
    trim: "EX-L",
    year: 2016,
    price: 18700000,
    mileage: 112000,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "CVT",
    driveType: "FWD",
    engine: "2.4L 4-Cylinder (Earth Dreams)",
    exteriorColor: "Modern Steel",
    interiorColor: "Ivory Leather",
    condition: "Nigerian Used",
    location: "Ibadan",
    description:
      "Well-maintained locally used Accord EX-L with leather interior and a smooth CVT. Body and paint in excellent condition with no accident history. All service records available from new.",
    features: [
      "Leather Interior",
      "Dual-Zone Climate",
      "Reverse Camera",
      "LaneWatch Camera",
      "Heated Front Seats",
      "Sunroof",
      "Alloy Wheels",
    ],
    views: 398,
    daysAgo: 14,
  },
  {
    make: "Porsche",
    model: "Macan",
    trim: "S",
    year: 2022,
    price: 138000000,
    mileage: 15000,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    engine: "2.9L Twin-Turbo V6",
    exteriorColor: "Carrara White",
    interiorColor: "Black/Bordeaux Red",
    condition: "Foreign Used",
    location: "Lagos",
    vin: "WP1AG2A54NLB12345",
    description:
      "A genuinely exceptional Macan S with very low mileage and the full Porsche factory warranty still active. Adaptive air suspension, Sport Chrono package and Bose surround sound. Inspected and ready for immediate delivery.",
    features: [
      "Sport Chrono Package",
      "Adaptive Air Suspension",
      "Bose Surround Sound",
      "Panoramic Roof",
      "Sport Exhaust",
      "14-Way Power Seats",
      "Porsche Entry & Drive",
      "Lane Keep Assist",
    ],
    featured: true,
    views: 1520,
    daysAgo: 1,
  },
  {
    make: "Audi",
    model: "A4",
    trim: "Premium Plus",
    year: 2017,
    price: 22400000,
    mileage: 98000,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    engine: "2.0L TFSI quattro",
    exteriorColor: "Mythos Black",
    interiorColor: "Black Leather",
    condition: "Foreign Used",
    location: "Abuja",
    description:
      "Clean A4 quattro Premium Plus with the virtual cockpit and B&O sound. All-wheel drive makes it ideal for wet-season driving. Freshly serviced with new brake pads and fluids.",
    features: [
      "Virtual Cockpit",
      "Bang & Olufsen Audio",
      "quattro All-Wheel Drive",
      "LED Headlights",
      "Heated Seats",
      "Parking Sensors",
      "Bluetooth & Navigation",
    ],
    views: 302,
    daysAgo: 18,
  },
  {
    make: "Toyota",
    model: "Land Cruiser Prado",
    trim: "TX-L",
    year: 2023,
    price: 165000000,
    mileage: 8000,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "4WD",
    engine: "4.0L V6 (1GR-FE)",
    exteriorColor: "Pearl White",
    interiorColor: "Beige Leather",
    condition: "Brand New",
    location: "Lagos",
    vin: "JTEBU5JR1P5123456",
    description:
      "Brand new Prado TX-L with delivery mileage only. The benchmark vehicle for Nigerian roads — full-time 4WD, robust ladder frame and outstanding resale value. Comes with manufacturer warranty and complete documentation.",
    features: [
      "Full-Time 4WD",
      "Multi-Terrain Select",
      "Leather Interior",
      "Sunroof",
      "Reverse Camera",
      "Third Row Seating",
      "Roof Rails",
      "Manufacturer Warranty",
    ],
    featured: true,
    views: 1340,
    daysAgo: 4,
  },
  {
    make: "Ford",
    model: "Explorer",
    trim: "XLT",
    year: 2015,
    price: 19800000,
    mileage: 128000,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "4WD",
    engine: "3.5L V6 Ti-VCT",
    exteriorColor: "Ruby Red",
    interiorColor: "Charcoal Cloth",
    condition: "Nigerian Used",
    location: "Port Harcourt",
    description:
      "Spacious seven-seater Explorer XLT, ideal for family or corporate use. Recently serviced with new shocks and a fresh set of tyres. Currently reserved pending a completed inspection.",
    features: [
      "Third Row Seating",
      "Reverse Camera",
      "SYNC Infotainment",
      "Dual-Zone Climate",
      "Tow Package",
      "Roof Rails",
    ],
    status: "RESERVED",
    views: 244,
    daysAgo: 21,
  },
  {
    make: "Hyundai",
    model: "Elantra",
    trim: "Limited",
    year: 2021,
    price: 26500000,
    mileage: 37000,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "CVT",
    driveType: "FWD",
    engine: "2.0L 4-Cylinder (Smartstream)",
    exteriorColor: "Fluid Metal",
    interiorColor: "Medium Gray",
    condition: "Foreign Used",
    location: "Lagos",
    description:
      "Sharp-looking Elantra Limited with the full digital cockpit and wireless CarPlay. Very economical and still under factory warranty. One owner, non-smoker, with a clean history report.",
    features: [
      "10.25-inch Digital Cluster",
      "Wireless Apple CarPlay",
      "Blind Spot Collision Avoidance",
      "Heated Seats",
      "Wireless Charging",
      "Bose Audio",
      "Sunroof",
    ],
    views: 447,
    daysAgo: 11,
  },
  {
    make: "Kia",
    model: "Sportage",
    trim: "EX",
    year: 2019,
    price: 21000000,
    mileage: 66000,
    bodyType: "Crossover",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "FWD",
    engine: "2.4L 4-Cylinder GDI",
    exteriorColor: "Snow White Pearl",
    interiorColor: "Black Cloth",
    condition: "Foreign Used",
    location: "Ibadan",
    description:
      "Practical, well-equipped Sportage EX with generous cabin space and a smooth automatic. A strong value proposition for a family SUV, with a clean inspection report and full service history.",
    features: [
      "Reverse Camera",
      "Apple CarPlay & Android Auto",
      "Dual-Zone Climate",
      "Alloy Wheels",
      "Cruise Control",
      "Rear Parking Sensors",
    ],
    views: 289,
    daysAgo: 16,
  },
  {
    make: "Toyota",
    model: "Corolla",
    trim: "LE",
    year: 2013,
    price: 12500000,
    mileage: 156000,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "FWD",
    engine: "1.8L 4-Cylinder (2ZR-FE)",
    exteriorColor: "Super White",
    interiorColor: "Ash Fabric",
    condition: "Nigerian Used",
    location: "Lagos",
    description:
      "A proven, bulletproof Corolla LE. High mileage but meticulously maintained with every service documented. The most affordable route into a reliable Toyota with cheap parts availability.",
    features: [
      "Bluetooth",
      "Reverse Camera",
      "Air Conditioning",
      "Alloy Wheels",
      "Cruise Control",
    ],
    status: "SOLD",
    views: 690,
    daysAgo: 30,
  },
  {
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range",
    year: 2020,
    price: 58000000,
    mileage: 44000,
    bodyType: "Sedan",
    fuelType: "Electric",
    transmission: "Automatic",
    driveType: "RWD",
    engine: "Dual Motor Electric (75 kWh)",
    exteriorColor: "Deep Blue Metallic",
    interiorColor: "Black Vegan Leather",
    condition: "Foreign Used",
    location: "Lagos",
    description:
      "Fully electric Model 3 Long Range with roughly 500 km of real-world range. Autopilot enabled, over-the-air software updates and near-zero running costs. Battery health verified at 94% of original capacity.",
    features: [
      "Autopilot",
      "Glass Roof",
      "15-inch Touchscreen",
      "Premium Audio",
      "Heated Seats (All Rows)",
      "Sentry Mode",
      "Over-the-Air Updates",
      "Battery Health Verified",
    ],
    featured: true,
    views: 1188,
    daysAgo: 7,
  },
  {
    make: "Mazda",
    model: "CX-5",
    trim: "Grand Touring",
    year: 2018,
    price: 23900000,
    mileage: 73000,
    bodyType: "Crossover",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    engine: "2.5L Skyactiv-G",
    exteriorColor: "Soul Red Crystal",
    interiorColor: "Parchment Leather",
    condition: "Foreign Used",
    location: "Abuja",
    description:
      "One of the best-driving crossovers in its class. This CX-5 Grand Touring pairs a premium leather cabin with genuinely engaging handling. Excellent condition inside and out, with no faults recorded.",
    features: [
      "Leather Interior",
      "Bose 10-Speaker Audio",
      "Head-Up Display",
      "Radar Cruise Control",
      "Blind Spot Monitoring",
      "Power Liftgate",
      "Heated Seats",
    ],
    views: 356,
    daysAgo: 12,
  },
];

const testimonials = [
  {
    name: "Adaeze Okonkwo",
    location: "Lekki, Lagos",
    rating: 5,
    message:
      "I bought a Range Rover Velar from Sundrive and the entire process was transparent from start to finish. They showed me the full inspection report before I paid a naira. Delivery was the next morning.",
    vehicle: "Range Rover Velar P250",
  },
  {
    name: "Ibrahim Musa",
    location: "Maitama, Abuja",
    rating: 5,
    message:
      "I couldn't find the exact X5 spec I wanted anywhere, so I submitted a sourcing request. They sent me three options within a week and handled the entire import and clearing. Genuinely professional.",
    vehicle: "BMW X5 xDrive40i",
  },
  {
    name: "Chidinma Eze",
    location: "Port Harcourt",
    rating: 5,
    message:
      "Booked an inspection online, and they had the car warmed up and ready when I arrived. No pressure, no hidden charges, and they answered every question honestly. I'd buy from them again.",
    vehicle: "Toyota Camry SE",
  },
  {
    name: "Tunde Bakare",
    location: "Ikeja, Lagos",
    rating: 5,
    message:
      "What stood out was the pricing. Everything was exactly as advertised, and they even covered the registration paperwork. A refreshingly straightforward dealership experience.",
    vehicle: "Lexus IS350 F-Sport",
  },
  {
    name: "Fatima Abdullahi",
    location: "Kano",
    rating: 5,
    message:
      "I was nervous about buying a car remotely from Kano, but their WhatsApp updates and video walkaround made me comfortable. The car arrived exactly as described.",
    vehicle: "Hyundai Elantra Limited",
  },
  {
    name: "Emeka Nwosu",
    location: "Ajah, Lagos",
    rating: 4,
    message:
      "Great selection of premium vehicles and a team that actually knows the cars. The Prado I bought has been flawless over six months of daily use.",
    vehicle: "Toyota Land Cruiser Prado",
  },
];

/* -------------------------------------------------------------------------- */
/* Runner                                                                      */
/* -------------------------------------------------------------------------- */

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@sundriveautos.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Sundrive@2026";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`  • admin already exists: ${email}`);
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      name: "Sundrive Admin",
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
  });
  console.log(`  • admin created: ${email}`);
}

async function seedVehicles() {
  const now = Date.now();

  for (const v of vehicles) {
    const slug = vehicleSlug({ make: v.make, model: v.model, trim: v.trim, year: v.year });
    const createdAt = new Date(now - (v.daysAgo ?? 10) * 86_400_000);

    const data = {
      make: v.make,
      model: v.model,
      trim: v.trim ?? null,
      year: v.year,
      price: v.price,
      mileage: v.mileage,
      bodyType: v.bodyType,
      fuelType: v.fuelType,
      transmission: v.transmission,
      driveType: v.driveType,
      engine: v.engine,
      exteriorColor: v.exteriorColor,
      interiorColor: v.interiorColor ?? null,
      condition: v.condition,
      location: v.location,
      vin: v.vin ?? null,
      description: v.description,
      features: JSON.stringify(v.features),
      images: JSON.stringify([photoFor(v.bodyType)]),
      status: v.status ?? "AVAILABLE",
      featured: v.featured ?? false,
      views: v.views ?? 0,
    };

    const created = await prisma.vehicle.upsert({
      where: { slug },
      update: { ...data, updatedAt: new Date() },
      create: { ...data, slug, createdAt, updatedAt: createdAt },
    });

    // Backfill a plausible view history for the analytics widgets.
    if (v.views) {
      await prisma.vehicleView.deleteMany({ where: { vehicleId: created.id } });
      const samples = Math.min(60, Math.round(v.views / 6));
      await prisma.vehicleView.createMany({
        data: Array.from({ length: samples }, (_, i) => ({
          vehicleId: created.id,
          createdAt: new Date(now - i * 7_200_000),
        })),
      });
    }
  }

  console.log(`  • ${vehicles.length} vehicles seeded`);
}

async function seedTestimonials() {
  const count = await prisma.testimonial.count();
  if (count > 0) {
    console.log("  • testimonials already present");
    return;
  }
  await prisma.testimonial.createMany({ data: testimonials });
  console.log(`  • ${testimonials.length} testimonials seeded`);
}

async function seedLeads() {
  const inspections = await prisma.inspection.count();
  if (inspections > 0) {
    console.log("  • sample leads already present");
    return;
  }

  const is350 = await prisma.vehicle.findUnique({
    where: { slug: "lexus-is350-f-sport-2014" },
  });
  const gle = await prisma.vehicle.findUnique({
    where: { slug: "mercedes-benz-gle-450-4matic-2019" },
  });

  const day = 86_400_000;
  const now = Date.now();

  const leads = [
    {
      name: "Ngozi Balogun",
      email: "ngozi.balogun@example.com",
      phone: "+2348031234567",
    },
    {
      name: "Samuel Adeyemi",
      email: "samuel.adeyemi@example.com",
      phone: "+2348123456789",
    },
    {
      name: "Halima Yusuf",
      email: "halima.yusuf@example.com",
      phone: "+2349076543210",
    },
    {
      name: "David Ochieng",
      email: "david.ochieng@example.com",
      phone: "+2347011223344",
    },
  ];

  // Customers are upserted by email, mirroring the public form behaviour.
  const customers = [];
  for (const lead of leads) {
    customers.push(
      await prisma.customer.upsert({
        where: { email: lead.email },
        update: {},
        create: { name: lead.name, email: lead.email, phone: lead.phone },
      }),
    );
  }

  await prisma.inspection.createMany({
    data: [
      {
        customerName: leads[0].name,
        email: leads[0].email,
        phone: leads[0].phone,
        vehicleId: is350?.id ?? null,
        vehicleLabel: "2014 Lexus IS350 F-Sport",
        preferredDate: new Date(now + 2 * day),
        preferredTime: "10:00",
        message: "Please have the service history ready. I'd also like to test drive.",
        status: "APPROVED",
        adminNotes: "Confirmed with customer over WhatsApp. Bay 2 reserved.",
        customerId: customers[0].id,
        createdAt: new Date(now - 2 * day),
      },
      {
        customerName: leads[1].name,
        email: leads[1].email,
        phone: leads[1].phone,
        vehicleId: gle?.id ?? null,
        vehicleLabel: "2019 Mercedes-Benz GLE 450 4MATIC",
        preferredDate: new Date(now + 4 * day),
        preferredTime: "14:30",
        message: "Travelling in from Abuja, so afternoon is better for me.",
        status: "PENDING",
        customerId: customers[1].id,
        createdAt: new Date(now - 6 * 3_600_000),
      },
      {
        customerName: leads[2].name,
        email: leads[2].email,
        phone: leads[2].phone,
        vehicleId: null,
        vehicleLabel: "2020 Porsche Macan S",
        preferredDate: new Date(now + day),
        preferredTime: "09:00",
        status: "PENDING",
        customerId: customers[2].id,
        createdAt: new Date(now - 3 * 3_600_000),
      },
      {
        customerName: leads[3].name,
        email: leads[3].email,
        phone: leads[3].phone,
        vehicleId: null,
        vehicleLabel: "Any 2019+ Toyota Land Cruiser Prado",
        preferredDate: new Date(now - 3 * day),
        preferredTime: "11:30",
        status: "COMPLETED",
        adminNotes: "Customer inspected the Prado TX-L and requested financing.",
        customerId: customers[3].id,
        createdAt: new Date(now - 8 * day),
      },
    ],
  });

  await prisma.sourcingRequest.createMany({
    data: [
      {
        customerName: leads[1].name,
        email: leads[1].email,
        phone: leads[1].phone,
        make: "Mercedes-Benz",
        model: "G-Class G63 AMG",
        yearFrom: 2019,
        yearTo: 2022,
        budget: 220000000,
        location: "Abuja",
        notes: "Prefer black on black with under 40,000 km. Must have full service history.",
        status: "IN_PROGRESS",
        adminNotes: "Two units identified at auction. Awaiting condition reports.",
        customerId: customers[1].id,
        createdAt: new Date(now - 5 * day),
      },
      {
        customerName: leads[3].name,
        email: leads[3].email,
        phone: leads[3].phone,
        make: "Toyota",
        model: "Hilux Double Cab",
        yearFrom: 2021,
        yearTo: 2024,
        budget: 65000000,
        location: "Port Harcourt",
        notes: "Need a 4x4 for site work. Automatic preferred.",
        status: "NEW",
        customerId: customers[3].id,
        createdAt: new Date(now - 2 * day),
      },
      {
        customerName: leads[0].name,
        email: leads[0].email,
        phone: leads[0].phone,
        make: "Audi",
        model: "RS6 Avant",
        yearFrom: 2020,
        yearTo: 2023,
        budget: 180000000,
        location: "Lagos",
        notes: "Wagon body specifically. Any colour except white.",
        status: "SOURCED",
        adminNotes: "Sourced a 2021 unit in Nardo Grey. Customer reviewing.",
        customerId: customers[0].id,
        createdAt: new Date(now - 12 * day),
      },
    ],
  });

  await prisma.contactMessage.createMany({
    data: [
      {
        name: leads[2].name,
        email: leads[2].email,
        phone: leads[2].phone,
        subject: "Financing options",
        message:
          "Hello, could you tell me what financing terms you offer for the Macan S? I can put down 40% and would like to spread the rest over 24 months.",
        status: "NEW",
        customerId: customers[2].id,
        createdAt: new Date(now - 4 * 3_600_000),
      },
      {
        name: leads[0].name,
        email: leads[0].email,
        phone: leads[0].phone,
        subject: "Do you deliver to Enugu?",
        message:
          "I'm interested in the Velar. Do you deliver outside Lagos, and is the delivery cost included in the listed price?",
        status: "REPLIED",
        customerId: customers[0].id,
        createdAt: new Date(now - 3 * day),
      },
      {
        name: "Bright Motors Ltd",
        email: "fleet@brightmotors.example.com",
        phone: "+2348099887766",
        subject: "Corporate fleet enquiry",
        message:
          "We are looking to refresh a fleet of eight executive sedans. Please send your corporate pricing structure and availability for bulk purchase.",
        status: "READ",
        createdAt: new Date(now - 6 * day),
      },
    ],
  });

  console.log("  • sample leads, customers and messages seeded");
}

async function main() {
  console.log("\nSeeding Sundrive Autos…");
  await seedAdmin();
  await seedVehicles();
  await seedTestimonials();
  await seedLeads();
  console.log("\nDone.\n");
}

main()
  .catch((error) => {
    console.error("\nSeed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
