// // app/student/exams/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   getFinalExams,
//   getMyAttempts,
//   ExamSummary,
//   ExamAttemptRecord,
// } from "app/api/exams/student/student-exams";
// import { useStudentSession } from "lib/use-student-session";

// interface Row {
//   exam: ExamSummary;
//   attempts: ExamAttemptRecord[];
// }

// function formatDate(d: string | null) {
//   if (!d) return null;
//   return new Date(d).toLocaleString(undefined, {
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
// }

// function statusFor(row: Row): {
//   label: string;
//   tone: "ready" | "locked" | "done" | "exhausted";
// } {
//   const { exam, attempts } = row;
//   const now = Date.now();
//   const best = attempts.length
//     ? attempts.reduce((a, b) => (b.score > a.score ? b : a))
//     : null;

//   if (exam.startDate && now < new Date(exam.startDate).getTime()) {
//     return { label: "Opens soon", tone: "locked" };
//   }
//   if (exam.endDate && now > new Date(exam.endDate).getTime()) {
//     return { label: "Closed", tone: "locked" };
//   }
//   if (attempts.length >= exam.maxAttempts) {
//     return {
//       label: best?.isPassed ? "Passed" : "Attempts used",
//       tone: "exhausted",
//     };
//   }
//   if (attempts.length > 0) {
//     return { label: "Retake available", tone: "done" };
//   }
//   return { label: "Not started", tone: "ready" };
// }

// export default function FinalExamsPage() {
//   const { userId, courseId } = useStudentSession();
//   const [rows, setRows] = useState<Row[] | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       try {
//         const exams = await getFinalExams({ courseId });
//         const withAttempts = await Promise.all(
//           exams.map(async (exam) => ({
//             exam,
//             attempts: await getMyAttempts(exam.id, userId).catch(() => []),
//           }))
//         );
//         if (active) setRows(withAttempts);
//       } catch (e: any) {
//         if (active) setError(e.message || "Could not load exams");
//       }
//     })();
//     return () => {
//       active = false;
//     };
//   }, [userId, courseId]);

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: "var(--exam-bg)",
//         fontFamily: "var(--exam-font-body)",
//         color: "var(--exam-ink)",
//       }}
//     >
//       <header className="border-b" style={{ borderColor: "var(--exam-border)" }}>
//         <div className="mx-auto max-w-5xl px-6 py-8">
//           <p
//             className="text-xs font-semibold uppercase tracking-[0.2em]"
//             style={{ color: "var(--exam-accent)" }}
//           >
//             Assessments
//           </p>
//           <h1
//             className="mt-1 text-3xl font-bold"
//             style={{ fontFamily: "var(--exam-font-display)" }}
//           >
//             Final Exams
//           </h1>
//           <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--exam-muted)" }}>
//             Each final exam can be attempted a limited number of times. Once you
//             start, the timer cannot be paused — make sure you have a stable
//             connection and a quiet space before you begin.
//           </p>
//         </div>
//       </header>

//       <main className="mx-auto max-w-5xl px-6 py-8">
//         {error && (
//           <div
//             className="rounded-[var(--exam-radius-md)] border px-4 py-3 text-sm"
//             style={{
//               borderColor: "var(--exam-danger)",
//               background: "var(--exam-danger-tint)",
//               color: "var(--exam-danger)",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         {!rows && !error && (
//           <div className="grid gap-4 sm:grid-cols-2">
//             {[0, 1].map((i) => (
//               <div
//                 key={i}
//                 className="h-40 animate-pulse rounded-[var(--exam-radius-lg)]"
//                 style={{ background: "var(--exam-surface)", border: "1px solid var(--exam-border)" }}
//               />
//             ))}
//           </div>
//         )}

//         {rows && rows.length === 0 && (
//           <div
//             className="rounded-[var(--exam-radius-lg)] border px-6 py-12 text-center"
//             style={{ borderColor: "var(--exam-border)", background: "var(--exam-surface)" }}
//           >
//             <p className="text-lg font-semibold">No final exams yet</p>
//             <p className="mt-1 text-sm" style={{ color: "var(--exam-muted)" }}>
//               When your course schedules a final exam, it will appear here.
//             </p>
//           </div>
//         )}

//         {rows && rows.length > 0 && (
//           <div className="grid gap-4 sm:grid-cols-2">
//             {rows.map((row) => {
//               const { exam, attempts } = row;
//               const { label, tone } = statusFor(row);
//               const toneColors: Record<string, { bg: string; fg: string }> = {
//                 ready: { bg: "var(--exam-primary-tint)", fg: "var(--exam-primary)" },
//                 locked: { bg: "var(--exam-warning-tint)", fg: "var(--exam-warning)" },
//                 done: { bg: "var(--exam-accent-tint)", fg: "var(--exam-accent)" },
//                 exhausted: { bg: "var(--exam-success-tint)", fg: "var(--exam-success)" },
//               };
//               const c = toneColors[tone];
//               const canStart = tone === "ready" || tone === "done";

