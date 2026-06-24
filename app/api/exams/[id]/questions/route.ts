// app/api/exams/[id]/questions/route.ts
import { NextRequest } from "next/server";
import { replaceExamQuestionsController } from "modules/exams/exams.controller";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await replaceExamQuestionsController(req, id);
  } catch (error) {
    console.error("Error in PUT questions route:", error);
    return Response.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}