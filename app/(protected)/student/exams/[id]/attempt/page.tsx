
// // app/student/exams/[id]/attempt/page.tsx
// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   getExam,
//   submitAttempt,
//   ExamDetail,
//   ExamQuestion,
// } from "app/api/exams/student/student-exams";
// import { useStudentSession } from "lib/use-student-session";

// interface FlatQuestion extends ExamQuestion {
//   sectionTitle: string;
//   globalIndex: number;
// }

// const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// function flattenQuestions(exam: ExamDetail): FlatQuestion[] {
//   const out: FlatQuestion[] = [];
//   let idx = 0;
//   const sections = [...exam.sections].sort((a, b) => a.order - b.order);
//   for (const section of sections) {
//     for (const q of [...section.questions].sort((a, b) => a.order - b.order)) {
//       out.push({ ...q, sectionTitle: section.title, globalIndex: idx++ });
//     }
//   }
//   for (const q of [...exam.questions].sort((a, b) => a.order - b.order)) {
//     out.push({ ...q, sectionTitle: "General", globalIndex: idx++ });
//   }
//   return out;
// }

// function formatTime(totalSeconds: number) {
//   const m = Math.floor(totalSeconds / 60);
//   const s = totalSeconds % 60;
//   return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
// }

// export default function ExamAttemptPage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();
//   const { userId } = useStudentSession();

//   const [exam, setExam] = useState<ExamDetail | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loadError, setLoadError] = useState<string | null>(null);

//   const [answers, setAnswers] = useState<Record<string, string>>({});
//   const [marked, setMarked] = useState<Set<string>>(new Set());
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const startedAtRef = useRef<number>(Date.now());

//   // Load exam
//   useEffect(() => {
//     let active = true;
//     (async () => {
//       try {
//         const data = await getExam(id);
//         if (!active) return;
//         setExam(data);
//         setSecondsLeft(data.duration * 60);
//         startedAtRef.current = Date.now();
//       } catch (e: any) {
//         if (active) setLoadError(e.message || "Could not load this exam");
//       }
//     })();
//     return () => {
//       active = false;
//     };
//   }, [id]);

//   const flat = useMemo(() => (exam ? flattenQuestions(exam) : []), [exam]);
//   const current = flat[currentIndex];

//   const handleSubmit = useCallback(async () => {
//     if (!exam || submitting) return;
//     setSubmitting(true);
//     setError(null);
//     try {
//       const timeTaken = Math.round((Date.now() - startedAtRef.current) / 1000);
//       const payload = {
//         userId,
//         timeTaken,
//         answers: Object.entries(answers).map(([questionId, optionId]) => ({
//           questionId,
//           optionId,
//         })),
//       };
//       const result = await submitAttempt(exam.id, payload);
//       sessionStorage.setItem(
//         `exam-result:${exam.id}`,
//         JSON.stringify({ result, examTitle: exam.title, totalMarks: exam.totalMarks, passingMarks: exam.passingMarks })
//       );
//       router.replace(`/student/exams/${exam.id}/result?attemptId=${result.id}`);
//     } catch (e: any) {
//       setError(e.message || "Could not submit your attempt. Please try again.");
//       setSubmitting(false);
//     }
//   }, [exam, answers, userId, router, submitting]);

//   // Countdown timer
//   useEffect(() => {
//     if (secondsLeft === null) return;
//     if (secondsLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
//     return () => clearTimeout(t);
//   }, [secondsLeft, handleSubmit]);

//   // Warn before leaving the tab
//   useEffect(() => {
//     const onBeforeUnload = (e: BeforeUnloadEvent) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };
//     window.addEventListener("beforeunload", onBeforeUnload);
//     return () => window.removeEventListener("beforeunload", onBeforeUnload);
//   }, []);

//   if (loadError) {
//     return (
//       <CenteredMessage tone="danger" title="Couldn't load exam">
//         {loadError}
//       </CenteredMessage>
//     );
//   }

//   if (!exam || secondsLeft === null) {
//     return (
//       <CenteredMessage title="Preparing your exam…">
//         Loading questions and starting your timer.
//       </CenteredMessage>
//     );
//   }

