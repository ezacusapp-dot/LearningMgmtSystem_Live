// import {updateCategoryController,deleteCategoryController,} from "@/modules/course-categories/course-category.controller";


// // UPDATE
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return updateCategoryController(req, params.id);
// }

// // DELETE
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return deleteCategoryController(params.id);
// }
// app/api/course-categories/[id]/route.ts
import { updateCategoryController, deleteCategoryController } from "@/modules/course-categories/course-category.controller";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateCategoryController(req, id);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteCategoryController(id);
}