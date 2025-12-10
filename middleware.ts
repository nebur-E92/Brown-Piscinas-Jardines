import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.startsWith('/analitica-qr')) {
    const token = process.env.QR_DASHBOARD_TOKEN;
    const basicUser = process.env.QR_BASIC_USER;
    const basicPass = process.env.QR_BASIC_PASS;

    // 1) Cookie existente
    if (token) {
      const cookie = req.cookies.get('qr_auth')?.value;
      if (cookie === token) {
        return NextResponse.next();
      }
    }

    // 2) Token en query -> setear cookie
    if (token) {
      const q = searchParams.get('token');
      if (q === token) {
        const res = NextResponse.next();
        const secure = process.env.NODE_ENV === 'production';
        // secure solo en prod para que funcione en dev/local
        res.cookies.set('qr_auth', token, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
        return res;
      }
    }

    // 3) HTTP Basic Auth
    if (basicUser && basicPass) {
      const auth = req.headers.get('authorization') || '';
      if (auth.startsWith('Basic ')) {
        try {
          const b64 = auth.slice(6);
          // atob está disponible en el runtime Edge; usa Buffer solo como respaldo en dev
          const decoded = typeof atob === 'function'
            ? atob(b64)
            : typeof Buffer !== 'undefined'
              ? Buffer.from(b64, 'base64').toString('utf8')
              : '';
          const [user, pass] = decoded.split(':');
          if (user === basicUser && pass === basicPass) {
            return NextResponse.next();
          }
        } catch {
          // ignore parse errors
        }
      }
      // Si no hay Basic válido, pedir credenciales
      const res = new NextResponse('Authentication required', { status: 401 });
      res.headers.set('WWW-Authenticate', 'Basic realm="QR Analytics"');
      return res;
    }

    // Si no hay token ni Basic configurado
    if (!token && !basicUser) {
      if (process.env.NODE_ENV === 'production') return NextResponse.redirect(new URL('/', req.url));
      return NextResponse.next();
    }

    // Sin autorización: redirige a home
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/analitica-qr/:path*', '/api/qr/export', '/api/qr/reset'],
};
