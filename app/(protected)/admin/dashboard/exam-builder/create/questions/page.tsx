// src/app/admin/dashboard/exam-builder/create/questions/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { examsApi, ExamQuestion } from "app/api/exams/exams";

const OPTION_LABELS = ["A", "B", "C", "D"];
const CODE_LANGUAGES = [
  { value: "python", label: "Python" }, { value: "javascript", label: "JavaScript" }, { value: "java", label: "Java" },
  { value: "c", label: "C" }, { value: "cpp", label: "C++" }, { value: "sql", label: "SQL" },
  { value: "typescript", label: "TypeScript" }, { value: "html", label: "HTML" },
];
const DIFFICULTIES = ["Easy", "Medium", "Difficult", "Challenging"];
const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const QUESTION_TYPES = ["Conceptual", "Prediction", "Debugging", "ProblemSolving"];

const Icon = {
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Code: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Image: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Info: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Grip: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Arrow: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Back: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 19"/></svg>,
  Explain: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Star: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

function makeOption(suffix: string) {
  return { id: `opt_${Date.now()}_${suffix}`, text: "", imageFile: null, imagePreview: null, showImage: false };
}

function newQuestion(index: number) {
  const ts = Date.now();
  return {
    id: `q_${ts}_${index}`, text: "", imageFile: null, imagePreview: null, showImage: false,
    showCode: false, codeSnippet: "", codeLanguage: "python",
    options: [makeOption(`${ts}_0`), makeOption(`${ts}_1`), makeOption(`${ts}_2`), makeOption(`${ts}_3`)],
    correctOptionId: "", explanation: "", explanationImageFile: null, explanationImagePreview: null,
    showExplanationImage: false, points: 1, difficulty: "Easy", bloomLevel: "Remember", questionType: "Conceptual",
  };
}

function OptionImagePill({ opt, onChange }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ imageFile: file, imagePreview: ev.target?.result, showImage: true });
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const remove = () => onChange({ imageFile: null, imagePreview: null, showImage: false });

  if (opt.showImage && opt.imagePreview) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative w-11 h-9 rounded-md overflow-hidden border border-violet-500/35 cursor-pointer"><img src={opt.imagePreview} alt="" className="w-full h-full object-cover" /></div>
        <button onClick={remove} className="w-5 h-5 rounded border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center"><Icon.X /></button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }
  return (
    <div className="flex-shrink-0">
      <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-white/10 bg-transparent text-slate-500 text-[10px] hover:border-violet-500/40 hover:text-violet-400"><Icon.Image /> Img</button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ImageZone({ preview, onFile, onRemove, label = "image" }: any) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFile(file, ev.target?.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-violet-500/25 bg-[#07090f]">
        <img src={preview} alt={label} className="w-full max-h-[180px] object-contain" />
        <div className="absolute top-2 right-2 flex gap-2">
          <button onClick={() => ref.current?.click()} className="px-2.5 py-1 rounded-md border border-white/15 bg-black/65 text-slate-300 text-[11px] hover:bg-black/80">Change</button>
          <button onClick={onRemove} className="w-6 h-6 rounded-md border border-red-500/30 bg-black/65 text-red-400 hover:bg-red-500/20 flex items-center justify-center"><Icon.X /></button>
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }
  return (
    <div onClick={() => ref.current?.click()} className="border-2 border-dashed border-white/8 rounded-xl py-8 text-center cursor-pointer hover:border-violet-500/30 hover:bg-violet-500/5">
      <div className="flex justify-center mb-2 text-slate-500"><Icon.Upload /></div>
      <p className="text-xs text-slate-500">Click to upload {label}</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function QuestionCard({ q, index, total, onUpdate, onDelete }: any) {
  const upd = (patch: any) => onUpdate(q.id, patch);
  const updateOption = (optId: string, patch: any) => upd({ options: q.options.map((o: any) => o.id === optId ? { ...o, ...patch } : o) });
  const correctIdx = q.options.findIndex((o: any) => o.id === q.correctOptionId);
  const correctLetter = correctIdx !== -1 ? OPTION_LABELS[correctIdx] : "—";
  const diffStyle: any = { Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", Difficult: "text-orange-400 bg-orange-500/10 border-orange-500/30", Challenging: "text-red-400 bg-red-500/10 border-red-500/30" }[q.difficulty] || "";

  return (
    <div className="bg-[#0f1117] border border-white/8 rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-white/[0.02] flex-wrap">
        <span className="text-slate-500 cursor-grab"><Icon.Grip /></span>
        <div className="bg-violet-500/20 border border-violet-500/40 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold text-violet-400">Q{index + 1}</div>
        <span className="text-xs text-slate-500">Question {index + 1} / {total}</span>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${diffStyle}`}>{q.difficulty}</div>
        <div className="ml-auto flex items-center gap-2"><span className="text-[10px] text-slate-500">Correct:</span><div className="bg-violet-500/15 border border-violet-500/40 rounded w-6 h-5 flex items-center justify-center text-xs font-bold text-violet-400">{correctLetter}</div></div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10"><span className="text-violet-400"><Icon.Star /></span><span className="text-[10px] text-slate-500">Marks</span><input type="number" min={1} max={100} value={q.points} onChange={e => upd({ points: parseInt(e.target.value) || 1 })} className="w-8 bg-transparent border-none text-violet-400 text-sm font-bold text-center outline-none" /></div>
        <button onClick={() => onDelete(q.id)} className="text-red-400 hover:text-red-300"><Icon.Trash /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Difficulty</div><select value={q.difficulty} onChange={e => upd({ difficulty: e.target.value })} className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div><div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Bloom's Level</div><select value={q.bloomLevel} onChange={e => upd({ bloomLevel: e.target.value })} className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{BLOOM_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Question Type</div><select value={q.questionType} onChange={e => upd({ questionType: e.target.value })} className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase text-slate-500">Question</span><div className="flex gap-2"><button onClick={() => q.showImage ? upd({ showImage: false, imageFile: null, imagePreview: null }) : upd({ showImage: true })} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${q.showImage ? "bg-violet-500/20 text-violet-400 border border-violet-500/40" : "bg-transparent text-slate-500 border border-white/10"}`}><Icon.Image /> {q.showImage ? "Hide" : "Add"} Image</button><button onClick={() => upd({ showCode: !q.showCode })} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${q.showCode ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" : "bg-transparent text-slate-500 border border-white/10"}`}><Icon.Code /> {q.showCode ? "Hide" : "Add"} Code</button></div></div>
          <textarea placeholder="Type your question here..." value={q.text} rows={3} onChange={e => upd({ text: e.target.value })} className="w-full bg-[#0a0c12] border border-white/10 rounded-xl px-4 py-2 text-white text-sm resize-none focus:border-violet-500 outline-none" />
          {q.showImage && <ImageZone preview={q.imagePreview} onFile={(file: any, preview: any) => upd({ imageFile: file, imagePreview: preview })} onRemove={() => upd({ imageFile: null, imagePreview: null })} />}
        </div>
        {q.showCode && (
          <div className="border border-blue-500/20 rounded-xl overflow-hidden bg-[#06080e]">
            <div className="flex justify-between items-center px-4 py-2 border-b border-white/5"><div className="flex items-center gap-2"><span className="text-blue-400"><Icon.Code /></span><span className="text-xs font-semibold text-slate-500">Code Snippet</span></div><select value={q.codeLanguage} onChange={e => upd({ codeLanguage: e.target.value })} className="bg-[#0a0c12] border border-white/10 rounded px-2 py-1 text-blue-400 text-xs">{CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select></div>
            <textarea placeholder="// Write code snippet here..." value={q.codeSnippet} rows={4} onChange={e => upd({ codeSnippet: e.target.value })} className="w-full bg-transparent border-none px-4 py-3 text-slate-300 text-sm font-mono resize-none outline-none" />
          </div>
        )}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase text-slate-500">Answer Options</div>
          {q.options.map((opt: any, idx: number) => {
            const isCorrect = q.correctOptionId === opt.id;
            return (
              <div key={opt.id} className={`rounded-xl border ${isCorrect ? "border-violet-500/40 bg-violet-500/5" : "border-white/10 bg-[#080a10]"}`}>
                <div className="flex items-center gap-3 px-3 py-2">
                  <button onClick={() => upd({ correctOptionId: opt.id })} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCorrect ? "border-violet-500 bg-violet-500/20" : "border-slate-600"}`}>{isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />}</button>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isCorrect ? "bg-violet-500/20 text-violet-400 border border-violet-500/50" : "bg-white/5 text-slate-500 border border-white/10"}`}>{OPTION_LABELS[idx]}</div>
                  <input placeholder={`Option ${OPTION_LABELS[idx]} text...`} value={opt.text} onChange={e => updateOption(opt.id, { text: e.target.value })} className="flex-1 bg-transparent border-none text-sm text-white outline-none" />
                  <OptionImagePill opt={opt} onChange={patch => updateOption(opt.id, patch)} />
                  {isCorrect && <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 text-[10px] font-bold"><Icon.Check /> Correct</div>}
                </div>
                {opt.showImage && opt.imagePreview && <div className="mx-3 mb-3 rounded-lg overflow-hidden border border-violet-500/30"><img src={opt.imagePreview} alt="Option" className="w-full max-h-32 object-contain" /></div>}
              </div>
            );
          })}
        </div>
        <div className="border-t border-white/5 pt-3">
          <div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><span className="text-slate-500"><Icon.Explain /></span><span className="text-[10px] font-bold uppercase text-slate-500">Explanation</span></div><button onClick={() => q.showExplanationImage ? upd({ showExplanationImage: false, explanationImageFile: null, explanationImagePreview: null }) : upd({ showExplanationImage: true })} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${q.showExplanationImage ? "bg-violet-500/20 text-violet-400 border border-violet-500/40" : "bg-transparent text-slate-500 border border-white/10"}`}><Icon.Image /> {q.showExplanationImage ? "Hide" : "Add"} Image</button></div>
          <textarea placeholder="Explain why the correct answer is right..." value={q.explanation} rows={2} onChange={e => upd({ explanation: e.target.value })} className="w-full bg-[#07090f] border border-white/10 rounded-lg px-3 py-2 text-slate-400 text-sm resize-none focus:border-violet-500 outline-none" />
          {q.showExplanationImage && <div className="mt-2"><ImageZone preview={q.explanationImagePreview} label="explanation image" onFile={(file: any, preview: any) => upd({ explanationImageFile: file, explanationImagePreview: preview })} onRemove={() => upd({ explanationImageFile: null, explanationImagePreview: null })} /></div>}
        </div>
      </div>
    </div>
  );
}

export default function ExamQuestionsPage() {
  const router = useRouter();
  const [examId, setExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([newQuestion(0)]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("currentExamId");
    if (!id) { router.push("/admin/dashboard/exam-builder/create"); return; }
    setExamId(id);
    const loadSections = async () => {
      try {
        const response = await examsApi.getSections(id);
        if (response.status && response.data.length > 0) { setSections(response.data); setSelectedSection(response.data[0].id); }
      } catch (error) { console.error("Failed to load sections:", error); }
    };
    loadSections();
  }, [router]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const addQuestion = () => { setQuestions(prev => [...prev, newQuestion(prev.length)]); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 60); };
  const updateQuestion = (id: string, patch: any) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  const deleteQuestion = (id: string) => { if (questions.length === 1) { showToast("At least one question is required"); return; } setQuestions(prev => prev.filter(q => q.id !== id)); };
  const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const answered = questions.filter(q => q.correctOptionId && q.text.trim()).length;

  const handleSave = async () => {
    const bad = questions.filter(q => !q.text.trim() || !q.correctOptionId);
    if (bad.length) { showToast(`${bad.length} question(s) need text + a correct answer`); return; }
    if (!examId) { showToast("Exam ID not found"); return; }
    setSaving(true);
    try {
      const apiQuestions: ExamQuestion[] = questions.map((q, index) => ({
        question: q.text, inputMode: q.showImage ? "image" : "text", questionImage: q.imagePreview, codeSnippet: q.showCode ? q.codeSnippet : null,
        codeLanguage: q.codeLanguage, explanation: q.explanation || null, explanationImage: q.showExplanationImage ? q.explanationImagePreview : null,
        points: q.points, difficulty: q.difficulty as any, bloomLevel: q.bloomLevel as any, questionType: q.questionType as any,
        order: index + 1, sectionId: sections.length > 0 ? selectedSection : null,
        options: q.options.map((opt: any, optIndex: number) => ({
          text: opt.text, isCorrect: q.correctOptionId === opt.id, order: optIndex + 1,
          inputMode: opt.showImage ? "image" : "text", imageData: opt.imagePreview,
        })),
      }));
      const response = await examsApi.replaceQuestions(examId, apiQuestions);
      if (response.status) { showToast("Exam saved successfully!"); setTimeout(() => router.push("/admin/dashboard/exam-builder"), 1500); }
      else showToast(response.message || "Failed to save exam");
    } catch (error) { console.error("Save exam error:", error); showToast("An error occurred while saving the exam"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" /><div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" /></div>
      <div className="relative max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start gap-4 mb-6 flex-wrap">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10"><span className="text-2xl">←</span></button>
          <div className="flex-1"><h1 className="text-2xl font-extrabold text-white">Add Questions</h1><p className="text-xs text-slate-500">Each question supports text, image, and code — options can have text + image</p></div>
          {[{ val: questions.length, label: "Questions", color: "#c4b5fd" }, { val: totalMarks, label: "Total Marks", color: "#a78bfa" }, { val: `${answered}/${questions.length}`, label: "Complete", color: answered === questions.length ? "#4ade80" : "#fbbf24" }].map(({ val, label, color }) => (<div key={label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center"><div className="text-xl font-bold" style={{ color }}>{val}</div><div className="text-[10px] text-slate-500 uppercase">{label}</div></div>))}
        </div>
        <div className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
        {sections.length > 0 && (<div className="mb-4 p-4 bg-[#0f1117]/80 border border-white/10 rounded-xl"><label className="text-[10px] font-bold uppercase text-slate-500">Add questions to section</label><select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full mt-2 bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{sections.map(s => (<option key={s.id} value={s.id}>{s.title} ({s.totalMarks} marks, {s.difficulty})</option>))}</select></div>)}
        {questions.map((q, idx) => (<QuestionCard key={q.id} q={q} index={idx} total={questions.length} onUpdate={updateQuestion} onDelete={deleteQuestion} />))}
        <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-violet-500/30 rounded-xl text-violet-400 hover:border-violet-500/60 hover:bg-violet-500/10 transition-all flex items-center justify-center gap-2"><Icon.Plus /> Add Question <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">Q{questions.length + 1}</span></button>
        <div className="mt-6 bg-[#0f1117] border border-white/10 rounded-xl p-4 flex justify-between items-center"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${answered === questions.length ? "bg-emerald-400" : "bg-yellow-400"}`} /><span className="text-xs text-slate-500">{answered === questions.length ? `All ${questions.length} questions ready` : `${questions.length - answered} questions incomplete`}</span></div><div className="flex gap-3"><button onClick={() => router.back()} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 text-sm">Back</button><button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50">{saving ? "Saving..." : <><span>Save Exam</span><Icon.Arrow /></>}</button></div></div>
      </div>
      {toast && <div className="fixed top-5 right-5 bg-[#0f1117] border border-violet-500/40 rounded-lg px-4 py-2 text-violet-400 text-sm shadow-lg z-50">{toast}</div>}
    </div>
  );
}