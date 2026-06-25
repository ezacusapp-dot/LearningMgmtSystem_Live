// modules/exams/exams.controller.ts
import { NextRequest } from "next/server";
import {
  getExamsService,
  getExamByIdService,
  createExamService,
  updateExamService,
  replaceExamSectionsService,
  replaceExamQuestionsService,
  addQuestionToSectionService,
  bulkUpdateSectionQuestionsService,
  assignCourseService,
  unassignCourseService,
  deleteExamService,
  getCoursesForDropdownService,
} from "./exams.service";
import {
  validateCreateExam,
  validateUpdateExam,
  validateAssignCourse,
  validateAddQuestionToSection,
  validateBulkUpdateQuestions,
  validateReplaceQuestions,
} from "./exams.validation";

export const getExamsController = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      examType: searchParams.get("examType"),
      courseId: searchParams.get("courseId"),
    };
    const result = await getExamsService(query);
    return Response.json({ status: true, ...result });
  } catch (err: any) {
    console.error("getExams error:", err);
    return Response.json({ status: false, message: err.message }, { status: 500 });
  }
};

export const getExamByIdController = async (id: string) => {
  try {
    const data = await getExamByIdService(id);
    return Response.json({ status: true, data });
  } catch (err: any) {
    const status = err.message === "Exam not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const createExamController = async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log("Creating exam with body:", JSON.stringify(body, null, 2));

    const validated = validateCreateExam(body);
    const data = await createExamService(validated);

    return Response.json(
      { status: true, message: "Exam created successfully", data },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("createExam error →", err);

    if (err.name === "ZodError") {
      return Response.json(
        { status: false, message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }

    return Response.json({ status: false, message: err.message }, { status: 400 });
  }
};

export const updateExamController = async (req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = validateUpdateExam(body);
    const data = await updateExamService(id, validated);

    return Response.json({ status: true, message: "Exam updated successfully", data });
  } catch (err: any) {
    console.error("updateExam error →", err);

    if (err.name === "ZodError") {
      return Response.json(
        { status: false, message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }

    const status = err.message === "Exam not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const replaceExamSectionsController = async (req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { sections } = body;

    if (!sections || !Array.isArray(sections)) {
      return Response.json(
        { status: false, message: "Sections array is required" },
        { status: 400 }
      );
    }

    const data = await replaceExamSectionsService(id, sections);
    return Response.json({ status: true, message: "Sections updated successfully", data });
  } catch (err: any) {
    console.error("replaceExamSections error →", err);
    const status = err.message === "Exam not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// NEW: Replace all questions on an exam
export const replaceExamQuestionsController = async (req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = validateReplaceQuestions(body);
    const data = await replaceExamQuestionsService(id, validated.questions);

    return Response.json({ status: true, message: "Questions saved successfully", data });
  } catch (err: any) {
    console.error("replaceExamQuestions error →", err);

    if (err.name === "ZodError") {
      return Response.json(
        { status: false, message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }

    const status = err.message === "Exam not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const addQuestionToSectionController = async (req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = validateAddQuestionToSection(body);
    const { sectionId, question } = validated;

    const data = await addQuestionToSectionService(id, sectionId, question);
    return Response.json({ status: true, message: "Question added successfully", data });
  } catch (err: any) {
    console.error("addQuestionToSection error →", err);

    if (err.name === "ZodError") {
      return Response.json(
        { status: false, message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }

    const status = err.message.includes("not found") ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const bulkUpdateQuestionsController = async (req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = validateBulkUpdateQuestions(body);
    const { sections } = validated;

    const results = [];
    for (const section of sections) {
      const data = await bulkUpdateSectionQuestionsService(
        id,
        section.sectionId,
        section.questions
      );
      results.push(data);
    }

    return Response.json({
      status: true,
      message: "Questions updated successfully",
      data: results,
    });
  } catch (err: any) {
    console.error("bulkUpdateQuestions error →", err);

    if (err.name === "ZodError") {
      return Response.json(
        { status: false, message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }

    const status = err.message.includes("not found") ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const assignCourseController = async (req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = validateAssignCourse(body);
    const data = await assignCourseService(id, validated.courseId);

    return Response.json({ status: true, message: "Course assigned successfully", data });
  } catch (err: any) {
    console.error("assignCourse error →", err);

    if (err.name === "ZodError") {
      return Response.json(
        { status: false, message: "Validation failed", errors: err.errors },
        { status: 400 }
      );
    }

    const code = err.message.includes("not found") ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status: code });
  }
};

export const unassignCourseController = async (_req: NextRequest, id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const data = await unassignCourseService(id);
    return Response.json({ status: true, message: "Course unassigned successfully", data });
  } catch (err: any) {
    console.error("unassignCourse error →", err);
    const status = err.message === "Exam not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const deleteExamController = async (id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    await deleteExamService(id);
    return Response.json({ status: true, message: "Exam deleted successfully" });
  } catch (err: any) {
    console.error("deleteExam error →", err);
    const status = err.message === "Exam not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const getCoursesDropdownController = async () => {
  try {
    const data = await getCoursesForDropdownService();
    return Response.json({ status: true, data });
  } catch (err: any) {
    console.error("getCoursesDropdown error:", err);
    return Response.json({ status: false, message: err.message }, { status: 500 });
  }
};

// Re-export getSectionsController for the GET /api/exams/[id]/sections route
export const getSectionsController = async (id: string) => {
  try {
    if (!id) {
      return Response.json(
        { status: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const data = await getExamByIdService(id);
    return Response.json({ status: true, data: data.sections ?? [] });
  } catch (err: any) {
    const status = err.message === "Exam not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};