import { defineMiddleware } from 'astro:middleware';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const exp = payload.exp as number | undefined;
  if (exp && Date.now() / 1000 > exp) return false;
  return true;
}

function hasAdminRole(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const roles = payload.roles as Array<{ name: string; type: string }> | undefined;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r.type === 'admin' || r.name === 'admin');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;

  // Public routes — always pass through
  const publicPaths = [
    '/admin/login',
    '/login',
    '/registro',
    '/recuperar-contrasena',
    '/verify-email',
    '/reset-password',
    '/',
  ];
  const publicPrefixes = [
    '/profesionales',
    '/landings',
    '/rubros',
    '/about',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/ayuda',
    '/membresia',
    '/como-funciona',
    '/_astro',
    '/favicon',
    '/uploads',
    '/assets',
  ];

  if (
    publicPaths.includes(pathname) ||
    publicPrefixes.some((p) => pathname.startsWith(p)) ||
    pathname.includes('.')
  ) {
    return next();
  }

  const token = context.cookies.get('trama_token')?.value;

  // Protect /admin/* (except /admin/login already in publicPaths)
  if (pathname.startsWith('/admin')) {
    if (!isTokenValid(token) || !hasAdminRole(token!)) {
      return context.redirect('/admin/login');
    }
    return next();
  }

  // Protect /dashboard/*
  if (pathname.startsWith('/dashboard')) {
    if (!isTokenValid(token)) {
      return context.redirect('/login');
    }
    return next();
  }

  return next();
});
