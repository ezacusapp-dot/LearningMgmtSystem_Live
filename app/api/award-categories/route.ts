import {createAwardCategoryController,getAwardCategoryController,} from "@/modules/award-category/awardCategory.controller";

// CREATE
export async function POST(req: Request) {
  return createAwardCategoryController(req);
}

// GET LIST
export async function GET(req: Request) {
  return getAwardCategoryController(req);
}