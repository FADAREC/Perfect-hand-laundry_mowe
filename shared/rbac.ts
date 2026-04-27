export const ROLE_LEVEL: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  customer: 1,
  guest: 0,
};

export function hasAccess(userRole: string, minRole: string) {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}
