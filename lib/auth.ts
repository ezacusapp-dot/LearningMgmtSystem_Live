// lib/auth.ts
//
// Shared "who is this student" helper for API routes. Built on top of the
// existing lib/paseto.ts (V3.decrypt) — that file is NOT modified.
//
// Reads the token from either the Authorization header or the httpOnly
// cookie set at login (see app/api/auth/student-login/route.ts), verifies
// it, then confirms the student still exists in the DB before trusting it.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/paseto";

export interface SessionStudent {
  id: number;
  username: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
}

/**
 * Returns just the numeric student id, or null if unauthenticated/invalid.
 * Use this in routes that only need the id (most of them).
 */
export async function getStudentIdFromSession(req: NextRequest): Promise<number | null> {
  const student = await getStudentFromSession(req);
  return student ? student.id : null;
}

/**
 * Returns the full student record (id + name fields), or null.
 * Use this where you need the student's name, e.g. anything certificate-related.
 */
export async function getStudentFromSession(req: NextRequest): Promise<SessionStudent | null> {
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    token = req.cookies.get("token")?.value;
  }
  if (!token) return null;

  try {
    // V3.decrypt (from lib/paseto.ts) throws on expired/invalid/tampered
    // tokens rather than resolving to null — the catch below handles that.
    const payload = await verifyToken(token);
    if (!payload || payload.id === undefined || payload.id === null) return null;

    // payload.id round-trips as a number since Student.id is Int, but stay
    // defensive in case the token shape ever changes.
    const studentId =
      typeof payload.id === "number" ? payload.id : parseInt(String(payload.id), 10);
    if (Number.isNaN(studentId)) return null;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return null;

    return {
      id: student.id,
      username: student.username,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}