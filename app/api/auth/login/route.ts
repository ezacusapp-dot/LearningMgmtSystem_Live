import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/paseto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = await generateToken({
      id: user.id,
      userId: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // ✅ Return success response
    return NextResponse.json(
      {
        success: true,
        token: token,
        role: user.role,
        email: user.email,
        name: user.name,
        id: user.id,
        message: "Login successful!"
      },
      {
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("LOGIN ERROR:", message, error);
    return NextResponse.json(
      { success: false, message: "Internal server error", detail: message },
      { status: 500 }
    );
  }
}