export function sanitizeText(value = '') {
  return String(value).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' }[char])).trim();
}
export function safeUrl(value = '') {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : '';
  } catch { return ''; }
}
export const rolePermissions = {
  Master: ['*'],
  Administrador: ['books:create', 'books:update', 'books:delete', 'taxonomy:manage', 'users:manage', 'analytics:view'],
  Editor: ['books:create', 'books:update', 'analytics:view'],
  Lector: ['catalog:read']
};
export function can(user, permission) {
  const permissions = rolePermissions[user?.role ?? 'Lector'] ?? [];
  return permissions.includes('*') || permissions.includes(permission);
}
