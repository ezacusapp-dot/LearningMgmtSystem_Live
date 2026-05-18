import {
  getSchoolsController,
  createSchoolController,
} from "@/modules/school/school.controller";

export async function GET(req: Request) {
  return getSchoolsController(req);
}

export async function POST(req: Request) {
  return createSchoolController(req);
}