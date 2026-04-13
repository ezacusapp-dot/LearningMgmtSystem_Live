// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "./lib/paseto";

// export async function proxy(req: NextRequest) {
//   // Only protect specific routes
//   if (!req.nextUrl.pathname.startsWith("/api/protected/")) {
//     return NextResponse.next();
//   }

//   const authHeader = req.headers.get("authorization");

//   if (!authHeader) {
//     return NextResponse.json(
//       { message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     await verifyToken(token);
//     return NextResponse.next();
//   } catch (err) {
//     return NextResponse.json(
//       { message: "Invalid token" },
//       { status: 401 }
//     );
//   }
// }

// // ✅ VERY IMPORTANT (Route matching)
// export const config = {
//   matcher: ["/api/protected/:path*"],
// };
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/paseto";

//export const runtime = "nodejs"; 

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🔐 Protect admin routes
  if (path.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await verifyToken(token);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// ✅ Route matcher
export const config = {
  matcher: ["/admin/:path*"],
};