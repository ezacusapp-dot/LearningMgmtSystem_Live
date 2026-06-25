// // app/student/exams/[id]/result/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";

// interface SectionScore {
//   id: string;
//   sectionId: string;
//   sectionTitle: string;
//   score: number;
//   percentage: number;
//   isPassed: boolean | null;
//   totalQuestions: number;
//   correctlyAnswered: number;
// }

// interface StoredResult {
//   result: {
//     id: string;
//     score: number;
//     percentage: number;
//     isPassed: boolean;
//     sectionScores: SectionScore[];
//   };
//   examTitle: string;
//   totalMarks: number;
//   passingMarks: number;
// }

// export default function ExamResultPage() {
//   const { id } = useParams<{ id: string }>();
//   const search = useSearchParams();
//   const router = useRouter();
//   const attemptId = search.get("attemptId");

//   const [data, setData] = useState<StoredResult | null>(null);
//   const [missing, setMissing] = useState(false);

//   useEffect(() => {
//     const raw = sessionStorage.getItem(`exam-result:${id}`);
//     if (!raw) {
//       setMissing(true);
//       return;
//     }
//     try {
//       const parsed: StoredResult = JSON.parse(raw);
//       if (attemptId && parsed.result.id !== attemptId) {
//         // Stored result is for a different attempt; still show it as it's
//         // the most recent we have for this exam in this session.
//       }
//       setData(parsed);
//     } catch {
//       setMissing(true);
//     }
//   }, [id, attemptId]);

//   if (missing) {
//     return (
//       <Shell>
//         <Card>
//           <h1 className="text-xl font-bold" style={{ fontFamily: "var(--exam-font-display)" }}>
//             Result unavailable
//           </h1>
//           <p className="mt-2 text-sm" style={{ color: "var(--exam-muted)" }}>
//             We cloud not find this result in your current session. Your attempt was still
//             recorded — check your exam history from the exams list.
//           </p>
//           <Link
//             href="/student/exams"
//             className="mt-6 inline-block rounded-[var(--exam-radius-md)] px-5 py-2.5 text-sm font-semibold text-white"
//             style={{ background: "var(--exam-primary)" }}
//           >
//             Back to exams
//           </Link>
//         </Card>
//       </Shell>
//     );
//   }

//   if (!data) {
//     return (
//       <Shell>
//         <Card>
//           <div className="h-6 w-1/2 animate-pulse rounded bg-[var(--exam-border)]" />
//           <div className="mt-4 h-32 animate-pulse rounded bg-[var(--exam-border)]" />
//         </Card>
//       </Shell>
//     );
//   }

//   const { result, examTitle, totalMarks, passingMarks } = data;
//   const pct = Math.round(result.percentage * 10) / 10;

//   return (
//     <Shell>
//       <Card>
//         <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--exam-accent)" }}>
//           Final exam result
//         </p>
//         <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--exam-font-display)" }}>
//           {examTitle}
//         </h1>

//         {/* Hero: score + wax-seal verdict stamp */}
//         <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
//           <div>
//             <p className="text-5xl font-extrabold tabular-nums" style={{ fontFamily: "var(--exam-font-display)", color: "var(--exam-primary)" }}>
//               {result.score}
//               <span className="text-xl font-semibold" style={{ color: "var(--exam-muted)" }}> / {totalMarks}</span>
//             </p>
//             <p className="mt-1 text-sm" style={{ color: "var(--exam-muted)" }}>
//               {pct}% · pass mark {passingMarks}
//             </p>
//           </div>

//           <SealStamp passed={result.isPassed} />
//         </div>

//         {/* Score bar */}
//         <div className="mt-6">
//           <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: "var(--exam-bg)" }}>
//             <div
//               className="h-full rounded-full transition-all"
//               style={{
//                 width: `${Math.min(100, pct)}%`,
//                 background: result.isPassed ? "var(--exam-success)" : "var(--exam-danger)",
//               }}
//             />
//           </div>
//           <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//             <span>0</span>
//             <span>Pass: {Math.round((passingMarks / totalMarks) * 100)}%</span>
//             <span>100</span>
//           </div>
//         </div>

