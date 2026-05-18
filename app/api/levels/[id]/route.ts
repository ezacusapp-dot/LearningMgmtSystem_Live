// import {updateLevelController,deleteLevelController,} from "@/modules/levels/level.controller";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return updateLevelController(req, params.id);
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return deleteLevelController(params.id);
// }
import {
  updateLevelController,
  deleteLevelController,
} from "@/modules/levels/level.controller";

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ✅ FIX
  return updateLevelController(req, id);
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ✅ FIX
  return deleteLevelController(id);
}