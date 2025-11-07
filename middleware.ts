import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login'];

// Mapeo de roles a sus rutas permitidas
const roleRoutes = {
  SUPER_ADMIN: ['/super-admin'],
  TECNICO: ['/tecnico'],
  ADMIN_TALLER: ['/taller'],
};

// Redirecciones por defecto según rol
const roleDefaultRoutes = {
  SUPER_ADMIN: '/super-admin',
  TECNICO: '/tecnico',
  ADMIN_TALLER: '/taller',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a archivos estáticos y APIs de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Permitir acceso a rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Obtener usuario del localStorage (simulación en cookie)
  const currentUserCookie = request.cookies.get('currentUser');

  // Si no hay usuario, verificar si hay datos en el header (desde el cliente)
  let user = null;
  if (currentUserCookie) {
    try {
      user = JSON.parse(currentUserCookie.value);
    } catch (e) {
      // Cookie inválida
    }
  }

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    // Excepción: la ruta raíz "/" redirige a login
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Para otras rutas protegidas, redirigir a login
    if (pathname !== '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Si el usuario está autenticado y accede a login, redirigir a su dashboard
  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = roleDefaultRoutes[user.role as keyof typeof roleDefaultRoutes] || '/';
    return NextResponse.redirect(url);
  }

  // Verificar si el usuario tiene acceso a la ruta basándose en su rol
  const userRole = user.role as keyof typeof roleRoutes;
  const allowedRoutes = roleRoutes[userRole] || [];

  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

  // Si no tiene acceso, redirigir a su dashboard
  if (!hasAccess && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = roleDefaultRoutes[userRole] || '/login';
    return NextResponse.redirect(url);
  }

  // Redirigir la ruta raíz al dashboard apropiado
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = roleDefaultRoutes[userRole] || '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurar qué rutas debe proteger el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