//   if (flat.length === 0) {
//     return (
//       <CenteredMessage tone="danger" title="No questions available">
//         This exam has no questions configured yet.
//       </CenteredMessage>
//     );
//   }

//   const answeredCount = Object.keys(answers).length;
//   const lowTime = secondsLeft <= 5 * 60;

//   function selectOption(questionId: string, optionId: string) {
//     setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
//   }

//   function toggleMark(questionId: string) {
//     setMarked((prev) => {
//       const next = new Set(prev);
//       if (next.has(questionId)) next.delete(questionId);
//       else next.add(questionId);
//       return next;
//     });
//   }

//   return (
//     <div
//       className="flex min-h-screen flex-col"
//       style={{ background: "var(--exam-bg)", fontFamily: "var(--exam-font-body)", color: "var(--exam-ink)" }}
//     >
//       {/* Top bar */}
//       <header
//         className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6"
//         style={{ background: "var(--exam-surface)", borderColor: "var(--exam-border)" }}
//       >
//         <div className="min-w-0">
//           <p className="truncate text-sm font-bold" style={{ fontFamily: "var(--exam-font-display)" }}>
//             {exam.title}
//           </p>
//           <p className="text-xs" style={{ color: "var(--exam-muted)" }}>
//             {current?.sectionTitle} · Question {currentIndex + 1} of {flat.length}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div
//             className="flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-semibold tabular-nums transition-colors"
//             style={{
//               background: lowTime ? "var(--exam-danger-tint)" : "var(--exam-primary-tint)",
//               color: lowTime ? "var(--exam-danger)" : "var(--exam-primary)",
//               fontFamily: "var(--exam-font-mono)",
//             }}
//           >
//             <span className={lowTime ? "animate-pulse" : ""}>●</span>
//             {formatTime(secondsLeft)}
//           </div>
//           <button
//             onClick={() => setShowConfirm(true)}
//             className="rounded-[var(--exam-radius-md)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
//             style={{ background: "var(--exam-primary)" }}
//           >
//             Submit
//           </button>
//         </div>
//       </header>

//       {error && (
//         <div className="px-4 pt-3 sm:px-6">
//           <div
//             className="rounded-[var(--exam-radius-md)] border px-4 py-2 text-sm"
//             style={{ borderColor: "var(--exam-danger)", background: "var(--exam-danger-tint)", color: "var(--exam-danger)" }}
//           >
//             {error}
//           </div>
//         </div>
//       )}

//       {/* Body */}
//       <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
//         {/* Question */}
//         <main className="flex-1">
//           <div
//             className="rounded-[var(--exam-radius-lg)] border p-6"
//             style={{ borderColor: "var(--exam-border)", background: "var(--exam-surface)", boxShadow: "var(--exam-shadow)" }}
//           >
//             <div className="flex items-start justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <span
//                   className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
//                   style={{ background: "var(--exam-primary)", fontFamily: "var(--exam-font-display)" }}
//                 >
//                   {currentIndex + 1}
//                 </span>
//                 <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//                   {current.points} point{current.points !== 1 ? "s" : ""}
//                 </span>
//               </div>
//               <button
//                 onClick={() => toggleMark(current.id)}
//                 className="rounded-full border px-3 py-1 text-xs font-semibold transition"
//                 style={{
//                   borderColor: marked.has(current.id) ? "var(--exam-warning)" : "var(--exam-border)",
//                   color: marked.has(current.id) ? "var(--exam-warning)" : "var(--exam-muted)",
//                   background: marked.has(current.id) ? "var(--exam-warning-tint)" : "transparent",
//                 }}
//               >
//                 {marked.has(current.id) ? "★ Marked for review" : "☆ Mark for review"}
//               </button>
//             </div>

//             <p className="mt-4 whitespace-pre-wrap text-base font-medium leading-relaxed">
//               {current.question}
//             </p>

//             {current.questionImage && (
//               <img
//                 src={current.questionImage}
//                 alt="Question illustration"
//                 className="mt-4 max-h-80 rounded-[var(--exam-radius-md)] border object-contain"
//                 style={{ borderColor: "var(--exam-border)" }}
//               />
//             )}

