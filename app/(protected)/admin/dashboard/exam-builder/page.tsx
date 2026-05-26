"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
interface Exam {
  id: number;
  title: string;
  course: string;
  questions: number;
  marks: string;
  duration: string;
  status: "Active" | "Inactive";
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const initialExams: Exam[] = [
  { id: 1, title: "Java Fundamentals", course: "Java", questions: 1, marks: "40/100", duration: "30 min", status: "Active" },
  { id: 2, title: "Web Development Basics", course: "Web", questions: 2, marks: "40/100", duration: "30 min", status: "Active" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
        status === "Active"
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      }`}
    >
      {status}
    </span>
  );
}

function CourseBadge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
      {label}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ExamsListPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [search, setSearch] = useState("");

  const filtered = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCreateExam = () => {
    router.push('/admin/dashboard/exam-builder/create');
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Exams
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {exams.length} total exam{exams.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={handleCreateExam}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white shadow-lg shadow-violet-700/30 transition-all active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            Create Exam
          </button>
        </div>

        {/* Table card */}
        <div className="bg-[#0f1117]/80 border border-white/8 rounded-2xl backdrop-blur-sm overflow-hidden">
          {/* Search bar */}
          <div className="px-6 pt-5 pb-4 border-b border-white/8">
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search exams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a0c12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {["Title", "Course", "Questions", "Marks", "Duration", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-600 text-sm">
                      No exams found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((exam, i) => (
                    <tr
                      key={exam.id}
                      className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                        i === filtered.length - 1 ? "border-none" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        {exam.title}
                      </td>
                      <td className="px-6 py-4">
                        <CourseBadge label={exam.course} />
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {exam.questions}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{exam.marks}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {exam.duration}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={exam.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all">
                            Questions
                          </button> */}
                          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all">
                            Results
                          </button>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}