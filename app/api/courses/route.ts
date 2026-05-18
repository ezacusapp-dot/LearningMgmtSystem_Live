// import {createCourseController,getCoursesController,} from "@/modules/courses/courses.controller";

// export async function POST(req: Request) {
//   return createCourseController(req);
// }

// export async function GET(req: Request) {
//   return getCoursesController(req);
// }
// ============================================================
// app/api/courses/route.ts
// ============================================================

// import { createCourseController, getCoursesController } from "@/modules/courses/courses.controller";

// export async function GET(req: Request) {
//   return getCoursesController(req);
// }

// export async function POST(req: Request) {
//   return createCourseController(req);
// }


// ============================================================
// app/api/courses/[id]/route.ts   ← save as separate file
// ============================================================
// app/api/courses/route.ts
import {
  getCoursesController,
  createCourseController,
} from "@/modules/courses/courses.controller";

export async function GET(req: Request) {
  return getCoursesController(req);
}

export async function POST(req: Request) {
  return createCourseController(req);
}