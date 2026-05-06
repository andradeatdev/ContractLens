import { NextRequest, NextResponse } from 'next/server';
import { logger } from './lib/logger';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;
  const traceId = logger.getTraceId();

  // Log Canônico do Proxy (Vercel Edge/Middleware)
  logger.info(`Request: ${request.method} ${pathname}`, {
    ip: request.ip,
    geo: request.geo,
  });

  // Passa o Trace ID para o Backend e outras rotas
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Trace-ID', traceId);

  // Rotas que requerem autenticação
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url, { headers: requestHeaders });
    }
  }

  // Rotas que não devem ser acessadas se já estiver logado
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url, { headers: requestHeaders });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
