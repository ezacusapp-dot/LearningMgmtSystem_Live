import { NextRequest } from "next/server";
import {
  getExamByIdController,
  updateExamController,
  deleteExamController,
} from "modules/exams/exams.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← Await params
  return getExamByIdController(id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← Await params
  return updateExamController(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← Await params
  return deleteExamController(id);
}