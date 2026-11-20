

// export type ExamStatus = "Active" | "Inactive" | "Draft" | "Archived";
// export type ExamInputMode = "text" | "image" | "code";

// export interface ExamOption {
//   id: string;
//   text: string;
//   order: number;
//   inputMode: ExamInputMode;
//   imageData: string | null;
// }

// export interface ExamQuestion {
//   id: string;
//   question: string;
//   inputMode: ExamInputMode;
//   questionImage: string | null;
//   codeSnippet: string | null;
//   codeLanguage: string | null;
//   points: number;
//   order: number;
//   options: ExamOption[];
// }

// export interface ExamSection {
//   id: string;
//   title: string;
//   description: string | null;
//   order: number;
//   totalMarks: number; // computed server-side from question points
//   timeLimit: number | null;
//   questions: ExamQuestion[];
// }

// export interface ExamDetail {
//   id: string;
//   title: string;
//   description: string | null;
//   examType: "MOCK" | "FINAL";
//   totalMarks: number;
//   passingMarks: number;
//   duration: number; // minutes
//   maxAttempts: number;
//   randomizeQuestions: boolean;
//   startDate: string | null;
//   endDate: string | null;
//   course?: { id: string; title: string } | null;
//   sections: ExamSection[];
//   questions: ExamQuestion[]; // ungrouped questions
// }

// export interface ExamSummary {
//   id: string;
//   title: string;
//   description: string | null;
//   examType: "MOCK" | "FINAL";
//   totalMarks: number;
//   passingMarks: number;
//   duration: number;
//   status: ExamStatus;
//   maxAttempts: number;
//   startDate: string | null;
//   endDate: string | null;
//   course?: { id: string; title: string } | null;
//   _count?: { questions: number; attempts: number };
// }

// export interface ExamAttemptRecord {
//   id: string;
//   examId: string;
//   userId: string | null;
//   score: number;
//   percentage: number | null;
//   isPassed: boolean;
//   timeTaken: number | null;
//   completedAt: string | null;
//   createdAt: string;
//   sectionScores: {
//     id: string;
//     sectionId: string;
//     score: number;
//     percentage: number;
//     isPassed: boolean | null;
//     totalQuestions: number;
//     correctlyAnswered: number;
//   }[];
// }

// export interface SubmitAttemptPayload {
//   userId?: string;
//   timeTaken: number; // seconds spent
//   answers: { questionId: string; optionId: string }[];
// }

// export interface SubmitAttemptResult {
//   id: string;
//   score: number;
//   percentage: number;
//   isPassed: boolean;
//   sectionScores: (ExamAttemptRecord["sectionScores"][number] & {
//     sectionTitle: string;
//   })[];
// }

// async function unwrap<T>(res: Response): Promise<T> {
//   const json = await res.json();
//   if (!json.status) {
//     throw new Error(json.message || "Request failed");
//   }
//   return (json.data ?? json) as T;
// }

// /** List final exams, optionally scoped to a course. */
// export async function getFinalExams(opts?: {
//   courseId?: string;
// }): Promise<ExamSummary[]> {
//   const qs = new URLSearchParams({ examType: "FINAL", status: "Active", limit: "100" });
//   if (opts?.courseId) qs.set("courseId", opts.courseId);

//   const res = await fetch(`/api/exams?${qs.toString()}`);
//   const json = await res.json();
//   if (!json.status) throw new Error(json.message || "Failed to load exams");
//   return json.data as ExamSummary[];
// }

// /** Student-safe exam detail: sections, questions and options WITHOUT answers. */
// export async function getExam(examId: string): Promise<ExamDetail> {
//   const res = await fetch(`/api/exams/${examId}/student`, { cache: "no-store" });
//   return unwrap<ExamDetail>(res);
// }

// /** Attempts a student has already made on this exam. */
// export async function getMyAttempts(
//   examId: string,
//   userId: string
// ): Promise<ExamAttemptRecord[]> {
//   const qs = new URLSearchParams({ userId });
//   const res = await fetch(`/api/exams/${examId}/attempts?${qs.toString()}`, {
//     cache: "no-store",
//   });
//   return unwrap<ExamAttemptRecord[]>(res);
// }

