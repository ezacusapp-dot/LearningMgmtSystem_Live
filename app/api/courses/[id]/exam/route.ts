import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Looking for exam with courseId:", id);

    // Find the most recent MOCK exam attached to this course
    const exam = await prisma.exam.findFirst({
      where: {
        courseId: id,  // ✅ Use 'id' from params as courseId
        examType: "MOCK",
        status: "Active",
      },
      orderBy: { createdAt: "desc" },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                options: { orderBy: { order: "asc" } },
              },
            },
          },
        },
        questions: {
          where: { sectionId: null },
          orderBy: { order: "asc" },
          include: {
            options: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!exam) {
      console.log("No active mock exam found for course:", id);
      return Response.json(
        { status: false, message: "No active mock exam found for this course" },
        { status: 404 }
      );
    }

    console.log("Found exam:", exam.id, exam.title);
    return Response.json({ status: true, data: exam });
  } catch (err: any) {
    console.error("GET /api/courses/[id]/exam error:", err);
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
}