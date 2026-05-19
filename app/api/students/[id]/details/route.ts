// app/api/courses/[courseId]/details/route.ts

import { getCourseForEditController } from "@/modules/courses/courses.controller";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getCourseForEditController(id);
  // Returns: course + grades[] + modules[] with lessons, revision/contents,
  //          quiz/questions/options — all nested, ordered by `order` field
}