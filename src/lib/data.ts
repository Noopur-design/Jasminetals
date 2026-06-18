/* ============================================================
   Jasminetals — content & mock data
   Design-only: powers the public site, client portal & internal panels.
   ============================================================ */

import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Building2,
  PartyPopper,
  Plane,
  Cake,
  Sparkles,
  CalendarHeart,
  PencilRuler,
  ClipboardCheck,
  Users,
  Gem,
} from "lucide-react";

export type EventType = {
  slug: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  includes: string[];
  seed: string;
};

export const eventTypes: EventType[] = [
  {
    slug: "weddings",
    name: "Weddings",
    icon: Heart,
    tagline: "From the first look to the last dance.",
    description:
      "Full-service wedding design and coordination — multi-day celebrations, multi-faith ceremonies, and every ritual handled with grace.",
    includes: [
      "Design concept & décor styling",
      "Multi-day run-of-show",
      "Vendor curation & management",
      "Guest logistics & hospitality",
      "On-day coordination team",
    ],
    seed: "wedding-aisle-florals",
  },
  {
    slug: "corporate",
    name: "Corporate",
    icon: Building2,
    tagline: "Polished events that mean business.",
    description:
      "Conferences, product launches, award nights and offsites — produced to brand, on time, and to the minute.",
    includes: [
      "Stage & AV production",
      "Branding & collateral",
      "Delegate registration",
      "Speaker & VIP management",
      "Live & hybrid streaming",
    ],
    seed: "corporate-stage-lights",
  },
  {
    slug: "social",
    name: "Social Celebrations",
    icon: PartyPopper,
    tagline: "Milestones worth remembering.",
    description:
      "Anniversaries, engagements, baby showers and intimate gatherings styled with warmth and personality.",
    includes: [
      "Theme & styling",
      "Curated entertainment",
      "Catering & bar design",
      "Photo & content corners",
      "Guest favours",
    ],
    seed: "social-table-setting",
  },
  {
    slug: "destination",
    name: "Destination",
    icon: Plane,
    tagline: "Celebrate somewhere extraordinary.",
    description:
      "Palaces, beaches and hill resorts — we manage travel, stay, and the entire experience end to end.",
    includes: [
      "Venue & resort sourcing",
      "Travel & accommodation",
      "Permits & logistics",
      "Local vendor network",
      "Guest concierge",
    ],
    seed: "destination-palace-courtyard",
  },
  {
    slug: "birthdays",
    name: "Birthdays",
    icon: Cake,
    tagline: "Big days, beautifully done.",
    description:
      "From whimsical first birthdays to landmark celebrations — playful, personal, and perfectly run.",
    includes: [
      "Concept & set design",
      "Entertainment & activities",
      "Custom cakes & dessert tables",
      "Hosting & coordination",
      "Return gifts",
    ],
    seed: "birthday-balloon-arch",
  },
];

export type PortfolioItem = {
  slug: string;
  title: string;
  type: string;
  typeSlug: string;
  location: string;
  year: string;
  cover: string;
  guests: string;
  brief: string;
  result: string;
  gallery: string[];
};

