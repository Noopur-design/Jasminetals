/* ============================================================
   Role-based access control (RBAC) — the permission model shared by the
   client UI, server guards and Firebase Auth claims. Roles: admin (owner, full access),
   team (sub-user, only what the admin grants), client (public/portal only).
   ============================================================ */

// Grantable modules for team sub-users. NOTE: "team" is intentionally NOT here —
// managing team members (and their permissions) is reserved for the owner-admin
// and can never be delegated to a sub-user. So no sub-user can ever change
// another sub-user.
export const MODULES = [
  "events",
  "clients",
  "vendors",
  "tasks",
  "calendar",
] as const;
export type Module = (typeof MODULES)[number];

export const ACTIONS = ["view", "create", "edit", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

export type Permissions = Partial<Record<Module, Partial<Record<Action, boolean>>>>;

export const MODULE_LABELS: Record<Module, string> = {
  events: "Events",
  clients: "Clients",
  vendors: "Vendors",
  tasks: "Tasks",
  calendar: "Calendar",
};

/** Admins implicitly have everything; team members are checked per grant. */
export function can(
  role: "lead" | "client" | "team" | "admin" | undefined,
  perms: Permissions | undefined,
  module: Module,
  action: Action,
): boolean {
  if (role === "admin") return true;
  if (role !== "team") return false;
  return Boolean(perms?.[module]?.[action]);
}

export const NO_PERMISSIONS: Permissions = {};

export const FULL_PERMISSIONS: Permissions = Object.fromEntries(
  MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, true]))]),
) as Permissions;

/** A sensible default grant for a new team member: view-only across modules. */
export const VIEWER_PERMISSIONS: Permissions = Object.fromEntries(
  MODULES.map((m) => [m, { view: true }]),
) as Permissions;
