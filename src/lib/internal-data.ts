/* ============================================================
   Jasminetals — INTERNAL mock data
   Powers the hidden staff panels (admin, team access, scheduling).
   Design-only. Reference "today" is 2026-06-15.
   ============================================================ */

export const TODAY = "2026-06-15";

export type EventStatus =
  | "lead"
  | "booked"
  | "planning"
  | "this-week"
  | "completed";

export type InternalEvent = {
  id: string;
  client: string;
  type: string;
  date: string; // ISO
  status: EventStatus;
  assignedTeam: string[]; // teamMember ids
  budget: number;
  location: string;
  coverSeed: string;
  guests: number;
};

export const events: InternalEvent[] = [
  {
    id: "evt-aanya-vikram",
    client: "Aanya & Vikram Mehra",
    type: "Wedding",
    date: "2026-06-17",
    status: "this-week",
    assignedTeam: ["tm-jasminetals", "tm-kabir", "tm-meher"],
    budget: 4800000,
    location: "Taj Lake Palace, Udaipur",
    coverSeed: "udaipur-lake-wedding",
    guests: 420,
  },
  {
    id: "evt-horizon-launch",
    client: "Horizon Technologies",
    type: "Corporate",
    date: "2026-06-19",
    status: "this-week",
    assignedTeam: ["tm-kabir", "tm-dev"],
    budget: 6200000,
    location: "Andaz Delhi, Aerocity",
    coverSeed: "corporate-launch-keynote",
    guests: 900,
  },
  {
    id: "evt-kapoor-sangeet",
    client: "The Kapoor Family",
    type: "Wedding",
    date: "2026-07-04",
    status: "planning",
    assignedTeam: ["tm-jasminetals", "tm-meher", "tm-priya"],
    budget: 3600000,
    location: "ITC Grand, Gurugram",
    coverSeed: "udaipur-sangeet-stage",
    guests: 340,
  },
  {
    id: "evt-northstar-awards",
    client: "NorthStar Financial",
    type: "Corporate",
    date: "2026-07-12",
    status: "planning",
    assignedTeam: ["tm-kabir", "tm-dev"],
    budget: 5400000,
    location: "JW Marriott, Mumbai",
    coverSeed: "corporate-gala-dinner",
    guests: 600,
  },
  {
    id: "evt-saira-dev-goa",
    client: "Saira & Dev Khanna",
    type: "Destination",
    date: "2026-08-22",
    status: "booked",
    assignedTeam: ["tm-jasminetals", "tm-priya"],
    budget: 5100000,
    location: "Taj Exotica, Goa",
    coverSeed: "destination-beach-ceremony",
    guests: 180,
  },
  {
    id: "evt-mehta-jubilee",
    client: "Sunita & Rajan Mehta",
    type: "Social",
    date: "2026-09-06",
    status: "booked",
    assignedTeam: ["tm-meher", "tm-dev"],
    budget: 1450000,
    location: "Private Estate, Chhatarpur",
    coverSeed: "anniversary-garden-soiree",
    guests: 150,
  },
  {
    id: "evt-ishaan-birthday",
    client: "Neha & Arjun Bhalla",
    type: "Birthday",
    date: "2026-07-26",
    status: "planning",
    assignedTeam: ["tm-meher"],
    budget: 680000,
    location: "The Oberoi, Gurugram",
    coverSeed: "birthday-balloon-arch",
    guests: 80,
  },
  {
    id: "evt-verma-engagement",
    client: "Riya Verma",
    type: "Social",
    date: "2026-10-11",
    status: "lead",
    assignedTeam: [],
    budget: 920000,
    location: "TBD — Delhi NCR",
    coverSeed: "social-table-setting",
    guests: 120,
  },
  {
    id: "evt-quantum-offsite",
    client: "Quantum Labs",
    type: "Corporate",
    date: "2026-11-03",
    status: "lead",
    assignedTeam: [],
    budget: 2300000,
    location: "TBD — Jaipur",
    coverSeed: "corporate-stage-lights",
    guests: 220,
  },
  {
    id: "evt-singh-wedding",
    client: "Tara & Aman Singh",
    type: "Wedding",
    date: "2026-04-18",
    status: "completed",
    assignedTeam: ["tm-jasminetals", "tm-kabir", "tm-meher", "tm-dev"],
    budget: 4200000,
    location: "The Leela Palace, Jaipur",
    coverSeed: "udaipur-mandap-florals",
    guests: 380,
  },
  {
    id: "evt-deloitte-gala",
    client: "Deloitte India",
    type: "Corporate",
    date: "2026-03-28",
    status: "completed",
    assignedTeam: ["tm-kabir", "tm-dev"],
    budget: 3900000,
    location: "The Leela, Mumbai",
    coverSeed: "corporate-awards-stage",
    guests: 520,
  },
];

