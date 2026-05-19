import { NextRequest } from "next/server";
import { getCourseForEditController } from "@/modules/courses/courses.controller";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;

  return getCourseForEditController(courseId);
}