import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/paseto";

const allowedOrigins = [
  "https://learning-mgmt-system-alpha.vercel.app",
  "http://localhost:3000",
];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const origin = req.headers.get("origin") || "";

  const isAllowedOrigin =
    allowedOrigins.includes(origin);

  // ✅ Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...(isAllowedOrigin && {
          "Access-Control-Allow-Origin": origin,
        }),

        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, OPTIONS",

        "Access-Control-Allow-Headers":
          "Content-Type, Authorization",

        "Access-Control-Allow-Credentials":
          "true",
      },
    });
  }

  // 🔐 Protect admin routes
  if (path.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    try {
      const payload = (await verifyToken(token)) as {
  role?: string;
};

const userRole = payload.role?.toUpperCase();

      if (
        userRole !== "ADMIN" &&
        userRole !== "SUPER_ADMIN"
      ) {
        return NextResponse.redirect(
          new URL("/unauthorized", req.url)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }
  }

  // 🔐 Protect student routes
  if (path.startsWith("/student")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/student_login", req.url)
      );
    }

    try {
     const payload = (await verifyToken(token)) as {
  role?: string;
};

if (payload.role?.toUpperCase() !== "STUDENT") {
        return NextResponse.redirect(
          new URL("/unauthorized", req.url)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL("/student_login", req.url)
      );
    }
  }

  // ✅ Continue request
  const response = NextResponse.next();

  // ✅ Add CORS headers
  if (isAllowedOrigin) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  response.headers.set(
    "Access-Control-Allow-Credentials",
    "true"
  );

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/student/:path*",
  ],
};
