// app/api/courses/[courseId]/details/route.ts

import { getCourseForEditController } from "@/modules/courses/courses.controller";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  return getCourseForEditController(courseId);
  // Returns: course + grades[] + modules[] with lessons, revision/contents,
  //          quiz/questions/options — all nested, ordered by `order` field
}