// /** Submit a completed attempt — scoring happens server-side. */
// export async function submitAttempt(
//   examId: string,
//   payload: SubmitAttemptPayload
// ): Promise<SubmitAttemptResult> {
//   const res = await fetch(`/api/exams/${examId}/attempts`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   return unwrap<SubmitAttemptResult>(res);
// }

// app/api/exams/student/student-exams.ts
export type ExamStatus = "Active" | "Inactive" | "Draft" | "Archived";
export type ExamInputMode = "text" | "image" | "code";

export interface ExamOption {
  id: string;
  text: string;
  order: number;
  inputMode: ExamInputMode;
  imageData: string | null;
}

export interface ExamQuestion {
  id: string;
  question: string;
  inputMode: ExamInputMode;
  questionImage: string | null;
  codeSnippet: string | null;
  codeLanguage: string | null;
  points: number;
  order: number;
  options: ExamOption[];
}

/** One line of the paper structure, e.g. { questionType: "Debugging", marks: 30 } */
export interface BlueprintRow {
  questionType: string;
  marks: number;
}

/** Exam info for the instructions page. The question pool is NEVER included. */
export interface ExamDetail {
  id: string;
  title: string;
  description: string | null;
  examType: "MOCK" | "FINAL";
  totalMarks: number;
  passingMarks: number;
  duration: number; // minutes
  maxAttempts: number;
  randomizeQuestions: boolean;
  startDate: string | null;
  endDate: string | null;
  course?: { id: string; title: string } | null;
  blueprint: BlueprintRow[];
}

/** THIS student's random paper, created when the attempt starts. */
export interface StudentPaper {
  attemptId: string;
  title: string;
  duration: number;
  totalMarks: number;
  startedAt: string;
  endsAt: string; // drive the countdown from this
  questions: ExamQuestion[];
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

// Same shape the result page already reads, so the result page needs no change.
export interface SubmitAttemptResult {
  id: string;
  score: number;
  percentage: number;
  isPassed: boolean;
  sectionScores: (ExamAttemptRecord["sectionScores"][number] & { sectionTitle: string })[];
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || "Request failed");
  }
  return (json.data ?? json) as T;
}

/** List final exams, optionally scoped to a course. */
export async function getFinalExams(opts?: { courseId?: string }): Promise<ExamSummary[]> {
  const qs = new URLSearchParams({ examType: "FINAL", status: "Active", limit: "100" });
  if (opts?.courseId) qs.set("courseId", opts.courseId);

  const res = await fetch(`/api/exams?${qs.toString()}`);
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Failed to load exams");
  return json.data as ExamSummary[];
}

/** Exam info (title, marks, duration, paper structure). No questions. */
export async function getExam(examId: string): Promise<ExamDetail> {
  const res = await fetch(`/api/exams/${examId}/student`, { cache: "no-store" });
  return unwrap<ExamDetail>(res);
}

/**
 * Completed attempts only. Attempts are now created when the student STARTS,
 * so an unfinished one must not count as "used" on the exams list / instructions page.
 */
export async function getMyAttempts(examId: string, userId: string): Promise<ExamAttemptRecord[]> {
  const qs = new URLSearchParams({ userId });
  const res = await fetch(`/api/exams/${examId}/attempts?${qs.toString()}`, { cache: "no-store" });
  const all = await unwrap<ExamAttemptRecord[]>(res);
  // completedAt is set by the new submit; timeTaken covers attempts saved by the old submit route
  return all.filter((a) => a.completedAt != null || a.timeTaken != null);
}

/** Start (or resume) an attempt. The server builds this student's random paper. */
export async function startAttempt(examId: string): Promise<StudentPaper> {
  // The server knows who you are from the login cookie
  const res = await fetch(`/api/exams/${examId}/start`, { method: "POST" });
  return unwrap<StudentPaper>(res);
}

/** Submit answers. Scoring happens on the server from the saved paper. */
export async function submitAttempt(
  examId: string,
  attemptId: string,
  answers: { questionId: string; optionId: string }[]
): Promise<SubmitAttemptResult> {
  const res = await fetch(`/api/exams/${examId}/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  const r = await unwrap<{ attemptId: string; score: number; percentage: number; isPassed: boolean }>(res);
  return { id: r.attemptId, score: r.score, percentage: r.percentage, isPassed: r.isPassed, sectionScores: [] };
}