// ── Consultation-form leads ──────────────────────────────
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "converted";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate?: string;
  guestCount?: string;
  budget?: string;
  message?: string;
  submittedAt: string; // ISO
  status: LeadStatus;
  assignedTeam?: string[];
};

export const leads: Lead[] = [
  {
    id: "ld-001",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98765 12345",
    eventType: "Wedding",
    eventDate: "2027-02-14",
    guestCount: "250",
    budget: "₹25L+",
    message:
      "Looking for full-service planning for our February 2027 wedding at a heritage property in Delhi NCR.",
    submittedAt: "2026-06-15T08:30:00",
    status: "new",
  },
  {
    id: "ld-002",
    name: "Ravi Gupta",
    email: "ravi.gupta@horizonindia.in",
    phone: "+91 99100 55432",
    eventType: "Corporate",
    eventDate: "2026-09-15",
    guestCount: "500",
    budget: "₹10L – ₹25L",
    message: "Annual leadership awards gala — 500 pax, Delhi venue TBD.",
    submittedAt: "2026-06-14T16:20:00",
    status: "new",
  },
  {
    id: "ld-003",
    name: "Anita Malhotra",
    email: "anita.m@gmail.com",
    phone: "+91 95500 88871",
    eventType: "Social",
    budget: "₹5L – ₹10L",
    message: "50th birthday party for my mother, ~80 guests, looking for a premium evening event.",
    submittedAt: "2026-06-14T11:05:00",
    status: "contacted",
  },
  {
    id: "ld-004",
    name: "Deepak & Naina Bose",
    email: "deepak.bose@gmail.com",
    phone: "+91 98300 44219",
    eventType: "Wedding",
    eventDate: "2026-12-10",
    guestCount: "300",
    budget: "₹25L+",
    submittedAt: "2026-06-13T09:15:00",
    status: "contacted",
  },
];

export type ClientStatus = "lead" | "active" | "past";

export type CrmClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  eventsCount: number;
  since: string; // ISO
  source: string;
};

