// lib/api/student-exams.ts
// Thin client around the existing /api/exams endpoints, scoped to what
// the student-facing Final Exam UI needs.

export type ExamStatus = "Active" | "Inactive" | "Draft" | "Archived";
export type ExamInputMode = "text" | "image" | "code";

export interface ExamOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  inputMode: ExamInputMode;
  imageData: string | null;
}

export interface ExamQuestion {
  id: string;
  sectionId: string | null;
  question: string;
  inputMode: ExamInputMode;
  questionImage: string | null;
  codeSnippet: string | null;
  codeLanguage: string | null;
  explanation: string | null;
  explanationImage: string | null;
  points: number;
  order: number;
  options: ExamOption[];
}

export interface ExamSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  totalMarks: number;
  passingMarks: number | null;
  timeLimit: number | null;
  questions: ExamQuestion[];
}

export interface ExamDetail {
  id: string;
  title: string;
  description: string | null;
  examType: "MOCK" | "FINAL";
  totalMarks: number;
  passingMarks: number;
  duration: number; // minutes
  status: ExamStatus;
  maxAttempts: number;
  showAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  requireProctoring: boolean;
  startDate: string | null;
  endDate: string | null;
  course?: { id: string; title: string } | null;
  sections: ExamSection[];
  questions: ExamQuestion[]; // ungrouped questions (sectionId === null)
}

export interface ExamSummary {
  id: string;
  title: string;
  description: string | null;
  examType: "MOCK" | "FINAL";
  totalMarks: number;
  passingMarks: number;
  duration: number;
  status: ExamStatus;
  maxAttempts: number;
  startDate: string | null;
  endDate: string | null;
  course?: { id: string; title: string } | null;
  _count?: { questions: number; attempts: number };
}

export interface ExamAttemptRecord {
  id: string;
  examId: string;
  userId: string | null;
  score: number;
  percentage: number | null;
  isPassed: boolean;
  timeTaken: number | null;
  completedAt: string | null;
  createdAt: string;
  sectionScores: {
    id: string;
    sectionId: string;
    score: number;
    percentage: number;
    isPassed: boolean | null;
    totalQuestions: number;
    correctlyAnswered: number;
  }[];
}

export interface SubmitAttemptPayload {
  userId?: string;
  timeTaken: number; // seconds spent
  answers: { questionId: string; optionId: string }[];
}

export interface SubmitAttemptResult {
  id: string;
  score: number;
  percentage: number;
  isPassed: boolean;
  sectionScores: (ExamAttemptRecord["sectionScores"][number] & {
    sectionTitle: string;
  })[];
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || "Request failed");
  }
  return (json.data ?? json) as T;
}

/** List final exams, optionally scoped to a course. */
export async function getFinalExams(opts?: {
  courseId?: string;
}): Promise<ExamSummary[]> {
  const qs = new URLSearchParams({ examType: "FINAL", status: "Active", limit: "100" });
  if (opts?.courseId) qs.set("courseId", opts.courseId);

  const res = await fetch(`/api/exams?${qs.toString()}`);
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Failed to load exams");
  return json.data as ExamSummary[];
}

/** Full exam detail — sections, questions, and options. */
export async function getExam(examId: string): Promise<ExamDetail> {
  const res = await fetch(`/api/exams/${examId}`, { cache: "no-store" });
  return unwrap<ExamDetail>(res);
}

/** Attempts a student has already made on this exam. */
export async function getMyAttempts(
  examId: string,
  userId: string
): Promise<ExamAttemptRecord[]> {
  const qs = new URLSearchParams({ userId });
  const res = await fetch(`/api/exams/${examId}/attempts?${qs.toString()}`, {
    cache: "no-store",
  });
  return unwrap<ExamAttemptRecord[]>(res);
}

/** Submit a completed attempt — scoring happens server-side. */
export async function submitAttempt(
  examId: string,
  payload: SubmitAttemptPayload
): Promise<SubmitAttemptResult> {
  const res = await fetch(`/api/exams/${examId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return unwrap<SubmitAttemptResult>(res);
}