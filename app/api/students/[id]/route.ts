import { NextRequest } from "next/server";

import {
  updateStudentController,
  deleteStudentController,
} from "@/modules/students/students.controller";

// ✅ PUT
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("PUT ID:", id);

  return updateStudentController(req, id);
}

// ✅ DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("DELETE ID:", id);

  return deleteStudentController(id);
}