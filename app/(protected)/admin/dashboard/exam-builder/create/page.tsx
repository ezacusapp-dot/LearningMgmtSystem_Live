
// app/admin/dashboard/exam-builder/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { examsApi } from "app/api/exams/exams";

interface ExamForm {
  title: string;
  description: string;
  courseId: string;
  examType: "MOCK" | "FINAL";
  totalMarks: string;
  passingMarks: string;
  duration: string;
  maxAttempts: string;
  showAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  status: "Draft" | "Active" | "Inactive";
  startDate: string;
  endDate: string;
}

interface Course {
  id: string;
  title: string;
}

export default function CreateExamPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ExamForm>({
    title: "",
    description: "",
    courseId: "",
    examType: "MOCK",
    totalMarks: "",
    passingMarks: "",
    duration: "",
    maxAttempts: "3",
    showAnswers: false,
    showExplanations: false,
    randomizeQuestions: false,
    status: "Draft",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<Partial<ExamForm>>({});

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await examsApi.getCourses();
        if (response.status && response.data) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const validate = () => {
    const e: Partial<ExamForm> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.courseId) e.courseId = "Course is required";
    if (!form.totalMarks) e.totalMarks = "Total marks required";
    if (!form.passingMarks) e.passingMarks = "Passing marks required";
    if (!form.duration) e.duration = "Duration is required";
    
    const total = parseInt(form.totalMarks);
    const passing = parseInt(form.passingMarks);
    if (total && passing && passing > total) {
      e.passingMarks = "Passing marks cannot exceed total marks";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const response = await examsApi.create({
        title: form.title,
        description: form.description || null,
        courseId: form.courseId,
        examType: form.examType,
        totalMarks: parseInt(form.totalMarks),
        passingMarks: parseInt(form.passingMarks),
        duration: parseInt(form.duration),
        maxAttempts: parseInt(form.maxAttempts),
        showAnswers: form.showAnswers,
        showExplanations: form.showExplanations,
        randomizeQuestions: form.randomizeQuestions,
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      });
      
      if (response.status) {
        localStorage.setItem("currentExamId", response.data.id);
        const addSections = confirm("Would you like to organize your exam into sections?");
        if (addSections) {
          router.push(`/admin/dashboard/exam-builder/create/sections?examId=${response.data.id}`);
        } else {
          router.push("/admin/dashboard/exam-builder/create/questions");
        }
      } else {
        alert(response.message || "Failed to create exam");
      }
    } catch (error) {
      console.error("Create exam error:", error);
      alert("An error occurred while creating the exam");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/admin/dashboard/exam-builder')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <span className="text-2xl">←</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Create New Exam</h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the basic information about the exam</p>
          </div>
        </div>

        <div className="bg-[#0f1117]/80 border border-white/8 rounded-2xl backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Exam Title</label>
              <input type="text" placeholder="e.g., Java Fundamentals" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500" />
              {errors.title && <p className="text-red-400 text-xs mt-0.5">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Description (Optional)</label>
              <textarea rows={3} placeholder="Describe the exam..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            {/* Exam Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Exam Type</label>
              <div className="flex gap-3">
                {(["MOCK", "FINAL"] as const).map((type) => (
                  <button key={type} onClick={() => setForm({ ...form, examType: type })} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${form.examType === type ? type === "MOCK" ? "bg-blue-500/20 border-blue-500/60 text-blue-400" : "bg-purple-500/20 border-purple-500/60 text-purple-400" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"}`}>
                    {type === "MOCK" ? "Mock Test" : "Final Exam"}
                  </button>
                ))}
              </div>
            </div>

            {/* Course */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Course</label>
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" disabled={loadingCourses}>
                <option value="">Select a course</option>
                {courses.map((course) => (<option key={course.id} value={course.id}>{course.title}</option>))}
              </select>
              {errors.courseId && <p className="text-red-400 text-xs mt-0.5">{errors.courseId}</p>}
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Marks</label>
                <input type="number" placeholder="e.g., 100" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
                {errors.totalMarks && <p className="text-red-400 text-xs mt-0.5">{errors.totalMarks}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Passing Marks</label>
                <input type="number" placeholder="e.g., 40" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
                {errors.passingMarks && <p className="text-red-400 text-xs mt-0.5">{errors.passingMarks}</p>}
              </div>
            </div>

            {/* Duration & Attempts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Duration (minutes)</label>
                <input type="number" placeholder="e.g., 60" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
                {errors.duration && <p className="text-red-400 text-xs mt-0.5">{errors.duration}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Max Attempts</label>
                <input type="number" placeholder="e.g., 3" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Exam Settings</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.showAnswers} onChange={(e) => setForm({ ...form, showAnswers: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-[#0f1117] accent-violet-500" />
                  <span className="text-sm text-slate-300">Show answers after completion</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.showExplanations} onChange={(e) => setForm({ ...form, showExplanations: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-[#0f1117] accent-violet-500" />
                  <span className="text-sm text-slate-300">Show explanations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.randomizeQuestions} onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-[#0f1117] accent-violet-500" />
                  <span className="text-sm text-slate-300">Randomize question order</span>
                </label>
              </div>
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Start Date (Optional)</label>
                <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">End Date (Optional)</label>
                <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</label>
              <div className="flex gap-3">
                {(["Draft", "Active", "Inactive"] as const).map((s) => (
                  <button key={s} onClick={() => setForm({ ...form, status: s })} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${form.status === s ? s === "Active" ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400" : s === "Draft" ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-400" : "bg-red-500/20 border-red-500/60 text-red-400" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/8 flex justify-end">
            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-700/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Creating..." : "Next: Add Sections/Questions"} <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}