import {
  getSchoolByIdController,
  updateSchoolController,
  deleteSchoolController,
} from "@/modules/school/school.controller";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getSchoolByIdController(id);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateSchoolController(req, id);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteSchoolController(id);
}