export const clients: CrmClient[] = [
  {
    id: "cl-mehra",
    name: "Aanya & Vikram Mehra",
    email: "aanya.mehra@gmail.com",
    phone: "+91 98100 22841",
    status: "active",
    eventsCount: 1,
    since: "2025-09-12",
    source: "Referral",
  },
  {
    id: "cl-horizon",
    name: "Horizon Technologies",
    email: "events@horizontech.in",
    phone: "+91 11 4055 7700",
    status: "active",
    eventsCount: 3,
    since: "2024-02-20",
    source: "Corporate RFP",
  },
  {
    id: "cl-kapoor",
    name: "The Kapoor Family",
    email: "rohit.kapoor@outlook.com",
    phone: "+91 98730 11200",
    status: "active",
    eventsCount: 1,
    since: "2026-01-08",
    source: "Instagram",
  },
  {
    id: "cl-northstar",
    name: "NorthStar Financial",
    email: "brand@northstar.co.in",
    phone: "+91 22 6612 9000",
    status: "active",
    eventsCount: 2,
    since: "2023-11-02",
    source: "Referral",
  },
  {
    id: "cl-khanna",
    name: "Saira & Dev Khanna",
    email: "saira.k@gmail.com",
    phone: "+91 99999 45612",
    status: "active",
    eventsCount: 1,
    since: "2026-02-14",
    source: "Website",
  },
  {
    id: "cl-mehta",
    name: "Sunita & Rajan Mehta",
    email: "rajan.mehta@gmail.com",
    phone: "+91 98180 73344",
    status: "active",
    eventsCount: 2,
    since: "2024-06-30",
    source: "Referral",
  },
  {
    id: "cl-bhalla",
    name: "Neha & Arjun Bhalla",
    email: "neha.bhalla@gmail.com",
    phone: "+91 98910 55890",
    status: "active",
    eventsCount: 1,
    since: "2026-03-19",
    source: "Instagram",
  },
  {
    id: "cl-verma",
    name: "Riya Verma",
    email: "riya.verma@gmail.com",
    phone: "+91 97110 88231",
    status: "lead",
    eventsCount: 0,
    since: "2026-05-28",
    source: "Website",
  },
  {
    id: "cl-quantum",
    name: "Quantum Labs",
    email: "people@quantumlabs.ai",
    phone: "+91 80 4123 6600",
    status: "lead",
    eventsCount: 0,
    since: "2026-06-02",
    source: "Corporate RFP",
  },
  {
    id: "cl-singh",
    name: "Tara & Aman Singh",
    email: "tara.singh@gmail.com",
    phone: "+91 98115 90021",
    status: "past",
    eventsCount: 1,
    since: "2025-07-11",
    source: "Referral",
  },
  {
    id: "cl-deloitte",
    name: "Deloitte India",
    email: "internal.events@deloitte.in",
    phone: "+91 124 679 2000",
    status: "past",
    eventsCount: 4,
    since: "2022-08-15",
    source: "Corporate RFP",
  },
  {
    id: "cl-arora",
    name: "Karan & Diya Arora",
    email: "karan.arora@gmail.com",
    phone: "+91 98991 23410",
    status: "lead",
    eventsCount: 0,
    since: "2026-06-10",
    source: "Referral",
  },
];

export type VendorCategory =
  | "catering"
  | "decor"
  | "photography"
  | "venue"
  | "entertainment"
  | "makeup";

export type VendorStatus = "confirmed" | "pending" | "preferred";

export type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  contact: string;
  phone: string;
  status: VendorStatus;
  rating: number;
};

export const vendors: Vendor[] = [
  { id: "vn-saffron", name: "Saffron & Sage Catering", category: "catering", contact: "Imran Qureshi", phone: "+91 98100 44120", status: "preferred", rating: 4.9 },
  { id: "vn-tarit", name: "Tarit Lighting & AV", category: "entertainment", contact: "Sandeep Rao", phone: "+91 99580 33019", status: "confirmed", rating: 4.7 },
  { id: "vn-bloom", name: "Bloomwork Florals", category: "decor", contact: "Meghna Iyer", phone: "+91 98201 76654", status: "preferred", rating: 4.8 },
  { id: "vn-stories", name: "Stories by Aman", category: "photography", contact: "Aman Gulati", phone: "+91 99100 21188", status: "confirmed", rating: 5.0 },
  { id: "vn-leela", name: "The Leela Palace", category: "venue", contact: "Banquets Desk", phone: "+91 124 477 1234", status: "preferred", rating: 4.9 },
  { id: "vn-glow", name: "Glow by Tina", category: "makeup", contact: "Tina Sethi", phone: "+91 98910 67712", status: "pending", rating: 4.6 },
  { id: "vn-dhol", name: "Rhythm Dhol Collective", category: "entertainment", contact: "Gurpreet Singh", phone: "+91 98760 12345", status: "confirmed", rating: 4.5 },
  { id: "vn-spice", name: "Spice Route Caterers", category: "catering", contact: "Lakshmi Nair", phone: "+91 99620 88451", status: "pending", rating: 4.4 },
  { id: "vn-frame", name: "Frame & Focus Films", category: "photography", contact: "Dev Malhotra", phone: "+91 98330 91002", status: "preferred", rating: 4.8 },
  { id: "vn-mandap", name: "Mandap Studio Decor", category: "decor", contact: "Pooja Reddy", phone: "+91 98445 23310", status: "confirmed", rating: 4.6 },
  { id: "vn-oberoi", name: "The Oberoi Gurugram", category: "venue", contact: "Events Office", phone: "+91 124 245 1234", status: "confirmed", rating: 4.8 },
  { id: "vn-lush", name: "Lush Bridal Studio", category: "makeup", contact: "Ritu Bansal", phone: "+91 98180 55440", status: "preferred", rating: 4.7 },
];

