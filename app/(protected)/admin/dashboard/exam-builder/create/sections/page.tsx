// src/app/admin/dashboard/exam-builder/create/sections/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { examsApi } from "app/api/exams/exams";

// Define the exact types that match the API
type Difficulty = "Easy" | "Medium" | "Difficult" | "Challenging";
type QuestionType = "Conceptual" | "Prediction" | "Debugging" | "ProblemSolving";

interface Section {
  title: string;
  description: string;
  order: number;
  difficulty: Difficulty; // Use the specific type instead of string
  questionType: QuestionType; // Use the specific type instead of string
  totalMarks: number;
  passingMarks: number;
  timeLimit: number;
}

// Use the types for the arrays
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Difficult", "Challenging"];
const QUESTION_TYPES: QuestionType[] = ["Conceptual", "Prediction", "Debugging", "ProblemSolving"];

export default function SectionsBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const [sections, setSections] = useState<Section[]>([
    { title: "Section A – Basic Concepts", description: "Basic Concepts (Easy)", order: 0, difficulty: "Easy", questionType: "Conceptual", totalMarks: 15, passingMarks: 8, timeLimit: 25 },
    { title: "Section B – Code Understanding", description: "Code Understanding (Medium)", order: 1, difficulty: "Medium", questionType: "Prediction", totalMarks: 15, passingMarks: 8, timeLimit: 30 },
    { title: "Section C – Code Analysis", description: "Code Analysis (Difficult)", order: 2, difficulty: "Difficult", questionType: "Debugging", totalMarks: 10, passingMarks: 5, timeLimit: 30 },
    { title: "Section D – Logical Programming", description: "Logical Programming (Challenging)", order: 3, difficulty: "Challenging", questionType: "ProblemSolving", totalMarks: 10, passingMarks: 5, timeLimit: 35 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!examId) {
      const storedId = localStorage.getItem("currentExamId");
      if (!storedId) router.push("/admin/dashboard/exam-builder/create");
    }
  }, [examId, router]);

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { 
      title: `Section ${String.fromCharCode(65 + sections.length)}`, 
      description: "", 
      order: sections.length, 
      difficulty: "Medium", 
      questionType: "Conceptual", 
      totalMarks: 0, 
      passingMarks: 0, 
      timeLimit: 30 
    }]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) { 
      alert("At least one section is required"); 
      return; 
    }
    setSections(sections.filter((_, i) => i !== index));
  };

  const totalMarks = sections.reduce((sum, s) => sum + s.totalMarks, 0);

  const handleSave = async () => {
    const examIdToUse = examId || localStorage.getItem("currentExamId");
    if (!examIdToUse) { 
      alert("Exam ID not found"); 
      return; 
    }
    setSaving(true);
    try {
      const response = await examsApi.updateSections(examIdToUse, sections);
      if (response.status) {
        localStorage.setItem("currentExamId", examIdToUse);
        router.push("/admin/dashboard/exam-builder/create/questions");
      } else {
        alert(response.message || "Failed to save sections");
      }
    } catch (error) { 
      console.error("Save sections error:", error); 
      alert("An error occurred while saving sections"); 
    } finally { 
      setSaving(false); 
    }
  };

  const skipSections = () => {
    const examIdToUse = examId || localStorage.getItem("currentExamId");
    if (examIdToUse) { 
      localStorage.setItem("currentExamId", examIdToUse); 
      router.push("/admin/dashboard/exam-builder/create/questions"); 
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
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <span className="text-2xl">←</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Organize Exam Sections</h1>
            <p className="text-slate-500 text-sm mt-1">Group questions into sections with different difficulty levels</p>
          </div>
          <div className="ml-auto bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2">
            <span className="text-xs text-slate-500">Total Marks:</span>
            <span className="ml-2 text-lg font-bold text-violet-400">{totalMarks}</span>
          </div>
        </div>
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-[#0f1117]/80 border border-white/8 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
                <h3 className="font-bold text-white">Section {String.fromCharCode(65 + idx)}</h3>
                <button onClick={() => removeSection(idx)} className="text-red-400 hover:text-red-300 text-sm">
                  Remove
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Section Title</label>
                  <input 
                    type="text" 
                    value={section.title} 
                    onChange={(e) => updateSection(idx, "title", e.target.value)} 
                    className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Description</label>
                  <input 
                    type="text" 
                    value={section.description} 
                    onChange={(e) => updateSection(idx, "description", e.target.value)} 
                    className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Difficulty</label>
                    <select 
                      value={section.difficulty} 
                      onChange={(e) => updateSection(idx, "difficulty", e.target.value as Difficulty)} 
                      className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    >
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Question Type</label>
                    <select 
                      value={section.questionType} 
                      onChange={(e) => updateSection(idx, "questionType", e.target.value as QuestionType)} 
                      className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    >
                      {QUESTION_TYPES.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Marks</label>
                    <input 
                      type="number" 
                      value={section.totalMarks} 
                      onChange={(e) => updateSection(idx, "totalMarks", parseInt(e.target.value) || 0)} 
                      className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Passing Marks</label>
                    <input 
                      type="number" 
                      value={section.passingMarks} 
                      onChange={(e) => updateSection(idx, "passingMarks", parseInt(e.target.value) || 0)} 
                      className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Time Limit (min)</label>
                    <input 
                      type="number" 
                      value={section.timeLimit} 
                      onChange={(e) => updateSection(idx, "timeLimit", parseInt(e.target.value) || 0)} 
                      className="w-full mt-1 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addSection} className="w-full mt-4 py-3 border-2 border-dashed border-violet-500/30 rounded-xl text-violet-400 hover:border-violet-500/60 hover:bg-violet-500/10 transition-all">
          + Add Section
        </button>
        <div className="mt-6 flex gap-3">
          <button onClick={skipSections} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all">
            Skip (No Sections)
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Sections & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}