// app/api/exams/[id]/sections/[sectionId]/questions/route.ts
import { NextRequest } from "next/server";
import { 
  addQuestionToSectionService, 
  bulkUpdateSectionQuestionsService 
} from "modules/exams/exams.service";
import { 
  validateAddQuestionToSection, 
  validateBulkUpdateQuestions 
} from "modules/exams/exams.validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const body = await req.json();
    const validated = validateAddQuestionToSection(body);
    const data = await addQuestionToSectionService(id, sectionId, validated.question);
    return Response.json({ 
      status: true, 
      message: "Question added successfully", 
      data 
    });
  } catch (err: any) {
    const status = err.message === "Exam not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const body = await req.json();
    const validated = validateBulkUpdateQuestions(body);
const section = validated.sections.find(s => s.sectionId === sectionId);
if (!section) throw new Error("Section not found in request body");
const data = await bulkUpdateSectionQuestionsService(id, sectionId, section.questions);
    return Response.json({ 
      status: true, 
      message: "Questions updated successfully", 
      data 
    });
  } catch (err: any) {
    const status = err.message === "Exam not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
}