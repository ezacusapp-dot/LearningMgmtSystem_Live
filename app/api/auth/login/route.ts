// import { prisma } from "@/lib/prisma";
// import { generateToken } from "@/lib/paseto";
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return NextResponse.json(
//         { success: false, message: "Invalid password" },
//         { status: 401 }
//       );
//     }

//     const token = await generateToken({
//       id: user.id,
//       userId: String(user.id),
//       email: user.email,
//       name: user.name,
//       role: user.role,
//     });

//     await prisma.session.create({
//       data: {
//         userId: user.id,
//         token,
//         expiresAt: new Date(Date.now() + 60 * 60 * 1000),
//       },
//     });

//     // ✅ Return success response
//     return NextResponse.json(
//       {
//         success: true,
//         token: token,
//         role: user.role,
//         email: user.email,
//         name: user.name,
//         id: user.id,
//         message: "Login successful!"
//       },
//       {
//         headers: {
//           "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`,
//         },
//       }
//     );
//   } catch (error) {
//     const message = error instanceof Error ? error.message : String(error);
//     console.error("LOGIN ERROR:", message, error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error", detail: message },
//       { status: 500 }
//     );
//   }
// }
// app/api/auth/login/route.ts
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/paseto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Email and password are required" 
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({
      id: user.id,
      userId: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        token: token,
        role: user.role,
        email: user.email,
        name: user.name,
        id: user.id,
        message: "Login successful!"
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}