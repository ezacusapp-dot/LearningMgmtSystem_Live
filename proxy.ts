import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/paseto";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🔐 Protect admin routes
  if (path.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const payload = await verifyToken(token);
      
      // ✅ Check for both ADMIN and SUPER_ADMIN
      const userRole = payload.role?.toUpperCase();
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🔐 Protect student routes
  if (path.startsWith("/student")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/student_login", req.url));
    }

    try {
      const payload = await verifyToken(token);
      
      if (payload.role?.toUpperCase() !== "STUDENT") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/student_login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};