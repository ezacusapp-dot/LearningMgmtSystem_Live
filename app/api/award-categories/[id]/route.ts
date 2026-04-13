import {updateAwardCategoryController,deleteAwardCategoryController,} from "@/modules/award-category/awardCategory.controller";
export const dynamic = "force-dynamic";
// UPDATE
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return updateAwardCategoryController(req, params.id);
// }

// // DELETE
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return deleteAwardCategoryController(params.id);
// }
// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ✅ FIX
  return updateAwardCategoryController(req, id);
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ✅ FIX
  return deleteAwardCategoryController(id);
}