//         {/* Section breakdown */}
//         {result.sectionScores.length > 0 && (
//           <div className="mt-8">
//             <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--exam-muted)" }}>
//               Section breakdown
//             </h2>
//             <div className="mt-3 overflow-hidden rounded-[var(--exam-radius-md)] border" style={{ borderColor: "var(--exam-border)" }}>
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr style={{ background: "var(--exam-primary-tint)" }}>
//                     <th className="px-4 py-2 text-left font-semibold" style={{ color: "var(--exam-primary)" }}>Section</th>
//                     <th className="px-4 py-2 text-right font-semibold" style={{ color: "var(--exam-primary)" }}>Correct</th>
//                     <th className="px-4 py-2 text-right font-semibold" style={{ color: "var(--exam-primary)" }}>Score</th>
//                     <th className="px-4 py-2 text-right font-semibold" style={{ color: "var(--exam-primary)" }}>Result</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {result.sectionScores.map((s) => (
//                     <tr key={s.id} className="border-t" style={{ borderColor: "var(--exam-border)" }}>
//                       <td className="px-4 py-2 font-medium">{s.sectionTitle}</td>
//                       <td className="px-4 py-2 text-right">{s.correctlyAnswered}/{s.totalQuestions}</td>
//                       <td className="px-4 py-2 text-right">{s.score} ({Math.round(s.percentage)}%)</td>
//                       <td className="px-4 py-2 text-right">
//                         {s.isPassed === null ? (
//                           <span style={{ color: "var(--exam-muted)" }}>—</span>
//                         ) : s.isPassed ? (
//                           <span className="font-semibold" style={{ color: "var(--exam-success)" }}>Passed</span>
//                         ) : (
//                           <span className="font-semibold" style={{ color: "var(--exam-danger)" }}>Failed</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         <div className="mt-8 flex flex-wrap gap-3">
//           <Link
//             href="/student/exams"
//             className="rounded-[var(--exam-radius-md)] border px-5 py-2.5 text-sm font-semibold transition"
//             style={{ borderColor: "var(--exam-border)" }}
//           >
//             Back to exams
//           </Link>
//           <Link
//             href={`/student/exams/${id}`}
//             className="rounded-[var(--exam-radius-md)] px-5 py-2.5 text-sm font-semibold text-white transition"
//             style={{ background: "var(--exam-primary)" }}
//           >
//             View exam details
//           </Link>
//         </div>
//       </Card>
//     </Shell>
//   );
// }

// /** Signature element: a rotated wax-seal style stamp echoing the
//  * certificate "seal" branding used elsewhere in the platform. */
// function SealStamp({ passed }: { passed: boolean }) {
//   const color = passed ? "var(--exam-success)" : "var(--exam-danger)";
//   return (
//     <div
//       className="flex h-28 w-28 shrink-0 rotate-[-8deg] items-center justify-center rounded-full border-[3px] text-center"
//       style={{
//         borderColor: color,
//         color,
//         borderStyle: "double",
//         fontFamily: "var(--exam-font-display)",
//       }}
//     >
//       <div>
//         <p className="text-sm font-extrabold leading-tight tracking-wide">
//           {passed ? "PASSED" : <>NOT<br />PASSED</>}
//         </p>
//         <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
//           {passed ? "✓ Cleared" : "Retake"}
//         </p>
//       </div>
//     </div>
//   );
// }

// function Shell({ children }: { children: React.ReactNode }) {
//   return (
//     <div
//       className="min-h-screen px-6 py-10"
//       style={{ background: "var(--exam-bg)", fontFamily: "var(--exam-font-body)", color: "var(--exam-ink)" }}
//     >
//       <div className="mx-auto max-w-2xl">{children}</div>
//     </div>
//   );
// }

// function Card({ children }: { children: React.ReactNode }) {
//   return (
//     <div
//       className="rounded-[var(--exam-radius-lg)] border p-8"
//       style={{ borderColor: "var(--exam-border)", background: "var(--exam-surface)", boxShadow: "var(--exam-shadow)" }}
//     >
//       {children}
//     </div>
//   );
// }
// app/student/exams/[id]/result/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  XCircle,
  CheckCircle2,
  ArrowLeft,
  FileText,
} from "lucide-react";

