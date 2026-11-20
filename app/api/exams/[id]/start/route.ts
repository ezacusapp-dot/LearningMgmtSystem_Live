// src/app/api/exams/[id]/start/route.ts
import { NextRequest } from "next/server";
import { startExamAttemptController } from "@/modules/exams/exams.controller";
import { getStudentIdFromToken } from "app/api/auth/student-auth"; // adjust the path if yours differs

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // on Next 14 params is a plain object; `await` still works
  const studentId = await getStudentIdFromToken(req);
  if (!studentId) {
    return Response.json({ status: false, message: "Please log in again" }, { status: 401 });
  }
  return startExamAttemptController(id, studentId);
}