//               return (
//                 <div
//                   key={exam.id}
//                   className="flex flex-col rounded-[var(--exam-radius-lg)] border p-5"
//                   style={{
//                     borderColor: "var(--exam-border)",
//                     background: "var(--exam-surface)",
//                     boxShadow: "var(--exam-shadow)",
//                   }}
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       {exam.course && (
//                         <p
//                           className="text-xs font-medium uppercase tracking-wide"
//                           style={{ color: "var(--exam-muted)" }}
//                         >
//                           {exam.course.title}
//                         </p>
//                       )}
//                       <h2
//                         className="mt-0.5 text-lg font-bold leading-snug"
//                         style={{ fontFamily: "var(--exam-font-display)" }}
//                       >
//                         {exam.title}
//                       </h2>
//                     </div>
//                     <span
//                       className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
//                       style={{ background: c.bg, color: c.fg }}
//                     >
//                       {label}
//                     </span>
//                   </div>

//                   {exam.description && (
//                     <p className="mt-2 text-sm" style={{ color: "var(--exam-muted)" }}>
//                       {exam.description}
//                     </p>
//                   )}

//                   <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
//                     <div className="rounded-[var(--exam-radius-sm)] py-2" style={{ background: "var(--exam-bg)" }}>
//                       <dt className="text-[10px] uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//                         Duration
//                       </dt>
//                       <dd className="text-sm font-semibold">{exam.duration} min</dd>
//                     </div>
//                     <div className="rounded-[var(--exam-radius-sm)] py-2" style={{ background: "var(--exam-bg)" }}>
//                       <dt className="text-[10px] uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//                         Total marks
//                       </dt>
//                       <dd className="text-sm font-semibold">{exam.totalMarks}</dd>
//                     </div>
//                     <div className="rounded-[var(--exam-radius-sm)] py-2" style={{ background: "var(--exam-bg)" }}>
//                       <dt className="text-[10px] uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//                         Attempts
//                       </dt>
//                       <dd className="text-sm font-semibold">
//                         {attempts.length}/{exam.maxAttempts}
//                       </dd>
//                     </div>
//                   </dl>

//                   {exam.endDate && (
//                     <p className="mt-3 text-xs" style={{ color: "var(--exam-muted)" }}>
//                       Closes {formatDate(exam.endDate)}
//                     </p>
//                   )}

//                   <div className="mt-auto pt-4">
//                     {canStart ? (
//                       <Link
//                         href={`/student/exams/${exam.id}`}
//                         className="block w-full rounded-[var(--exam-radius-md)] py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
//                         style={{ background: "var(--exam-primary)" }}
//                       >
//                         {attempts.length > 0 ? "Retake exam" : "View instructions & start"}
//                       </Link>
//                     ) : tone === "exhausted" ? (
//                       <Link
//                         href={`/student/exams/${exam.id}/result?attemptId=${attempts[attempts.length - 1]?.id}`}
//                         className="block w-full rounded-[var(--exam-radius-md)] border py-2.5 text-center text-sm font-semibold transition hover:bg-[var(--exam-primary-tint)]"
//                         style={{ borderColor: "var(--exam-primary)", color: "var(--exam-primary)" }}
//                       >
//                         View result
//                       </Link>
//                     ) : (
//                       <button
//                         disabled
//                         className="block w-full cursor-not-allowed rounded-[var(--exam-radius-md)] border py-2.5 text-center text-sm font-semibold"
//                         style={{ borderColor: "var(--exam-border)", color: "var(--exam-muted)" }}
//                       >
//                         Unavailable
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
// app/student/exams/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Target,
  RotateCcw,
  CalendarClock,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  getFinalExams,
  getMyAttempts,
  ExamSummary,
  ExamAttemptRecord,
} from "app/api/exams/student/student-exams";
import { useStudentSession } from "lib/use-student-session";

interface Row {
  exam: ExamSummary;
  attempts: ExamAttemptRecord[];
}

type Tone = "neutral" | "warning" | "muted" | "active" | "success" | "danger";

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusFor(row: Row): { label: string; tone: Tone } {
  const { exam, attempts } = row;
  const now = Date.now();
  const best = attempts.length
    ? attempts.reduce((a, b) => (b.score > a.score ? b : a))
    : null;

  if (exam.startDate && now < new Date(exam.startDate).getTime()) {
    return { label: "Opens soon", tone: "warning" };
  }
  if (exam.endDate && now > new Date(exam.endDate).getTime()) {
    return { label: "Closed", tone: "muted" };
  }
  if (attempts.length >= exam.maxAttempts) {
    return best?.isPassed
      ? { label: "Passed", tone: "success" }
      : { label: "Attempts used", tone: "danger" };
  }
  if (attempts.length > 0) {
    return { label: "Retake available", tone: "active" };
  }
  return { label: "Not started", tone: "neutral" };
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<Tone, string> = {
  neutral: "bg-slate-800 text-slate-400 border border-slate-600",
  warning: "bg-amber-950 text-amber-400 border border-amber-800",
  muted: "bg-slate-800/60 text-slate-500 border border-slate-700",
  active: "bg-green-950 text-green-400 border border-green-800",
  success: "bg-[#27500a] text-[#c0dd97] border border-[#639922]",
  danger: "bg-red-950 text-red-400 border border-red-800",
};

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`shrink-0 text-[11px] font-semibold px-3 py-0.5 rounded-full ${BADGE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}

// ─── Exam Card ─────────────────────────────────────────────────────────────────
function ExamCard({ row }: { row: Row }) {
  const { exam, attempts } = row;
  const { label, tone } = statusFor(row);
  const canStart = tone === "neutral" || tone === "active";
  const exhausted = tone === "success" || tone === "danger";

  return (
    <div className="group flex flex-col rounded-2xl border border-[#2d3448] bg-[#161b27] p-5 transition-all duration-200 hover:border-[#3b6d11] hover:shadow-[0_4px_24px_rgba(59,109,17,0.15)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          {exam.course && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {exam.course.title}
            </p>
          )}
          <h2 className="mt-0.5 text-[0.95rem] font-semibold leading-snug text-slate-100">
            {exam.title}
          </h2>
        </div>
        <StatusBadge label={label} tone={tone} />
      </div>

      {exam.description && (
        <p className="mt-2 text-xs text-slate-500 line-clamp-2">{exam.description}</p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-[#1e2230] py-2">
          <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
            <Clock className="h-3 w-3" /> Duration
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-slate-200">{exam.duration} min</dd>
        </div>
        <div className="rounded-lg bg-[#1e2230] py-2">
          <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
            <Target className="h-3 w-3" /> Marks
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-slate-200">{exam.totalMarks}</dd>
        </div>
        <div className="rounded-lg bg-[#1e2230] py-2">
          <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
            <RotateCcw className="h-3 w-3" /> Attempts
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-slate-200">
            {attempts.length}/{exam.maxAttempts}
          </dd>
        </div>
      </dl>

      {exam.endDate && (
        <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
          <CalendarClock className="h-3 w-3" />
          Closes {formatDate(exam.endDate)}
        </p>
      )}

      <div className="flex-1" />

      <div className="mt-4">
        {canStart ? (
          <Link
            href={`/student/exams/${exam.id}`}
            className="block w-full rounded-xl border border-[#639922] bg-[#3b6d11] py-2.5 text-center text-sm font-semibold text-[#c0dd97] transition-colors duration-150 hover:bg-[#27500a] active:scale-95"
          >
            {attempts.length > 0 ? "Retake exam" : "View instructions & start"}
          </Link>
        ) : exhausted ? (
          <Link
            href={`/student/exams/${exam.id}/result?attemptId=${attempts[attempts.length - 1]?.id}`}
            className="block w-full rounded-xl border border-[#639922] py-2.5 text-center text-sm font-semibold text-[#c0dd97] transition-colors hover:bg-[#173404]/40"
          >
            View result
          </Link>
        ) : (
          <button
            disabled
            className="block w-full cursor-not-allowed rounded-xl border border-[#2d3448] bg-[#1e2230] py-2.5 text-center text-sm font-semibold text-slate-500"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FinalExamsPage() {
  const { userId, courseId } = useStudentSession();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const exams = await getFinalExams({ courseId });
        const withAttempts = await Promise.all(
          exams.map(async (exam) => ({
            exam,
            attempts: await getMyAttempts(exam.id, userId).catch(() => []),
          }))
        );
        if (active) setRows(withAttempts);
      } catch (e: any) {
        if (active) setError(e.message || "Could not load exams");
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, courseId]);

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans">
      <header className="border-b border-[#2d3448]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#639922]">
            Assessments
          </p>
          <h1 className="mt-1 text-[1.6rem] font-semibold text-slate-100 tracking-tight">
            Final Exams
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Each final exam can be attempted a limited number of times. Once you
            start, the timer cannot be paused — make sure you have a stable
            connection and a quiet space before you begin.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!rows && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-[#2d3448] bg-[#161b27]"
              />
            ))}
          </div>
        )}

        {rows && rows.length === 0 && (
          <div className="rounded-2xl border border-[#2d3448] bg-[#161b27] px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1e2230]">
              <BookOpen className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-slate-100">No final exams yet</p>
            <p className="mt-1 text-sm text-slate-500">
              When your course schedules a final exam, it will appear here.
            </p>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {rows.map((row) => (
              <ExamCard key={row.exam.id} row={row} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}