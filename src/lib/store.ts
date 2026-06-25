import "server-only";
import { readDoc, writeDoc } from "@/lib/storage";
import { hashPassword, verifyPassword } from "@/lib/team-accounts";
import {
  events as seedEvents,
  clients as seedClients,
  vendors as seedVendors,
  tasks as seedTasks,
  leads as seedLeads,
  type InternalEvent,
  type Lead,
  type Task,
} from "@/lib/internal-data";

export type { Lead, Task };

export async function listTasks(): Promise<Task[]> {
  return readCollection<Task>("tasks", seedTasks);
}

export async function listTasksForEvent(eventId: string): Promise<Task[]> {
  const all = await listTasks();
  return all.filter((t) => t.eventId === eventId);
}

/**
 * Persistence is delegated to the storage adapter (src/lib/storage.ts): KV in
 * production (Vercel's filesystem is read-only), local `.data/<name>.json` files
 * in dev. Each collection is one JSON document; the seed is returned (not
 * persisted) until the first write.
 */
async function readCollection<T>(name: string, seed: T[]): Promise<T[]> {
  return readDoc<T[]>(name, seed);
}

async function writeCollection<T>(name: string, data: T[]): Promise<void> {
  return writeDoc<T[]>(name, data);
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(performance.now() % 1000)}`;
}

// ── Events ──────────────────────────────────────────────
export async function listEvents(): Promise<InternalEvent[]> {
  // Seeds the file from `seedEvents` on first read only. We deliberately do NOT
  // re-merge missing seeds on every call — that would resurrect events the admin
  // has deleted (deleteEvent has no tombstone). A freshly seeded store already
  // contains the full seed set.
  return readCollection<InternalEvent>("events", seedEvents);
}

export async function createEvent(data: Omit<InternalEvent, "id">): Promise<InternalEvent> {
  const all = await listEvents();
  const event: InternalEvent = { ...data, id: newId("evt") };
  all.unshift(event);
  await writeCollection("events", all);
  return event;
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<InternalEvent, "id">>,
): Promise<InternalEvent | null> {
  const all = await listEvents();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, id };
  await writeCollection("events", all);
  return all[idx];
}

export async function deleteEvent(id: string): Promise<boolean> {
  const all = await listEvents();
  const next = all.filter((e) => e.id !== id);
  if (next.length === all.length) return false;
  await writeCollection("events", next);
  return true;
}

// ── Leads ────────────────────────────────────────────────────
export async function listLeads(): Promise<Lead[]> {
  return readCollection<Lead>("leads", seedLeads);
}

export async function createLead(data: Omit<Lead, "id">): Promise<Lead> {
  const all = await listLeads();
  const lead: Lead = { ...data, id: newId("ld") };
  all.unshift(lead);
  await writeCollection("leads", all);
  return lead;
}

export async function updateLead(
  id: string,
  patch: Partial<Omit<Lead, "id">>,
): Promise<Lead | null> {
  const all = await listLeads();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, id };
  await writeCollection("leads", all);
  return all[idx];
}

export async function deleteLead(id: string): Promise<boolean> {
  const all = await listLeads();
  const next = all.filter((l) => l.id !== id);
  if (next.length === all.length) return false;
  await writeCollection("leads", next);
  return true;
}

// ── Client assignments (lead → client promotion) ─────────────
export type ClientAssignment = {
  email: string;       // primary key — the client's login email
  name: string;
  phone?: string;
  eventName: string;   // e.g. "Priya's Wedding"
  eventType: string;
  eventDate: string;   // ISO date
  venue: string;
  location: string;
  guestCount?: string;
  budget?: string;
  assignedTeam?: string[];  // teamMember ids
  assignedAt: string;  // ISO datetime when admin promoted
  portalStatus?: "booked" | "planning" | "this-week" | "completed";
  // True for the starter assignment auto-created on sign-up, BEFORE the client has
  // actually booked a consultation and an admin has set up their real event. The
  // portal shows a "book a consultation" prompt (not placeholder event details)
  // until this is cleared by an admin setting up the real booking.
  placeholder?: boolean;
  // Optional admin-set password so a client can sign in at /login without Google
  // or email verification. Salted scrypt hash; never returned to the client.
  passwordHash?: string;
};

/** Whether the client has actually booked a consultation / had a real event set
 *  up by an admin (vs. the auto-provisioned starter shown to brand-new sign-ups). */
export function isConsultationBooked(a: ClientAssignment | null | undefined): boolean {
  return !!a && a.placeholder !== true;
}

export async function listClientAssignments(): Promise<ClientAssignment[]> {
  return readCollection<ClientAssignment>("client-assignments", []);
}

export async function getClientAssignment(email: string): Promise<ClientAssignment | null> {
  const all = await listClientAssignments();
  return all.find((c) => c.email.toLowerCase() === email.toLowerCase()) ?? null;
}

/**
 * Map a promoted portal client into the InternalEvent shape the internal UI
 * renders. Portal clients ARE real events (they carry a date, venue, status and
 * an assignedTeam), so every internal surface that lists or resolves events
 * should fold them in via this helper — keeping the id prefix (`portal-`) so it
 * never collides with a stored event id, and preserving assignedTeam so team
 * scoping works.
 */
export function clientAssignmentToEvent(a: ClientAssignment): InternalEvent {
  return {
    id: `portal-${a.email}`,
    client: a.name,
    type: a.eventType,
    date: a.eventDate,
    status: a.portalStatus ?? "booked",
    assignedTeam: a.assignedTeam ?? [],
    budget: 0,
    location: `${a.venue}, ${a.location}`,
    coverSeed: a.eventName,
    guests: Number(a.guestCount) || 0,
  };
}

export async function setClientAssignment(data: ClientAssignment): Promise<ClientAssignment> {
  const all = await listClientAssignments();
  const idx = all.findIndex((c) => c.email.toLowerCase() === data.email.toLowerCase());
  if (idx >= 0) all[idx] = data;
  else all.unshift(data);
  await writeCollection("client-assignments", all);
  return data;
}

export async function deleteClientAssignment(email: string): Promise<boolean> {
  const all = await listClientAssignments();
  const next = all.filter((c) => c.email.toLowerCase() !== email.toLowerCase());
  if (next.length === all.length) return false;
  await writeCollection("client-assignments", next);
  return true;
}

/** Set (or clear) an admin-issued password for a client so they can sign in
 *  with email + password — no Google or email verification needed. */
export async function setClientPassword(email: string, password: string): Promise<boolean> {
  const all = await listClientAssignments();
  const idx = all.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());
  if (idx < 0) return false;
  all[idx] = { ...all[idx], passwordHash: hashPassword(password) };
  await writeCollection("client-assignments", all);
  return true;
}

/** Returns the assignment if the email+password match the admin-set password. */
export async function verifyClientPassword(
  email: string,
  password: string,
): Promise<ClientAssignment | null> {
  const a = await getClientAssignment(email);
  if (!a || !a.passwordHash) return null;
  return verifyPassword(password, a.passwordHash) ? a : null;
}

// ── Client Portal Data (milestones, budget, messages) ────────

export type MilestoneStatus = "done" | "in-progress" | "pending" | "action-needed";

export type ClientMilestone = {
  id: string;
  title: string;
  description: string;
  due: string;
  status: MilestoneStatus;
  owner: "You" | "Jasminetals";
};

export type ClientBudgetLine = {
  category: string;
  allocated: number;
  spent: number;
  status: "paid" | "partial" | "due";
};

export type ClientPortalMessage = {
  id: string;
  from: "you" | "team";
  author: string;
  time: string;
  text: string;
};

export type ClientDocument = {
  id: string;
  name: string;
  type: "contract" | "invoice" | "other";
  size: string;
  date: string;       // ISO date
  filename: string;     // local-fs name (dev): .data/uploads/{filename}
  storagePath?: string; // Firebase Storage object path (prod) — fetched server-side behind auth
  mimeType: string;
};

export type ClientPortalData = {
  email: string;
  milestones: ClientMilestone[];
  budget: { total: number; lines: ClientBudgetLine[] };
  messages: ClientPortalMessage[];
  documents: ClientDocument[];
};

function parseBudgetToRupees(s: string): number {
  if (!s) return 0;
  const nums = (s.match(/[\d.]+/g) ?? []).map(Number);
  if (!nums.length) return 0;
  const isCr = /[Cc][Rr]/.test(s);
  const multiplier = isCr ? 10_000_000 : 100_000;
  const value = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  return Math.round(value * multiplier);
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

export function seedClientPortalData(assignment: ClientAssignment): ClientPortalData {
  const today = new Date();
  const eventDate = new Date(assignment.eventDate);
  const totalDays = Math.max(7, (eventDate.getTime() - today.getTime()) / 86_400_000);

  function at(frac: number) { return addDays(today, totalDays * frac); }

  const isWedding = /wedding|marriage|nikah|shaadi/i.test(assignment.eventType);
  const isCorp = /corporate|conference|gala|launch|seminar/i.test(assignment.eventType);

  const milestones: ClientMilestone[] = [
    {
      id: "m1",
      title: "Consultation & agreement",
      description: "Planning brief, service agreement and scope confirmed with Jasminetals.",
      due: today.toISOString().slice(0, 10),
      status: "done",
      owner: "You",
    },
    {
      id: "m2",
      title: isWedding ? "Theme & décor concept" : "Event concept & design brief",
      description: isWedding
        ? "Colour palette, décor direction and overall wedding vision approved."
        : "Event theme, visual concept and guest experience flow locked.",
      due: at(0.15),
      status: totalDays > 21 ? "in-progress" : "done",
      owner: "Jasminetals",
    },
    {
      id: "m3",
      title: isCorp ? "Venue & AV booking" : "Vendor confirmation",
      description: isCorp
        ? "Venue, AV, catering and crew bookings confirmed."
        : "Caterer, decorator, photographer and entertainment confirmed.",
      due: at(0.3),
      status: "pending",
      owner: "Jasminetals",
    },
    {
      id: "m4",
      title: "Guest list & invitations",
      description: "Final guest count confirmed and invitations sent.",
      due: at(0.5),
      status: "pending",
      owner: "You",
    },
    {
      id: "m5",
      title: "Pre-event walkthrough",
      description: "On-site run-of-show review and final vendor briefing.",
      due: at(0.85),
      status: "pending",
      owner: "Jasminetals",
    },
    {
      id: "m6",
      title: `${assignment.eventType} — event day`,
      description: "Your event. We handle every detail on the day.",
      due: assignment.eventDate,
      status: "pending",
      owner: "Jasminetals",
    },
  ];

  const budgetTotal = parseBudgetToRupees(assignment.budget ?? "");
  const lines: ClientBudgetLine[] = budgetTotal > 0
    ? isWedding
      ? [
          { category: "Venue & accommodation", allocated: Math.round(budgetTotal * 0.30), spent: 0, status: "due" },
          { category: "Catering & bar", allocated: Math.round(budgetTotal * 0.20), spent: 0, status: "due" },
          { category: "Décor & florals", allocated: Math.round(budgetTotal * 0.15), spent: 0, status: "due" },
          { category: "Photography & film", allocated: Math.round(budgetTotal * 0.10), spent: 0, status: "due" },
          { category: "Entertainment & music", allocated: Math.round(budgetTotal * 0.08), spent: 0, status: "due" },
          { category: "Invitations & stationery", allocated: Math.round(budgetTotal * 0.04), spent: 0, status: "due" },
          { category: "Jasminetals planning fee", allocated: Math.round(budgetTotal * 0.08), spent: 0, status: "due" },
          { category: "Miscellaneous", allocated: Math.round(budgetTotal * 0.05), spent: 0, status: "due" },
        ]
      : [
          { category: "Venue & setup", allocated: Math.round(budgetTotal * 0.35), spent: 0, status: "due" },
          { category: "Catering", allocated: Math.round(budgetTotal * 0.25), spent: 0, status: "due" },
          { category: "Decoration", allocated: Math.round(budgetTotal * 0.18), spent: 0, status: "due" },
          { category: "Photography & video", allocated: Math.round(budgetTotal * 0.10), spent: 0, status: "due" },
          { category: "Jasminetals planning fee", allocated: Math.round(budgetTotal * 0.07), spent: 0, status: "due" },
          { category: "Miscellaneous", allocated: Math.round(budgetTotal * 0.05), spent: 0, status: "due" },
        ]
    : [];

  const messages: ClientPortalMessage[] = [
    {
      id: "welcome-1",
      from: "team",
      author: "Jasminetals Team",
      time: assignment.assignedAt,
      text: `Welcome to your event portal, ${assignment.name.split(" ")[0]}! We're thrilled to be planning your ${assignment.eventType} — ${assignment.eventName}. This is your space to track every milestone, review the budget and stay in touch with us. We'll share updates, tasks and documents here as we go. Let's make it unforgettable! ✨`,
    },
  ];

  return { email: assignment.email, milestones, budget: { total: budgetTotal, lines }, messages, documents: [] };
}

