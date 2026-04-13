import {createAwardCategoryController,getAwardCategoryController,} from "@/modules/award-category/awardCategory.controller";
export const dynamic = "force-dynamic";
// CREATE
export async function POST(req: Request) {
  return createAwardCategoryController(req);
}

// GET LIST
export async function GET(req: Request) {
  return getAwardCategoryController(req);
}