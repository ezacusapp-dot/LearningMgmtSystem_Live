import {createCategoryController, getCategoriesController,} from "@/modules/course-categories/course-category.controller";
export const dynamic = "force-dynamic";
// CREATE
export async function POST(req: Request) {
  return createCategoryController(req);
}

// GET
export async function GET(req: Request) {
  return getCategoriesController(req);
}

