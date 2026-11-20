// src/app/api/exams/[id]/attempts/[attemptId]/submit/route.ts
import { NextRequest } from "next/server";
import { submitExamAttemptController } from "@/modules/exams/exams.controller";
import { getStudentIdFromToken } from "app/api/auth/student-auth"; // adjust the path if yours differs

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const { attemptId } = await params;
  const studentId = await getStudentIdFromToken(req);
  if (!studentId) {
    return Response.json({ status: false, message: "Please log in again" }, { status: 401 });
  }
  return submitExamAttemptController(req, attemptId, studentId);
}