export type Module =
  | "Events"
  | "Clients"
  | "Vendors"
  | "Calendar"
  | "Tasks"
  | "Budget";

export const MODULES: Module[] = [
  "Events",
  "Clients",
  "Vendors",
  "Calendar",
  "Tasks",
  "Budget",
];

export type Perms = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
};

export type AccessEntry = { module: Module; perms: Perms };

export type MemberStatus = "active" | "suspended";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: MemberStatus;
  assignedEvents: string[]; // event ids
  access: AccessEntry[];
};

const full: Perms = { view: true, create: true, edit: true, delete: true, export: true };
const editor: Perms = { view: true, create: true, edit: true, delete: false, export: true };
const viewer: Perms = { view: true, create: false, edit: false, delete: false, export: false };
const none: Perms = { view: false, create: false, edit: false, delete: false, export: false };

function access(map: Partial<Record<Module, Perms>>): AccessEntry[] {
  return MODULES.map((module) => ({ module, perms: map[module] ?? none }));
}

export const teamMembers: TeamMember[] = [
  {
    id: "tm-jasminetals",
    name: "Jasmine Nair",
    role: "Founder & Creative Director",
    email: "jasminetals@jasminetalsevents.in",
    status: "active",
    assignedEvents: ["evt-aanya-vikram", "evt-kapoor-sangeet", "evt-saira-dev-goa", "evt-singh-wedding"],
    access: access({ Events: full, Clients: full, Vendors: full, Calendar: full, Tasks: full, Budget: full }),
  },
  {
    id: "tm-kabir",
    name: "Kabir Sethi",
    role: "Head of Production",
    email: "kabir@jasminetalsevents.in",
    status: "active",
    assignedEvents: ["evt-aanya-vikram", "evt-horizon-launch", "evt-northstar-awards", "evt-singh-wedding", "evt-deloitte-gala"],
    access: access({ Events: full, Clients: editor, Vendors: full, Calendar: full, Tasks: full, Budget: editor }),
  },
  {
    id: "tm-meher",
    name: "Meher Rao",
    role: "Lead Designer",
    email: "meher@jasminetalsevents.in",
    status: "active",
    assignedEvents: ["evt-aanya-vikram", "evt-kapoor-sangeet", "evt-mehta-jubilee", "evt-ishaan-birthday", "evt-singh-wedding"],
    access: access({ Events: editor, Clients: viewer, Vendors: editor, Calendar: editor, Tasks: editor, Budget: viewer }),
  },
  {
    id: "tm-dev",
    name: "Dev Anand",
    role: "Client Experience Lead",
    email: "dev@jasminetalsevents.in",
    status: "active",
    assignedEvents: ["evt-horizon-launch", "evt-northstar-awards", "evt-mehta-jubilee", "evt-singh-wedding", "evt-deloitte-gala"],
    access: access({ Events: editor, Clients: full, Vendors: editor, Calendar: editor, Tasks: editor, Budget: viewer }),
  },
  {
    id: "tm-priya",
    name: "Priya Menon",
    role: "Coordinator",
    email: "priya@jasminetalsevents.in",
    status: "active",
    assignedEvents: ["evt-kapoor-sangeet", "evt-saira-dev-goa"],
    access: access({ Events: viewer, Vendors: viewer, Calendar: viewer, Tasks: editor }),
  },
  {
    id: "tm-rohan",
    name: "Rohan Bhatt",
    role: "Junior Coordinator",
    email: "rohan@jasminetalsevents.in",
    status: "suspended",
    assignedEvents: [],
    access: access({ Events: viewer, Calendar: viewer, Tasks: viewer }),
  },
];

export type AuditEntry = {
  id: string;
  who: string;
  action: string;
  target: string;
  when: string; // ISO datetime
  before?: string;
  after?: string;
};

