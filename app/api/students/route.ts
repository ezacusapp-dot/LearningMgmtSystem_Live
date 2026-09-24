// app/api/students/route.ts
import { NextRequest } from "next/server";
import {
  createStudentController,
  getStudentController,
} from "@/modules/students/students.controller";

// CREATE
export async function POST(req: NextRequest) {
  return createStudentController(req);
}

// GET LIST
export async function GET(req: NextRequest) {
  return getStudentController(req);
}