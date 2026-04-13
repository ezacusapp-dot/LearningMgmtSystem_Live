import {createCourseController,getCoursesController,} from "@/modules/courses/courses.controller";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return createCourseController(req);
}

export async function GET(req: Request) {
  return getCoursesController(req);
}

