// modules/exams/exams.repository.ts
import { prisma } from "@/lib/prisma";
import { CreateExamDto, UpdateExamDto, ExamQueryParams } from "./exams.types";

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
    order: o.order,
    inputMode: (o.inputMode ?? "text") as any,
    imageData: o.inputMode === "image" ? (o.imageData ?? null) : null,
  }));
}

function buildQuestionsCreate(
  questions: NonNullable<CreateExamDto["questions"]>,
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
      points: q.points,
      difficulty: (q.difficulty ?? null) as any,
      bloomLevel: (q.bloomLevel ?? null) as any,
      questionType: (q.questionType ?? null) as any,
      order: q.order,
      options: {
        create: buildOptionsCreate(q.options),
      },
    };
    // Only attach sectionId when creating questions at the top level (not nested inside a section)
    const resolvedSectionId = sectionId || q.sectionId || null;
    if (resolvedSectionId) {
      return { ...base, sectionId: resolvedSectionId };
    }
    return base;
  });
}

function buildSectionsCreate(sections: NonNullable<CreateExamDto["sections"]>) {
  return sections.map((s) => ({
    title: s.title,
    description: s.description,
    order: s.order,
    difficulty: (s.difficulty ?? null) as any,
    questionType: (s.questionType ?? null) as any,
    totalMarks: s.totalMarks,
    passingMarks: s.passingMarks ?? null,
    timeLimit: s.timeLimit ?? null,
    questions:
      s.questions && s.questions.length > 0
        ? { create: buildQuestionsCreate(s.questions) }
        : undefined,
  }));
}

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

  return prisma.exam.create({
    data: {
      ...scalar,
      ...(courseId && { course: { connect: { id: courseId } } }),
      ...(sections && sections.length > 0 && {
        sections: { create: buildSectionsCreate(sections) },
      }),
      ...(questions && questions.length > 0 && !sections && {
        questions: { create: buildQuestionsCreate(questions) },
      }),
    },
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
  return prisma.$transaction(async (tx) => {
    await tx.examSection.deleteMany({ where: { examId } });

    for (const section of sections) {
      await tx.examSection.create({
        data: {
          examId,
          title: section.title,
          description: section.description,
          order: section.order,
          difficulty: (section.difficulty ?? null) as any,
          questionType: (section.questionType ?? null) as any,
          totalMarks: section.totalMarks,
          passingMarks: section.passingMarks ?? null,
          timeLimit: section.timeLimit ?? null,
          questions:
            section.questions && section.questions.length > 0
              ? { create: buildQuestionsCreate(section.questions) }
              : undefined,
        },
      });
    }

    return tx.exam.findUnique({ where: { id: examId }, include: examDetailInclude });
  });
};

// NEW: Replace ALL questions on an exam (no section grouping required)
export const replaceExamQuestionsRepo = async (
  examId: string,
  questions: NonNullable<CreateExamDto["questions"]>
) => {
  return prisma.$transaction(async (tx) => {
    // Delete all existing questions for this exam (cascades to options)
    await tx.examQuestion.deleteMany({ where: { examId } });

    // Re-create all questions
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
          points: question.points,
          difficulty: (question.difficulty ?? null) as any,
          bloomLevel: (question.bloomLevel ?? null) as any,
          questionType: (question.questionType ?? null) as any,
          order: question.order,
          options: {
            create: buildOptionsCreate(question.options),
          },
        },
      });
    }

    // Update exam total marks to reflect actual question points
    const totalMarks = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
    await tx.exam.update({ where: { id: examId }, data: { totalMarks } });

    return tx.exam.findUnique({ where: { id: examId }, include: examDetailInclude });
  });
};

export const addQuestionToSectionRepo = async (
  examId: string,
  sectionId: string,
  question: NonNullable<CreateExamDto["questions"]>[0]
) => {
  const section = await prisma.examSection.findFirst({ where: { id: sectionId, examId } });
  if (!section) throw new Error("Section not found in this exam");

  return prisma.examQuestion.create({
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
      points: question.points,
      difficulty: (question.difficulty ?? null) as any,
      bloomLevel: (question.bloomLevel ?? null) as any,
      questionType: (question.questionType ?? null) as any,
      order: question.order,
      options: { create: buildOptionsCreate(question.options) },
    },
    include: { options: true },
  });
};

export const bulkUpdateSectionQuestionsRepo = async (
  examId: string,
  sectionId: string,
  questions: NonNullable<CreateExamDto["questions"]>
) => {
  return prisma.$transaction(async (tx) => {
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
          points: question.points,
          difficulty: (question.difficulty ?? null) as any,
          bloomLevel: (question.bloomLevel ?? null) as any,
          questionType: (question.questionType ?? null) as any,
          order: question.order,
          options: { create: buildOptionsCreate(question.options) },
        },
      });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
    await tx.examSection.update({ where: { id: sectionId }, data: { totalMarks } });

    const allSections = await tx.examSection.findMany({ where: { examId } });
    const examTotalMarks = allSections.reduce((sum, s) => sum + s.totalMarks, 0);
    await tx.exam.update({ where: { id: examId }, data: { totalMarks: examTotalMarks } });

    return tx.exam.findUnique({ where: { id: examId }, include: examDetailInclude });
  });
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