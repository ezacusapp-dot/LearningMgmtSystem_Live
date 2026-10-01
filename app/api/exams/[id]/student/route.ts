import { getExamForStudentController } from "@/modules/exams/exams.controller";

// Next 15: params is a Promise.
// On Next 14 use: { params }: { params: { id: string } } and drop the await.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getExamForStudentController(id);
}