//             {current.codeSnippet && (
//               <div className="mt-4 overflow-hidden rounded-[var(--exam-radius-md)]" style={{ background: "#1f1426" }}>
//                 {current.codeLanguage && (
//                   <div className="px-4 pt-2 text-[10px] font-semibold uppercase tracking-wide text-white/50">
//                     {current.codeLanguage}
//                   </div>
//                 )}
//                 <pre
//                   className="overflow-x-auto px-4 py-3 text-sm text-white"
//                   style={{ fontFamily: "var(--exam-font-mono)" }}
//                 >
//                   <code>{current.codeSnippet}</code>
//                 </pre>
//               </div>
//             )}

//             {/* Options — OMR bubble sheet style */}
//             <div className="mt-6 space-y-3">
//               {[...current.options]
//                 .sort((a, b) => a.order - b.order)
//                 .map((opt, i) => {
//                   const selected = answers[current.id] === opt.id;
//                   return (
//                     <button
//                       key={opt.id}
//                       onClick={() => selectOption(current.id, opt.id)}
//                       className="flex w-full items-start gap-3 rounded-[var(--exam-radius-md)] border px-4 py-3 text-left transition"
//                       style={{
//                         borderColor: selected ? "var(--exam-primary)" : "var(--exam-border)",
//                         background: selected ? "var(--exam-primary-tint)" : "var(--exam-surface)",
//                       }}
//                     >
//                       <span
//                         className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition"
//                         style={{
//                           borderColor: selected ? "var(--exam-primary)" : "var(--exam-muted)",
//                           background: selected ? "var(--exam-primary)" : "transparent",
//                           color: selected ? "#fff" : "var(--exam-muted)",
//                           fontFamily: "var(--exam-font-display)",
//                         }}
//                       >
//                         {LETTERS[i] ?? i + 1}
//                       </span>
//                       <span className="flex-1 pt-0.5 text-sm leading-relaxed">
//                         {opt.inputMode === "image" && opt.imageData ? (
//                           <img
//                             src={opt.imageData}
//                             alt={`Option ${LETTERS[i] ?? i + 1}`}
//                             className="max-h-40 rounded-[var(--exam-radius-sm)] border object-contain"
//                             style={{ borderColor: "var(--exam-border)" }}
//                           />
//                         ) : (
//                           opt.text
//                         )}
//                       </span>
//                     </button>
//                   );
//                 })}
//             </div>
//           </div>

//           {/* Prev / Next */}
//           <div className="mt-4 flex items-center justify-between">
//             <button
//               onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
//               disabled={currentIndex === 0}
//               className="rounded-[var(--exam-radius-md)] border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
//               style={{ borderColor: "var(--exam-border)", background: "var(--exam-surface)" }}
//             >
//               ← Previous
//             </button>
//             <button
//               onClick={() => setCurrentIndex((i) => Math.min(flat.length - 1, i + 1))}
//               disabled={currentIndex === flat.length - 1}
//               className="rounded-[var(--exam-radius-md)] px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
//               style={{ background: "var(--exam-primary)" }}
//             >
//               Next →
//             </button>
//           </div>
//         </main>

//         {/* Navigator */}
//         <aside className="w-full shrink-0 lg:w-72">
//           <div
//             className="rounded-[var(--exam-radius-lg)] border p-4"
//             style={{ borderColor: "var(--exam-border)", background: "var(--exam-surface)", boxShadow: "var(--exam-shadow)" }}
//           >
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-bold" style={{ fontFamily: "var(--exam-font-display)" }}>
//                 Answer sheet
//               </h3>
//               <span className="text-xs font-semibold" style={{ color: "var(--exam-muted)" }}>
//                 {answeredCount}/{flat.length}
//               </span>
//             </div>

