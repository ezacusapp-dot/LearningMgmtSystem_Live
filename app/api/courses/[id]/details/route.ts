import { getCourseForEditController } from "@/modules/courses/courses.controller";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getCourseForEditController(id);
}