// app/api/auth/login/route.ts (or app/api/school/login/route.ts)
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/paseto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check for SCHOOL_ADMIN
    const school = await prisma.school.findFirst({
      where: {
        adminEmail: email,
        role: "SCHOOL_ADMIN",
        active: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token with school admin data
    const token = await generateToken({
      id: school.id,
      schoolId: school.id,
      email: school.adminEmail,
      name: school.adminName,
      schoolName: school.name,
      role: "SCHOOL_ADMIN",
      type: "school_admin",
    });

    return NextResponse.json(
      {
        success: true,
        token,
        role: "SCHOOL_ADMIN",
        school: {
          id: school.id,
          name: school.name,
          adminName: school.adminName,
          adminEmail: school.adminEmail,
        },
        redirectTo: "/school/dashboard",
      },
      {
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`,
        },
      }
    );
  } catch (error) {
    console.error("School login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}