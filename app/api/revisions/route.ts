// ============================================================
// app/api/revisions/[id]/route.ts
// ============================================================

import {
  getRevisionByIdController,
  updateRevisionController,
  deleteRevisionController,
} from "@/modules/revisions/revisions.controller";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getRevisionByIdController(id);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateRevisionController(req, id);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteRevisionController(id);
}