export const portfolio: PortfolioItem[] = [
  {
    slug: "aanya-and-vikram",
    title: "Aanya & Vikram",
    type: "Weddings",
    typeSlug: "weddings",
    location: "Udaipur",
    year: "2025",
    cover: "udaipur-lake-wedding",
    guests: "420 guests",
    brief:
      "A three-day lakeside celebration blending Marwari tradition with contemporary design, hosted across two heritage venues.",
    result:
      "Twelve curated functions, forty vendors, zero missed cues — and a mandap that floated over the water at golden hour.",
    gallery: [
      "udaipur-lake-wedding",
      "udaipur-mandap-florals",
      "udaipur-sangeet-stage",
      "udaipur-haldi-marigold",
      "udaipur-reception-tablescape",
      "udaipur-couple-portrait",
    ],
  },
  {
    slug: "horizon-product-launch",
    title: "Horizon — Global Launch",
    type: "Corporate",
    typeSlug: "corporate",
    location: "New Delhi",
    year: "2025",
    cover: "corporate-launch-keynote",
    guests: "900 delegates",
    brief:
      "A flagship product reveal for a technology brand, broadcast live to 40 countries with a press-day and gala dinner.",
    result:
      "A 9-minute reveal sequence, a 22-camera live stream, and a green-room operation that kept 30 VIPs perfectly on schedule.",
    gallery: [
      "corporate-launch-keynote",
      "corporate-stage-lights",
      "corporate-registration-desk",
      "corporate-gala-dinner",
      "corporate-press-wall",
    ],
  },
  {
    slug: "the-mehta-silver-jubilee",
    title: "The Mehta Silver Jubilee",
    type: "Social Celebrations",
    typeSlug: "social",
    location: "Gurugram",
    year: "2024",
    cover: "anniversary-garden-soiree",
    guests: "150 guests",
    brief:
      "A 25th anniversary garden soirée — intimate, elegant, and full of personal storytelling.",
    result:
      "A living timeline installation, a surprise family performance, and a dinner under a canopy of warm string lights.",
    gallery: [
      "anniversary-garden-soiree",
      "social-table-setting",
      "anniversary-string-lights",
      "anniversary-cake-moment",
    ],
  },
  {
    slug: "ishaan-turns-one",
    title: "Ishaan Turns One",
    type: "Birthdays",
    typeSlug: "birthdays",
    location: "Noida",
    year: "2025",
    cover: "birthday-balloon-arch",
    guests: "80 guests",
    brief:
      "A hot-air-balloon themed first birthday with a soft pastel palette and plenty for little guests to do.",
    result:
      "A balloon installation, a dessert sky, and a play zone that kept thirty toddlers (and their parents) delighted.",
    gallery: [
      "birthday-balloon-arch",
      "birthday-dessert-table",
      "birthday-play-zone",
    ],
  },
  {
    slug: "saira-and-dev-goa",
    title: "Saira & Dev",
    type: "Destination",
    typeSlug: "destination",
    location: "Goa",
    year: "2024",
    cover: "destination-beach-ceremony",
    guests: "180 guests",
    brief:
      "A barefoot beach wedding with a weekend of curated experiences for out-of-town guests.",
    result:
      "Sunset vows on the sand, a flotilla of guest logistics handled invisibly, and an after-party that ran till dawn.",
    gallery: [
      "destination-beach-ceremony",
      "destination-palace-courtyard",
      "destination-welcome-dinner",
      "destination-couple-sunset",
    ],
  },
  {
    slug: "northstar-awards-night",
    title: "NorthStar Awards Night",
    type: "Corporate",
    typeSlug: "corporate",
    location: "Mumbai",
    year: "2024",
    cover: "corporate-gala-dinner",
    guests: "600 guests",
    brief:
      "An annual awards gala for a financial-services group, with a seated dinner and live entertainment.",
    result:
      "Forty-two awards presented in seventy minutes, a seamless seating plan, and a headline act that brought the house down.",
    gallery: [
      "corporate-gala-dinner",
      "corporate-awards-stage",
      "corporate-entertainment",
    ],
  },
];

export type Package = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  featured?: boolean;
  cta: string;
};

export const packages: Package[] = [
  {
    name: "Essentials",
    price: "₹1.5L",
    cadence: "starting",
    description: "On-day coordination for couples and hosts who've planned the details themselves.",
    features: [
      "Final-month planning support",
      "Run-of-show & vendor schedule",
      "On-day coordination (1 lead)",
      "Vendor point-of-contact",
      "Timeline & logistics management",
    ],
    cta: "Enquire",
  },
  {
    name: "Signature",
    price: "₹4L",
    cadence: "starting",
    description: "Our most-loved end-to-end service for a single standout celebration.",
    features: [
      "Everything in Essentials",
      "Full design & décor concept",
      "Complete vendor curation",
      "Budget planning & tracking",
      "Dedicated 3-person coordination team",
      "Client portal access",
    ],
    featured: true,
    cta: "Book a Consultation",
  },
  {
    name: "Bespoke",
    price: "Custom",
    cadence: "by quote",
    description: "Multi-day or destination productions designed entirely around you.",
    features: [
      "Everything in Signature",
      "Multi-day / multi-venue planning",
      "Destination & travel management",
      "Guest concierge & hospitality",
      "Custom builds & installations",
      "Senior producer + full crew",
    ],
    cta: "Request a Proposal",
  },
];

