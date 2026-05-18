import {createStudentController,getStudentController,} from "@/modules/students/students.controller";

// CREATE
export async function POST(req: Request) {
  return createStudentController(req);
}

// GET LIST
export async function GET(req: Request) {
  return getStudentController(req);
}