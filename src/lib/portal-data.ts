/**
 * Mock data for the authenticated Client Portal.
 * A single booked client's event — design-only, no backend.
 * Today (for this build) is 2026-06-15; the event is ~5 months out.
 */

export type MilestoneStatus = "done" | "in-progress" | "pending" | "action-needed";
export type MilestoneOwner = "You" | "Jasminetals";
export type BudgetLineStatus = "paid" | "partial" | "due";
export type DocumentType = "contract" | "invoice" | "other";
export type MessageFrom = "you" | "team";

export interface PortalEvent {
  name: string;
  type: string;
  date: string; // ISO
  venue: string;
  location: string;
  status: string;
  coverSeed: string;
  guestCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  due: string; // ISO
  status: MilestoneStatus;
  owner: MilestoneOwner;
}

export interface BudgetLine {
  category: string;
  allocated: number;
  spent: number;
  status: BudgetLineStatus;
}

export interface BudgetSummary {
  total: number;
  lines: BudgetLine[];
}

export interface MoodboardItem {
  seed: string;
  label: string;
  note?: string;
}

export interface PortalDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  date: string; // ISO
}

export interface Message {
  id: string;
  from: MessageFrom;
  author: string;
  time: string; // ISO
  text: string;
}

export const event: PortalEvent = {
  name: "Aanya & Vikram",
  type: "Lakeside Wedding",
  date: "2026-11-21",
  venue: "Taj Lake Palace",
  location: "Udaipur, Rajasthan",
  status: "Planning",
  coverSeed: "aanya-vikram-lakeside-udaipur",
  guestCount: 220,
};

/** The client's primary contact for the avatar menu. */
export const client = {
  name: "Aanya Mehra",
  email: "aanya.mehra@gmail.com",
  role: "Bride · Primary contact",
};

/** The lead planner from Jasminetals. */
export const planner = {
  name: "Ishita Rao",
  role: "Lead Planner, Jasminetals",
};

export const milestones: Milestone[] = [
  {
    id: "m1",
    title: "Sign planning agreement",
    description: "Service contract & scope confirmed with Jasminetals.",
    due: "2026-05-30",
    status: "done",
    owner: "You",
  },
  {
    id: "m2",
    title: "Confirm venue & dates",
    description: "Taj Lake Palace booked for 21 Nov across both ceremonies.",
    due: "2026-06-05",
    status: "done",
    owner: "Jasminetals",
  },
  {
    id: "m3",
    title: "Lock the guest list (round one)",
    description: "Share your draft list so we can finalise room blocks.",
    due: "2026-06-20",
    status: "action-needed",
    owner: "You",
  },
  {
    id: "m4",
    title: "Approve invitation suite design",
    description: "Foil-pressed concepts ready for your sign-off in Mood Board.",
    due: "2026-06-25",
    status: "action-needed",
    owner: "You",
  },
  {
    id: "m5",
    title: "Finalise décor & floral concept",
    description: "Marigold-and-ivory mandap palette under refinement.",
    due: "2026-07-10",
    status: "in-progress",
    owner: "Jasminetals",
  },
  {
    id: "m6",
    title: "Book photography & cinematography",
    description: "Shortlist of three studios shared; awaiting your pick.",
    due: "2026-07-18",
    status: "in-progress",
    owner: "Jasminetals",
  },
  {
    id: "m7",
    title: "Tasting & menu confirmation",
    description: "Curated Rajasthani-thali and global stations tasting.",
    due: "2026-08-22",
    status: "pending",
    owner: "Jasminetals",
  },
  {
    id: "m8",
    title: "Send invitations",
    description: "Print run and dispatch to all confirmed guests.",
    due: "2026-09-05",
    status: "pending",
    owner: "Jasminetals",
  },
  {
    id: "m9",
    title: "Guest travel & stay coordination",
    description: "Flights, transfers and palace room allocations.",
    due: "2026-10-01",
    status: "pending",
    owner: "Jasminetals",
  },
  {
    id: "m10",
    title: "Final headcount & run-of-show",
    description: "Lock numbers and the minute-by-minute timeline.",
    due: "2026-11-07",
    status: "pending",
    owner: "You",
  },
];