//             {/* Group by section */}
//             {Object.entries(
//               flat.reduce<Record<string, FlatQuestion[]>>((acc, q) => {
//                 (acc[q.sectionTitle] ??= []).push(q);
//                 return acc;
//               }, {})
//             ).map(([sectionTitle, qs]) => (
//               <div key={sectionTitle} className="mt-3">
//                 <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//                   {sectionTitle}
//                 </p>
//                 <div className="grid grid-cols-6 gap-1.5">
//                   {qs.map((q) => {
//                     const isCurrent = q.globalIndex === currentIndex;
//                     const isAnswered = !!answers[q.id];
//                     const isMarked = marked.has(q.id);
//                     let bg = "var(--exam-surface)";
//                     let fg = "var(--exam-ink)";
//                     let border = "var(--exam-border)";
//                     if (isAnswered) {
//                       bg = "var(--exam-primary)";
//                       fg = "#fff";
//                       border = "var(--exam-primary)";
//                     }
//                     if (isMarked) {
//                       border = "var(--exam-warning)";
//                       if (!isAnswered) {
//                         bg = "var(--exam-warning-tint)";
//                         fg = "var(--exam-warning)";
//                       }
//                     }
//                     return (
//                       <button
//                         key={q.id}
//                         onClick={() => setCurrentIndex(q.globalIndex)}
//                         className="flex aspect-square items-center justify-center rounded-[6px] border text-xs font-bold transition"
//                         style={{
//                           background: bg,
//                           color: fg,
//                           borderColor: border,
//                           outline: isCurrent ? `2px solid var(--exam-accent)` : "none",
//                           outlineOffset: "1px",
//                           fontFamily: "var(--exam-font-display)",
//                         }}
//                       >
//                         {q.globalIndex + 1}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}

//             {/* Legend */}
//             <div className="mt-4 space-y-1.5 border-t pt-3 text-xs" style={{ borderColor: "var(--exam-border)", color: "var(--exam-muted)" }}>
//               <LegendRow swatch="var(--exam-primary)" label="Answered" />
//               <LegendRow swatch="var(--exam-warning-tint)" border="var(--exam-warning)" label="Marked for review" />
//               <LegendRow swatch="var(--exam-surface)" border="var(--exam-border)" label="Not answered" />
//             </div>
//           </div>
//         </aside>
//       </div>

//       {showConfirm && (
//         <SubmitDialog
//           total={flat.length}
//           answered={answeredCount}
//           marked={marked.size}
//           submitting={submitting}
//           onCancel={() => setShowConfirm(false)}
//           onConfirm={handleSubmit}
//         />
//       )}
//     </div>
//   );
// }

// function LegendRow({ swatch, border, label }: { swatch: string; border?: string; label: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <span
//         className="h-3.5 w-3.5 rounded-[3px] border"
//         style={{ background: swatch, borderColor: border ?? swatch }}
//       />
//       {label}
//     </div>
//   );
// }

// function SubmitDialog({
//   total,
//   answered,
//   marked,
//   submitting,
//   onCancel,
//   onConfirm,
// }: {
//   total: number;
//   answered: number;
//   marked: number;
//   submitting: boolean;
//   onCancel: () => void;
//   onConfirm: () => void;
// }) {
//   const unanswered = total - answered;
//   return (
//     <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
//       <div
//         className="w-full max-w-sm rounded-[var(--exam-radius-lg)] border p-6"
//         style={{ background: "var(--exam-surface)", borderColor: "var(--exam-border)", fontFamily: "var(--exam-font-body)" }}
//       >
//         <h3 className="text-lg font-bold" style={{ fontFamily: "var(--exam-font-display)" }}>
//           Submit exam?
//         </h3>
//         <p className="mt-1 text-sm" style={{ color: "var(--exam-muted)" }}>
//           Once submitted, you won't be able to change your answers.
//         </p>

//         <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
//           <div className="rounded-[var(--exam-radius-sm)] py-2" style={{ background: "var(--exam-success-tint)" }}>
//             <dt className="text-[10px] uppercase tracking-wide" style={{ color: "var(--exam-success)" }}>Answered</dt>
//             <dd className="text-lg font-bold" style={{ color: "var(--exam-success)" }}>{answered}</dd>
//           </div>
//           <div className="rounded-[var(--exam-radius-sm)] py-2" style={{ background: unanswered > 0 ? "var(--exam-danger-tint)" : "var(--exam-bg)" }}>
//             <dt className="text-[10px] uppercase tracking-wide" style={{ color: unanswered > 0 ? "var(--exam-danger)" : "var(--exam-muted)" }}>Unanswered</dt>
//             <dd className="text-lg font-bold" style={{ color: unanswered > 0 ? "var(--exam-danger)" : "var(--exam-ink)" }}>{unanswered}</dd>
//           </div>
//         </dl>
//         {marked > 0 && (
//           <p className="mt-2 text-xs" style={{ color: "var(--exam-warning)" }}>
//             {marked} question{marked !== 1 ? "s" : ""} marked for review.
//           </p>
//         )}

