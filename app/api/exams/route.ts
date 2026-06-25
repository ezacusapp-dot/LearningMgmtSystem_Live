// app/api/exams/route.ts
import { NextRequest } from "next/server";
import {
  getExamsController,
  createExamController,
} from "modules/exams/exams.controller";

// GET /api/exams
export async function GET(req: NextRequest) {
  return getExamsController(req);
}

// POST /api/exams
export async function POST(req: NextRequest) {
  return createExamController(req);
}