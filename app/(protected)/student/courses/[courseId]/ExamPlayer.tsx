"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ExamOption {
  id: string;
  text: string;
  inputMode: "text" | "image" | "code";
  imageData?: string | null;
  isCorrect: boolean;
  order: number;
}

interface ExamQuestion {
  id: string;
  question: string;
  inputMode: "text" | "image" | "code";
  questionImage?: string | null;
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  explanation?: string | null;
  points: number;
  difficulty?: string | null;
  bloomLevel?: string | null;
  questionType?: string | null;
  order: number;
  options: ExamOption[];
}

interface ExamSection {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  difficulty?: string | null;
  totalMarks: number;
  passingMarks?: number | null;
  timeLimit?: number | null;
  questions: ExamQuestion[];
}

export interface ExamData {
  id: string;
  title: string;
  description?: string | null;
  examType: "MOCK" | "FINAL";
  totalMarks: number;
  passingMarks: number;
  duration: number; // minutes
  status: string;
  maxAttempts: number;
  showAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  startDate?: string | null;
  endDate?: string | null;
  sections: ExamSection[];
  questions: ExamQuestion[]; // flat questions (no section)
}

interface ExamAttemptResult {
  score: number;
  percentage: number;
  isPassed: boolean;
  sectionScores?: {
    sectionId: string;
    sectionTitle: string;
    score: number;
    percentage: number;
    correctlyAnswered: number;
    totalQuestions: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getAllQuestions(exam: ExamData): ExamQuestion[] {
  if (exam.sections && exam.sections.length > 0) {
    return exam.sections.flatMap((s) => s.questions ?? []);
  }
  return exam.questions ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function ExamTimer({
  totalSeconds,
  onTimeUp,
}: {
  totalSeconds: number;
  onTimeUp: () => void;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUpRef.current();
      return;
    }
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // intentionally empty — starts once

  const pct = Math.max(0, (remaining / totalSeconds) * 100);
  const isWarning = remaining < 300; // < 5 min
  const isDanger = remaining < 60;

  const color = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#639922";

  return (
    <div className="flex items-center gap-3">
      {/* circular ring */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" stroke="#2d3448" strokeWidth="4" fill="none" />
          <circle
            cx="24" cy="24" r="20"
            stroke={color}
            strokeWidth="4" fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 24 24)"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4l3 3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div>
        <p
          className="text-[18px] font-bold font-mono leading-none"
          style={{ color }}
        >
          {formatTime(remaining)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">remaining</p>
      </div>
    </div>
  );
}

// ─── Question navigator sidebar ────────────────────────────────────────────────

function QuestionNav({
  questions,
  answers,
  currentIdx,
  onJump,
  sections,
}: {
  questions: ExamQuestion[];
  answers: Record<string, string>;
  currentIdx: number;
  onJump: (idx: number) => void;
  sections: ExamSection[];
}) {
  const getSectionForQ = (qId: string) =>
    sections.find((s) => s.questions?.some((q) => q.id === qId));

  const answered = Object.keys(answers).length;
  const total = questions.length;

  return (
    <div className="w-[200px] flex-shrink-0 bg-[#161b27] border-r border-[#1e2230] flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-[#1e2230]">
        <p className="text-[11px] font-semibold text-slate-200">Questions</p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {answered}/{total} answered
        </p>
        <div className="h-1 bg-[#2d3448] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-[#639922] rounded-full transition-all duration-300"
            style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="mb-3">
              <p className="text-[10px] font-semibold text-[#639922] uppercase tracking-wide px-1 mb-1.5">
                {section.title}
              </p>
              <div className="grid grid-cols-4 gap-1">
                {(section.questions ?? []).map((q) => {
                  const globalIdx = questions.findIndex((gq) => gq.id === q.id);
                  const isAnswered = !!answers[q.id];
                  const isCurrent = globalIdx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => onJump(globalIdx)}
                      className="h-8 rounded-lg text-[11px] font-semibold transition-all duration-150"
                      style={{
                        background: isCurrent
                          ? "#639922"
                          : isAnswered
                          ? "rgba(99,153,34,0.2)"
                          : "#1e2230",
                        color: isCurrent ? "white" : isAnswered ? "#c0dd97" : "#64748b",
                        border: isCurrent ? "none" : isAnswered ? "1px solid rgba(99,153,34,0.4)" : "1px solid #2d3448",
                      }}
                    >
                      {globalIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => onJump(idx)}
                  className="h-8 rounded-lg text-[11px] font-semibold transition-all duration-150"
                  style={{
                    background: isCurrent
                      ? "#639922"
                      : isAnswered
                      ? "rgba(99,153,34,0.2)"
                      : "#1e2230",
                    color: isCurrent ? "white" : isAnswered ? "#c0dd97" : "#64748b",
                    border: isCurrent ? "none" : isAnswered ? "1px solid rgba(99,153,34,0.4)" : "1px solid #2d3448",
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-[#1e2230] space-y-1">
        {[
          { color: "#639922", label: "Current" },
          { color: "rgba(99,153,34,0.3)", label: "Answered" },
          { color: "#1e2230", label: "Not answered" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ background: item.color, border: "1px solid #2d3448" }}
            />
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Single question view ──────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
  sectionTitle,
}: {
  question: ExamQuestion;
  index: number;
  total: number;
  selected: string | null;
  onSelect: (optId: string) => void;
  sectionTitle?: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Section label */}
      {sectionTitle && (
        <p className="text-[11px] text-[#639922] font-semibold uppercase tracking-wide mb-3">
          {sectionTitle}
        </p>
      )}

      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 text-[13px] font-bold text-[#639922] bg-[#1a2a0f] px-2.5 py-1 rounded-lg">
          Q{index + 1}/{total}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {question.difficulty && (
              <span
                className="text-[10px] px-2 py-0.5 rounded font-medium"
                style={{
                  background:
                    question.difficulty === "Easy"
                      ? "rgba(99,153,34,0.15)"
                      : question.difficulty === "Medium"
                      ? "rgba(234,179,8,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color:
                    question.difficulty === "Easy"
                      ? "#c0dd97"
                      : question.difficulty === "Medium"
                      ? "#fbbf24"
                      : "#f87171",
                }}
              >
                {question.difficulty}
              </span>
            )}
            <span className="text-[10px] text-slate-500">
              {question.points} pt{question.points !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="mb-5">
        {question.inputMode === "image" && question.questionImage ? (
          <img
            src={question.questionImage}
            alt={`Question ${index + 1}`}
            className="max-w-full rounded-xl border border-[#2d3448] max-h-[280px] object-contain mb-3"
          />
        ) : (
          <p className="text-[15px] text-slate-100 font-medium leading-relaxed">
            {question.question}
          </p>
        )}

        {question.codeSnippet && (
          <pre className="mt-3 bg-[#0a0c12] border border-[#2d3448] rounded-xl p-4 text-[12px] text-slate-300 overflow-x-auto font-mono">
            {question.codeSnippet}
          </pre>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, oi) => {
          const isSelected = selected === opt.id;
          const labels = ["A", "B", "C", "D", "E", "F"];
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="w-full text-left rounded-xl border transition-all duration-200 group"
              style={{
                background: isSelected ? "rgba(99,153,34,0.1)" : "#161b27",
                borderColor: isSelected ? "#639922" : "#2d3448",
                borderWidth: "1px",
              }}
            >
              {opt.inputMode === "image" && opt.imageData ? (
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold"
                      style={{
                        background: isSelected ? "#639922" : "#1e2230",
                        color: isSelected ? "white" : "#64748b",
                      }}
                    >
                      {labels[oi] ?? oi + 1}
                    </span>
                    <img
                      src={opt.imageData}
                      alt={`Option ${labels[oi] ?? oi + 1}`}
                      className="max-h-[120px] rounded-lg object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 flex items-center gap-3">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all"
                    style={{
                      background: isSelected ? "#639922" : "#1e2230",
                      color: isSelected ? "white" : "#64748b",
                    }}
                  >
                    {labels[oi] ?? oi + 1}
                  </span>
                  <span
                    className="text-[13px] leading-snug"
                    style={{ color: isSelected ? "#c0dd97" : "#cbd5e1" }}
                  >
                    {opt.text || <span className="italic text-slate-600">No text</span>}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Results view ──────────────────────────────────────────────────────────────

function ResultsView({
  exam,
  result,
  answers,
  questions,
  onClose,
}: {
  exam: ExamData;
  result: ExamAttemptResult;
  answers: Record<string, string>;
  questions: ExamQuestion[];
  onClose: () => void;
}) {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Score hero */}
        <div
          className="rounded-2xl border p-8 text-center mb-6"
          style={{
            background: result.isPassed ? "rgba(99,153,34,0.08)" : "rgba(239,68,68,0.08)",
            borderColor: result.isPassed ? "rgba(99,153,34,0.3)" : "rgba(239,68,68,0.3)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: result.isPassed ? "rgba(99,153,34,0.15)" : "rgba(239,68,68,0.15)",
              }}
            >
              {result.isPassed ? (
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <path d="M8 20l8 8 16-16" stroke="#639922" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <path d="M12 12l16 16M28 12L12 28" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
            </div>
          </div>
          <h2
            className="text-[22px] font-bold mb-1"
            style={{ color: result.isPassed ? "#c0dd97" : "#f87171" }}
          >
            {result.isPassed ? "Congratulations!" : "Better luck next time"}
          </h2>
          <p className="text-slate-400 text-[13px] mb-5">
            {result.isPassed
              ? "You've successfully passed the mock exam."
              : `You needed ${exam.passingMarks} marks to pass.`}
          </p>

          {/* Score ring */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" stroke="#2d3448" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="54"
                  stroke={result.isPassed ? "#639922" : "#ef4444"}
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - result.percentage / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[24px] font-bold"
                  style={{ color: result.isPassed ? "#c0dd97" : "#f87171" }}
                >
                  {Math.round(result.percentage)}%
                </span>
                <span className="text-[11px] text-slate-500">score</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: "Score", value: `${result.score}/${exam.totalMarks}` },
              { label: "Passing", value: `${exam.passingMarks} marks` },
              { label: "Result", value: result.isPassed ? "Pass" : "Fail" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#161b27] rounded-xl p-3 border border-[#2d3448]">
                <p className="text-[11px] text-slate-500">{stat.label}</p>
                <p className="text-[15px] font-bold text-slate-100 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section breakdown */}
        {result.sectionScores && result.sectionScores.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[14px] font-semibold text-slate-200 mb-3">Section breakdown</h3>
            <div className="space-y-2">
              {result.sectionScores.map((ss) => (
                <div
                  key={ss.sectionId}
                  className="flex items-center gap-3 bg-[#161b27] border border-[#2d3448] rounded-xl px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-200 font-medium truncate">{ss.sectionTitle}</p>
                    <div className="h-1.5 bg-[#2d3448] rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ss.percentage}%`,
                          background: ss.percentage >= 60 ? "#639922" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold" style={{ color: ss.percentage >= 60 ? "#c0dd97" : "#f87171" }}>
                      {Math.round(ss.percentage)}%
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {ss.correctlyAnswered}/{ss.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review answers toggle */}
        {exam.showAnswers && (
          <button
            onClick={() => setShowReview((p) => !p)}
            className="w-full py-2.5 border border-[#2d3448] rounded-xl text-[13px] text-slate-300 hover:bg-[#1e2230] transition-colors mb-4"
          >
            {showReview ? "Hide answer review" : "Review answers"}
          </button>
        )}

        {showReview && (
          <div className="space-y-4 mb-6">
            {questions.map((q, idx) => {
              const selected = answers[q.id];
              const correct = q.options.find((o) => o.isCorrect);
              const selectedOpt = q.options.find((o) => o.id === selected);
              const isCorrect = selected === correct?.id;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border p-4"
                  style={{
                    background: isCorrect ? "rgba(99,153,34,0.06)" : "rgba(239,68,68,0.06)",
                    borderColor: isCorrect ? "rgba(99,153,34,0.25)" : "rgba(239,68,68,0.25)",
                  }}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-[12px] font-bold text-[#639922] bg-[#1a2a0f] px-2 py-0.5 rounded flex-shrink-0">
                      Q{idx + 1}
                    </span>
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ml-1 ${isCorrect ? "bg-[#639922]/20 text-[#c0dd97]" : "bg-red-500/20 text-red-400"}`}>
                        {isCorrect ? `+${q.points} pts` : `0/${q.points} pts`}
                      </span>
                      <p className="text-[13px] text-slate-200 mt-1">{q.question}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[12px]">
                    <p className={isCorrect ? "text-[#c0dd97]" : "text-red-400"}>
                      <span className="text-slate-500">Your answer: </span>
                      {selectedOpt?.text ?? "Not answered"}
                    </p>
                    {!isCorrect && correct && (
                      <p className="text-[#639922]">
                        <span className="text-slate-500">Correct: </span>
                        {correct.text}
                      </p>
                    )}
                    {exam.showExplanations && q.explanation && (
                      <div className="mt-2 p-2.5 bg-[#1a1f2e] rounded-lg border border-[#2d3448]">
                        <span className="text-slate-500">Explanation: </span>
                        <span className="text-slate-300">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[14px] font-semibold hover:bg-[#27500a] transition-colors"
        >
          Back to course
        </button>
      </div>
    </div>
  );
}

// ─── Confirm submit modal ──────────────────────────────────────────────────────

function ConfirmSubmitModal({
  answered,
  total,
  onConfirm,
  onCancel,
  submitting,
}: {
  answered: number;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-[16px] font-bold text-slate-100 mb-2">Submit exam?</h3>
        <p className="text-[13px] text-slate-400 mb-4">
          You have answered{" "}
          <span className="text-[#c0dd97] font-semibold">{answered}</span> of{" "}
          <span className="font-semibold text-slate-200">{total}</span> questions.
          {unanswered > 0 && (
            <span className="text-yellow-400">
              {" "}
              {unanswered} question{unanswered !== 1 ? "s" : ""} unanswered.
            </span>
          )}
        </p>
        <p className="text-[12px] text-slate-500 mb-5">
          Once submitted, you cannot change your answers.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 border border-[#2d3448] rounded-xl text-[13px] text-slate-300 hover:bg-[#1e2230] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[13px] font-semibold hover:bg-[#27500a] transition-colors"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </div>
            ) : (
              "Submit exam"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ExamPlayer Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ExamPlayer({
  exam,
  courseId,
  onClose,
}: {
  exam: ExamData;
  courseId: string;
  onClose: () => void;
}) {
  const allQuestions = getAllQuestions(exam);
  const hasSections = exam.sections && exam.sections.length > 0;

  // ── State ────────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<"intro" | "exam" | "results">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<ExamAttemptResult | null>(null);

  const currentQuestion = allQuestions[currentIdx] ?? null;
  const currentSectionTitle = hasSections
    ? exam.sections.find((s) => s.questions?.some((q) => q.id === currentQuestion?.id))?.title
    : undefined;

  const answeredCount = Object.keys(answers).length;

  // ── Submit logic ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Build answers payload: { questionId, optionId }[]
      const answersPayload = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));

      // Calculate score client-side for immediate feedback
      let score = 0;
      allQuestions.forEach((q) => {
        const selected = answers[q.id];
        const correct = q.options.find((o) => o.isCorrect);
        if (selected && selected === correct?.id) score += q.points;
      });

      const percentage = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
      const isPassed = score >= exam.passingMarks;

      // POST attempt to API
      const res = await fetch(`/api/exams/${exam.id}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId,
          answers: answersPayload,
          score,
          percentage,
          isPassed,
          timeTaken: exam.duration * 60, // approx; real time tracking optional
        }),
      });

      const json = await res.json();

      if (json.status && json.data) {
        // Use server-calculated result if available
        const serverResult: ExamAttemptResult = {
          score: json.data.score ?? score,
          percentage: json.data.percentage ?? percentage,
          isPassed: json.data.isPassed ?? isPassed,
          sectionScores: json.data.sectionScores?.map((ss: any) => ({
            sectionId: ss.sectionId,
            sectionTitle:
              exam.sections.find((s) => s.id === ss.sectionId)?.title ?? "Section",
            score: ss.score,
            percentage: ss.percentage,
            correctlyAnswered: ss.correctlyAnswered,
            totalQuestions: ss.totalQuestions,
          })),
        };
        setResult(serverResult);
      } else {
        // Fallback to client-side result
        setResult({
          score,
          percentage,
          isPassed,
          sectionScores: hasSections
            ? exam.sections.map((section) => {
                const sqs = section.questions ?? [];
                let sScore = 0;
                let correct = 0;
                sqs.forEach((q) => {
                  const sel = answers[q.id];
                  const correctOpt = q.options.find((o) => o.isCorrect);
                  if (sel && sel === correctOpt?.id) {
                    sScore += q.points;
                    correct++;
                  }
                });
                const sTotal = sqs.reduce((s, q) => s + q.points, 0);
                return {
                  sectionId: section.id,
                  sectionTitle: section.title,
                  score: sScore,
                  percentage: sTotal > 0 ? (sScore / sTotal) * 100 : 0,
                  correctlyAnswered: correct,
                  totalQuestions: sqs.length,
                };
              })
            : undefined,
        });
        if (!json.status) {
          toast.error(json.message ?? "Could not save attempt to server");
        }
      }

      setPhase("results");
      setShowConfirm(false);
    } catch (err: any) {
      console.error("Exam submit error:", err);
      toast.error("Could not submit exam. Showing local results.");
      // Still show results
      let score = 0;
      allQuestions.forEach((q) => {
        const sel = answers[q.id];
        const correct = q.options.find((o) => o.isCorrect);
        if (sel && sel === correct?.id) score += q.points;
      });
      const percentage = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
      setResult({ score, percentage, isPassed: score >= exam.passingMarks });
      setPhase("results");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }, [answers, allQuestions, exam, courseId, hasSections]);

  // Auto-submit when timer expires
  const handleTimeUp = useCallback(() => {
    toast("⏰ Time's up! Submitting your exam…", { duration: 3000 });
    handleSubmit();
  }, [handleSubmit]);

  // ── Keyboard navigation ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "exam") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIdx((p) => Math.min(p + 1, allQuestions.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIdx((p) => Math.max(p - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, allQuestions.length]);

  // ─────────────────────────────────────────────────────────────────────────────
  // INTRO SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 bg-[#0f1117] text-slate-200 flex flex-col z-50">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-4 h-14 bg-[#161b27] border-b border-[#1e2230] flex-shrink-0">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <BackIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[14px] font-semibold text-slate-100 truncate">
              {exam.examType === "MOCK" ? "Mock Exam" : "Final Exam"}
            </h1>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-[#1e2230] rounded-lg">
            <CloseIcon />
          </button>
        </div>

        {/* Intro content */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-10">
          <div className="max-w-lg w-full">
            {/* Header badge */}
            <div className="flex justify-center mb-6">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                style={{
                  background: exam.examType === "MOCK" ? "rgba(99,153,34,0.15)" : "rgba(239,68,68,0.15)",
                  color: exam.examType === "MOCK" ? "#c0dd97" : "#f87171",
                  border: `1px solid ${exam.examType === "MOCK" ? "rgba(99,153,34,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
              >
                {exam.examType === "MOCK" ? "Mock Exam" : "Final Exam"}
              </span>
            </div>

            <h2 className="text-[24px] font-bold text-slate-100 text-center mb-2">
              {exam.title}
            </h2>
            {exam.description && (
              <p className="text-[13px] text-slate-400 text-center mb-6 leading-relaxed">
                {exam.description}
              </p>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                {
                  icon: "ti-clock",
                  label: "Duration",
                  value: `${exam.duration} minutes`,
                },
                {
                  icon: "ti-list-numbers",
                  label: "Questions",
                  value: `${allQuestions.length} questions`,
                },
                {
                  icon: "ti-award",
                  label: "Total marks",
                  value: `${exam.totalMarks} marks`,
                },
                {
                  icon: "ti-target",
                  label: "Passing marks",
                  value: `${exam.passingMarks} marks`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 bg-[#161b27] border border-[#2d3448] rounded-xl p-3.5"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(99,153,34,0.12)" }}
                  >
                    <i className={`ti ${item.icon}`} style={{ color: "#639922", fontSize: 18 }} aria-hidden />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">{item.label}</p>
                    <p className="text-[13px] font-semibold text-slate-100">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sections */}
            {hasSections && (
              <div className="mb-6">
                <p className="text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Sections
                </p>
                <div className="space-y-2">
                  {exam.sections.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-[#161b27] border border-[#2d3448] rounded-xl px-4 py-2.5"
                    >
                      <div>
                        <p className="text-[13px] text-slate-200">{s.title}</p>
                        {s.difficulty && (
                          <p className="text-[10px] text-slate-500">{s.difficulty}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-semibold text-slate-300">
                          {(s.questions ?? []).length} Qs
                        </p>
                        <p className="text-[10px] text-slate-500">{s.totalMarks} marks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-4 mb-6">
              <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Instructions
              </p>
              <ul className="space-y-1.5">
                {[
                  "Once started, the timer cannot be paused.",
                  "Navigate questions using the sidebar or arrow buttons.",
                  `You can attempt this exam up to ${exam.maxAttempts} time${exam.maxAttempts !== 1 ? "s" : ""}.`,
                  exam.randomizeQuestions ? "Questions are in randomized order." : null,
                  exam.showAnswers ? "Answers will be shown after submission." : null,
                ]
                  .filter(Boolean)
                  .map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-slate-400">
                      <span className="text-[#639922] mt-0.5 flex-shrink-0">•</span>
                      {rule}
                    </li>
                  ))}
              </ul>
            </div>

            <button
              onClick={() => setPhase("exam")}
              className="w-full py-3.5 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[14px] font-bold hover:bg-[#27500a] transition-colors"
            >
              Start exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "results" && result) {
    return (
      <div className="fixed inset-0 bg-[#0f1117] text-slate-200 flex flex-col z-50">
        <div className="flex items-center gap-4 px-4 h-14 bg-[#161b27] border-b border-[#1e2230] flex-shrink-0">
          <h1 className="text-[14px] font-semibold text-slate-100 flex-1">Exam results</h1>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-[#1e2230] rounded-lg">
            <CloseIcon />
          </button>
        </div>
        <ResultsView
          exam={exam}
          result={result}
          answers={answers}
          questions={allQuestions}
          onClose={onClose}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXAM TAKING SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#0f1117] text-slate-200 flex flex-col z-50">
      {/* Confirm submit modal */}
      {showConfirm && (
        <ConfirmSubmitModal
          answered={answeredCount}
          total={allQuestions.length}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
          submitting={submitting}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 h-14 bg-[#161b27] border-b border-[#1e2230] flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-semibold text-slate-100 truncate">{exam.title}</h1>
          <p className="text-[11px] text-slate-500">
            {exam.examType === "MOCK" ? "Mock Exam" : "Final Exam"} •{" "}
            {allQuestions.length} questions • {exam.totalMarks} marks
          </p>
        </div>

        {/* Timer */}
        <ExamTimer totalSeconds={exam.duration * 60} onTimeUp={handleTimeUp} />

        {/* Submit button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[12px] font-semibold hover:bg-[#27500a] disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <i className="ti ti-send" style={{ fontSize: 14 }} aria-hidden />
          )}
          Submit
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Question navigator */}
        <QuestionNav
          questions={allQuestions}
          answers={answers}
          currentIdx={currentIdx}
          onJump={setCurrentIdx}
          sections={hasSections ? exam.sections : []}
        />

        {/* Main question area */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              index={currentIdx}
              total={allQuestions.length}
              selected={answers[currentQuestion.id] ?? null}
              onSelect={(optId) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optId }))
              }
              sectionTitle={currentSectionTitle}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              No questions
            </div>
          )}

          {/* Bottom navigation bar */}
          <div className="flex-shrink-0 px-6 py-3 bg-[#161b27] border-t border-[#1e2230] flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2 border border-[#2d3448] bg-[#0f1117] text-slate-400 rounded-xl text-[12px] hover:bg-[#1e2230] hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <BackIcon /> Previous
            </button>

            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <span className="text-slate-300 font-semibold">{currentIdx + 1}</span>
              <span>/</span>
              <span>{allQuestions.length}</span>
            </div>

            {currentIdx < allQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((p) => Math.min(p + 1, allQuestions.length - 1))}
                className="flex items-center gap-2 px-4 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[12px] font-semibold hover:bg-[#27500a] transition-colors"
              >
                Next
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[12px] font-semibold hover:bg-[#27500a] disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-send" style={{ fontSize: 13 }} aria-hidden />
                Submit exam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