export type ProcessStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    icon: CalendarHeart,
    title: "Consultation",
    description:
      "We listen first — your story, your guests, your vision and your budget. No templates, no pressure.",
  },
  {
    icon: PencilRuler,
    title: "Concept",
    description:
      "A bespoke design direction: mood boards, layouts, and a clear plan you can see and feel.",
  },
  {
    icon: ClipboardCheck,
    title: "Planning",
    description:
      "Vendors curated, budgets tracked, timelines built — every detail logged in your client portal.",
  },
  {
    icon: Users,
    title: "Coordination",
    description:
      "A dedicated team manages vendors, logistics and the run-of-show in the weeks before.",
  },
  {
    icon: Gem,
    title: "Event Day",
    description:
      "You're a guest at your own celebration. We handle everything, invisibly, from dawn to last dance.",
  },
];

export type Testimonial = {
  quote: string;
  author: string;
  detail: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Jasminetals turned three chaotic days into the calmest, most beautiful weekend of our lives. Not one thing went wrong — or if it did, we never knew.",
    author: "Aanya & Vikram",
    detail: "Lakeside Wedding · Udaipur",
    rating: 5,
  },
  {
    quote:
      "Our global launch had zero margin for error and they produced it flawlessly. The live stream, the stage, the VIP flow — all of it, perfect.",
    author: "Rohan Kapoor",
    detail: "VP Marketing · Horizon",
    rating: 5,
  },
  {
    quote:
      "Twenty-five years of marriage deserved a special evening, and they gave us one we'll never forget. Warm, thoughtful, and impeccably run.",
    author: "Sunita Mehta",
    detail: "Silver Jubilee · Gurugram",
    rating: 5,
  },
  {
    quote:
      "From the first call I felt heard. They understood the brief instantly and made every decision feel easy. The client portal kept us totally in control.",
    author: "Saira & Dev",
    detail: "Destination Wedding · Goa",
    rating: 5,
  },
];

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  seed: string;
};

export const team: TeamMember[] = [
  {
    name: "Jasmine Nair",
    role: "Founder & Creative Director",
    bio: "Fifteen years designing celebrations across India and beyond. Jasmine leads every concept personally.",
    seed: "team-jasmine",
  },
  {
    name: "Kabir Sethi",
    role: "Head of Production",
    bio: "The calm in every storm. Kabir runs logistics, crews and timelines down to the minute.",
    seed: "team-kabir",
  },
  {
    name: "Meher Rao",
    role: "Lead Designer",
    bio: "Florals, tablescapes and installations. Meher turns mood boards into spaces you can walk into.",
    seed: "team-meher",
  },
  {
    name: "Dev Anand",
    role: "Client Experience Lead",
    bio: "Your day-to-day partner — from first consultation to the final thank-you note.",
    seed: "team-dev",
  },
];

export const stats = [
  { value: "500+", label: "Events planned" },
  { value: "15", label: "Years of craft" },
  { value: "98%", label: "Referral rate" },
  { value: "40+", label: "Trusted vendors" },
];

export const valueProps = [
  {
    icon: Sparkles,
    title: "Design-led, always",
    description:
      "Every event begins with an original concept. No copy-paste themes — your celebration looks like no one else's.",
  },
  {
    icon: ClipboardCheck,
    title: "Nothing falls through",
    description:
      "Run-of-show timelines, vendor checklists and a live client portal mean every detail is tracked and visible.",
  },
  {
    icon: Users,
    title: "A team on the day",
    description:
      "You're never relying on one person. A dedicated crew coordinates vendors so you can simply be present.",
  },
  {
    icon: Gem,
    title: "Calm under pressure",
    description:
      "Fifteen years and five hundred events of experience handling the unexpected — invisibly.",
  },
];

export const venuePartners = [
  "The Leela Palace",
  "Taj Lake Palace",
  "ITC Grand",
  "The Oberoi",
  "JW Marriott",
  "Andaz Delhi",
];
