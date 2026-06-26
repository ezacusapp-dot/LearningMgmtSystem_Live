// modules/exams/exams.repository.ts
import { prisma } from "@/lib/prisma";
import { CreateExamDto, UpdateExamDto, ExamQueryParams } from "./exams.types";

// ─── Include Configurations ──────────────────────────────────────────────────
const examListInclude = {
  course: { select: { id: true, title: true } },
  _count: { select: { questions: true, attempts: true } },
} as const;

const examDetailInclude = {
  course: { select: { id: true, title: true } },
  sections: {
    orderBy: { order: "asc" as const },
    include: {
      questions: {
        orderBy: { order: "asc" as const },
        include: {
          options: { orderBy: { order: "asc" as const } },
        },
      },
    },
  },
  questions: {
    where: { sectionId: null },
    orderBy: { order: "asc" as const },
    include: {
      options: { orderBy: { order: "asc" as const } },
    },
  },
} as const;

// ─── Transaction Options ─────────────────────────────────────────────────────
const TX_OPTIONS = {
  timeout: 30000, // 30 seconds
  maxWait: 10000, // wait up to 10s to acquire
};

// ─── Helper Functions ────────────────────────────────────────────────────────
export function buildWhere(query: ExamQueryParams) {
  const where: any = {};
  if (query.search) where.title = { contains: query.search, mode: "insensitive" };
  if (query.status) where.status = query.status;
  if (query.examType) where.examType = query.examType;
  if (query.courseId) where.courseId = query.courseId;
  return where;
}

function buildOptionsCreate(options: NonNullable<CreateExamDto["questions"]>[0]["options"]) {
  return options.map((o) => ({
    text: o.inputMode === "image" ? "" : (o.text ?? ""),
    isCorrect: o.isCorrect,
    order: o.order || 0,
    inputMode: (o.inputMode ?? "text") as any,
    imageData: o.inputMode === "image" ? (o.imageData ?? null) : null,
  }));
}

function buildQuestionsCreate(
  questions: NonNullable<CreateExamDto["questions"]>,
  examId?: string,
  sectionId?: string
) {
  return questions.map((q) => {
    const base = {
      question: q.question,
      inputMode: (q.inputMode ?? "text") as any,
      questionImage: q.inputMode === "image" ? (q.questionImage ?? null) : null,
      codeSnippet: q.codeSnippet ?? null,
      codeLanguage: q.codeLanguage ?? null,
      explanation: q.explanation ?? null,
      explanationImage: q.explanationImage ?? null,
      points: q.points || 1,
      difficulty: (q.difficulty ?? null) as any,
      bloomLevel: (q.bloomLevel ?? null) as any,
      questionType: (q.questionType ?? null) as any,
      order: q.order || 0,
      options: {
        create: buildOptionsCreate(q.options),
      },
    };

    const resolvedData: any = {
      ...base,
      examId: examId,
    };

    if (sectionId) {
      resolvedData.sectionId = sectionId;
    } else if (q.sectionId) {
      resolvedData.sectionId = q.sectionId;
    }

    return resolvedData;
  });
}

function buildSectionsCreate(sections: NonNullable<CreateExamDto["sections"]>, examId?: string) {
  return sections.map((s) => ({
    title: s.title,
    description: s.description || "",
    order: s.order || 0,
    difficulty: (s.difficulty ?? null) as any,
    questionType: (s.questionType ?? null) as any,
    totalMarks: s.totalMarks || 0,
    passingMarks: s.passingMarks ?? null,
    timeLimit: s.timeLimit ?? null,
    questions:
      s.questions && s.questions.length > 0
        ? {
            create: buildQuestionsCreate(s.questions, examId),
          }
        : undefined,
  }));
}

// ─── Repository Functions ────────────────────────────────────────────────────

export const getExamsRepo = (where: any, skip: number, take: number) =>
  prisma.exam.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: examListInclude,
  });

export const countExamsRepo = (where: any) => prisma.exam.count({ where });

export const findExamByIdRepo = (id: string) =>
  prisma.exam.findUnique({ where: { id }, include: examDetailInclude });

