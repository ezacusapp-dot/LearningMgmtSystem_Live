// app/api/exams/[id]/assign-course/route.ts
import { NextRequest } from "next/server";
import {
  assignCourseController,
  unassignCourseController,
} from "modules/exams/exams.controller";



export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← Await params
  return assignCourseController(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← Await params
  return unassignCourseController(req, id);
}