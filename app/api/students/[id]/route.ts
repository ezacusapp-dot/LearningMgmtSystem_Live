// import {
//   updateStudentController,
//   deleteStudentController,
// } from "@/modules/students/students.controller";

// // ✅ PUT
// export async function PUT(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params; // ✅ FIX

//   console.log("PUT ID:", id);

//   return updateStudentController(req, id);
// }

// // ✅ DELETE
// export async function DELETE(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params; // ✅ FIX

//   console.log("DELETE ID:", id);

//   return deleteStudentController(id);
// }
import { NextRequest } from "next/server";
import {
  updateStudentController,
  deleteStudentController,
} from "@/modules/students/students.controller";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateStudentController(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteStudentController(req, id);
}