export const createExamRepo = async (data: CreateExamDto) => {
  const { sections, questions, courseId, ...scalar } = data;

  let createdExam: any;

  if (sections && sections.length > 0) {
    createdExam = await prisma.exam.create({
      data: {
        ...scalar,
        ...(courseId && { course: { connect: { id: courseId } } }),
        sections: {
          create: buildSectionsCreate(sections),
        },
      },
      include: examDetailInclude,
    });
  } else if (questions && questions.length > 0) {
    createdExam = await prisma.exam.create({
      data: {
        ...scalar,
        ...(courseId && { course: { connect: { id: courseId } } }),
        questions: {
          create: buildQuestionsCreate(questions),
        },
      },
      include: examDetailInclude,
    });
  } else {
    createdExam = await prisma.exam.create({
      data: {
        ...scalar,
        ...(courseId && { course: { connect: { id: courseId } } }),
      },
      include: examDetailInclude,
    });
  }

  let totalMarks = 0;
  if (sections && sections.length > 0) {
    totalMarks = sections.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
  } else if (questions && questions.length > 0) {
    totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }

  if (totalMarks > 0) {
    await prisma.exam.update({
      where: { id: createdExam.id },
      data: { totalMarks },
    });
  }

  return prisma.exam.findUnique({
    where: { id: createdExam.id },
    include: examDetailInclude,
  });
};

export const updateExamRepo = (id: string, data: UpdateExamDto) => {
  const { courseId, ...scalar } = data;
  return prisma.exam.update({
    where: { id },
    data: {
      ...scalar,
      ...(courseId === null
        ? { course: { disconnect: true } }
        : courseId
        ? { course: { connect: { id: courseId } } }
        : {}),
    },
    include: examDetailInclude,
  });
};

export const replaceExamSectionsRepo = async (
  examId: string,
  sections: NonNullable<CreateExamDto["sections"]>
) => {
  // Run writes inside transaction, read outside to avoid timeout
  await prisma.$transaction(async (tx) => {
    await tx.examSection.deleteMany({ where: { examId } });

    for (const section of sections) {
      await tx.examSection.create({
        data: {
          examId,
          title: section.title,
          description: section.description || "",
          order: section.order || 0,
          difficulty: (section.difficulty ?? null) as any,
          questionType: (section.questionType ?? null) as any,
          totalMarks: section.totalMarks || 0,
          passingMarks: section.passingMarks ?? null,
          timeLimit: section.timeLimit ?? null,
          questions:
            section.questions && section.questions.length > 0
              ? {
                  create: buildQuestionsCreate(section.questions, examId),
                }
              : undefined,
        },
      });
    }

    const allSections = await tx.examSection.findMany({ where: { examId } });
    const totalMarks = allSections.reduce((sum, s) => sum + s.totalMarks, 0);
    await tx.exam.update({ where: { id: examId }, data: { totalMarks } });
  }, TX_OPTIONS);

  // ← Outside transaction — no timeout risk
  return prisma.exam.findUnique({ where: { id: examId }, include: examDetailInclude });
};

