
// app/student/exams/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Award,
  Target,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Trophy,
  Shuffle,
} from "lucide-react";
import {
  getExam,
  getMyAttempts,
  ExamDetail,
  ExamAttemptRecord,
} from "app/api/exams/student/student-exams";
import { useStudentSession } from "lib/use-student-session";

const RULES = [
  "Your question paper is generated at random when you click \u201cStart exam\u201d, so every student gets a different paper.",
  "The timer starts the moment you click \u201cStart exam\u201d and cannot be paused.",
  "Your exam is auto-submitted the instant the timer reaches zero.",
  "If you refresh the page, you will get the same paper and the same remaining time.",
  "Submitted attempts are final and count toward your attempt limit.",
];

const TYPE_LABELS: Record<string, string> = {
  Conceptual: "Conceptual",
  Prediction: "Prediction",
  Debugging: "Debugging",
  ProblemSolving: "Problem solving",
};

export default function ExamInstructionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useStudentSession();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [examData, attemptData] = await Promise.all([
          getExam(id),
          getMyAttempts(id, userId).catch(() => []),
        ]);
        if (active) {
          setExam(examData);
          setAttempts(attemptData);
        }
      } catch (e: any) {
        if (active) setError(e.message || "Could not load this exam");
      }
    })();
    return () => {
      active = false;
    };
  }, [id, userId]);

  if (error) {
    return (
      <Shell>
        <Card>
          <p className="text-sm font-semibold text-red-400">{error}</p>
        </Card>
      </Shell>
    );
  }

  if (!exam) {
    return (
      <Shell>
        <Card>
          <div className="h-6 w-1/2 animate-pulse rounded bg-[#2d3448]" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#2d3448]" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#2d3448]" />
        </Card>
      </Shell>
    );
  }

  const now = Date.now();
  const notYetOpen = exam.startDate && now < new Date(exam.startDate).getTime();
  const closed = exam.endDate && now > new Date(exam.endDate).getTime();
  const attemptsLeft = exam.maxAttempts - attempts.length;
  const noAttemptsLeft = attemptsLeft <= 0;
  const notReady = exam.blueprint.length === 0; // admin has not set the paper structure yet
  const blocked = notYetOpen || closed || noAttemptsLeft || notReady;

  return (
    <Shell>
      <Card>
        {exam.course && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c0dd97]">
            {exam.course.title}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-bold text-slate-100">{exam.title}</h1>
        {exam.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{exam.description}</p>
        )}

        {/* Key facts */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact icon={<Clock className="w-4 h-4" />} label="Duration" value={`${exam.duration} min`} />
          <Fact icon={<Award className="w-4 h-4" />} label="Total marks" value={String(exam.totalMarks)} />
          <Fact icon={<Target className="w-4 h-4" />} label="Passing marks" value={String(exam.passingMarks)} />
          <Fact
            icon={<RotateCcw className="w-4 h-4" />}
            label="Attempts left"
            value={`${Math.max(attemptsLeft, 0)} / ${exam.maxAttempts}`}
          />
        </div>

        {/* Paper structure */}
        {exam.blueprint.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-[#639922]" />
              Your paper
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Questions are picked at random for each student. The marks below are fixed.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#2d3448]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#173404]/50">
                    <th className="px-4 py-2 text-left font-semibold text-[#c0dd97]">Question type</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#c0dd97]">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.blueprint.map((b) => (
                    <tr key={b.questionType} className="border-t border-[#2d3448]">
                      <td className="px-4 py-2 font-medium text-slate-200">
                        {TYPE_LABELS[b.questionType] ?? b.questionType}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">{b.marks}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#2d3448] bg-[#1e2230]">
                    <td className="px-4 py-2 font-semibold text-slate-100">Total</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-100">
                      {exam.blueprint.reduce((s, b) => s + b.marks, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#639922]" />
            Before you begin
          </h2>
          <ul className="mt-3 space-y-2">
            {RULES.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold bg-[#173404] text-[#c0dd97] border border-[#3b6d11]">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status messages */}
        {notReady && (
          <Notice tone="warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This exam is not ready yet. Please check back later.
          </Notice>
        )}
        {notYetOpen && (
          <Notice tone="warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This exam opens on {new Date(exam.startDate!).toLocaleString()}.
          </Notice>
        )}
        {closed && (
          <Notice tone="danger">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This exam closed on {new Date(exam.endDate!).toLocaleString()}.
          </Notice>
        )}
        {!notYetOpen && !closed && noAttemptsLeft && (
          <Notice tone="danger">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You have used all {exam.maxAttempts} attempt{exam.maxAttempts > 1 ? "s" : ""} for this exam.
          </Notice>
        )}

        {/* Acknowledge + start */}
        {!blocked && (
          <label className="mt-6 flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#639922]"
            />
            <span>
              I have read the instructions above and I'm ready to begin. I understand my paper is
              generated and the timer starts immediately.
            </span>
          </label>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            {attempts.length > 0 && (
              <>
                <Trophy className="w-3.5 h-3.5 text-[#639922]" />
                Previous best: {attempts.reduce((a, b) => (b.score > a ? b.score : a), 0)} / {exam.totalMarks}
              </>
            )}
          </p>
          <button
            disabled={blocked || !acknowledged}
            onClick={() => router.push(`/student/exams/${exam.id}/attempt`)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] px-6 py-3 text-sm font-semibold transition-colors duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            <CheckCircle2 className="w-4 h-4" />
            Start exam
          </button>
        </div>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1117] px-6 py-10 text-slate-200 font-sans">
      <div className="mx-auto max-w-3xl">{children}</div>
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

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-3 text-center bg-[#1e2230]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 flex items-center justify-center gap-1">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-100">{value}</p>
    </div>
  );
}

function Notice({ tone, children }: { tone: "warning" | "danger"; children: React.ReactNode }) {
  const styles =
    tone === "warning"
      ? "bg-amber-950 text-amber-400 border border-amber-800"
      : "bg-red-950 text-red-400 border border-red-800";
  return (
    <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${styles}`}>
      {children}
    </div>
  );
}