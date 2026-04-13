import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/paseto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // 👈 required for paseto + bcrypt + prisma

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = await generateToken({
     userId: String(user.id),
      role: user.role,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // return NextResponse.json({
    //   token,
    //   role: user.role,
    //   email: user.email,
    //   name: user.name,
    // });
    return NextResponse.json(
  {
    role: user.role,
    email: user.email,
    name: user.name,
    token
  },
  {
    headers: {
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict`,
    },
  }
);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("LOGIN ERROR:", message, error);
    return NextResponse.json(
      { message: "Internal server error", detail: message },
      { status: 500 }
    );
  }
}