export const replaceExamQuestionsRepo = async (
  examId: string,
  questions: NonNullable<CreateExamDto["questions"]>
) => {
  // Run writes inside transaction, read outside to avoid timeout
  await prisma.$transaction(async (tx) => {
    await tx.examQuestion.deleteMany({ where: { examId } });

    for (const question of questions) {
      await tx.examQuestion.create({
        data: {
          examId,
          sectionId: question.sectionId ?? null,
          question: question.question,
          inputMode: (question.inputMode ?? "text") as any,
          questionImage:
            question.inputMode === "image" ? (question.questionImage ?? null) : null,
          codeSnippet: question.codeSnippet ?? null,
          codeLanguage: question.codeLanguage ?? null,
          explanation: question.explanation ?? null,
          explanationImage: question.explanationImage ?? null,
          points: question.points || 1,
          difficulty: (question.difficulty ?? null) as any,
          bloomLevel: (question.bloomLevel ?? null) as any,
          questionType: (question.questionType ?? null) as any,
          order: question.order || 0,
          options: {
            create: buildOptionsCreate(question.options),
          },
        },
      });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    await tx.exam.update({ where: { id: examId }, data: { totalMarks } });
  }, TX_OPTIONS);

  // ← Outside transaction — no timeout risk
  return prisma.exam.findUnique({ where: { id: examId }, include: examDetailInclude });
};

export const addQuestionToSectionRepo = async (
  examId: string,
  sectionId: string,
  question: NonNullable<CreateExamDto["questions"]>[0]
) => {
  const section = await prisma.examSection.findFirst({
    where: { id: sectionId, examId },
  });

  if (!section) throw new Error("Section not found in this exam");

  const createdQuestion = await prisma.examQuestion.create({
    data: {
      examId,
      sectionId,
      question: question.question,
      inputMode: (question.inputMode ?? "text") as any,
      questionImage: question.inputMode === "image" ? (question.questionImage ?? null) : null,
      codeSnippet: question.codeSnippet ?? null,
      codeLanguage: question.codeLanguage ?? null,
      explanation: question.explanation ?? null,
      explanationImage: question.explanationImage ?? null,
      points: question.points || 1,
      difficulty: (question.difficulty ?? null) as any,
      bloomLevel: (question.bloomLevel ?? null) as any,
      questionType: (question.questionType ?? null) as any,
      order: question.order || 0,
      options: { create: buildOptionsCreate(question.options) },
    },
    include: { options: true },
  });

  // Update section total marks
  const sectionQuestions = await prisma.examQuestion.findMany({ where: { sectionId } });
  const sectionTotalMarks = sectionQuestions.reduce((sum, q) => sum + q.points, 0);
  await prisma.examSection.update({
    where: { id: sectionId },
    data: { totalMarks: sectionTotalMarks },
  });

  // Update exam total marks
  const allQuestions = await prisma.examQuestion.findMany({ where: { examId } });
  const examTotalMarks = allQuestions.reduce((sum, q) => sum + q.points, 0);
  await prisma.exam.update({
    where: { id: examId },
    data: { totalMarks: examTotalMarks },
  });

  return createdQuestion;
};

export const bulkUpdateSectionQuestionsRepo = async (
  examId: string,
  sectionId: string,
  questions: NonNullable<CreateExamDto["questions"]>
) => {
  // Run writes inside transaction, read outside to avoid timeout
  await prisma.$transaction(async (tx) => {
    await tx.examQuestion.deleteMany({ where: { examId, sectionId } });

    for (const question of questions) {
      await tx.examQuestion.create({
        data: {
          examId,
          sectionId,
          question: question.question,
          inputMode: (question.inputMode ?? "text") as any,
          questionImage:
            question.inputMode === "image" ? (question.questionImage ?? null) : null,
          codeSnippet: question.codeSnippet ?? null,
          codeLanguage: question.codeLanguage ?? null,
          explanation: question.explanation ?? null,
          explanationImage: question.explanationImage ?? null,
          points: question.points || 1,
          difficulty: (question.difficulty ?? null) as any,
          bloomLevel: (question.bloomLevel ?? null) as any,
          questionType: (question.questionType ?? null) as any,
          order: question.order || 0,
          options: { create: buildOptionsCreate(question.options) },
        },
      });
    }

    const sectionTotalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    await tx.examSection.update({
      where: { id: sectionId },
      data: { totalMarks: sectionTotalMarks },
    });

    const allSections = await tx.examSection.findMany({ where: { examId } });
    const examTotalMarks = allSections.reduce((sum, s) => sum + s.totalMarks, 0);
    await tx.exam.update({
      where: { id: examId },
      data: { totalMarks: examTotalMarks },
    });
  }, TX_OPTIONS);

  // ← Outside transaction — no timeout risk
  return prisma.exam.findUnique({ where: { id: examId }, include: examDetailInclude });
};

export const assignCourseRepo = (examId: string, courseId: string) =>
  prisma.exam.update({
    where: { id: examId },
    data: { course: { connect: { id: courseId } } },
    include: examListInclude,
  });

export const unassignCourseRepo = (examId: string) =>
  prisma.exam.update({
    where: { id: examId },
    data: { course: { disconnect: true } },
    include: examListInclude,
  });

export const deleteExamRepo = (id: string) => prisma.exam.delete({ where: { id } });

export const getCoursesForDropdownRepo = () =>
  prisma.courses.findMany({
    where: { status: "Published" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });