import {
  updateGradeController,
  deleteGradeController,
} from "@/modules/grade/grade.controller";

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ✅ important
  return updateGradeController(req, id);
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ✅ important
  return deleteGradeController(id);
}