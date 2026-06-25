
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { examsApi, Exam } from "app/api/exams/exams";
// src/app/admin/dashboard/exam-builder/page.tsx


function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Inactive: "bg-red-500/20 text-red-400 border-red-500/30",
    Draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
}

function ExamTypeBadge({ type }: { type: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
      type === "MOCK" 
        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
    }`}>
      {type === "MOCK" ? "Mock Test" : "Final Exam"}
    </span>
  );
}

export default function ExamsListPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExams, setTotalExams] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadExams = async () => {
    setLoading(true);
    try {
      const response = await examsApi.getAll({ 
        page: currentPage, 
        limit: 10, 
        search: search || undefined,
        examType: filterType !== "all" ? filterType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      if (response.status) {
        setExams(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalExams(response.meta.total);
      }
    } catch (error) {
      console.error("Failed to load exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [currentPage, search, filterType, filterStatus]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        const response = await examsApi.delete(id);
        if (response.status) {
          loadExams();
        } else {
          alert(response.message || "Failed to delete exam");
        }
      } catch (error) {
        console.error("Delete exam error:", error);
        alert("An error occurred while deleting the exam");
      }
    }
  };

  const handleCreateExam = () => {
    router.push('/admin/dashboard/exam-builder/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/dashboard/exam-builder/edit/${id}`);
  };

  const handleViewResults = (id: string) => {
    router.push(`/admin/dashboard/exam-builder/results/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Exams Management</h1>
            <p className="text-slate-500 text-sm mt-1">{totalExams} total exam{totalExams !== 1 ? "s" : ""}</p>
          </div>
          <button 
            onClick={handleCreateExam} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white shadow-lg shadow-violet-700/30 transition-all active:scale-95"
          >
            <span className="text-lg leading-none">+</span> Create Exam
          </button>
        </div>

        <div className="bg-[#0f1117]/80 border border-white/8 rounded-2xl backdrop-blur-sm overflow-hidden">
          {/* Filters */}
          <div className="px-6 pt-5 pb-4 border-b border-white/8">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-sm">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search exams..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full bg-[#0a0c12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all" 
                />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#0a0c12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Types</option>
                <option value="MOCK">Mock Tests</option>
                <option value="FINAL">Final Exams</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0a0c12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Title</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Type</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Course</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Questions</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Marks</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Duration</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-600 text-sm">Loading...</td></tr>
                ) : exams.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-600 text-sm">No exams found.</td></tr>
                ) : (
                  exams.map((exam, i) => (
                    <tr key={exam.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${i === exams.length - 1 ? "border-none" : ""}`}>
                      <td className="px-6 py-4 font-semibold text-white">{exam.title}</td>
                      <td className="px-6 py-4"><ExamTypeBadge type={exam.examType} /></td>
                      <td className="px-6 py-4 text-slate-300">{exam.course?.title || "—"}</td>
                      <td className="px-6 py-4 text-slate-300">{exam._count?.questions || 0}</td>
                      <td className="px-6 py-4 text-slate-300">{exam.passingMarks}/{exam.totalMarks}</td>
                      <td className="px-6 py-4 text-slate-300">{exam.duration} min</td>
                      <td className="px-6 py-4"><StatusBadge status={exam.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewResults(exam.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all">Results</button>
                          <button onClick={() => handleEdit(exam.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all">Edit</button>
                          <button onClick={() => handleDelete(exam.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/8 flex justify-between items-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}