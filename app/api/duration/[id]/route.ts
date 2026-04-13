import {updateDurationTypeController,deleteDurationTypeController,} from "@/modules/duration-type/durationType.controller";
export const dynamic = "force-dynamic";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateDurationTypeController(req, id);
}

export async function DELETE(
  req: Request,
   { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteDurationTypeController(id);
}