export const auditLog: AuditEntry[] = [
  { id: "au-01", who: "Kabir Sethi", action: "Updated event status", target: "Aanya & Vikram Mehra", when: "2026-06-15T09:42:00", before: "planning", after: "this-week" },
  { id: "au-02", who: "Jasmine Nair", action: "Assigned team member", target: "Kapoor Sangeet", when: "2026-06-15T08:17:00", before: "—", after: "Priya Menon" },
  { id: "au-03", who: "Dev Anand", action: "Confirmed vendor", target: "Tarit Lighting & AV", when: "2026-06-14T18:05:00", before: "pending", after: "confirmed" },
  { id: "au-04", who: "Meher Rao", action: "Updated budget line", target: "Ishaan Birthday — Decor", when: "2026-06-14T15:30:00", before: "₹1,80,000", after: "₹2,10,000" },
  { id: "au-05", who: "Jasmine Nair", action: "Created client", target: "Karan & Diya Arora", when: "2026-06-14T11:12:00", after: "Lead" },
  { id: "au-06", who: "System", action: "Revoked access", target: "Rohan Bhatt", when: "2026-06-13T22:00:00", before: "active", after: "suspended" },
  { id: "au-07", who: "Kabir Sethi", action: "Moved task", target: "Stage AV walkthrough", when: "2026-06-13T16:48:00", before: "in-progress", after: "review" },
  { id: "au-08", who: "Dev Anand", action: "Exported guest list", target: "Horizon Launch", when: "2026-06-13T14:20:00" },
  { id: "au-09", who: "Priya Menon", action: "Added note", target: "Saira & Dev — Goa", when: "2026-06-12T19:33:00" },
  { id: "au-10", who: "Jasmine Nair", action: "Updated permissions", target: "Meher Rao — Budget", when: "2026-06-12T10:05:00", before: "edit", after: "view" },
  { id: "au-11", who: "Meher Rao", action: "Uploaded files", target: "Kapoor Sangeet — Moodboard", when: "2026-06-11T17:50:00", after: "8 files" },
  { id: "au-12", who: "System", action: "Sent invoice", target: "NorthStar Financial", when: "2026-06-11T09:00:00", after: "₹54,00,000" },
  { id: "au-13", who: "Kabir Sethi", action: "Updated event status", target: "Quantum Labs", when: "2026-06-10T13:15:00", before: "—", after: "lead" },
  { id: "au-14", who: "Dev Anand", action: "Deleted task", target: "Old catering RFP", when: "2026-06-09T11:40:00" },
];

export type TaskPriority = "low" | "med" | "high";
export type TaskStage = "todo" | "in-progress" | "review" | "done";

export type Task = {
  id: string;
  eventId: string;
  title: string;
  assignee: string; // member name
  due: string; // ISO
  priority: TaskPriority;
  stage: TaskStage;
};

