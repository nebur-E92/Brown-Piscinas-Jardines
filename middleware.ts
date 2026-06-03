import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "./lib/panel/auth";

// ── helper: verifica el JWT del panel ─────────────────────────────────────────
async function isPanelAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = new TextEncoder().encode(process.env.PANEL_JWT_SECRET ?? "");
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ── Panel de gestión (/panel/* y /api/panel/*) ───────────────────────────
  const isPanelApi = pathname.startsWith("/api/panel") && !pathname.startsWith("/api/panel/auth");
  if (pathname.startsWith("/panel") || isPanelApi) {
    if (!(await isPanelAuthed(req))) {
      if (isPanelApi) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      const loginUrl = new URL("/panel-login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── QR Analytics (existente) ──────────────────────────────────────────────
  const isProtected =
    pathname.startsWith("/analitica-qr") ||
    pathname.startsWith("/api/qr/export") ||
    pathname.startsWith("/api/qr/reset");

  if (isProtected) {
    const token = process.env.QR_DASHBOARD_TOKEN;
    const basicUser = process.env.QR_BASIC_USER;
    const basicPass = process.env.QR_BASIC_PASS;

    if (token) {
      const q = searchParams.get("token");
      if (q === token) {
        const res = NextResponse.next();
        const secure = process.env.NODE_ENV === "production";
        res.cookies.set("qr_auth", token, {
          httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
        });
        return res;
      }
    }

    if (token) {
      const cookie = req.cookies.get("qr_auth")?.value;
      if (cookie === token) return NextResponse.next();
    }

    if (basicUser && basicPass) {
      const auth = req.headers.get("authorization") || "";
      if (auth.startsWith("Basic ")) {
        try {
          const b64 = auth.slice(6);
          const decoded =
            typeof atob === "function"
              ? atob(b64)
              : Buffer.from(b64, "base64").toString("utf8");
          const [user, pass] = decoded.split(":");
          if (user === basicUser && pass === basicPass) return NextResponse.next();
        } catch { /* ignore */ }
      }
      const res = new NextResponse("Authentication required", { status: 401 });
      res.headers.set("WWW-Authenticate", 'Basic realm="QR Analytics"');
      return res;
    }

    if (!token && !basicUser) {
      if (process.env.NODE_ENV === "production") return NextResponse.redirect(new URL("/", req.url));
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/api/panel/:path*",
    "/analitica-qr/:path*",
    "/api/qr/export",
    "/api/qr/reset",
  ],
};
