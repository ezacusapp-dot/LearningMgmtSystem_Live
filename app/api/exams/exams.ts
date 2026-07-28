// app/api/exams/exams.ts
import { ExamStatus, ExamType } from "@prisma/client";

export interface ExamOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  inputMode?: "text" | "image";
  imageData?: string | null;
}

export interface ExamQuestion {
  id?: string;
  sectionId?: string | null;
  question: string;
  inputMode?: "text" | "image";
  questionImage?: string | null;
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  explanation?: string | null;
  explanationImage?: string | null;
  points: number;
  difficulty?: "Easy" | "Medium" | "Difficult" | "Challenging" | null;
  bloomLevel?: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create" | null;
  questionType?: "Conceptual" | "Prediction" | "Debugging" | "ProblemSolving" | null;
  order: number;
  options: ExamOption[];
}

export interface ExamSection {
  id?: string;
  title: string;
  description?: string | null;
  order: number;
  difficulty?: "Easy" | "Medium" | "Difficult" | "Challenging" | null;
  questionType?: "Conceptual" | "Prediction" | "Debugging" | "ProblemSolving" | null;
  questions?: ExamQuestion[];
}
export interface CreateExamData {
  title: string;
  description?: string | null;
  courseId?: string | null;
  examType?: ExamType;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  status?: ExamStatus;
  maxAttempts?: number;
  showAnswers?: boolean;
  showExplanations?: boolean;
  randomizeQuestions?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdBy?: string;
  sections?: ExamSection[];
  questions?: ExamQuestion[];
}

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  examType: ExamType;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  status: ExamStatus;
  maxAttempts?: number | null;
  showAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  course?: { id: string; title: string } | null;
  _count?: { questions: number; attempts: number };
  sections?: ExamSection[];
  questions?: ExamQuestion[];
}

const API_BASE = "/api/exams";

export const examsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    examType?: string;
    courseId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.examType) searchParams.set("examType", params.examType);
    if (params?.courseId) searchParams.set("courseId", params.courseId);

    const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
    const response = await fetch(url);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  create: async (data: CreateExamData) => {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<CreateExamData>) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    return response.json();
  },

  // ── Section management ──────────────────────────────────────────────────────

  getSections: async (id: string) => {
    const response = await fetch(`${API_BASE}/${id}/sections`);
    return response.json();
  },

  updateSections: async (id: string, sections: ExamSection[]) => {
    const response = await fetch(`${API_BASE}/${id}/sections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    return response.json();
  },

  // ── Question management ─────────────────────────────────────────────────────

  // Replace ALL questions on an exam in one call (used by questions/page.tsx)
  replaceQuestions: async (id: string, questions: ExamQuestion[]) => {
    const response = await fetch(`${API_BASE}/${id}/questions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });
    return response.json();
  },

  addQuestionToSection: async (
    examId: string,
    sectionId: string,
    question: ExamQuestion
  ) => {
    const response = await fetch(
      `${API_BASE}/${examId}/sections/${sectionId}/questions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }
    );
    return response.json();
  },

  bulkUpdateSectionQuestions: async (
    examId: string,
    sectionId: string,
    questions: ExamQuestion[]
  ) => {
    const response = await fetch(
      `${API_BASE}/${examId}/sections/${sectionId}/questions`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      }
    );
    return response.json();
  },

  // ── Course assignment ───────────────────────────────────────────────────────

  assignCourse: async (id: string, courseId: string) => {
    const response = await fetch(`${API_BASE}/${id}/assign-course`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    return response.json();
  },

  unassignCourse: async (id: string) => {
    const response = await fetch(`${API_BASE}/${id}/assign-course`, {
      method: "DELETE",
    });
    return response.json();
  },

  getCourses: async () => {
    const response = await fetch(`${API_BASE}/courses`);
    return response.json();
  },
};