export const tasks: Task[] = [
  { id: "tk-01", eventId: "evt-aanya-vikram", title: "Finalize mandap floral install", assignee: "Meher Rao", due: "2026-06-16", priority: "high", stage: "in-progress" },
  { id: "tk-02", eventId: "evt-aanya-vikram", title: "Confirm guest transport fleet", assignee: "Kabir Sethi", due: "2026-06-16", priority: "high", stage: "todo" },
  { id: "tk-03", eventId: "evt-aanya-vikram", title: "Lock sangeet run-of-show", assignee: "Jasmine Nair", due: "2026-06-15", priority: "high", stage: "review" },
  { id: "tk-04", eventId: "evt-horizon-launch", title: "Stage AV walkthrough", assignee: "Kabir Sethi", due: "2026-06-17", priority: "high", stage: "review" },
  { id: "tk-05", eventId: "evt-horizon-launch", title: "Delegate registration setup", assignee: "Dev Anand", due: "2026-06-18", priority: "med", stage: "in-progress" },
  { id: "tk-06", eventId: "evt-horizon-launch", title: "Brief live-stream crew", assignee: "Kabir Sethi", due: "2026-06-18", priority: "med", stage: "todo" },
  { id: "tk-07", eventId: "evt-kapoor-sangeet", title: "Source vintage tableware", assignee: "Meher Rao", due: "2026-06-24", priority: "med", stage: "todo" },
  { id: "tk-08", eventId: "evt-kapoor-sangeet", title: "Tasting with Saffron & Sage", assignee: "Priya Menon", due: "2026-06-21", priority: "low", stage: "todo" },
  { id: "tk-09", eventId: "evt-northstar-awards", title: "Awards script v2", assignee: "Dev Anand", due: "2026-06-28", priority: "med", stage: "in-progress" },
  { id: "tk-10", eventId: "evt-ishaan-birthday", title: "Balloon arch concept sign-off", assignee: "Meher Rao", due: "2026-06-30", priority: "low", stage: "done" },
  { id: "tk-11", eventId: "evt-aanya-vikram", title: "Welcome hamper assembly", assignee: "Priya Menon", due: "2026-06-15", priority: "med", stage: "done" },
  { id: "tk-12", eventId: "evt-horizon-launch", title: "Press wall final artwork", assignee: "Dev Anand", due: "2026-06-16", priority: "high", stage: "done" },
  { id: "tk-13", eventId: "evt-saira-dev-goa", title: "Resort room-block contract", assignee: "Jasmine Nair", due: "2026-07-02", priority: "med", stage: "todo" },
  { id: "tk-14", eventId: "evt-northstar-awards", title: "Seating plan draft", assignee: "Dev Anand", due: "2026-07-05", priority: "low", stage: "todo" },
];

export type RunOfShowItem = {
  time: string; // "HH:MM"
  duration: string; // human
  title: string;
  owner: string;
  type: "ceremony" | "vendor" | "catering" | "logistics" | "other";
};

/** Run-of-show for evt-aanya-vikram (the this-week wedding). */
export const runOfShow: RunOfShowItem[] = [
  { time: "06:30", duration: "90 min", title: "Vendor load-in & venue handover", owner: "Kabir Sethi", type: "logistics" },
  { time: "08:00", duration: "120 min", title: "Mandap & floral installation", owner: "Bloomwork Florals", type: "vendor" },
  { time: "10:30", duration: "45 min", title: "Bride & groom hair / makeup call", owner: "Glow by Tina", type: "vendor" },
  { time: "11:30", duration: "60 min", title: "Guest welcome & refreshments", owner: "Saffron & Sage", type: "catering" },
  { time: "12:30", duration: "30 min", title: "Baraat procession", owner: "Rhythm Dhol Collective", type: "ceremony" },
  { time: "13:00", duration: "90 min", title: "Pheras & ceremony", owner: "Jasmine Nair", type: "ceremony" },
  { time: "14:30", duration: "120 min", title: "Lunch service", owner: "Saffron & Sage", type: "catering" },
  { time: "16:30", duration: "60 min", title: "Couple portraits — lakeside", owner: "Stories by Aman", type: "vendor" },
  { time: "19:00", duration: "45 min", title: "Reception stage & lighting check", owner: "Tarit Lighting & AV", type: "logistics" },
  { time: "20:00", duration: "180 min", title: "Reception & dinner", owner: "Jasmine Nair", type: "ceremony" },
  { time: "23:30", duration: "60 min", title: "Vendor strike & wrap", owner: "Kabir Sethi", type: "logistics" },
];

/** Budget breakdown for the event detail view. */
export type BudgetLine = { category: string; allocated: number; spent: number };
export const budgetBreakdown: Record<string, BudgetLine[]> = {
  "evt-aanya-vikram": [
    { category: "Venue & stay", allocated: 1600000, spent: 1600000 },
    { category: "Catering", allocated: 1100000, spent: 980000 },
    { category: "Décor & florals", allocated: 850000, spent: 720000 },
    { category: "Photography & film", allocated: 450000, spent: 300000 },
    { category: "Entertainment & AV", allocated: 500000, spent: 410000 },
    { category: "Logistics & misc", allocated: 300000, spent: 180000 },
  ],
};

export type PipelineStage = { status: EventStatus; label: string; count: number; value: number };

