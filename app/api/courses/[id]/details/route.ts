import { NextRequest } from "next/server";
import { getCourseForEditController } from "@/modules/courses/courses.controller";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return getCourseForEditController(id);
}