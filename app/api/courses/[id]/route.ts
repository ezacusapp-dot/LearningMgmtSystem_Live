// import {updateCourseController,deleteCourseController,} from "@/modules/courses/courses.controller";


// // ✅ UPDATE
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return updateCourseController(req, params.id);
// }

// // ✅ DELETE
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return deleteCourseController(params.id);
// }
// // app/api/courses/[id]/route.ts
// import { updateCourseController, deleteCourseController } from "@/modules/courses/courses.controller";

// export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   return updateCourseController(req, id);
// }

// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   return deleteCourseController(id);
// }
import {
  getCourseForEditController,
  updateCourseController,
  deleteCourseController,
} from "@/modules/courses/courses.controller";

/** GET /api/courses/[id]  — full nested data for edit page */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getCourseForEditController(id);
}

/** PUT /api/courses/[id]  — full replacement (modules + grades) */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateCourseController(req, id);
}

/** DELETE /api/courses/[id] */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteCourseController(id);
}