interface SectionScore {
  id: string;
  sectionId: string;
  sectionTitle: string;
  score: number;
  percentage: number;
  isPassed: boolean | null;
  totalQuestions: number;
  correctlyAnswered: number;
}

interface StoredResult {
  result: {
    id: string;
    score: number;
    percentage: number;
    isPassed: boolean;
    sectionScores: SectionScore[];
  };
  examTitle: string;
  totalMarks: number;
  passingMarks: number;
}

export default function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const attemptId = search.get("attemptId");

  const [data, setData] = useState<StoredResult | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`exam-result:${id}`);
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      const parsed: StoredResult = JSON.parse(raw);
      if (attemptId && parsed.result.id !== attemptId) {
        // Stored result is for a different attempt; still show it as it's
        // the most recent we have for this exam in this session.
      }
      setData(parsed);
    } catch {
      setMissing(true);
    }
  }, [id, attemptId]);

  if (missing) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-bold text-slate-100">Result unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">
            We couldn't find this result in your current session. Your
            attempt was still recorded — check your exam history from the
            exams list.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] px-5 py-2.5 text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to exams
          </Link>
        </Card>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <Card>
          <div className="h-6 w-1/2 animate-pulse rounded bg-[#2d3448]" />
          <div className="mt-4 h-32 animate-pulse rounded bg-[#2d3448]" />
        </Card>
      </Shell>
    );
  }

  const { result, examTitle, totalMarks, passingMarks } = data;
  const pct = Math.round(result.percentage * 10) / 10;

  return (
    <Shell>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c0dd97]">
          Final exam result
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-100">{examTitle}</h1>

        {/* Hero: score + verdict badge */}
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-5xl font-extrabold tabular-nums text-slate-100">
              {result.score}
              <span className="text-xl font-semibold text-slate-500"> / {totalMarks}</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {pct}% · pass mark {passingMarks}
            </p>
          </div>

          <VerdictBadge passed={result.isPassed} />
        </div>

        {/* Score bar */}
        <div className="mt-6">
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#1e2230]">
            <div
              className={`h-full rounded-full transition-all ${
                result.isPassed ? "bg-[#639922]" : "bg-red-600"
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <span>0</span>
            <span>Pass: {Math.round((passingMarks / totalMarks) * 100)}%</span>
            <span>100</span>
          </div>
        </div>

        {/* Section breakdown */}
        {result.sectionScores.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#639922]" />
              Section breakdown
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#2d3448]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#173404]/50">
                    <th className="px-4 py-2 text-left font-semibold text-[#c0dd97]">Section</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#c0dd97]">Correct</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#c0dd97]">Score</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#c0dd97]">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sectionScores.map((s) => (
                    <tr key={s.id} className="border-t border-[#2d3448]">
                      <td className="px-4 py-2 font-medium text-slate-200">{s.sectionTitle}</td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        {s.correctlyAnswered}/{s.totalQuestions}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        {s.score} ({Math.round(s.percentage)}%)
                      </td>
                      <td className="px-4 py-2 text-right">
                        {s.isPassed === null ? (
                          <span className="text-slate-500">—</span>
                        ) : s.isPassed ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                            <XCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/student/exams"
            className="flex items-center gap-1.5 rounded-xl border border-[#2d3448] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#3b6d11]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to exams
          </Link>
          <Link
            href={`/student/exams/${id}`}
            className="flex items-center gap-1.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] px-5 py-2.5 text-sm font-semibold transition"
          >
            <FileText className="w-4 h-4" />
            View exam details
          </Link>
        </div>
      </Card>
    </Shell>
  );
}

/** Verdict badge echoing the platform's status-pill styling. */
function VerdictBadge({ passed }: { passed: boolean }) {
  return (
    <div
      className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 text-center ${
        passed
          ? "border-[#639922] bg-[#173404]/60 text-[#c0dd97]"
          : "border-red-700 bg-red-950 text-red-400"
      }`}
    >
      {passed ? <Trophy className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
      <p className="text-sm font-extrabold leading-tight tracking-wide">
        {passed ? "PASSED" : "NOT PASSED"}
      </p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1117] px-6 py-10 font-sans text-slate-200">
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#2d3448] bg-[#161b27] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      {children}
    </div>
  );
}