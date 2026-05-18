import { getCoursesByGradeWithFullDetailsController } from "@/modules/courses/courses.controller";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { gradeId } = await params;
  return getCoursesByGradeWithFullDetailsController(gradeId, req);
}