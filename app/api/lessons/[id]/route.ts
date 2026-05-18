import {
  getLessonByIdController,
  updateLessonController,
  deleteLessonController,
} from "@/modules/lessons/lessons.controller";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getLessonByIdController(id);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateLessonController(req, id);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteLessonController(id);
}