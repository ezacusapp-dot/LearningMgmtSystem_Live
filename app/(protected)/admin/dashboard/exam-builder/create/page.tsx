"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ExamForm {
  title: string;
  course: string;
  totalMarks: string;
  passingMarks: string;
  duration: string;
  status: "Active" | "Inactive";
}

// Available courses for dropdown
const availableCourses = [
  "Java",
  "Web",
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "Database",
  "DevOps",
  "Cloud Computing",
  "Data Science"
];

export default function CreateExamPage() {
  const router = useRouter();
  const [form, setForm] = useState<ExamForm>({
    title: "",
    course: "",
    totalMarks: "",
    passingMarks: "",
    duration: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<Partial<ExamForm>>({});
  const [customCourse, setCustomCourse] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const validate = () => {
    const e: Partial<ExamForm> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.course.trim()) e.course = "Course is required";
    if (!form.totalMarks.trim()) e.totalMarks = "Total marks required";
    if (!form.passingMarks.trim()) e.passingMarks = "Passing marks required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Store exam data in localStorage to use in questions page
      localStorage.setItem("tempExamData", JSON.stringify(form));
      router.push("/admin/dashboard/exam-builder/create/questions");
    }
  };

  const handleCourseSelect = (course: string) => {
    if (course === "other") {
      setShowCustomInput(true);
      setForm({ ...form, course: "" });
    } else {
      setShowCustomInput(false);
      setForm({ ...form, course: course });
    }
  };

  const handleCustomCourse = (value: string) => {
    setCustomCourse(value);
    setForm({ ...form, course: value });
  };

  const field = (
    label: string,
    key: keyof ExamForm,
    placeholder: string,
    type = "text"
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
      />
      {errors[key] && (
        <p className="text-red-400 text-xs mt-0.5">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-10">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/dashboard/master/exam-builder')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">←</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Create New Exam
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Fill in the basic information about the exam
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0f1117]/80 border border-white/8 rounded-2xl backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-6 flex flex-col gap-5">
            {field("Exam Title", "title", "e.g. Java Fundamentals")}
            
            {/* Course Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Course
              </label>
              <select
                value={showCustomInput ? "other" : form.course}
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
              >
                <option value="">Select a course</option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
                <option value="other">+ Add Custom Course</option>
              </select>
              
              {showCustomInput && (
                <input
                  type="text"
                  placeholder="Enter course name"
                  value={customCourse}
                  onChange={(e) => handleCustomCourse(e.target.value)}
                  className="mt-2 w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
              )}
              
              {errors.course && (
                <p className="text-red-400 text-xs mt-0.5">{errors.course}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("Total Marks", "totalMarks", "e.g. 100", "number")}
              {field("Passing Marks", "passingMarks", "e.g. 40", "number")}
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Exam Time (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5 pr-16 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                  min
                </span>
              </div>
              {errors.duration && (
                <p className="text-red-400 text-xs mt-0.5">{errors.duration}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Status
              </label>
              <div className="flex gap-3">
                {(["Active", "Inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, status: s })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      form.status === s
                        ? s === "Active"
                          ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400"
                          : "bg-red-500/20 border-red-500/60 text-red-400"
                        : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-700/30 flex items-center gap-2"
            >
              Next: Add Questions
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}