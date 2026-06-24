// app/api/exams/courses/route.ts
import { NextRequest } from "next/server";
import { getCoursesDropdownController } from "modules/exams/exams.controller";

export async function GET(req: NextRequest) {
  return getCoursesDropdownController();
}