
// ============================================================
// app/api/courses/route.ts
import {
  getCoursesController,
  createCourseController,
} from "@/modules/courses/courses.controller";
import { certificateTemplateController } from 'modules/certificate-template/certificateTemplate.controller';

export async function GET(req: Request) {
  return getCoursesController(req);
}

export async function POST(req: Request) {
  return createCourseController(req);
}