export async function listClientPortalDataAll(): Promise<ClientPortalData[]> {
  return readCollection<ClientPortalData>("client-portal", []);
}

export async function getClientPortalData(email: string): Promise<ClientPortalData | null> {
  const all = await readCollection<ClientPortalData>("client-portal", []);
  return all.find((d) => d.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function setClientPortalData(data: ClientPortalData): Promise<ClientPortalData> {
  const all = await readCollection<ClientPortalData>("client-portal", []);
  const idx = all.findIndex((d) => d.email.toLowerCase() === data.email.toLowerCase());
  if (idx >= 0) all[idx] = data;
  else all.unshift(data);
  await writeCollection("client-portal", all);
  return data;
}

export async function addClientDocument(
  email: string,
  doc: ClientDocument,
): Promise<ClientPortalData | null> {
  const all = await readCollection<ClientPortalData>("client-portal", []);
  const idx = all.findIndex((d) => d.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  all[idx] = { ...all[idx], documents: [doc, ...(all[idx].documents ?? [])] };
  await writeCollection("client-portal", all);
  return all[idx];
}

// ── Generic collections (clients / vendors / tasks) ─────────
type Row = { id: string } & Record<string, unknown>;

const SEEDS: Record<string, Row[]> = {
  clients: seedClients as unknown as Row[],
  vendors: seedVendors as unknown as Row[],
  tasks: seedTasks as unknown as Row[],
};
const ID_PREFIX: Record<string, string> = { clients: "cl", vendors: "vn", tasks: "tk" };

export function isCollection(name: string): boolean {
  return name in SEEDS;
}

export async function listCollection(name: string): Promise<Row[]> {
  return readCollection<Row>(name, SEEDS[name] ?? []);
}

export async function createInCollection(name: string, data: Record<string, unknown>): Promise<Row> {
  const all = await listCollection(name);
  const item: Row = { ...data, id: newId(ID_PREFIX[name] ?? name) };
  all.unshift(item);
  await writeCollection(name, all);
  return item;
}

export async function updateInCollection(
  name: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<Row | null> {
  const all = await listCollection(name);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const { id: _ignore, ...rest } = patch;
  void _ignore;
  all[idx] = { ...all[idx], ...rest, id };
  await writeCollection(name, all);
  return all[idx];
}

export async function deleteFromCollection(name: string, id: string): Promise<boolean> {
  const all = await listCollection(name);
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return false;
  await writeCollection(name, next);
  return true;
}

// ── Settings (single object) ───────────────────────────────
export type StudioSettings = {
  profile: {
    studioName: string;
    contactEmail: string;
    phone: string;
    gstin: string;
    city: string;
    region: string;
    about: string;
  };
  branding: { accent: string; font: string; logoName: string; logo: string };
  notifications: Record<string, boolean>;
};

export const DEFAULT_SETTINGS: StudioSettings = {
  profile: {
    studioName: "Jasminetals",
    contactEmail: "hello@jasminetalsevents.in",
    phone: "+91 11 4055 7700",
    gstin: "07AABCA1234F1Z5",
    city: "New Delhi",
    region: "ncr",
    about:
      "Full-service event planning studio crafting weddings, corporate gatherings and milestone celebrations across Delhi NCR.",
  },
  branding: { accent: "#B08D57", font: "playfair", logoName: "jasminetals-logo.svg", logo: "" },
  notifications: {
    newLeads: true,
    taskAssignments: true,
    vendorStatus: true,
    budgetOverruns: false,
    weeklyDigest: true,
  },
};

export async function getSettings(): Promise<StudioSettings> {
  const saved = await readDoc<Partial<StudioSettings>>("settings", {});
  return {
    profile: { ...DEFAULT_SETTINGS.profile, ...saved.profile },
    branding: { ...DEFAULT_SETTINGS.branding, ...saved.branding },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...saved.notifications },
  };
}

export async function saveSettings(patch: Partial<StudioSettings>): Promise<StudioSettings> {
  const cur = await getSettings();
  const next: StudioSettings = {
    profile: { ...cur.profile, ...patch.profile },
    branding: { ...cur.branding, ...patch.branding },
    notifications: { ...cur.notifications, ...patch.notifications },
  };
  await writeDoc("settings", next);
  return next;
}
