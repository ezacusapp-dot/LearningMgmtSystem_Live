import { NextRequest } from "next/server";
import {
  updateLessonController,
  deleteLessonController,
} from "@/modules/lessons/lessons.controller";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateLessonController(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteLessonController(id);
}