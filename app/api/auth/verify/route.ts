// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/paseto";
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ✅ Safe here — API routes support Node.js

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    await verifyToken(token);
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}