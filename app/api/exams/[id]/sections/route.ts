// app/api/exams/[id]/sections/route.ts
import { NextRequest } from "next/server";
import {
  getSectionsController,
  replaceExamSectionsController,
} from "modules/exams/exams.controller";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await getSectionsController(id);
  } catch (error) {
    console.error("Error in GET sections route:", error);
    return Response.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await replaceExamSectionsController(req, id);
  } catch (error) {
    console.error("Error in PUT sections route:", error);
    return Response.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}