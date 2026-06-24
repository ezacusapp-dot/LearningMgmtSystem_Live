"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { type ExamData } from "./ExamPlayer";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LessonItem {
  id: string;
  title: string;
  duration: string;
  type: "video" | "doc" | "quiz";
  fileUrl?: string | null;
  completed: boolean;
  active: boolean;
  quizId?: string | null;
  questions?: QuizQuestion[];
  passingMarks?: number;
  totalMarks?: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  inputMode?: string;
  questionImage?: string;
  codeSnippet?: string;
  explanation?: string;
  points?: number;
  options?: QuizOption[];
}

interface QuizOption {
  id: string;
  text?: string;
  inputMode?: string;
  imageData?: string;
  isCorrect?: boolean;
  order?: number;
}

interface Section {
  id: number;
  moduleId: string;
  title: string;
  type: string;
  lessons: number;
  duration: string;
  completed: boolean;
  open: boolean;
  items: LessonItem[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  author: string;
  authorTitle: string;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  progress: number;
  thumbnail: string | null;
  category: string;
  sections: Section[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function PlayCircleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#639922" strokeWidth="1.5" />
      <polygon points="8,7 14,10 8,13" fill="#639922" />
    </svg>
  );
}

function DocIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="2" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function QuizIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#fbbf24" strokeWidth="1.5" />
      <path d="M10 6v5M10 13v1" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExamClockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4v4l3 3"
        stroke="#639922"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMini() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <polygon points="5,3 17,10 5,17" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5v10M16 5L8 10l8 5V5z" strokeLinejoin="round" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 5v10M4 5l8 5-8 5V5z" strokeLinejoin="round" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8v4h3l4 4V4L6 8H3z" strokeLinejoin="round" />
      <path d="M14 6a4 4 0 0 1 0 8" strokeLinecap="round" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16h12" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox Component
// ─────────────────────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      style={{
        width: 17,
        height: 17,
        borderRadius: 4,
        border: checked ? "none" : "1.5px solid #4a5568",
        background: checked ? "#639922" : "transparent",
      }}
    >
      {checked && <CheckMini />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Progress Component
// ─────────────────────────────────────────────────────────────────────────────

function ModuleProgress({
  section,
  completedIds,
}: {
  section: Section;
  completedIds: Set<string>;
}) {
  const total = section.items.length;
  const done = section.items.filter((i) => completedIds.has(i.id)).length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="h-[3px] rounded-full overflow-hidden mt-1.5" style={{ background: "#1e2230" }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: "#639922" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Mock Exam Entry Component
// ─────────────────────────────────────────────────────────────────────────────

function SidebarMockExamEntry({
  exam,
  onStart,
}: {
  exam: ExamData;
  onStart: () => void;
}) {
  const allQCount =
    exam.sections?.length > 0
      ? exam.sections.reduce((s, sec) => s + (sec.questions?.length ?? 0), 0)
      : exam.questions?.length ?? 0;

  return (
    <div
      onClick={onStart}
      className="flex items-start gap-[10px] px-4 py-[11px] cursor-pointer transition-all duration-150"
      style={{
        borderLeft: "3px solid #639922",
        background: "linear-gradient(90deg, rgba(99,153,34,0.09) 0%, rgba(99,153,34,0.02) 100%)",
        borderTop: "1px solid rgba(99,153,34,0.18)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          "linear-gradient(90deg, rgba(99,153,34,0.16) 0%, rgba(99,153,34,0.05) 100%)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          "linear-gradient(90deg, rgba(99,153,34,0.09) 0%, rgba(99,153,34,0.02) 100%)";
      }}
    >
      {/* Clock icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
        style={{ width: 28, height: 28, background: "rgba(99,153,34,0.18)" }}
      >
        <ExamClockIcon size={15} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#639922] uppercase tracking-wide mb-[2px]">
          Mock Exam
        </p>
        <p className="text-[12.5px] font-semibold text-[#c0dd97] leading-snug truncate">
          {exam.title}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-[5px]">
          <span className="text-[10.5px] text-slate-400">⏱ {exam.duration} min</span>
          <span className="text-[10.5px] text-slate-400">📝 {allQCount} Q</span>
          <span className="text-[10.5px] text-slate-400">🎯 Pass {exam.passingMarks}</span>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="flex-shrink-0 flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] text-[11px] font-bold text-[#c0dd97] self-center transition-colors hover:bg-[#27500a]"
        style={{ background: "#3b6d11", border: "1px solid #639922" }}
      >
        <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor">
          <polygon points="5,3 17,10 5,17" />
        </svg>
        Start
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Module Component
// ─────────────────────────────────────────────────────────────────────────────

function SidebarModule({
  section,
  activeLesson,
  completedIds,
  onSelect,
  onToggleComplete,
  isLastModule,
  mockExam,
  onStartExam,
}: {
  section: Section;
  activeLesson: LessonItem | null;
  completedIds: Set<string>;
  onSelect: (item: LessonItem) => void;
  onToggleComplete: (id: string, val: boolean) => void;
  isLastModule?: boolean;
  mockExam?: ExamData;
  onStartExam?: () => void;
}) {
  const [open, setOpen] = useState<boolean>(section.open ?? false);
  const done = section.items.filter((i) => completedIds.has(i.id)).length;

  return (
    <div className="border-b border-[#1e2230]">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex flex-col gap-1 px-4 py-[11px] text-left hover:bg-[#1a1f2e] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[#7c6fa0] bg-[#1e2230] px-1.5 py-0.5 rounded flex-shrink-0">
              {section.id < 10 ? `0${section.id}` : section.id}
            </span>
            <span className="text-[13px] font-semibold text-slate-200 truncate">
              {section.title}
            </span>
          </div>
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-500 flex-shrink-0 ml-2 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {section.items.length} items • {section.duration}
          </span>
          <span className="text-[11px]" style={{ color: done > 0 ? "#639922" : "#64748b" }}>
            {done}/{section.items.length}
          </span>
        </div>
        <ModuleProgress section={section} completedIds={completedIds} />
      </button>

      {open && (
        <div style={{ background: "#0d1018" }}>
          {section.items.map((item) => {
            const isActive = activeLesson?.id === item.id;
            const isComp = completedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex items-start gap-[10px] px-4 py-[9px] cursor-pointer transition-colors"
                style={{
                  borderLeft: `3px solid ${isActive ? "#639922" : "transparent"}`,
                  background: isActive ? "#0f1e06" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#13192a";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isComp}
                    onChange={(v) => onToggleComplete(item.id, v)}
                    disabled={isComp}
                  />
                </div>

                <div className="mt-0.5 flex-shrink-0">
                  {item.type === "video" ? (
                    <PlayCircleIcon size={15} />
                  ) : item.type === "quiz" ? (
                    <QuizIcon size={15} />
                  ) : (
                    <DocIcon size={15} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[12.5px] leading-snug"
                    style={{
                      color: isActive ? "#c0dd97" : isComp ? "#64748b" : "#cbd5e1",
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: isComp && !isActive ? "line-through" : "none",
                    }}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-[#475569]">{item.duration}</span>
                    {item.type === "quiz" && (
                      <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                        Quiz
                      </span>
                    )}
                    {item.type === "doc" && (
                      <span className="text-[10px] text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded">
                        PDF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Mock Exam entry — only appended to the last module */}
          {isLastModule && mockExam && onStartExam && (
            <SidebarMockExamEntry exam={mockExam} onStart={onStartExam} />
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz View Component
// ─────────────────────────────────────────────────────────────────────────────

function QuizView({
  lesson,
  quizAttempt,
  onQuizComplete,
  onSubmitQuiz,
}: {
  lesson: LessonItem;
  quizAttempt?: { score: number; isPassed: boolean };
  onQuizComplete?: (passed: boolean) => void;
  onSubmitQuiz?: (
    quizId: string,
    score: number,
    passed: boolean,
    answers: Record<string, string>
  ) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(!!quizAttempt);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const questions = lesson.questions ?? [];
  const getQuestionPoints = (q: QuizQuestion) => q.points || 1;
  const totalPossible = questions.reduce((sum, q) => sum + getQuestionPoints(q), 0);

  const calculateScoreAndDetails = () => {
    let totalScore = 0;
    const results = questions.map((q) => {
      const userAnswerId = answers[q.id];
      const correctOption = q.options?.find((o) => o.isCorrect);
      const isCorrect = userAnswerId === correctOption?.id;
      const pointsEarned = isCorrect ? getQuestionPoints(q) : 0;
      totalScore += pointsEarned;
      return {
        questionId: q.id,
        question: q.question,
        userAnswerId,
        userAnswerText:
          q.options?.find((o) => o.id === userAnswerId)?.text || "Not answered",
        correctAnswerText: correctOption?.text || "N/A",
        isCorrect,
        pointsEarned,
        pointsPossible: getQuestionPoints(q),
        explanation: q.explanation,
        questionImage: q.questionImage,
        codeSnippet: q.codeSnippet,
      };
    });
    return { totalScore, results };
  };

  const handleSubmit = async () => {
    const { totalScore } = calculateScoreAndDetails();
    const percentage = (totalScore / totalPossible) * 100;
    const passedQuiz = percentage >= (lesson.passingMarks || 0);
    setSubmitting(true);
    if (onSubmitQuiz && lesson.quizId) {
      await onSubmitQuiz(lesson.quizId, totalScore, passedQuiz, answers);
    }
    setSubmitted(true);
    setShowResults(true);
    setSubmitting(false);
    if (onQuizComplete) onQuizComplete(passedQuiz);
  };

  // Already attempted — show score summary first
  if (quizAttempt && submitted && !showResults) {
    const percentage = (quizAttempt.score / totalPossible) * 100;
    return (
      <div className="mx-6 mb-6">
        <div className="bg-[#161b27] border border-[#2d3448] rounded-2xl p-6">
          <div className="text-center py-8">
            <div
              className={`text-[3rem] font-bold mb-2 ${
                quizAttempt.isPassed ? "text-[#639922]" : "text-red-400"
              }`}
            >
              {quizAttempt.score}/{totalPossible}
            </div>
            <p
              className={`text-[14px] font-semibold ${
                quizAttempt.isPassed ? "text-[#c0dd97]" : "text-red-400"
              }`}
            >
              {quizAttempt.isPassed ? "🎉 Passed!" : "Quiz Already Attempted"}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Score: {Math.round(percentage)}% | Passing: {lesson.passingMarks}%
            </p>
            <button
              onClick={() => setShowResults(true)}
              className="mt-4 px-5 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[13px] font-semibold hover:bg-[#27500a] transition-colors"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (submitted && showResults) {
    const { totalScore, results } = calculateScoreAndDetails();
    const percentage = (totalScore / totalPossible) * 100;
    const passed = percentage >= (lesson.passingMarks || 0);

    return (
      <div className="mx-6 mb-6">
        <div className="bg-[#161b27] border border-[#2d3448] rounded-2xl p-6">
          <div className="text-center py-6 border-b border-[#2d3448] mb-6">
            <div
              className={`text-[3rem] font-bold mb-2 ${
                passed ? "text-[#639922]" : "text-red-400"
              }`}
            >
              {totalScore}/{totalPossible}
            </div>
            <p
              className={`text-[16px] font-semibold ${
                passed ? "text-[#c0dd97]" : "text-red-400"
              }`}
            >
              {passed ? "🎉 Congratulations! You Passed!" : "📝 Quiz Submitted"}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Score: {Math.round(percentage)}% | Passing Score: {lesson.passingMarks}%
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {passed
                ? "Great job! You've earned credit for this quiz."
                : "Review the answers below to learn more."}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[15px] font-semibold text-slate-200 flex items-center gap-2">
              <span>📋 Answer Review</span>
              <span className="text-xs text-slate-500 font-normal">
                ({results.filter((r) => r.isCorrect).length}/{results.length} correct)
              </span>
            </h4>

            {results.map((result, idx) => (
              <div
                key={result.questionId}
                className={`border-l-4 pl-4 py-3 ${
                  result.isCorrect ? "border-[#639922]" : "border-red-500"
                } bg-[#0f1117] rounded-r-lg`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#639922] text-[13px] font-medium">
                        Question {idx + 1}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          result.isCorrect
                            ? "bg-[#639922]/20 text-[#c0dd97]"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {result.isCorrect
                          ? `+${result.pointsEarned} pts`
                          : `0/${result.pointsPossible} pts`}
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-200 font-medium">{result.question}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {result.isCorrect ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#639922" />
                        <path
                          d="M6 10l3 3 5-5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#ef4444" />
                        <path
                          d="M7 7l6 6M13 7L7 13"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {result.questionImage && (
                  <div className="mt-2 mb-3">
                    <img
                      src={result.questionImage}
                      alt={`Question ${idx + 1}`}
                      className="max-w-full rounded-lg border border-[#2d3448] max-h-[200px] object-contain"
                    />
                  </div>
                )}

                {result.codeSnippet && (
                  <pre className="bg-[#0a0c12] border border-[#2d3448] rounded-lg p-3 mb-3 text-[11px] text-slate-300 overflow-x-auto">
                    {result.codeSnippet}
                  </pre>
                )}

                <div className="space-y-2 mt-2 text-[13px]">
                  <div className={result.isCorrect ? "text-[#c0dd97]" : "text-red-400"}>
                    <span className="text-slate-500">Your answer: </span>
                    {result.userAnswerText}
                  </div>
                  {!result.isCorrect && (
                    <div className="text-[#639922]">
                      <span className="text-slate-500">Correct answer: </span>
                      {result.correctAnswerText}
                    </div>
                  )}
                  {result.explanation && (
                    <div className="mt-3 p-3 bg-[#1a1f2e] rounded-lg border border-[#2d3448]">
                      <div className="flex items-start gap-2">
                        <span className="text-[#639922] text-sm">💡</span>
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                            Explanation
                          </p>
                          <p className="text-[12px] text-slate-300 leading-relaxed">
                            {result.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d3448] text-center">
            <p className="text-slate-500 text-xs">
              ⚠️ Only one attempt is allowed per quiz. Your score has been recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Quiz form
  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount === questions.length;

  return (
    <div className="mx-6 mb-6">
      <div className="bg-[#161b27] border border-[#2d3448] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2d3448]">
          <div>
            <h3 className="text-[16px] font-bold text-slate-100">{lesson.title}</h3>
            <p className="text-[12px] text-slate-500 mt-1">Test your knowledge</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-3 text-[12px] text-slate-400">
              <span>{questions.length} questions</span>
              <span>•</span>
              <span>Total: {totalPossible} points</span>
              <span>•</span>
              <span>Passing: {lesson.passingMarks}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-[#2d3448] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#639922] rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
            <span className="text-[11px] text-yellow-500/80 flex items-center gap-1">
              <span>⚠️</span> One attempt only
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((q, qi) => (
            <div key={q.id} className="border border-[#2d3448] rounded-xl p-4 bg-[#0f1117]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#639922] text-[13px] font-bold bg-[#1a2a0f] px-2 py-0.5 rounded">
                    Q{qi + 1}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {getQuestionPoints(q)} point{getQuestionPoints(q) !== 1 ? "s" : ""}
                  </span>
                </div>
                {answers[q.id] && (
                  <span className="text-[11px] text-[#639922]">✓ Answered</span>
                )}
              </div>

              <div className="mb-3">
                {q.inputMode === "image" && q.questionImage ? (
                  <div className="mt-2">
                    <img
                      src={q.questionImage}
                      alt={`Question ${qi + 1}`}
                      className="max-w-full rounded-lg border border-[#2d3448] bg-[#0f1117] max-h-[300px] object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-[14px] text-slate-200 font-medium">{q.question}</span>
                )}
              </div>

              {q.codeSnippet && (
                <pre className="bg-[#0a0c12] border border-[#2d3448] rounded-lg p-3 mb-3 text-[11px] text-slate-300 overflow-x-auto">
                  {q.codeSnippet}
                </pre>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {(q.options ?? []).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-[13px] transition-all duration-200 ${
                      answers[q.id] === opt.id
                        ? "border-[#639922] bg-[#1a2a0f] text-[#c0dd97] shadow-sm"
                        : "border-[#2d3448] bg-[#0f1117] text-slate-300 hover:border-[#3a4460] hover:bg-[#1a1f2e]"
                    }`}
                  >
                    {opt.inputMode === "image" && opt.imageData ? (
                      <img
                        src={opt.imageData}
                        alt={`Option ${opt.order}`}
                        className="max-h-[120px] w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border ${
                            answers[q.id] === opt.id
                              ? "border-[#639922] bg-[#639922]/20"
                              : "border-slate-600"
                          } flex items-center justify-center`}
                        >
                          {answers[q.id] === opt.id && (
                            <div className="w-2 h-2 rounded-full bg-[#639922]" />
                          )}
                        </span>
                        <span>
                          {opt.text || (
                            <span className="text-slate-600 italic">No option text</span>
                          )}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
              canSubmit && !submitting
                ? "bg-[#3b6d11] border border-[#639922] text-[#c0dd97] hover:bg-[#27500a] cursor-pointer"
                : "bg-[#1e2230] border border-[#2d3448] text-slate-500 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </div>
            ) : !canSubmit ? (
              `Answer all questions to submit (${answeredCount}/${questions.length} completed)`
            ) : (
              "Submit Quiz & View Results"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Player Component
// ─────────────────────────────────────────────────────────────────────────────

function VideoPlayer({
  lesson,
  isPlaying,
  onTogglePlay,
}: {
  lesson: LessonItem | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  if (lesson?.fileUrl && isPlaying) {
    const url = lesson.fileUrl;

    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) {
      return (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }

    const vimeoMatch =
      url.match(/(?:vimeo\.com\/)(\d+)(?:\?.*)?$/) ||
      url.match(/(?:player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch) {
      return (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&badge=0&byline=0&portrait=0&title=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      );
    }

    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <video
            src={url}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full bg-black"
          />
        </div>
      );
    }
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ aspectRatio: "16/9", background: "#000" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(99,153,34,0.08) 0%, transparent 70%)",
        }}
      />
      {!isPlaying ? (
        <button
          onClick={onTogglePlay}
          className="relative z-10 flex flex-col items-center gap-3 group"
        >
          <div className="w-16 h-16 rounded-full bg-[#639922] flex items-center justify-center shadow-lg group-hover:bg-[#3b6d11] transition-colors active:scale-95">
            <PlayIcon />
          </div>
          <p className="text-[11px] text-slate-400">{lesson?.title}</p>
        </button>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-[#639922] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#639922">
              <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-400">Playing: {lesson?.title}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Viewer Component
// ─────────────────────────────────────────────────────────────────────────────

function PDFView({ lesson, onClose }: { lesson: LessonItem; onClose?: () => void }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const raw = lesson.fileUrl;

  if (!raw) {
    return (
      <div className="bg-[#161b27] border border-[#2d3448] rounded-2xl p-12 text-center">
        <DocIcon size={40} />
        <p className="text-slate-400 text-sm mt-4">No document available</p>
      </div>
    );
  }

  const dataUrl = raw.startsWith("data:")
    ? raw
    : raw.startsWith("http") || raw.startsWith("/")
    ? raw
    : `data:application/pdf;base64,${raw}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${lesson.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f1117] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b27] border-b border-[#2d3448]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M8 3v3H5M12 3v3h3M8 17v-3H5M12 17v-3h3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="text-sm text-slate-300 font-medium truncate max-w-md">
              {lesson.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-lg text-[12px] font-semibold hover:bg-[#27500a] transition-colors"
            >
              <DownloadIcon /> Download PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1e2230] transition-colors"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 bg-[#0a0c12]">
          <object data={dataUrl} type="application/pdf" className="w-full h-full" title={lesson.title}>
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <DocIcon size={48} />
              <p className="text-slate-400 text-sm text-center px-6">
                Your browser cannot display this PDF inline.
              </p>
              <button
                onClick={handleDownload}
                className="px-5 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[13px] font-semibold hover:bg-[#27500a] transition-colors"
              >
                Download PDF
              </button>
            </div>
          </object>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <DocIcon size={16} />
          <span className="text-[12px] text-slate-400">{lesson.title}.pdf</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2230] border border-[#2d3448] text-slate-300 rounded-lg text-[11px] font-medium hover:bg-[#2a2f42] transition-colors"
          >
            <FullscreenIcon /> Full Screen
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-lg text-[11px] font-semibold hover:bg-[#27500a] transition-colors"
          >
            <DownloadIcon /> Download
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden border border-[#2d3448] bg-[#0a0c12]"
        style={{ height: 600 }}
      >
        <object data={dataUrl} type="application/pdf" className="w-full h-full" title={lesson.title}>
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <DocIcon size={48} />
            <p className="text-slate-400 text-sm text-center px-6">
              Your browser cannot display this PDF inline.
            </p>
            <button
              onClick={handleDownload}
              className="px-5 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[13px] font-semibold hover:bg-[#27500a] transition-colors"
            >
              Download PDF
            </button>
          </div>
        </object>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CoursePlayer Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CoursePlayer({
  courseData,
  mockExam,
  onStartExam,
  onClose,
}: {
  courseData: CourseData;
  mockExam?: ExamData;
  onStartExam?: () => void;
  onClose: () => void;
}) {
  const course = courseData;

  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [quizAttempts, setQuizAttempts] = useState<
    Map<string, { score: number; isPassed: boolean }>
  >(new Map());
  const [loading, setLoading] = useState(true);

  const allLessons: LessonItem[] = (course.sections ?? []).flatMap((s) => s.items);
  const defaultLesson = allLessons.find((i) => i.active) ?? allLessons[0] ?? null;

  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(defaultLesson);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"Overview" | "Attachment" | "Notes" | "Rating">(
    "Overview"
  );

  const currentIdx = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const completedCount = completedIds.size;
  const progress =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const isCurrentLessonCompleted = !!activeLesson && completedIds.has(activeLesson.id);

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/courses/progress?courseId=${course.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.status && json.data) {
        setCompletedIds(new Set(json.data.completedLessonIds || []));

        const attempts = new Map<string, { score: number; isPassed: boolean }>();
        json.data.quizAttempts?.forEach((attempt: any) => {
          attempts.set(attempt.quizId, { score: attempt.score, isPassed: attempt.isPassed });
        });
        setQuizAttempts(attempts);

        if (json.data.enrollment) {
          setEnrollmentStatus(json.data.enrollment.status);
          if (json.data.enrollment.status === "Pending") {
            await startCourse();
          }
        }
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
      toast.error("Failed to load your progress");
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: course.id, action: "start" }),
      });
      setEnrollmentStatus("InProcess");
      toast.success("Course started! Good luck with your learning.");
    } catch (error) {
      console.error("Failed to start course:", error);
    }
  };

  const toggleComplete = async (id: string, val: boolean) => {
    if (!val && completedIds.has(id)) {
      toast.error("Cannot unmark a completed lesson");
      return;
    }
    if (val && !completedIds.has(id)) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/courses/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId: course.id, lessonId: id, action: "complete_lesson" }),
        });
        const json = await res.json();
        if (json.status) {
          setCompletedIds((prev) => new Set(prev).add(id));
          toast.success("Lesson completed! 🎉");
          if (json.progress?.courseCompleted) {
            setEnrollmentStatus("Complete");
            toast.success("Congratulations! You've completed the course! 🎓");
          }
        } else {
          toast.error(json.message || "Failed to complete lesson");
        }
      } catch (error) {
        console.error("Failed to complete lesson:", error);
        toast.error("Could not mark lesson as complete");
      }
    }
  };

  const handleQuizSubmit = async (
    quizId: string,
    score: number,
    passed: boolean,
    answers: Record<string, string>
  ) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseId: course.id,
          quizId,
          score,
          passed,
          answers,
          action: "submit_quiz",
        }),
      });
      const json = await res.json();
      if (json.status) {
        setQuizAttempts((prev) => new Map(prev).set(quizId, { score, isPassed: passed }));
        toast.success(json.message);
        if (passed && activeLesson && activeLesson.quizId === quizId) {
          await toggleComplete(activeLesson.id, true);
        }
      } else {
        toast.error(json.message || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Could not submit quiz");
    }
  };

  const selectLesson = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setIsPlaying(false);
  };

  const goTo = (lesson: LessonItem | null) => {
    if (!lesson) return;
    setActiveLesson(lesson);
    setIsPlaying(false);
  };

  const activeSection = course.sections.find((s) =>
    s.items.some((i) => i.id === activeLesson?.id)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0f1117] text-slate-200 flex flex-col z-50 font-sans">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 h-14 bg-[#161b27] border-b border-[#1e2230] flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <BackIcon />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-semibold text-slate-100 truncate">{course.title}</h1>
          <p className="text-[11px] text-slate-500">
            {completedCount} of {allLessons.length} lessons completed
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:block text-[12px] text-slate-400">Progress</span>
          <div className="relative w-[44px] h-[44px]">
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" stroke="#2d3448" strokeWidth="4" fill="none" />
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="#639922"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
              />
              <text
                x="22"
                y="26"
                textAnchor="middle"
                fill="#c0dd97"
                fontSize="9"
                fontWeight="700"
              >
                {progress}%
              </text>
            </svg>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-200 hover:bg-[#1e2230] rounded-lg transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="w-[290px] flex-shrink-0 bg-[#161b27] border-r border-[#1e2230] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2230]">
              <span className="text-[13px] font-semibold text-slate-200">Course Content</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 px-4 py-3 border-b border-[#1e2230]">
              <div className="text-center">
                <p className="text-[18px] font-bold text-slate-100">{allLessons.length}</p>
                <p className="text-[10px] text-slate-500">Items</p>
              </div>
              <div className="w-px h-7 bg-[#2d3448]" />
              <div className="text-center">
                <p className="text-[18px] font-bold text-[#639922]">{course.duration}</p>
                <p className="text-[10px] text-slate-500">Duration</p>
              </div>
              <div className="w-px h-7 bg-[#2d3448]" />
              <div className="text-center">
                <p className="text-[18px] font-bold text-slate-100">{progress}%</p>
                <p className="text-[10px] text-slate-500">Done</p>
              </div>
            </div>

            {/* Modules list */}
            <div className="flex-1 overflow-y-auto">
              {course.sections.map((section, idx) => (
                <SidebarModule
                  key={section.moduleId}
                  section={section}
                  activeLesson={activeLesson}
                  completedIds={completedIds}
                  onSelect={selectLesson}
                  onToggleComplete={toggleComplete}
                  isLastModule={idx === course.sections.length - 1}
                  mockExam={mockExam}
                  onStartExam={onStartExam}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
          {/* Sidebar re-open toggle */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-0 top-20 z-10 bg-[#1e2230] border border-[#2d3448] text-slate-400 hover:text-slate-200 p-2 rounded-r-lg transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 5l5 5-5 5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Breadcrumb */}
          {activeSection && (
            <div className="px-6 pt-4 pb-1 flex items-center gap-2 text-[12px] text-slate-500 flex-shrink-0">
              <span>{activeSection.title}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 2l4 4-4 4" />
              </svg>
              <span className="text-slate-300 font-medium truncate">{activeLesson?.title}</span>
            </div>
          )}

          {/* Title row */}
          <div className="px-6 pb-3 pt-1 flex-shrink-0 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[1.25rem] font-bold text-slate-100 leading-tight truncate">
                {activeLesson?.title || "Select a Lesson"}
              </h2>
              {course.category && (
                <p className="text-[12px] text-slate-500 mt-0.5">{course.category}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCurrentLessonCompleted && (
                <span className="flex items-center gap-1.5 text-[12px] text-[#c0dd97] bg-[#1a2a0f] border border-[#639922]/30 px-3 py-1 rounded-full">
                  <CheckMini /> Completed
                </span>
              )}
              <span className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v4l3 3" strokeLinecap="round" />
                </svg>
                Complete lesson to track progress
              </span>
            </div>
          </div>

          {/* ── Lesson Content ────────────────────────────────────────────── */}
          {activeLesson?.type === "quiz" ? (
            <QuizView
              lesson={activeLesson}
              quizAttempt={
                activeLesson.quizId ? quizAttempts.get(activeLesson.quizId) : undefined
              }
              onSubmitQuiz={handleQuizSubmit}
              onQuizComplete={(passed) => {
                if (passed && activeLesson.quizId) toggleComplete(activeLesson.id, true);
              }}
            />
          ) : activeLesson?.type === "doc" ? (
            <div className="mx-6 mb-6">
              <PDFView lesson={activeLesson} />
            </div>
          ) : (
            <div className="mx-6 mb-4 rounded-2xl overflow-hidden bg-[#161b27] border border-[#2d3448] flex-shrink-0">
              <VideoPlayer
                lesson={activeLesson}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
              />
              <div className="bg-[#161b27] px-4 py-3">
                <div className="h-1 bg-[#2d3448] rounded-full mb-3 overflow-hidden cursor-pointer">
                  <div className="h-full bg-[#639922] rounded-full" style={{ width: "0%" }} />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
                      </svg>
                    ) : (
                      <PlayIcon />
                    )}
                  </button>
                  <button
                    onClick={() => goTo(prevLesson)}
                    disabled={!prevLesson}
                    className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <PrevIcon />
                  </button>
                  <button
                    onClick={() => goTo(nextLesson)}
                    disabled={!nextLesson}
                    className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <NextIcon />
                  </button>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <VolumeIcon />
                  </button>
                  <span className="text-[12px] text-slate-400 ml-1">
                    — / {activeLesson?.duration || "—"}
                  </span>
                  <div className="flex-1" />
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <FullscreenIcon />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation Row ────────────────────────────────────────────── */}
          <div className="mx-6 mb-5 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              onClick={() => goTo(prevLesson)}
              disabled={!prevLesson}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2d3448] bg-[#161b27] text-slate-400 text-[13px] font-medium hover:bg-[#1e2230] hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <BackIcon /> Previous
            </button>

            <div
              onClick={() => {
                if (!isCurrentLessonCompleted && activeLesson && activeLesson.type !== "quiz") {
                  toggleComplete(activeLesson.id, true);
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                isCurrentLessonCompleted || activeLesson?.type === "quiz"
                  ? "cursor-default opacity-75"
                  : "cursor-pointer hover:bg-[#1a2a0f]"
              }`}
              style={{
                background: isCurrentLessonCompleted ? "rgba(99,153,34,0.12)" : "#161b27",
                border: `1px solid ${isCurrentLessonCompleted ? "#639922" : "#2d3448"}`,
              }}
            >
              <Checkbox
                checked={isCurrentLessonCompleted}
                onChange={(v) => {
                  if (!isCurrentLessonCompleted && activeLesson && activeLesson.type !== "quiz") {
                    toggleComplete(activeLesson.id, v);
                  }
                }}
                disabled={isCurrentLessonCompleted || activeLesson?.type === "quiz"}
              />
              <span
                className="text-[13px] font-semibold"
                style={{ color: isCurrentLessonCompleted ? "#c0dd97" : "#94a3b8" }}
              >
                {isCurrentLessonCompleted
                  ? "Completed ✓"
                  : activeLesson?.type === "quiz"
                  ? "Complete Quiz First"
                  : "Mark as Complete"}
              </span>
            </div>

            <button
              onClick={() => {
                if (!isCurrentLessonCompleted && activeLesson && activeLesson.type !== "quiz") {
                  toggleComplete(activeLesson.id, true);
                }
                goTo(nextLesson);
              }}
              disabled={!nextLesson}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] text-[13px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 4l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────────── */}
          <div className="mx-6 mb-8 flex-shrink-0">
            <div className="flex border-b border-[#1e2230]">
              {(["Overview", "Attachment", "Notes", "Rating"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="px-5 py-2.5 text-[13px] transition-colors"
                  style={{
                    fontWeight: activeTab === t ? 600 : 400,
                    color: activeTab === t ? "#c0dd97" : "#64748b",
                    borderBottom: `2px solid ${activeTab === t ? "#639922" : "transparent"}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-4">
              {activeTab === "Overview" && (
                <div>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    {course.description || "No description available for this course."}
                  </p>
                  {course.author && (
                    <div className="flex items-center gap-4 mt-5 p-4 bg-[#161b27] border border-[#2d3448] rounded-2xl">
                      <div className="w-11 h-11 rounded-full bg-[#639922] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">
                        {course.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-100">{course.author}</p>
                        {course.authorTitle && (
                          <p className="text-[12px] text-slate-400">{course.authorTitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Attachment" && (
                <p className="text-[13px] text-slate-500">No attachments for this lesson.</p>
              )}

              {activeTab === "Notes" && (
                <div>
                  <textarea
                    placeholder="Take notes for this lecture…"
                    className="w-full min-h-[120px] bg-[#161b27] border border-[#2d3448] rounded-xl p-3 text-[13px] text-slate-300 resize-y outline-none focus:border-[#639922] transition-colors leading-relaxed"
                  />
                  <button className="mt-2 px-5 py-2 bg-[#3b6d11] border border-[#639922] text-[#c0dd97] rounded-xl text-[13px] font-semibold hover:bg-[#27500a] transition-colors">
                    Save Note
                  </button>
                </div>
              )}

              {activeTab === "Rating" && (
                <p className="text-[13px] text-slate-500">No ratings yet for this lecture.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