export const pipeline: PipelineStage[] = (["lead", "booked", "planning", "this-week", "completed"] as EventStatus[]).map(
  (status) => {
    const matched = events.filter((e) => e.status === status);
    return {
      status,
      label:
        status === "this-week"
          ? "This Week"
          : status.charAt(0).toUpperCase() + status.slice(1),
      count: matched.length,
      value: matched.reduce((sum, e) => sum + e.budget, 0),
    };
  },
);

export const kpis = [
  { id: "kpi-events", label: "Active events", value: "8", delta: "+2 this month", trend: "up" as const },
  { id: "kpi-revenue", label: "Booked revenue", value: "₹3.4 Cr", delta: "+18% QoQ", trend: "up" as const },
  { id: "kpi-leads", label: "Open leads", value: "3", delta: "1 new this week", trend: "up" as const },
  { id: "kpi-tasks", label: "Tasks due (7d)", value: "9", delta: "3 high priority", trend: "flat" as const },
];

export const STATUS_LABEL: Record<EventStatus, string> = {
  lead: "Lead",
  booked: "Booked",
  planning: "Planning",
  "this-week": "This Week",
  completed: "Completed",
};

export type BadgeVariant = "neutral" | "gold" | "success" | "warning" | "danger" | "info" | "solid";

export const STATUS_VARIANT: Record<EventStatus, BadgeVariant> = {
  lead: "info",
  booked: "gold",
  planning: "warning",
  "this-week": "danger",
  completed: "neutral",
};

export const CLIENT_STATUS_VARIANT: Record<ClientStatus, BadgeVariant> = {
  lead: "info",
  active: "success",
  past: "neutral",
};

export const VENDOR_STATUS_VARIANT: Record<VendorStatus, BadgeVariant> = {
  confirmed: "success",
  pending: "warning",
  preferred: "gold",
};

export const PRIORITY_VARIANT: Record<TaskPriority, BadgeVariant> = {
  low: "neutral",
  med: "info",
  high: "danger",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  med: "Medium",
  high: "High",
};

export const VENDOR_CATEGORY_LABEL: Record<VendorCategory, string> = {
  catering: "Catering",
  decor: "Décor",
  photography: "Photography",
  venue: "Venue",
  entertainment: "Entertainment",
  makeup: "Hair & Makeup",
};

export const ROS_TYPE_VARIANT: Record<RunOfShowItem["type"], BadgeVariant> = {
  ceremony: "gold",
  vendor: "info",
  catering: "success",
  logistics: "warning",
  other: "neutral",
};

// Helpers ----------------------------------------------------------------

export function memberById(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function memberName(id: string): string {
  return memberById(id)?.name ?? "Unassigned";
}

export function eventById(id: string): InternalEvent | undefined {
  return events.find((e) => e.id === id);
}

export function tasksForEvent(id: string): Task[] {
  return tasks.filter((t) => t.eventId === id);
}

/** The "logged-in" coordinator for the scoped Team Access view. */
export const CURRENT_COORDINATOR_ID = "tm-priya";

/** Internal notes shown in the scoped team view. */
export type InternalNote = {
  id: string;
  eventId: string;
  author: string;
  when: string;
  body: string;
};

export const internalNotes: InternalNote[] = [
  { id: "nt-01", eventId: "evt-kapoor-sangeet", author: "Jasmine Nair", when: "2026-06-14T10:00:00", body: "Client prefers warm amber lighting over white — flag to Tarit before the walkthrough." },
  { id: "nt-02", eventId: "evt-kapoor-sangeet", author: "Meher Rao", when: "2026-06-13T16:20:00", body: "Vintage tableware sourced from two suppliers; need final count by 24 Jun." },
  { id: "nt-03", eventId: "evt-saira-dev-goa", author: "Jasmine Nair", when: "2026-06-12T19:30:00", body: "Resort holding 90 rooms till 2 Jul. Confirm guest numbers with Saira this week." },
  { id: "nt-04", eventId: "evt-saira-dev-goa", author: "Priya Menon", when: "2026-06-11T12:05:00", body: "Welcome dinner menu tasting scheduled for next visit. Veg-heavy spread requested." },
];