//         <div className="mt-6 flex gap-3">
//           <button
//             onClick={onCancel}
//             disabled={submitting}
//             className="flex-1 rounded-[var(--exam-radius-md)] border py-2.5 text-sm font-semibold transition disabled:opacity-50"
//             style={{ borderColor: "var(--exam-border)" }}
//           >
//             Keep working
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={submitting}
//             className="flex-1 rounded-[var(--exam-radius-md)] py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
//             style={{ background: "var(--exam-primary)" }}
//           >
//             {submitting ? "Submitting…" : "Submit exam"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CenteredMessage({
//   title,
//   tone,
//   children,
// }: {
//   title: string;
//   tone?: "danger";
//   children: React.ReactNode;
// }) {
//   return (
//     <div
//       className="flex min-h-screen items-center justify-center px-6"
//       style={{ background: "var(--exam-bg)", fontFamily: "var(--exam-font-body)", color: "var(--exam-ink)" }}
//     >
//       <div
//         className="max-w-sm rounded-[var(--exam-radius-lg)] border p-6 text-center"
//         style={{ borderColor: "var(--exam-border)", background: "var(--exam-surface)", boxShadow: "var(--exam-shadow)" }}
//       >
//         <h2
//           className="text-lg font-bold"
//           style={{ fontFamily: "var(--exam-font-display)", color: tone === "danger" ? "var(--exam-danger)" : "var(--exam-ink)" }}
//         >
//           {title}
//         </h2>
//         <p className="mt-2 text-sm" style={{ color: "var(--exam-muted)" }}>
//           {children}
//         </p>
//       </div>
//     </div>
//   );
// }

// app/student/exams/[id]/attempt/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getExam,
  submitAttempt,
  ExamDetail,
  ExamQuestion,
} from "app/api/exams/student/student-exams";
import { useStudentSession } from "lib/use-student-session";

