import {
  createGradeController,
  getGradeController,
} from "@/modules/grade/grade.controller";

// CREATE
export async function POST(req: Request) {
  return createGradeController(req);
}

// GET LIST
export async function GET(req: Request) {
  return getGradeController(req);
}