export const budget: BudgetSummary = {
  total: 9500000,
  lines: [
    { category: "Venue & stay", allocated: 2800000, spent: 2800000, status: "paid" },
    { category: "Catering & bar", allocated: 1900000, spent: 950000, status: "partial" },
    { category: "Décor & florals", allocated: 1500000, spent: 600000, status: "partial" },
    { category: "Photography & film", allocated: 850000, spent: 0, status: "due" },
    { category: "Entertainment", allocated: 700000, spent: 350000, status: "partial" },
    { category: "Invitations & stationery", allocated: 280000, spent: 140000, status: "partial" },
    { category: "Hair, makeup & styling", allocated: 420000, spent: 0, status: "due" },
    { category: "Guest travel & logistics", allocated: 650000, spent: 0, status: "due" },
    { category: "Jasminetals planning fee", allocated: 400000, spent: 200000, status: "partial" },
  ],
};

export const moodboard: MoodboardItem[] = [
  { seed: "marigold-ivory-mandap", label: "Mandap palette", note: "Marigold & ivory" },
  { seed: "lakeside-sunset-ceremony", label: "Lakeside ceremony" },
  { seed: "candlelit-palace-dinner", label: "Candlelit dinner" },
  { seed: "foil-invitation-suite", label: "Invitation suite", note: "Gold foil on ecru" },
  { seed: "blush-rose-centrepiece", label: "Table centrepiece" },
  { seed: "bridal-mehndi-detail", label: "Mehndi details" },
  { seed: "string-light-courtyard", label: "Courtyard lighting" },
  { seed: "heritage-boat-arrival", label: "Boat arrival" },
  { seed: "draped-gold-canopy", label: "Welcome canopy" },
];

export const documents: PortalDocument[] = [
  { id: "d1", name: "Planning Services Agreement", type: "contract", size: "320 KB", date: "2026-05-30" },
  { id: "d2", name: "Venue Booking Contract — Taj Lake Palace", type: "contract", size: "510 KB", date: "2026-06-05" },
  { id: "d3", name: "Advance Invoice #AUR-2026-014", type: "invoice", size: "98 KB", date: "2026-06-06" },
  { id: "d4", name: "Décor & Florals Proposal", type: "other", size: "2.4 MB", date: "2026-06-10" },
  { id: "d5", name: "Catering Estimate — Round One", type: "invoice", size: "142 KB", date: "2026-06-12" },
  { id: "d6", name: "Event Day Schedule (Draft)", type: "other", size: "76 KB", date: "2026-06-14" },
];

export const messages: Message[] = [
  {
    id: "t1",
    from: "team",
    author: "Ishita Rao",
    time: "2026-06-12T10:05:00",
    text: "Good morning Aanya! The marigold-and-ivory mandap concept is up in your Mood Board. Have a look whenever you get a quiet moment — no rush.",
  },
  {
    id: "t2",
    from: "you",
    author: "Aanya Mehra",
    time: "2026-06-12T12:40:00",
    text: "It's stunning! Vikram loved the canopy lighting too. Can we make the florals a touch warmer?",
  },
  {
    id: "t3",
    from: "team",
    author: "Ishita Rao",
    time: "2026-06-12T13:15:00",
    text: "Absolutely — we'll deepen the marigold and add amber roses. I'll refresh the board by Thursday.",
  },
  {
    id: "t4",
    from: "team",
    author: "Ishita Rao",
    time: "2026-06-14T09:30:00",
    text: "Two small to-dos for you this week: your round-one guest list and a sign-off on the invitation suite. Both are in your Timeline.",
  },
  {
    id: "t5",
    from: "you",
    author: "Aanya Mehra",
    time: "2026-06-14T18:20:00",
    text: "On it — I'll share the guest list this weekend. Thank you for keeping us so calm through all this. 💛",
  },
];