interface FlatQuestion extends ExamQuestion {
  sectionTitle: string;
  globalIndex: number;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function flattenQuestions(exam: ExamDetail): FlatQuestion[] {
  const out: FlatQuestion[] = [];
  let idx = 0;
  const sections = [...exam.sections].sort((a, b) => a.order - b.order);
  for (const section of sections) {
    for (const q of [...section.questions].sort((a, b) => a.order - b.order)) {
      out.push({ ...q, sectionTitle: section.title, globalIndex: idx++ });
    }
  }
  for (const q of [...exam.questions].sort((a, b) => a.order - b.order)) {
    out.push({ ...q, sectionTitle: "General", globalIndex: idx++ });
  }
  return out;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ExamAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useStudentSession();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startedAtRef = useRef<number>(Date.now());

  // Load exam
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getExam(id);
        if (!active) return;
        setExam(data);
        setSecondsLeft(data.duration * 60);
        startedAtRef.current = Date.now();
      } catch (e: any) {
        if (active) setLoadError(e.message || "Could not load this exam");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const flat = useMemo(() => (exam ? flattenQuestions(exam) : []), [exam]);
  const current = flat[currentIndex];

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const timeTaken = Math.round((Date.now() - startedAtRef.current) / 1000);
      const payload = {
        userId,
        timeTaken,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId,
          optionId,
        })),
      };
      const result = await submitAttempt(exam.id, payload);
      sessionStorage.setItem(
        `exam-result:${exam.id}`,
        JSON.stringify({ result, examTitle: exam.title, totalMarks: exam.totalMarks, passingMarks: exam.passingMarks })
      );
      router.replace(`/student/exams/${exam.id}/result?attemptId=${result.id}`);
    } catch (e: any) {
      setError(e.message || "Could not submit your attempt. Please try again.");
      setSubmitting(false);
    }
  }, [exam, answers, userId, router, submitting]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, handleSubmit]);

  // Warn before leaving the tab
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  if (loadError) {
    return (
      <CenteredMessage tone="danger" title="Couldn't load exam">
        {loadError}
      </CenteredMessage>
    );
  }

  if (!exam || secondsLeft === null) {
    return (
      <CenteredMessage title="Preparing your exam…">
        Loading questions and starting your timer.
      </CenteredMessage>
    );
  }

  if (flat.length === 0) {
    return (
      <CenteredMessage tone="danger" title="No questions available">
        This exam has no questions configured yet.
      </CenteredMessage>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const lowTime = secondsLeft <= 5 * 60;

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function toggleMark(questionId: string) {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117] text-slate-200 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#2d3448] bg-[#161b27] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-100">{exam.title}</p>
          <p className="text-xs text-slate-500">
            {current?.sectionTitle} · Question {currentIndex + 1} of {flat.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-semibold tabular-nums transition-colors ${
              lowTime
                ? "bg-red-950 text-red-400 border border-red-800"
                : "bg-[#173404]/70 text-[#c0dd97] border border-[#3b6d11]"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${lowTime ? "animate-pulse" : ""}`} />
            {formatTime(secondsLeft)}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] px-4 py-2 text-sm font-semibold transition-colors duration-150 active:scale-95"
          >
            Submit
          </button>
        </div>
      </header>

      {error && (
        <div className="px-4 pt-3 sm:px-6">
          <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Question */}
        <main className="flex-1">
          <div className="rounded-2xl border border-[#2d3448] bg-[#161b27] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-[#3b6d11] text-[#c0dd97]">
                  {currentIndex + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {current.points} point{current.points !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={() => toggleMark(current.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  marked.has(current.id)
                    ? "border-amber-700 text-amber-400 bg-amber-950"
                    : "border-[#2d3448] text-slate-500 hover:border-[#3b6d11] hover:text-[#c0dd97]"
                }`}
              >
                <Star
                  className="w-3.5 h-3.5"
                  fill={marked.has(current.id) ? "currentColor" : "none"}
                />
                {marked.has(current.id) ? "Marked for review" : "Mark for review"}
              </button>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-100">
              {current.question}
            </p>

            {current.questionImage && (
              <img
                src={current.questionImage}
                alt="Question illustration"
                className="mt-4 max-h-80 rounded-xl border border-[#2d3448] object-contain"
              />
            )}

            {current.codeSnippet && (
              <div className="mt-4 overflow-hidden rounded-xl bg-[#0a0c12] border border-[#2d3448]">
                {current.codeLanguage && (
                  <div className="px-4 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {current.codeLanguage}
                  </div>
                )}
                <pre className="overflow-x-auto px-4 py-3 text-sm text-slate-200 font-mono">
                  <code>{current.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Options — OMR bubble sheet style */}
            <div className="mt-6 space-y-3">
              {[...current.options]
                .sort((a, b) => a.order - b.order)
                .map((opt, i) => {
                  const selected = answers[current.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(current.id, opt.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-[#639922] bg-[#173404]/60"
                          : "border-[#2d3448] bg-[#1e2230] hover:border-[#3b6d11]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                          selected
                            ? "border-[#639922] bg-[#3b6d11] text-[#c0dd97]"
                            : "border-slate-600 text-slate-500"
                        }`}
                      >
                        {LETTERS[i] ?? i + 1}
                      </span>
                      <span className="flex-1 pt-0.5 text-sm leading-relaxed text-slate-200">
                        {opt.inputMode === "image" && opt.imageData ? (
                          <img
                            src={opt.imageData}
                            alt={`Option ${LETTERS[i] ?? i + 1}`}
                            className="max-h-40 rounded-lg border border-[#2d3448] object-contain"
                          />
                        ) : (
                          opt.text
                        )}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-[#2d3448] bg-[#161b27] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#3b6d11] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(flat.length - 1, i + 1))}
              disabled={currentIndex === flat.length - 1}
              className="flex items-center gap-1.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Navigator */}
        <aside className="w-full shrink-0 lg:w-72">
          <div className="rounded-2xl border border-[#2d3448] bg-[#161b27] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Answer sheet</h3>
              <span className="text-xs font-semibold text-[#c0dd97]">
                {answeredCount}/{flat.length}
              </span>
            </div>

            {/* Group by section */}
            {Object.entries(
              flat.reduce<Record<string, FlatQuestion[]>>((acc, q) => {
                (acc[q.sectionTitle] ??= []).push(q);
                return acc;
              }, {})
            ).map(([sectionTitle, qs]) => (
              <div key={sectionTitle} className="mt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {sectionTitle}
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {qs.map((q) => {
                    const isCurrent = q.globalIndex === currentIndex;
                    const isAnswered = !!answers[q.id];
                    const isMarked = marked.has(q.id);

                    let classes =
                      "flex aspect-square items-center justify-center rounded-md border text-xs font-bold transition ";
                    if (isAnswered) {
                      classes += "bg-[#3b6d11] text-[#c0dd97] border-[#639922] ";
                    } else if (isMarked) {
                      classes += "bg-amber-950 text-amber-400 border-amber-700 ";
                    } else {
                      classes += "bg-[#1e2230] text-slate-300 border-[#2d3448] ";
                    }
                    if (isMarked && isAnswered) {
                      classes += "ring-2 ring-amber-700 ";
                    }
                    if (isCurrent) {
                      classes += "outline outline-2 outline-offset-1 outline-[#c0dd97]";
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(q.globalIndex)}
                        className={classes}
                      >
                        {q.globalIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="mt-4 space-y-1.5 border-t border-[#2d3448] pt-3 text-xs text-slate-500">
              <LegendRow className="bg-[#3b6d11] border-[#639922]" label="Answered" />
              <LegendRow className="bg-amber-950 border-amber-700" label="Marked for review" />
              <LegendRow className="bg-[#1e2230] border-[#2d3448]" label="Not answered" />
            </div>
          </div>
        </aside>
      </div>

      {showConfirm && (
        <SubmitDialog
          total={flat.length}
          answered={answeredCount}
          marked={marked.size}
          submitting={submitting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
}

function LegendRow({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3.5 w-3.5 rounded-[3px] border ${className}`} />
      {label}
    </div>
  );
}

function SubmitDialog({
  total,
  answered,
  marked,
  submitting,
  onCancel,
  onConfirm,
}: {
  total: number;
  answered: number;
  marked: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2d3448] bg-[#161b27] p-6 font-sans">
        <h3 className="text-lg font-bold text-slate-100">Submit exam?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Once submitted, you won't be able to change your answers.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl py-2 bg-green-950 border border-green-900">
            <dt className="text-[10px] uppercase tracking-wide text-green-400">Answered</dt>
            <dd className="text-lg font-bold text-green-400">{answered}</dd>
          </div>
          <div
            className={`rounded-xl py-2 border ${
              unanswered > 0
                ? "bg-red-950 border-red-900"
                : "bg-[#1e2230] border-[#2d3448]"
            }`}
          >
            <dt
              className={`text-[10px] uppercase tracking-wide ${
                unanswered > 0 ? "text-red-400" : "text-slate-500"
              }`}
            >
              Unanswered
            </dt>
            <dd
              className={`text-lg font-bold ${
                unanswered > 0 ? "text-red-400" : "text-slate-200"
              }`}
            >
              {unanswered}
            </dd>
          </div>
        </dl>
        {marked > 0 && (
          <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" fill="currentColor" />
            {marked} question{marked !== 1 ? "s" : ""} marked for review.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl border border-[#2d3448] py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#3b6d11] disabled:opacity-50"
          >
            Keep working
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] py-2.5 text-sm font-semibold transition disabled:opacity-60"
          >
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit exam
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CenteredMessage({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "danger";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-6 font-sans text-slate-200">
      <div className="max-w-sm rounded-2xl border border-[#2d3448] bg-[#161b27] p-6 text-center shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <h2 className={`text-lg font-bold ${tone === "danger" ? "text-red-400" : "text-slate-100"}`}>
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{children}</p>
      </div>
    </div>
  );
}