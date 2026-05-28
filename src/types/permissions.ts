export type Role = "owner" | "admin" | "editor" | "viewer" | "guest";

export type ResourceType =
  | "project"
  | "team"
  | "analytics"
  | "settings"
  | "billing"
  | "members";

export type Action = "create" | "read" | "update" | "delete" | "manage";

export interface Permission {
  resource: ResourceType;
  actions: Action[];
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    { resource: "project", actions: ["create", "read", "update", "delete", "manage"] },
    { resource: "team", actions: ["create", "read", "update", "delete", "manage"] },
    { resource: "analytics", actions: ["read", "manage"] },
    { resource: "settings", actions: ["read", "update", "manage"] },
    { resource: "billing", actions: ["read", "update", "manage"] },
    { resource: "members", actions: ["create", "read", "update", "delete", "manage"] },
  ],
  admin: [
    { resource: "project", actions: ["create", "read", "update", "delete"] },
    { resource: "team", actions: ["create", "read", "update"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "settings", actions: ["read", "update"] },
    { resource: "billing", actions: ["read"] },
    { resource: "members", actions: ["create", "read", "update"] },
  ],
  editor: [
    { resource: "project", actions: ["create", "read", "update"] },
    { resource: "team", actions: ["read"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "settings", actions: ["read"] },
    { resource: "billing", actions: [] },
    { resource: "members", actions: ["read"] },
  ],
  viewer: [
    { resource: "project", actions: ["read"] },
    { resource: "team", actions: ["read"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "settings", actions: ["read"] },
    { resource: "billing", actions: [] },
    { resource: "members", actions: ["read"] },
  ],
  guest: [
    { resource: "project", actions: ["read"] },
    { resource: "team", actions: [] },
    { resource: "analytics", actions: [] },
    { resource: "settings", actions: [] },
    { resource: "billing", actions: [] },
    { resource: "members", actions: [] },
  ],
};

export function hasPermission(
  role: Role,
  resource: ResourceType,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  const resourcePerm = permissions.find((p) => p.resource === resource);
  return resourcePerm?.actions.includes(action) ?? false;
}

export function canAccess(role: Role, resource: ResourceType): boolean {
  return hasPermission(role, resource, "read");
}
