"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizBuilder } from "components/QuizBuilder";
// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["Draft", "Published", "Archived"];

const LESSON_TYPES = [
  { type: "VIDEO", label: "Video" },
  { type: "PDF",   label: "PDF"   },
];

const MODULE_TYPES = [
  { type: "LESSON",     label: "Lesson"     },
  { type: "REVISION",   label: "Revision"   },
  { type: "QUIZ",       label: "Quiz"       },
  { type: "FINAL_QUIZ", label: "Final Quiz" },
];

const UPLOADABLE_TYPES = ["VIDEO", "PDF"];

const OPTION_LABELS = ["A", "B", "C", "D"];

const CODE_LANGUAGES = [
  { value: "python",     label: "Python"     },
  { value: "javascript", label: "JavaScript" },
  { value: "java",       label: "Java"       },
  { value: "c",          label: "C"          },
  { value: "cpp",        label: "C++"        },
  { value: "sql",        label: "SQL"        },
  { value: "typescript", label: "TypeScript" },
  { value: "html",       label: "HTML"       },
];

const DEFAULT_RULES = [
  { id: "r1", label: "Require Module Completion",  desc: "Students must complete all lessons before proceeding to the next module", enabled: true  },
  { id: "r2", label: "Require Test Pass (60%)",    desc: "Students must pass intermediate tests to continue to the next module",    enabled: true  },
  { id: "r3", label: "Allow Course Retake",        desc: "Students can retake the entire course if they fail",                      enabled: false },
];

const today = new Date().toISOString().split("T")[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function canAddLesson(module, contentType) {
  const { type, lessons } = module;
  if (type === "REVISION") {
    if (contentType !== "VIDEO") return false;
    return lessons.filter(l => l.contentType === "VIDEO").length < 1;
  }
  if (type === "LESSON") {
    if (contentType === "VIDEO") return lessons.filter(l => l.contentType === "VIDEO").length < 3;
    if (contentType === "PDF")   return lessons.filter(l => l.contentType === "PDF").length < 1;
  }
  return true;
}

function disabledReason(module, contentType) {
  if (module.type === "REVISION") {
    if (contentType !== "VIDEO") return "Revision modules allow Video only";
    return "Max 1 video allowed in Revision";
  }
  if (module.type === "LESSON") {
    if (contentType === "VIDEO") return "Max 3 videos allowed per Lesson";
    if (contentType === "PDF")   return "Max 1 PDF allowed per Lesson";
  }
  return "Limit reached";
}

// ─── Grade Multi-Select Dropdown ─────────────────────────────────────────────

function GradeMultiSelect({ grades, selected, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id));
    else onChange([...selected, id]);
  };

  const label = selected.length === 0
    ? "Select grades…"
    : selected.length === 1
      ? grades.find(g => g.id === selected[0])?.name ?? "1 selected"
      : `${selected.length} grades selected`;

  return (
    <div className="gms-wrap" ref={ref}>
      <button
        type="button"
        className={`gms-trigger ${error ? "gms-trigger-error" : ""} ${open ? "gms-trigger-open" : ""}`}
        onClick={() => setOpen(p => !p)}
      >
        <span className={`gms-label ${selected.length === 0 ? "placeholder" : ""}`}>{label}</span>
        {selected.length > 0 && (
          <span className="gms-count-pill">{selected.length}</span>
        )}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="gms-dropdown">
          {grades.length === 0 ? (
            <div className="gms-empty">No grades available</div>
          ) : (
            grades.map(g => {
              const isSelected = selected.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`gms-option ${isSelected ? "selected" : ""}`}
                  onClick={() => toggle(g.id)}
                >
                  <span className="gms-option-check">
                    {isSelected && <CheckSmallIcon />}
                  </span>
                  <span className="gms-option-label">{g.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quiz Builder ─────────────────────────────────────────────────────────────

// function QuizBuilder({ moduleId, questions, onUpdate, isFinal, enums }) {
//   const accentColor = isFinal ? "#7c4fd4" : "#639922";
//   const accentBg    = isFinal ? "#3d2a6e" : "#3b6d11";
//   const accentBdr   = isFinal ? "#7c4fd4" : "#639922";
//   const accentTxt   = isFinal ? "#c4b5fd" : "#c0dd97";

//   const [codeOpenIds, setCodeOpenIds] = useState([]);

//   const toggleCodeSection = (qId) =>
//     setCodeOpenIds(prev =>
//       prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
//     );

//   const getDefaultDifficulty   = () => enums.difficulties[0]?.type  || "Easy";
//   const getDefaultBloomLevel   = () => enums.bloomLevels[0]?.type   || "Remember";
//   const getDefaultQuestionType = () => enums.questionTypes[0]?.type || "Conceptual";

//   const addQuestion = () => {
//     const newQ = {
//       id: `q_${Date.now()}`,
//       text: "",
//       options: [
//         { id: `opt_${Date.now()}_0`, text: "" },
//         { id: `opt_${Date.now()}_1`, text: "" },
//       ],
//       correctOptionId: "",
//       description: "",
//       points: 1,
//       difficulty:   getDefaultDifficulty(),
//       bloomLevel:   getDefaultBloomLevel(),
//       questionType: getDefaultQuestionType(),
//       codeSnippet:  "",
//       codeLanguage: "",
//     };
//     onUpdate([...questions, newQ]);
//   };

//   const removeQuestion = (qId) => {
//     setCodeOpenIds(prev => prev.filter(id => id !== qId));
//     onUpdate(questions.filter(q => q.id !== qId));
//   };

//   const updateQuestion = (qId, patch) =>
//     onUpdate(questions.map(q => q.id === qId ? { ...q, ...patch } : q));

//   const addOption = (qId) => {
//     const q = questions.find(x => x.id === qId);
//     if (!q || q.options.length >= 4) return;
//     const newOpt = { id: `opt_${Date.now()}`, text: "" };
//     updateQuestion(qId, { options: [...q.options, newOpt] });
//   };

//   const removeOption = (qId, optId) => {
//     const q = questions.find(x => x.id === qId);
//     if (!q || q.options.length <= 2) return;
//     const updated   = q.options.filter(o => o.id !== optId);
//     const correctId = q.correctOptionId === optId ? "" : q.correctOptionId;
//     updateQuestion(qId, { options: updated, correctOptionId: correctId });
//   };

//   const updateOptionText = (qId, optId, text) => {
//     const q = questions.find(x => x.id === qId);
//     if (!q) return;
//     updateQuestion(qId, {
//       options: q.options.map(o => o.id === optId ? { ...o, text } : o),
//     });
//   };

//   const getCorrectLetter = (q) => {
//     if (!q.correctOptionId) return "—";
//     const idx = q.options.findIndex(opt => opt.id === q.correctOptionId);
//     return idx !== -1 ? OPTION_LABELS[idx] : "—";
//   };

//   return (
//     <div className="qb-wrap">
//       <div className="qb-banner" style={{ borderColor: accentBdr, background: isFinal ? "rgba(124,79,212,0.07)" : "rgba(99,153,34,0.07)" }}>
//         <span className="qb-banner-icon" style={{ background: accentBg, borderColor: accentBdr, color: accentTxt }}>
//           {isFinal ? <FinalQuizIcon /> : <QuizBannerIcon />}
//         </span>
//         <div>
//           <p className="qb-banner-title" style={{ color: accentTxt }}>{isFinal ? "Final Quiz" : "Quiz"} — Question Builder</p>
//           <p className="qb-banner-sub">Add questions, options, metadata and optional code snippets</p>
//         </div>
//         <span className="qb-question-count" style={{ background: accentBg, borderColor: accentBdr, color: accentTxt }}>
//           {questions.length} Q
//         </span>
//       </div>

//       {questions.length === 0 ? (
//         <div className="qb-empty">
//           <QuizEmptyIcon />
//           <p>No questions yet — add your first question below</p>
//         </div>
//       ) : (
//         questions.map((q, qi) => {
//           const codeOpen = codeOpenIds.includes(q.id);
//           const hasCode  = !!q.codeSnippet?.trim();

//           return (
//             <div key={q.id} className="qb-question-card" style={{ borderLeftColor: accentColor }}>
//               <div className="qb-q-header">
//                 <span className="qb-q-num" style={{ background: accentBg, borderColor: accentBdr, color: accentTxt }}>Q{qi + 1}</span>
//                 <span className="qb-q-label">Question</span>
//                 <div className="qb-q-header-right">
//                   <div className="qb-pts-field">
//                     <span className="qb-pts-label">Marks</span>
//                     <input
//                       type="number"
//                       className="qb-pts-input"
//                       min={1} max={100}
//                       value={q.points}
//                       onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
//                     />
//                   </div>
//                   <button className="cb-icon-btn delete" onClick={() => removeQuestion(q.id)} title="Delete question">
//                     <DeleteIcon />
//                   </button>
//                 </div>
//               </div>

//               <div className="qb-meta-grid">
//                 <div className="qb-meta-field">
//                   <label className="qb-meta-label">Difficulty</label>
//                   <select className="qb-meta-select" value={q.difficulty} onChange={e => updateQuestion(q.id, { difficulty: e.target.value })}>
//                     {enums.difficulties.length > 0
//                       ? enums.difficulties.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)
//                       : <><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></>}
//                   </select>
//                 </div>
//                 <div className="qb-meta-field">
//                   <label className="qb-meta-label">Bloom's Level</label>
//                   <select className="qb-meta-select" value={q.bloomLevel} onChange={e => updateQuestion(q.id, { bloomLevel: e.target.value })}>
//                     {enums.bloomLevels.length > 0
//                       ? enums.bloomLevels.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)
//                       : <><option value="Remember">Remember</option><option value="Understand">Understand</option><option value="Apply">Apply</option><option value="Analyze">Analyze</option><option value="Evaluate">Evaluate</option><option value="Create">Create</option></>}
//                   </select>
//                 </div>
//                 <div className="qb-meta-field">
//                   <label className="qb-meta-label">Type</label>
//                   <select className="qb-meta-select" value={q.questionType} onChange={e => updateQuestion(q.id, { questionType: e.target.value })}>
//                     {enums.questionTypes.length > 0
//                       ? enums.questionTypes.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)
//                       : <><option value="Conceptual">Conceptual</option><option value="OutputPrediction">Output Prediction</option><option value="ProblemSolving">Problem Solving</option><option value="Debugging">Debugging</option></>}
//                   </select>
//                 </div>
//                 <div className="qb-meta-field qb-correct-preview">
//                   <label className="qb-meta-label">Correct Answer</label>
//                   <div className="qb-correct-badge-preview" style={{ borderColor: accentBdr, color: accentTxt }}>{getCorrectLetter(q)}</div>
//                 </div>
//               </div>

//               <textarea className="qb-q-text" placeholder="Type your question here…" rows={2} value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} />

//               <div className="qb-code-toggle-wrap">
//                 {!codeOpen ? (
//                   <button className="qb-code-add-chip" onClick={() => toggleCodeSection(q.id)}>
//                     <CodeIcon /> Add Code Snippet <span className="qb-code-chip-hint">optional</span>
//                   </button>
//                 ) : (
//                   <div className="qb-code-section">
//                     <div className="qb-code-header">
//                       <span className="qb-code-label"><CodeIcon /> Code Snippet <span className="qb-desc-optional"> — shown above the question</span></span>
//                       <div className="qb-code-header-right">
//                         <select className="qb-meta-select qb-lang-select" value={q.codeLanguage || "python"} onChange={e => updateQuestion(q.id, { codeLanguage: e.target.value })}>
//                           {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
//                         </select>
//                         <button className="qb-option-remove" title="Remove code snippet" onClick={() => { updateQuestion(q.id, { codeSnippet: "", codeLanguage: "" }); toggleCodeSection(q.id); }}>
//                           <XSmallIcon />
//                         </button>
//                       </div>
//                     </div>
//                     <textarea className="qb-code-textarea" placeholder={`// Paste your ${CODE_LANGUAGES.find(l => l.value === (q.codeLanguage || "python"))?.label || "code"} snippet here…`} rows={5} value={q.codeSnippet} onChange={e => updateQuestion(q.id, { codeSnippet: e.target.value })} spellCheck={false} />
//                     {q.codeLanguage && <div className="qb-code-lang-badge">{CODE_LANGUAGES.find(l => l.value === q.codeLanguage)?.label || q.codeLanguage}</div>}
//                   </div>
//                 )}
//                 {!codeOpen && hasCode && (
//                   <span className="qb-code-saved-badge" onClick={() => toggleCodeSection(q.id)} title="Code snippet saved — click to edit">
//                     <CodeIcon /> {CODE_LANGUAGES.find(l => l.value === q.codeLanguage)?.label || "Code"} snippet saved <span className="qb-code-edit-hint">Edit</span>
//                   </span>
//                 )}
//               </div>

//               <div className="qb-options-section">
//                 <p className="qb-options-label">Answer Options <span className="qb-options-hint">(select the correct answer)</span></p>
//                 {q.options.map((opt, oi) => {
//                   const isCorrect = q.correctOptionId === opt.id;
//                   return (
//                     <div key={opt.id} className={`qb-option-row ${isCorrect ? "correct" : ""}`} style={isCorrect ? { borderColor: accentColor, background: isFinal ? "rgba(124,79,212,0.09)" : "rgba(99,153,34,0.09)" } : {}}>
//                       <button className={`qb-option-radio ${isCorrect ? "checked" : ""}`} style={isCorrect ? { background: accentBg, borderColor: accentColor } : {}} onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })} title="Mark as correct answer">
//                         {isCorrect && <span className="qb-option-radio-dot" style={{ background: accentTxt }} />}
//                       </button>
//                       <span className="qb-option-letter" style={isCorrect ? { background: accentBg, borderColor: accentBdr, color: accentTxt } : {}}>{OPTION_LABELS[oi]}</span>
//                       <input className="qb-option-input" placeholder={`Option ${OPTION_LABELS[oi]}…`} value={opt.text} onChange={e => updateOptionText(q.id, opt.id, e.target.value)} />
//                       {isCorrect && <span className="qb-correct-badge" style={{ background: isFinal ? "rgba(124,79,212,0.15)" : "rgba(99,153,34,0.15)", borderColor: accentBdr, color: accentTxt }}><CheckSmallIcon /> Correct</span>}
//                       {q.options.length > 2 && <button className="qb-option-remove" onClick={() => removeOption(q.id, opt.id)} title="Remove option"><XSmallIcon /></button>}
//                     </div>
//                   );
//                 })}
//                 {q.options.length < 4 && <button className="qb-add-option-chip" onClick={() => addOption(q.id)}><PlusSmallIcon /> Add Option {OPTION_LABELS[q.options.length]}</button>}
//               </div>

//               <div className="qb-desc-section">
//                 <label className="qb-desc-label"><ExplainIcon /> Explanation <span className="qb-desc-optional">(optional — shown after answer)</span></label>
//                 <textarea className="qb-desc-textarea" placeholder="Explain why the correct answer is right…" rows={2} value={q.description} onChange={e => updateQuestion(q.id, { description: e.target.value })} />
//               </div>
//             </div>
//           );
//         })
//       )}

//       <button className="qb-add-question-btn" style={{ borderColor: accentBdr, color: accentTxt }} onClick={addQuestion}>
//         <PlusIcon /> Add Question {questions.length > 0 && <span className="qb-add-q-hint">Q{questions.length + 1}</span>}
//       </button>
//     </div>
//   );
// }

// ─── Collapsed Module Row ─────────────────────────────────────────────────────

function CollapsedModuleRow({ m, idx, onEdit, onDelete }) {
  const isQuiz  = m.type === "QUIZ" || m.type === "FINAL_QUIZ";
  const isFinal = m.type === "FINAL_QUIZ";
  const typeLabel = MODULE_TYPES.find(t => t.type === m.type)?.label ?? m.type;
  const summaryParts = [];
  if (isQuiz) {
    summaryParts.push(`${m.questions?.length ?? 0} question${(m.questions?.length ?? 0) !== 1 ? "s" : ""}`);
  } else {
    const videos = m.lessons.filter(l => l.contentType === "VIDEO").length;
    const pdfs   = m.lessons.filter(l => l.contentType === "PDF").length;
    if (videos) summaryParts.push(`${videos} video${videos > 1 ? "s" : ""}`);
    if (pdfs)   summaryParts.push(`${pdfs} PDF${pdfs > 1 ? "s" : ""}`);
    if (!videos && !pdfs) summaryParts.push("no content yet");
  }
  const accentClass = isFinal ? "collapsed-final" : isQuiz ? "collapsed-quiz" : "collapsed-lesson";
  return (
    <div className={`cb-collapsed-row ${accentClass}`}>
      <div className="cb-collapsed-left">
        <div className={`cb-module-num ${isQuiz ? (isFinal ? "quiz-final" : "quiz") : ""}`} style={{ flexShrink: 0 }}>{idx + 1}</div>
        <span className="cb-collapsed-title">{m.title || `Module ${idx + 1}`}</span>
      </div>
      <div className="cb-collapsed-meta">
        <span className={`cb-collapsed-type-badge ${isFinal ? "final" : isQuiz ? "quiz" : "lesson"}`}>{typeLabel}</span>
        {summaryParts.map((p, i) => <span key={i} className="cb-collapsed-summary-chip">{p}</span>)}
      </div>
      <div className="cb-collapsed-actions">
        <button className="cb-btn cb-btn-outline cb-btn-sm" onClick={() => onEdit(m.id)}><EditIcon /> Edit</button>
        <button className="cb-icon-btn delete" onClick={() => onDelete(m.id)} title="Delete module"><DeleteIcon /></button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [categories, setCategories] = useState([]);
  const [levels,     setLevels]     = useState([]);

  const [grades,     setGrades]     = useState([]);
  

  const [form, setForm] = useState({
    title: "", categoryId: "", levelId: "",
    durationId: "",  description: "", createdBy: "", status: "Draft",
    thumbnailFile: null, thumbnailName: "",
    gradeIds: [],
  });
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const thumbnailInputRef = useRef(null);

  // ── Validation errors ──────────────────────────────────────────────────────
const [errors, setErrors] = useState<Record<string, string>>({});

const [durationTypes, setDurationTypes] = useState([]);

const validateStep1 = () => {
  const e: Record<string, string> = {};

  if (!form.title.trim())
    e.title = "Title is required";

  if (!form.categoryId)
    e.categoryId = "Category is required";

  if (!form.levelId)
    e.levelId = "Level is required";

  if (!form.durationId)
    e.durationId = "Duration is required";

  if (form.gradeIds.length === 0)
    e.gradeIds = "At least one grade is required";

  if (!form.description.trim())
    e.description = "Description is required";

  if (!form.thumbnailFile)
    e.thumbnail = "Thumbnail is required";

  if (!form.createdBy.trim())
    e.createdBy = "Created By is required";

  if (!form.status)
    e.status = "Status is required";

  setErrors(e);

  return Object.keys(e).length === 0;
};

  const clearError = (field) => setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const [modules,  setModules]  = useState([]);
  const [savedModuleIds, setSavedModuleIds] = useState([]);

  const [schedule, setSchedule] = useState({ dripContent: true, startDate: today, releaseIntervalDays: 7 });
  const [tests,    setTests]    = useState([]);
  const [rules,    setRules]    = useState(DEFAULT_RULES);

  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState("");
  const [delModal, setDelModal] = useState(null);

  const [uploadTarget,   setUploadTarget]   = useState(null);
  const [uploadFile,     setUploadFile]     = useState(null);
  const [videoLinkDraft, setVideoLinkDraft] = useState(["", "", ""]);
  const fileInputRef = useRef(null);

  const [enums, setEnums] = useState({ difficulties: [], bloomLevels: [], questionTypes: [] });

  useEffect(() => {
    (async () => {
      try {
        const [catRes, lvlRes, durRes, enumRes, gradeRes] = await Promise.all([
          fetch("/api/course-categories?limit=100"),
          fetch("/api/levels?limit=100"),
          fetch("/api/duration?limit=100"),
          fetch("/api/enums"),
          fetch("/api/grade?limit=100"),
        ]);
        const catJson   = await catRes.json();
        const lvlJson   = await lvlRes.json();
        const durJson   = await durRes.json();
        const enumJson  = await enumRes.json();
        const gradeJson = await gradeRes.json();
        if (gradeJson.status || gradeJson.success) setGrades(gradeJson.data ?? []);
        if (catJson.status   || catJson.success)   setCategories(catJson.data  ?? []);
        if (lvlJson.status   || lvlJson.success)   setLevels(lvlJson.data      ?? []);
        if (durJson.status   || durJson.success)   setDurationTypes(durJson.data   ?? []);
        if (enumJson.status) {
          setEnums({
            difficulties:  enumJson.data.difficulties  || [],
            bloomLevels:   enumJson.data.bloomLevels   || [],
            questionTypes: enumJson.data.questionTypes || [],
          });
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  const showToast     = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const confirmDelete = (msg, onConfirm) => setDelModal({ msg, onConfirm });

  // ── Thumbnail ──────────────────────────────────────────────────────────────
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm(prev => ({ ...prev, thumbnailFile: file, thumbnailName: file.name }));
    clearError("thumbnail");
    const reader = new FileReader();
reader.onload = (ev) => {
  const result = ev.target?.result;

  if (typeof result === "string") {
    setThumbnailPreview(result);
  }
};
    reader.readAsDataURL(file);
  };
  const removeThumbnail = () => {
    setForm(prev => ({ ...prev, thumbnailFile: null, thumbnailName: "" }));
    setThumbnailPreview("");
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  // ── Module helpers ─────────────────────────────────────────────────────────
  const addModule = () =>
    setModules(prev => [...prev, {
      id: `mod_${Date.now()}`,
      title: `Module ${prev.length + 1}`,
      type: "LESSON",
      order: prev.length + 1,
      description: "",
      lessons: [],
      questions: [],
    }]);

  const removeModule = (id) =>
    confirmDelete("Delete this module and all its lessons/questions?", () => {
      setModules(prev => prev.filter(m => m.id !== id));
      setSavedModuleIds(prev => prev.filter(sid => sid !== id));
    });

  const updateModule = (id, patch) =>
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));

  const updateModuleQuestions = (moduleId, questions) =>
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, questions } : m));

  const saveModule = (moduleId) => { setSavedModuleIds(prev => [...prev, moduleId]); showToast("Module saved!"); };
  const editModule = (moduleId) => setSavedModuleIds(prev => prev.filter(id => id !== moduleId));

  // ── Lesson helpers ─────────────────────────────────────────────────────────
  const addLesson = (moduleId, contentType) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    if (!canAddLesson(module, contentType)) { showToast(disabledReason(module, contentType)); return; }
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m, lessons: [...m.lessons, {
        id: `les_${Date.now()}`,
        title: contentType.charAt(0) + contentType.slice(1).toLowerCase(),
        contentType,
        fileUrl: "",
        videoLinks: [],
        order: m.lessons.length + 1,
      }],
    } : m));
  };

  const removeLesson = (moduleId, lessonId) =>
    confirmDelete("Delete this lesson?", () =>
      setModules(prev => prev.map(m => m.id === moduleId
        ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m)));

  const updateLesson = (moduleId, lessonId, patch) =>
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l),
    } : m));

  // ── Upload modal helpers ───────────────────────────────────────────────────
  const openUploadModal = (moduleId, lessonId, contentType) => {
    const lesson = modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
    setUploadTarget({ moduleId, lessonId, contentType });
    setUploadFile(null);
    if (contentType === "VIDEO") {
      const ex = lesson?.videoLinks ?? [];
      setVideoLinkDraft([ex[0] ?? "", ex[1] ?? "", ex[2] ?? ""]);
    } else setVideoLinkDraft(["", "", ""]);
  };
  const closeUploadModal = () => { setUploadTarget(null); setUploadFile(null); setVideoLinkDraft(["", "", ""]); };
  const handleFileChange = (e) => setUploadFile(e.target.files?.[0] ?? null);
  const handleUploadConfirm = () => {
    if (!uploadTarget) return;
    const { moduleId, lessonId, contentType } = uploadTarget;
    if (contentType === "VIDEO") {
      const links = videoLinkDraft.map(l => l.trim()).filter(Boolean);
      if (links.length === 0) { showToast("Please enter at least one video link"); return; }
      updateLesson(moduleId, lessonId, { videoLinks: links, fileUrl: "" });
      showToast(`${links.length} video link${links.length > 1 ? "s" : ""} saved!`);
    } else if (contentType === "PDF") {
      if (!uploadFile) { showToast("Please select a PDF file"); return; }
      updateLesson(moduleId, lessonId, { fileUrl: uploadFile.name, videoLinks: [] });
      showToast("PDF uploaded successfully!");
    }
    closeUploadModal();
  };

  // ── Test helpers ───────────────────────────────────────────────────────────
  const addTest = () =>
    setTests(prev => [...prev, {
      id: `tst_${Date.now()}`,
      name: `Intermediate Test ${prev.length + 1}`,
      afterModuleId: modules[0]?.id ?? "",
      passingScore: 70, retakeAllowed: true, maxRetakes: 3,
    }]);
  const removeTest = (id) => confirmDelete("Delete this test?", () => setTests(prev => prev.filter(t => t.id !== id)));
  const updateTest = (id, patch) => setTests(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  const uploadThumbnail = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'thumbnails'); // or 'courses' – adjust to your folder structure

  const res = await fetch('/api/uploads', { method: 'POST', body: formData });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Upload failed');
  }
  const result = await res.json();
  if (!result.success) throw new Error(result.error || 'Upload failed');
  return result.data.url; // e.g., "/uploads/thumbnails/image-123.jpg"
};

  // ── Save course ────────────────────────────────────────────────────────────
  // const handleSave = async () => {
  //   if (!validateStep1()) {
  //     setStep(1);
  //     showToast("Please fill in all required fields");
  //     return;
  //   }
  //   setSaving(true);
  //   try {
  //     const payload = {
  //       ...form, thumbnailFile: undefined,
  //       modules: modules.map(m => ({
  //         title: m.title, type: m.type, order: m.order, description: m.description,
  //         lessons: m.lessons.map(l => ({
  //           title: l.title, contentType: l.contentType,
  //           fileUrl: l.fileUrl, videoLinks: l.videoLinks, order: l.order,
  //         })),
  //         questions: (m.type === "QUIZ" || m.type === "FINAL_QUIZ")
  //           ? m.questions.map(q => ({
  //               text: q.text, points: q.points, difficulty: q.difficulty,
  //               bloomLevel: q.bloomLevel, questionType: q.questionType,
  //               codeSnippet: q.codeSnippet || null, codeLanguage: q.codeLanguage || null,
  //               explanation: q.description || null,
  //               options: q.options.map((o, oi) => ({ text: o.text, isCorrect: o.id === q.correctOptionId, order: oi + 1 })),
  //             }))
  //           : [],
  //       })),
  //       schedule, intermediateTests: tests, eligibilityRules: rules,
  //     };
  //     const res  = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  //     const json = await res.json();
  //     if (json.status || json.success) {
  //       showToast("Course created successfully!");
  //       setTimeout(() => router.push("/admin/dashboard/master/courses"), 1000);
  //     } else showToast("Failed to save course");
  //   } catch (e) {
  //     console.error(e); showToast("An error occurred");
  //   } finally { setSaving(false); }
  // };
  const handleSave = async () => {
  if (!validateStep1()) {
    setStep(1);
    showToast("Please fill in all required fields");
    return;
  }
  setSaving(true);
  try {
    // 1. Upload thumbnail first
    let thumbnailUrl = null;
    if (form.thumbnailFile) {
      thumbnailUrl = await uploadThumbnail(form.thumbnailFile);
    } else {
      showToast("Thumbnail is required");
      setSaving(false);
      return;
    }

    // 2. Build payload
    const payload = {
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      levelId: form.levelId,
      validityPeriodId: form.durationId, // maps to duration ID from validity-periods
      status: form.status,
      createdBy: form.createdBy,
      thumbnailUrl,                     // ← now included
      gradeIds: form.gradeIds,
      modules: modules.map(m => ({
        title: m.title,
        type: m.type,
        order: m.order,
        description: m.description,
        lessons: m.lessons.map(l => ({
          title: l.title,
          contentType: l.contentType,
          fileUrl: l.fileUrl,
          videoLinks: l.videoLinks,
          order: l.order,
        })),
        questions: (m.type === "QUIZ" || m.type === "FINAL_QUIZ")
          ? m.questions.map(q => ({
               text:          q.text ?? "",
  inputMode:     q.inputMode ?? "text",
  questionImage: q.questionImage || null,
  points:        q.points,
  difficulty:    q.difficulty,
  bloomLevel:    q.bloomLevel,
  questionType:  q.questionType,
  codeSnippet:   q.codeSnippet || null,
  codeLanguage:  q.codeLanguage || null,
  explanation:   q.description || null,
  options: q.options.map((o, oi) => ({
    text:      o.text ?? "",
    isCorrect: o.id === q.correctOptionId,
    order:     oi + 1,
    inputMode: o.inputMode ?? "text",
    imageData: o.imageData || null,
              })),
            }))
          : [],
      })),
      schedule,
      intermediateTests: tests,
      eligibilityRules: rules,
    };

    // 3. Create course
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.status || json.success) {
      showToast("Course created successfully!");
      setTimeout(() => router.push("/admin/dashboard/master/courses"), 1000);
    } else {
      showToast(json.message || "Failed to save course");
    }
  } catch (e: any) {
    console.error(e);
    showToast(e.message || "An error occurred");
  } finally {
    setSaving(false);
  }
};

  const getReleaseDate = (idx) => {
    const base = schedule.startDate ? new Date(schedule.startDate) : new Date();
    base.setDate(base.getDate() + idx * schedule.releaseIntervalDays);
    return base;
  };

  const goStep = (n) => {
    if (n > 1 && step === 1) {
      if (!validateStep1()) { showToast("Please fill in all required fields"); return; }
    }
    setStep(n);
  };

  const stepConfig = [
    { num: 1, label: "Course Info"   },
    { num: 2, label: "Modules"       },
    { num: 3, label: "Timeline"      },
    { num: 4, label: "Tests & Rules" },
  ];

  const lessonHasContent = (l) =>
    l.contentType === "VIDEO" ? l.videoLinks.length > 0 : !!l.fileUrl;

  const getModuleHint = (m) => {
    if (m.type === "LESSON")   { const v = m.lessons.filter(l => l.contentType === "VIDEO").length; const p = m.lessons.filter(l => l.contentType === "PDF").length; return `${v}/3 Videos · ${p}/1 PDF`; }
    if (m.type === "REVISION") { const v = m.lessons.filter(l => l.contentType === "VIDEO").length; return `${v}/1 Video (Revision)`; }
    return "";
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="cb-page">

      {/* ── Header ── */}
      <div className="cb-header">
        <div>
          <h1 className="cb-title">Course Builder</h1>
          <p className="cb-subtitle">Create comprehensive courses with modules, lessons and assessments</p>
        </div>
        <div className="cb-header-actions">
          <button className="cb-btn cb-btn-outline" onClick={() => showToast("Preview coming soon")}>
            <EyeIcon /> Preview
          </button>
          <button className="cb-btn cb-btn-green" onClick={handleSave} disabled={saving}>
            <SaveIcon /> {saving ? "Saving…" : "Save Course"}
          </button>
        </div>
      </div>

      {/* ── Steps ── */}
      <div className="cb-steps-bar">
        {stepConfig.map((s, i) => (
          <div key={s.num} className="cb-step-item">
            <button className="cb-step-btn" onClick={() => goStep(s.num)}>
              <div className={`cb-step-circle ${step > s.num ? "done" : step === s.num ? "active" : "todo"}`}>{s.num}</div>
              <span className={`cb-step-label ${step === s.num ? "active" : ""}`}>{s.label}</span>
            </button>
            {i < stepConfig.length - 1 && <div className="cb-step-divider" />}
          </div>
        ))}
      </div>

      {/* ══ STEP 1 — Course Info ══ */}
      {step === 1 && (
        <div className="cb-card">
          <h2 className="cb-card-title">Course Information</h2>

          {/* Row 1: Title + Category */}
          <div className="cb-grid-title-cat">
            <div className="cb-field">
              <label className="cb-label">Title <span className="cb-req">*</span></label>
              <input
                className={`cb-input ${errors.title ? "cb-input-error" : ""}`}
                placeholder="e.g. Advanced Python Programming"
                value={form.title}
                onChange={e => { setForm({ ...form, title: e.target.value }); clearError("title"); }}
              />
              {errors.title && <span className="cb-error-msg"><ErrorIcon />{errors.title}</span>}
            </div>
            <div className="cb-field">
              <label className="cb-label">Category <span className="cb-req">*</span></label>
              <select
                className={`cb-input ${errors.categoryId ? "cb-input-error" : ""}`}
                value={form.categoryId}
                onChange={e => { setForm({ ...form, categoryId: e.target.value }); clearError("categoryId"); }}
              >
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <span className="cb-error-msg"><ErrorIcon />{errors.categoryId}</span>}
            </div>
          </div>

          {/* Row 2: Level + Duration + Grade */}
       <div className="cb-grid3">
  <div className="cb-field">
    <label className="cb-label">Level <span className="cb-req">*</span></label>
    <select
      className={`cb-input ${errors.levelId ? "cb-input-error" : ""}`}
      value={form.levelId}
      onChange={e => { setForm({ ...form, levelId: e.target.value }); clearError("levelId"); }}
    >
      <option value="">Select level…</option>
      {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
    </select>
    {errors.levelId && <span className="cb-error-msg"><ErrorIcon />{errors.levelId}</span>}
  </div>
  
  {/* NEW: Duration selector with value + unit */}
  <div className="cb-field">
    <label className="cb-label">Duration <span className="cb-req">*</span></label>
    <select
      className={`cb-input ${errors.durationId ? "cb-input-error" : ""}`}
      value={form.durationId}
      onChange={e => { setForm({ ...form, durationId: e.target.value }); clearError("durationId"); }}
    >
      <option value="">Select duration…</option>
      {durationTypes.map(dt => (
        <option key={dt.id} value={dt.id}>
          {dt.value} {dt.unit} {!dt.isActive && "(Inactive)"}
        </option>
      ))}
    </select>
    {errors.durationId && <span className="cb-error-msg"><ErrorIcon />{errors.durationId}</span>}
  </div>
  
  <div className="cb-field">
    <label className="cb-label">Grade <span className="cb-req">*</span></label>
    <GradeMultiSelect
      grades={grades}
      selected={form.gradeIds}
      onChange={(ids) => { setForm(prev => ({ ...prev, gradeIds: ids })); clearError("gradeIds"); }}
      error={!!errors.gradeIds}
    />
    {errors.gradeIds && <span className="cb-error-msg"><ErrorIcon />{errors.gradeIds}</span>}
  </div>
</div>


          {/* Row 3: Description */}
          <div className="cb-field">
            <label className="cb-label">Description <span className="cb-req">*</span></label>
            <textarea
              className={`cb-textarea ${errors.description ? "cb-input-error" : ""}`}
              rows={3}
              placeholder="Brief description of this course…"
              value={form.description}
              onChange={e => { setForm({ ...form, description: e.target.value }); clearError("description"); }}
            />
            {errors.description && <span className="cb-error-msg"><ErrorIcon />{errors.description}</span>}
          </div>

          {/* Row 4: Thumbnail */}
          <div className="cb-field">
            <label className="cb-label">Thumbnail <span className="cb-req">*</span></label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview ? (
              <div className={`cb-thumb-preview-wrap ${errors.thumbnail ? "cb-thumb-error" : ""}`}>
                <img src={thumbnailPreview} alt="Thumbnail preview" className="cb-thumb-preview-img" />
                <div className="cb-thumb-preview-info">
                  <p className="cb-thumb-filename">{form.thumbnailName}</p>
                  <p className="cb-thumb-meta">{form.thumbnailFile ? `${(form.thumbnailFile.size / 1048576).toFixed(1)} MB` : ""}</p>
                  <div className="cb-thumb-actions">
                    <button className="cb-btn cb-btn-outline cb-btn-sm" onClick={() => thumbnailInputRef.current?.click()}><UploadSmallIcon /> Change Image</button>
                    <button className="cb-btn cb-btn-danger-sm" onClick={removeThumbnail}><XSmallIcon /> Remove</button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`cb-upload-zone ${errors.thumbnail ? "cb-upload-zone-error" : ""}`}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <UploadIcon />
                <p className="cb-upload-title">Click to Upload Course Thumbnail</p>
                <p className="cb-upload-sub">PNG, JPG, WEBP up to 5 MB (1280×720 recommended)</p>
              </div>
            )}
            {errors.thumbnail && <span className="cb-error-msg"><ErrorIcon />{errors.thumbnail}</span>}
          </div>

          {/* Row 5: Created By + Status */}
          <div className="cb-grid2">
            <div className="cb-field" style={{ marginBottom: 0 }}>
              <label className="cb-label">Created By <span className="cb-req">*</span></label>
              <input
                className={`cb-input ${errors.createdBy ? "cb-input-error" : ""}`}
                placeholder="Instructor name…"
                value={form.createdBy}
                onChange={e => { setForm({ ...form, createdBy: e.target.value }); clearError("createdBy"); }}
              />
              {errors.createdBy && <span className="cb-error-msg"><ErrorIcon />{errors.createdBy}</span>}
            </div>
            <div className="cb-field" style={{ marginBottom: 0 }}>
              <label className="cb-label">Status <span className="cb-req">*</span></label>
              <select
                className={`cb-input ${errors.status ? "cb-input-error" : ""}`}
                value={form.status}
                onChange={e => { setForm({ ...form, status: e.target.value }); clearError("status"); }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <span className="cb-error-msg"><ErrorIcon />{errors.status}</span>}
            </div>
          </div>

          <div className="cb-nav" style={{ marginTop: "1.75rem" }}>
            <span />
            <button className="cb-btn cb-btn-green" onClick={() => goStep(2)}>Next: Add Modules →</button>
          </div>
        </div>
      )}

      {/* ══ STEP 2 — Modules ══ */}
      {step === 2 && (
        <div>
          <div className="cb-section-head">
            <span className="cb-section-heading">Modules & Lessons</span>
            <button className="cb-btn cb-btn-green" onClick={addModule}><PlusIcon /> Add Module</button>
          </div>

          <div className="cb-info-box" style={{ marginBottom: "1rem" }}>
            <InfoIcon />
            <p>
              <strong style={{ color: "#c0dd97" }}>Lesson</strong> — up to 3 Videos, 1 PDF.&nbsp;
              <strong style={{ color: "#7dd3fc" }}>Revision</strong> — 1 Video only.&nbsp;
              <strong style={{ color: "#c4b5fd" }}>Quiz / Final Quiz</strong> — question builder with optional code snippets.
              &nbsp;Click <strong style={{ color: "#94a3b8" }}>Save Module</strong> to collapse each module when done.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="cb-empty">
              <ModulesIcon />
              <p>No modules yet — add your first module above</p>
            </div>
          ) : (
            modules.map((m, idx) => {
              const isSaved = savedModuleIds.includes(m.id);
              const isQuiz  = m.type === "QUIZ" || m.type === "FINAL_QUIZ";
              const isFinal = m.type === "FINAL_QUIZ";

              if (isSaved) {
                return (
                  <CollapsedModuleRow key={m.id} m={m} idx={idx} onEdit={editModule} onDelete={(id) => removeModule(id)} />
                );
              }

              return (
                <div key={m.id} className={`cb-module-block ${isQuiz ? (isFinal ? "mod-final-quiz" : "mod-quiz") : ""}`}>
                  <div className="cb-module-header">
                    <GripIcon />
                    <div className={`cb-module-num ${isQuiz ? (isFinal ? "quiz-final" : "quiz") : ""}`}>{idx + 1}</div>
                    <input className="cb-module-title-input" value={m.title} onChange={e => updateModule(m.id, { title: e.target.value })} />
                    <div className="cb-module-header-right">
                      <select
                        className={`cb-module-type-select ${isQuiz ? (isFinal ? "final-quiz-select" : "quiz-select") : ""}`}
                        value={m.type}
                        onChange={e => updateModule(m.id, { type: e.target.value })}
                      >
                        {MODULE_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                      </select>
                      <span className={`cb-count-badge ${isQuiz ? (isFinal ? "quiz-final-badge" : "quiz-badge") : ""}`}>
                        {isQuiz ? (m.questions?.length ?? 0) : m.lessons.length}
                      </span>
                      <button className="cb-icon-btn delete" onClick={() => removeModule(m.id)}><DeleteIcon /></button>
                    </div>
                  </div>

                  {!isQuiz && (m.type === "LESSON" || m.type === "REVISION") && (
                    <div className="cb-module-hint"><HintIcon /><span>{getModuleHint(m)}</span></div>
                  )}

                  {isQuiz ? (
                    <QuizBuilder moduleId={m.id} questions={m.questions ?? []} onUpdate={(qs) => updateModuleQuestions(m.id, qs)} isFinal={isFinal} enums={enums} />
                  ) : (
                    <div className="cb-lessons-wrap">
                      {m.lessons.map(l => (
                        <div key={l.id} className="cb-lesson-row">
                          <span className={`cb-lesson-icon lt-${l.contentType.toLowerCase()}`}><LessonTypeIcon type={l.contentType} /></span>
                          <input className="cb-lesson-title-input" value={l.title} onChange={e => updateLesson(m.id, l.id, { title: e.target.value })} />
                          {lessonHasContent(l) && (
                            <span className="cb-lesson-uploaded-badge">
                              <CheckSmallIcon />
                              {l.contentType === "VIDEO" ? `${l.videoLinks.length} link${l.videoLinks.length > 1 ? "s" : ""}` : "Uploaded"}
                            </span>
                          )}
                          {UPLOADABLE_TYPES.includes(l.contentType) && (
                            <button className="cb-icon-btn cb-upload-btn" title={l.contentType === "VIDEO" ? "Add video links (max 3)" : "Upload 1 PDF file"} onClick={() => openUploadModal(m.id, l.id, l.contentType)}>
                              <UploadSmallIcon />
                            </button>
                          )}
                          <button className="cb-icon-btn delete" style={{ width: 28, height: 28 }} onClick={() => removeLesson(m.id, l.id)}><DeleteIcon /></button>
                        </div>
                      ))}
                      <div className="cb-add-lesson-row">
                        {LESSON_TYPES.map(t => {
                          const allowed = canAddLesson(m, t.type);
                          return (
                            <button key={t.type} className={`cb-add-lesson-chip ${!allowed ? "disabled" : ""}`} title={!allowed ? disabledReason(m, t.type) : `Add ${t.label}`} disabled={!allowed} onClick={() => addLesson(m.id, t.type)}>
                              <PlusSmallIcon /> {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="cb-module-save-row">
                    <button className="cb-save-module-btn" onClick={() => saveModule(m.id)}>
                      <CheckSmallIcon /> Save Module
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <button className="cb-add-module-btn" onClick={addModule}><PlusIcon /> Add Module</button>

          <div className="cb-nav">
            <button className="cb-btn cb-btn-outline" onClick={() => goStep(1)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={() => goStep(3)}>Next: Timeline →</button>
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Timeline ══ */}
      {step === 3 && (
        <div className="cb-card">
          <h2 className="cb-card-title">Timeline & Schedule</h2>
          <div className="cb-info-box">
            <InfoIcon />
            <p>Module release interval controls how many days students wait between module access.</p>
          </div>
          <div className="cb-toggle-row">
            <div>
              <p className="cb-toggle-label">Drip Content System</p>
              <span className="cb-toggle-sub">Release modules gradually over time</span>
            </div>
            <label className="cb-toggle">
              <input type="checkbox" checked={schedule.dripContent} onChange={e => setSchedule({ ...schedule, dripContent: e.target.checked })} />
              <span className="cb-toggle-slider" />
            </label>
          </div>
          <div className="cb-grid2">
            <div className="cb-field">
              <label className="cb-label">Start Date</label>
              <input type="date" className="cb-input" value={schedule.startDate} onChange={e => setSchedule({ ...schedule, startDate: e.target.value })} />
            </div>
            <div className="cb-field">
              <label className="cb-label">Release Interval (days)</label>
              <input type="number" className="cb-input" min={1} value={schedule.releaseIntervalDays} onChange={e => setSchedule({ ...schedule, releaseIntervalDays: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          {modules.length > 0 && (
            <div className="cb-timeline-wrap">
              <p className="cb-tl-heading">Release Schedule Preview</p>
              {modules.map((m, idx) => {
                const date    = getReleaseDate(idx);
                const locked  = schedule.dripContent && date > new Date();
                const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                const isQuiz  = m.type === "QUIZ" || m.type === "FINAL_QUIZ";
                return (
                  <div key={m.id} className="cb-tl-item">
                    <div className="cb-tl-col">
                      <div className={`cb-tl-dot ${locked ? "locked" : ""}`}>{idx + 1}</div>
                      {idx < modules.length - 1 && <div className="cb-tl-line" />}
                    </div>
                    <div className="cb-tl-card">
                      <div className="cb-tl-card-head">
                        <span className="cb-tl-mod-name">{m.title}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {isQuiz && <span className="cb-tl-type-badge quiz">{m.type === "FINAL_QUIZ" ? "Final Quiz" : "Quiz"} · {m.questions?.length ?? 0}Q</span>}
                          {locked ? <span className="cb-tl-badge locked"><LockIcon /> Locked</span> : <span className="cb-tl-badge unlocked"><UnlockIcon /> Available</span>}
                        </div>
                      </div>
                      <p className="cb-tl-meta">
                        Releases: {dateStr}
                        {isQuiz ? ` · ${m.questions?.length ?? 0} question${(m.questions?.length ?? 0) !== 1 ? "s" : ""}` : ` · ${m.lessons.length} lesson${m.lessons.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="cb-nav">
            <button className="cb-btn cb-btn-outline" onClick={() => goStep(2)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={() => goStep(4)}>Next: Tests & Rules →</button>
          </div>
        </div>
      )}

      {/* ══ STEP 4 — Tests & Rules ══ */}
      {step === 4 && (
        <div className="cb-card">
          <h2 className="cb-card-title">Intermediate Tests</h2>
          {tests.length === 0 && <p className="cb-empty-inline">No intermediate tests added yet</p>}
          {tests.map(t => (
            <div key={t.id} className="cb-test-block">
              <div className="cb-test-header">
                <QuizIcon />
                <input className="cb-test-title-input" value={t.name} onChange={e => updateTest(t.id, { name: e.target.value })} />
                <button className="cb-icon-btn delete" onClick={() => removeTest(t.id)}><DeleteIcon /></button>
              </div>
              <div className="cb-grid2">
                <div className="cb-field">
                  <label className="cb-label">After Module</label>
                  <select className="cb-input" value={t.afterModuleId} onChange={e => updateTest(t.id, { afterModuleId: e.target.value })}>
                    {modules.length === 0 ? <option value="">— Add modules first —</option> : modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="cb-field">
                  <label className="cb-label">Passing Score (%)</label>
                  <input type="number" className="cb-input" min={0} max={100} value={t.passingScore} onChange={e => updateTest(t.id, { passingScore: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="cb-test-retake-row">
                <label className="cb-checkbox-label">
                  <input type="checkbox" checked={t.retakeAllowed} onChange={e => updateTest(t.id, { retakeAllowed: e.target.checked })} />
                  Allow Retakes
                </label>
                {t.retakeAllowed && (
                  <div className="cb-retake-count">
                    <span className="cb-label" style={{ margin: 0 }}>Max retakes:</span>
                    <input type="number" className="cb-input" min={0} max={10} style={{ width: 72 }} value={t.maxRetakes} onChange={e => updateTest(t.id, { maxRetakes: parseInt(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <button className="cb-add-module-btn" onClick={addTest} style={{ marginBottom: "2rem" }}><PlusIcon /> Add Intermediate Test</button>
          <h2 className="cb-card-title" style={{ borderTop: "1px solid #2d3448", paddingTop: "1.25rem" }}>Eligibility Rules</h2>
          {rules.map(r => (
            <div key={r.id} className="cb-rule-row">
              <div>
                <p className="cb-rule-label">{r.label}</p>
                <span className="cb-rule-desc">{r.desc}</span>
              </div>
              <label className="cb-toggle">
                <input type="checkbox" checked={r.enabled} onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: e.target.checked } : x))} />
                <span className="cb-toggle-slider" />
              </label>
            </div>
          ))}
          <div className="cb-nav">
            <button className="cb-btn cb-btn-outline" onClick={() => goStep(3)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={handleSave} disabled={saving}>
              <SaveIcon /> {saving ? "Saving…" : "Save & Publish"}
            </button>
          </div>
        </div>
      )}

      {/* ══ Upload Modal ══ */}
      {uploadTarget && (
        <div className="cb-overlay" onClick={closeUploadModal}>
          <div className="cb-modal cb-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cb-modal-header">
              <h2 className="cb-modal-title">{uploadTarget.contentType === "VIDEO" ? "Add Video Links" : "Upload PDF"}</h2>
              <button className="cb-modal-close" onClick={closeUploadModal}>✕</button>
            </div>
            <div className="cb-modal-body">
              {uploadTarget.contentType === "VIDEO" && (
                <>
                  <p className="cb-upload-modal-info">Add a <strong>video link</strong> (YouTube, Vimeo, etc.).</p>
                  {[0].map(i => (
                    <div key={i} className="cb-field">
                      <label className="cb-label">Video Link {i + 1} <span className="cb-req">*</span></label>
                      <input className="cb-input" placeholder="https://youtube.com/watch?v=..." value={videoLinkDraft[i]} onChange={e => { const u = [...videoLinkDraft]; u[i] = e.target.value; setVideoLinkDraft(u); }} />
                    </div>
                  ))}
                </>
              )}
              {uploadTarget.contentType === "PDF" && (
                <>
                  <p className="cb-upload-modal-info">Upload <strong>1 PDF file</strong> for this lesson.</p>
                  <div className={`cb-upload-modal-zone ${uploadFile ? "has-file" : ""}`} onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" style={{ display: "none" }} accept=".pdf" onChange={handleFileChange} />
                    {uploadFile ? (
                      <><div className="cb-upload-modal-icon success"><CheckIcon /></div><p className="cb-upload-modal-title success">{uploadFile.name}</p><p className="cb-upload-modal-sub">{(uploadFile.size / 1048576).toFixed(1)} MB · Click to change</p></>
                    ) : (
                      <><div className="cb-upload-modal-icon"><UploadBigIcon /></div><p className="cb-upload-modal-title">Click to upload PDF</p><p className="cb-upload-modal-sub">PDF only · Max 50MB · 1 file</p></>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="cb-modal-footer">
              <button className="cb-btn-cancel" onClick={closeUploadModal}>Cancel</button>
              <button className="cb-btn-green-solid" onClick={handleUploadConfirm} disabled={uploadTarget.contentType === "VIDEO" ? !videoLinkDraft[0].trim() : !uploadFile}>
                {uploadTarget.contentType === "VIDEO" ? "Save Links" : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Modal ══ */}
      {delModal && (
        <div className="cb-overlay" onClick={() => setDelModal(null)}>
          <div className="cb-modal cb-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cb-modal-header">
              <h2 className="cb-modal-title">Confirm Delete</h2>
              <button className="cb-modal-close" onClick={() => setDelModal(null)}>✕</button>
            </div>
            <div className="cb-modal-body">
              <div className="cb-delete-warn"><WarnIcon /><p>{delModal.msg}</p></div>
            </div>
            <div className="cb-modal-footer">
              <button className="cb-btn-cancel" onClick={() => setDelModal(null)}>Cancel</button>
              <button className="cb-btn-danger" onClick={() => { delModal.onConfirm(); setDelModal(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="cb-toast">{toast}</div>}

      <style>{styles}</style>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function PlusSmallIcon()  { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SaveIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function EyeIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function DeleteIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function EditIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function XSmallIcon()     { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function GripIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>; }
function InfoIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function HintIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function LockIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UnlockIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>; }
function WarnIcon()       { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function ModulesIcon()    { return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.25 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function QuizIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function QuizBannerIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function FinalQuizIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function QuizEmptyIcon()  { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function ExplainIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }
function CheckSmallIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function CheckIcon()      { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function UploadIcon()     { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", color: "#475569" }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function UploadSmallIcon(){ return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function UploadBigIcon()  { return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7c4fd4" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function CodeIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function ErrorIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function LessonTypeIcon({ type }) {
  switch (type) {
    case "VIDEO":    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case "PDF":      return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "DOCUMENT": return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
    default: return null;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  .cb-page { padding: 2rem 2.5rem; min-height: 100vh; background: #0f1117; color: #e2e8f0; font-family: 'DM Sans','Segoe UI',sans-serif; }

  .cb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .cb-title { font-size: 1.55rem; font-weight: 600; color: #f1f5f9; margin: 0 0 4px; letter-spacing: -0.3px; }
  .cb-subtitle { font-size: 0.84rem; color: #64748b; margin: 0; }
  .cb-header-actions { display: flex; gap: 10px; align-items: center; }

  .cb-btn { display: inline-flex; align-items: center; gap: 7px; padding: 0.5rem 1.1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; border: 1px solid transparent; }
  .cb-btn:active { transform: scale(0.97); }
  .cb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cb-btn-green { background: #3b6d11; color: #c0dd97; border-color: #639922; }
  .cb-btn-green:hover:not(:disabled) { background: #27500a; }
  .cb-btn-outline { background: transparent; color: #94a3b8; border-color: #2d3448; }
  .cb-btn-outline:hover { background: #1e2230; color: #e2e8f0; }
  .cb-btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
  .cb-btn-danger-sm { display: inline-flex; align-items: center; gap: 5px; padding: 0.35rem 0.75rem; border-radius: 7px; font-size: 0.78rem; font-weight: 500; cursor: pointer; background: transparent; border: 1px solid #7f1d1d; color: #fca5a5; transition: background 0.12s; }
  .cb-btn-danger-sm:hover { background: #2a0d0d; }
  .cb-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: background 0.15s, transform 0.1s; }
  .cb-icon-btn:active { transform: scale(0.9); }
  .cb-icon-btn.delete { color: #f87171; }
  .cb-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
  .cb-upload-btn { color: #7dd3fc; width: 28px; height: 28px; }
  .cb-upload-btn:hover { background: #0c1a2e; border-color: #163856; color: #bae6fd; }
  .cb-lesson-uploaded-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; background: #0c1a0c; border: 1px solid #1a5a1a; color: #86efac; font-size: 0.72rem; white-space: nowrap; }

  .cb-steps-bar { display: flex; align-items: center; background: #161b27; border: 1px solid #2d3448; border-radius: 12px; padding: 1.1rem 1.5rem; margin-bottom: 2rem; }
  .cb-step-item { display: flex; align-items: center; flex: 1; }
  .cb-step-btn { display: flex; align-items: center; gap: 10px; padding: 0.4rem 0.6rem; border-radius: 8px; background: none; border: none; cursor: pointer; transition: background 0.15s; }
  .cb-step-btn:hover { background: #1e2230; }
  .cb-step-circle { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 600; transition: background 0.2s; }
  .cb-step-circle.active { background: #3b6d11; color: #c0dd97; border: 1px solid #639922; box-shadow: 0 0 0 3px rgba(99,153,34,0.18); }
  .cb-step-circle.done   { background: #3b6d11; color: #c0dd97; border: 1px solid #639922; }
  .cb-step-circle.todo   { background: #1a2030; border: 1px solid #2d3448; color: #475569; }
  .cb-step-label { font-size: 0.82rem; font-weight: 500; color: #64748b; }
  .cb-step-label.active { color: #f1f5f9; }
  .cb-step-divider { flex: 1; height: 1px; background: #2d3448; margin: 0 6px; }

  .cb-card { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; padding: 1.75rem; }
  .cb-card-title { font-size: 1.05rem; font-weight: 600; color: #f1f5f9; margin: 0 0 1.4rem; }

  /* ── Layout: Title + Category side by side, title shorter ── */
  .cb-grid-title-cat {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
    margin-bottom: 1.1rem;
    align-items: start;
  }

  .cb-field { margin-bottom: 1.1rem; }
  .cb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.1rem; }
  .cb-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.85rem; margin-bottom: 1.1rem; }
  .cb-label { display: block; font-size: 0.81rem; font-weight: 500; color: #94a3b8; margin-bottom: 6px; }
  .cb-req { color: #f87171; }
  .cb-input { width: 100%; padding: 0.52rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; appearance: none; font-family: inherit; }
  .cb-input::placeholder { color: #475569; }
  .cb-input:focus { border-color: #639922; }
  .cb-input-error { border-color: #e24b4a !important; }
  .cb-input-error:focus { border-color: #e24b4a !important; box-shadow: 0 0 0 3px rgba(226,75,74,0.15); }
  .cb-error-msg { display: flex; align-items: center; gap: 5px; margin-top: 5px; font-size: 0.75rem; color: #f87171; line-height: 1.4; }
  .cb-textarea { width: 100%; padding: 0.6rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; resize: vertical; min-height: 80px; transition: border-color 0.15s; box-sizing: border-box; font-family: inherit; }
  .cb-textarea::placeholder { color: #475569; }
  .cb-textarea:focus { border-color: #639922; }

  /* ── Grade Multi-Select ── */
  .gms-wrap { position: relative; width: 100%; }
  .gms-trigger {
    width: 100%; padding: 0.52rem 0.85rem;
    background: #1a2030; border: 1px solid #2d3448; border-radius: 8px;
    color: #e2e8f0; font-size: 0.875rem; outline: none;
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; transition: border-color 0.15s; box-sizing: border-box;
    font-family: inherit; text-align: left;
  }
  .gms-trigger:hover { border-color: #3a4460; }
  .gms-trigger:focus, .gms-trigger-open { border-color: #639922; }
  .gms-trigger-error { border-color: #e24b4a !important; }
  .gms-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gms-label.placeholder { color: #475569; }
  .gms-count-pill {
    background: #3b6d11; border: 1px solid #639922; color: #c0dd97;
    font-size: 0.7rem; font-weight: 700; padding: 1px 7px; border-radius: 20px;
    flex-shrink: 0;
  }
  .gms-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 40;
    background: #1a2030; border: 1px solid #3a4460; border-radius: 9px;
    padding: 4px; max-height: 220px; overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    animation: cb-slideUp 0.15s ease;
  }
  .gms-empty { padding: 10px 12px; font-size: 0.8rem; color: #475569; }
  .gms-option {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 0.55rem 0.75rem; border-radius: 6px; border: none;
    background: transparent; color: #94a3b8; font-size: 0.85rem;
    cursor: pointer; transition: background 0.12s, color 0.12s;
    text-align: left; font-family: inherit;
  }
  .gms-option:hover { background: #252f42; color: #e2e8f0; }
  .gms-option.selected { color: #c0dd97; }
  .gms-option.selected:hover { background: #1f3d09; }
  .gms-option-check {
    width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
    border: 1.5px solid #3a4460; display: flex; align-items: center; justify-content: center;
    transition: background 0.12s, border-color 0.12s;
  }
  .gms-option.selected .gms-option-check {
    background: #3b6d11; border-color: #639922; color: #c0dd97;
  }
  .gms-option-label { flex: 1; }

  .cb-upload-zone { border: 2px dashed #2d3448; border-radius: 10px; padding: 2rem 1rem; text-align: center; cursor: pointer; transition: border-color 0.15s; }
  .cb-upload-zone:hover { border-color: #639922; }
  .cb-upload-zone-error { border-color: #e24b4a !important; }
  .cb-upload-title { font-size: 0.88rem; font-weight: 500; color: #94a3b8; margin-bottom: 4px; }
  .cb-upload-sub { font-size: 0.78rem; color: #475569; }
  .cb-thumb-preview-wrap { display: flex; align-items: flex-start; gap: 1.1rem; padding: 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 10px; }
  .cb-thumb-preview-wrap.cb-thumb-error { border-color: #e24b4a; }
  .cb-thumb-preview-img { width: 128px; height: 72px; object-fit: cover; border-radius: 6px; flex-shrink: 0; border: 1px solid #2d3448; }
  .cb-thumb-preview-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .cb-thumb-filename { font-size: 0.84rem; font-weight: 500; color: #f1f5f9; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
  .cb-thumb-meta { font-size: 0.75rem; color: #64748b; margin: 0; }
  .cb-thumb-actions { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }

  .cb-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .cb-section-heading { font-size: 1.05rem; font-weight: 600; color: #f1f5f9; }

  /* ── Collapsed module row ── */
  .cb-collapsed-row { display: flex; align-items: center; gap: 12px; background: #161b27; border: 1px solid #2d3448; border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 0.6rem; transition: border-color 0.15s, background 0.15s; animation: cb-slideUp 0.2s ease; }
  .cb-collapsed-row:hover { border-color: #3a4460; background: #1a2030; }
  .cb-collapsed-row.collapsed-quiz { border-color: #2d3a1a; }
  .cb-collapsed-row.collapsed-quiz:hover { border-color: #639922; }
  .cb-collapsed-row.collapsed-final { border-color: #2d1f4a; }
  .cb-collapsed-row.collapsed-final:hover { border-color: #7c4fd4; }
  .cb-collapsed-row.collapsed-lesson { border-left: 3px solid #3a4460; }
  .cb-collapsed-row.collapsed-quiz { border-left: 3px solid #639922; }
  .cb-collapsed-row.collapsed-final { border-left: 3px solid #7c4fd4; }
  .cb-collapsed-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .cb-collapsed-title { font-size: 0.95rem; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cb-collapsed-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }
  .cb-collapsed-type-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; white-space: nowrap; }
  .cb-collapsed-type-badge.lesson { background: #1a2030; border: 1px solid #3a4460; color: #7dd3fc; }
  .cb-collapsed-type-badge.quiz   { background: #1a2d0a; border: 1px solid #639922; color: #c0dd97; }
  .cb-collapsed-type-badge.final  { background: #1a0f30; border: 1px solid #7c4fd4; color: #c4b5fd; }
  .cb-collapsed-summary-chip { padding: 3px 9px; border-radius: 20px; background: #1a2030; border: 1px solid #252d3e; color: #64748b; font-size: 0.72rem; white-space: nowrap; }
  .cb-collapsed-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  /* ── Expanded module block ── */
  .cb-module-block { background: #1a2030; border: 1px solid #2d3448; border-radius: 10px; padding: 1.1rem 1.2rem; margin-bottom: 0.85rem; transition: border-color 0.15s; animation: cb-slideUp 0.2s ease; }
  .cb-module-block:hover { border-color: #3a4460; }
  .cb-module-block.mod-quiz { border-color: #2d3a1a; }
  .cb-module-block.mod-quiz:hover { border-color: #3b6d11; }
  .cb-module-block.mod-final-quiz { border-color: #3d2a6e; }
  .cb-module-block.mod-final-quiz:hover { border-color: #7c4fd4; }
  .cb-module-header { display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; flex-wrap: nowrap; }
  .cb-module-header > svg { color: #475569; cursor: grab; }
  .cb-module-num { width: 28px; height: 28px; border-radius: 6px; background: #3b6d11; border: 1px solid #639922; color: #c0dd97; font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cb-module-num.quiz { background: #3b6d11; border-color: #639922; color: #c0dd97; }
  .cb-module-num.quiz-final { background: #3d2a6e; border-color: #7c4fd4; color: #c4b5fd; }
  .cb-module-title-input { flex: 1; background: transparent; border: none; border-bottom: 1.5px solid transparent; color: #f1f5f9; font-size: 1rem; font-weight: 600; outline: none; padding: 2px 4px; transition: border-color 0.15s; font-family: inherit; }
  .cb-module-title-input:hover { border-bottom-color: #3a4460; }
  .cb-module-title-input:focus { border-bottom-color: #639922; }
  .cb-module-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }
  .cb-module-type-select { padding: 5px 26px 5px 12px; background: #12111e; border: 1px solid #3d2a6e; border-radius: 20px; color: #c4b5fd; font-size: 0.78rem; font-weight: 600; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23a78bfa' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; transition: border-color 0.15s; font-family: inherit; }
  .cb-module-type-select:focus { border-color: #7c4fd4; box-shadow: 0 0 0 3px rgba(124,79,212,0.2); }
  .cb-module-type-select.quiz-select { background-color: #111a08; border-color: #3b6d11; color: #c0dd97; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23639922' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); }
  .cb-module-type-select.final-quiz-select { background-color: #12111e; border-color: #7c4fd4; color: #c4b5fd; }
  .cb-module-type-select option { background: #161b27; color: #e2e8f0; }
  .cb-count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 8px; background: #0c1627; border: 1px solid #1a3a5e; color: #60a5fa; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
  .cb-count-badge.quiz-badge { background: #0c1a08; border-color: #1a4a0a; color: #86efac; }
  .cb-count-badge.quiz-final-badge { background: #1a0c2e; border-color: #4a1a7a; color: #c4b5fd; }
  .cb-module-hint { display: flex; align-items: center; gap: 6px; padding: 5px 4px 10px; font-size: 0.75rem; color: #64748b; }

  .cb-module-save-row { display: flex; justify-content: flex-end; margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid #252d3e; }
  .cb-save-module-btn { display: inline-flex; align-items: center; gap: 7px; padding: 0.5rem 1.25rem; background: #3b6d11; border: 1px solid #639922; border-radius: 8px; color: #c0dd97; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; font-family: inherit; }
  .cb-save-module-btn:hover { background: #27500a; }
  .cb-save-module-btn:active { transform: scale(0.97); }

  .cb-lessons-wrap { padding-left: 38px; }
  .cb-lesson-row { display: flex; align-items: center; gap: 8px; padding: 0.52rem 0.75rem; background: #161b27; border: 1px solid #2d3448; border-radius: 7px; margin-bottom: 6px; }
  .cb-lesson-icon { width: 24px; height: 24px; border-radius: 5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lt-video    { background: #0c1a2e; border: 1px solid #163856; color: #7dd3fc; }
  .lt-pdf      { background: #1a0c0c; border: 1px solid #5a1a1a; color: #fca5a5; }
  .lt-document { background: #1a1430; border: 1px solid #3d2060; color: #c4b5fd; }
  .cb-lesson-title-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid transparent; color: #e2e8f0; font-size: 0.84rem; outline: none; padding: 1px 3px; font-family: inherit; }
  .cb-lesson-title-input:focus { border-bottom-color: #639922; }
  .cb-add-lesson-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .cb-add-lesson-chip { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; border: 1px solid #2d3448; background: transparent; color: #64748b; font-size: 0.78rem; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
  .cb-add-lesson-chip:hover:not(:disabled) { border-color: #639922; color: #c0dd97; }
  .cb-add-lesson-chip.disabled, .cb-add-lesson-chip:disabled { opacity: 0.35; cursor: not-allowed; border-color: #1e2230; color: #3a4460; }
  .cb-add-module-btn { width: 100%; padding: 0.85rem; border: 2px dashed #2d3448; border-radius: 10px; background: transparent; color: #64748b; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: border-color 0.15s, color 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .cb-add-module-btn:hover { border-color: #639922; color: #c0dd97; }
  .cb-empty { text-align: center; padding: 3rem 1rem; color: #475569; font-size: 0.875rem; }
  .cb-empty p { margin: 0; }
  .cb-empty-inline { text-align: center; padding: 1.5rem 0 2rem; color: #475569; font-size: 0.84rem; }

  /* Quiz Builder */
  .qb-wrap { padding: 0.25rem 0 0.5rem 0; }
  .qb-banner { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1rem; border: 1px solid; border-radius: 9px; margin-bottom: 1rem; }
  .qb-banner-icon { width: 34px; height: 34px; border-radius: 8px; border: 1px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .qb-banner-title { font-size: 0.85rem; font-weight: 600; margin: 0 0 2px; }
  .qb-banner-sub { font-size: 0.76rem; color: #64748b; margin: 0; }
  .qb-question-count { margin-left: auto; padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid; white-space: nowrap; flex-shrink: 0; }
  .qb-question-card { background: #161b27; border: 1px solid #2a3248; border-left: 3px solid; border-radius: 9px; padding: 1.1rem 1.2rem; margin-bottom: 0.85rem; transition: box-shadow 0.15s; }
  .qb-question-card:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.04); }
  .qb-q-header { display: flex; align-items: center; gap: 10px; margin-bottom: 0.85rem; }
  .qb-q-num { width: 30px; height: 26px; border-radius: 6px; border: 1px solid; display: flex; align-items: center; justify-content: center; font-size: 0.76rem; font-weight: 700; flex-shrink: 0; }
  .qb-q-label { font-size: 0.78rem; color: #64748b; font-weight: 500; }
  .qb-q-header-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  .qb-pts-field { display: flex; align-items: center; gap: 6px; }
  .qb-pts-label { font-size: 0.76rem; color: #64748b; white-space: nowrap; }
  .qb-pts-input { width: 52px; padding: 4px 8px; background: #1a2030; border: 1px solid #2d3448; border-radius: 6px; color: #e2e8f0; font-size: 0.82rem; outline: none; text-align: center; font-family: inherit; }
  .qb-pts-input:focus { border-color: #639922; }
  .qb-meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1rem; background: #10141e; padding: 0.75rem; border-radius: 8px; border: 1px solid #252d3e; }
  .qb-meta-field { display: flex; flex-direction: column; gap: 4px; }
  .qb-meta-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: #7e8aa2; letter-spacing: 0.3px; }
  .qb-meta-select { background: #1a2030; border: 1px solid #2d3448; border-radius: 6px; padding: 5px 8px; color: #e2e8f0; font-size: 0.8rem; outline: none; cursor: pointer; font-family: inherit; }
  .qb-meta-select:focus { border-color: #639922; }
  .qb-correct-preview { justify-content: space-between; }
  .qb-correct-badge-preview { background: rgba(99,153,34,0.12); border: 1px solid; border-radius: 20px; padding: 3px 8px; font-size: 0.8rem; font-weight: 600; text-align: center; width: fit-content; margin-top: 2px; }
  .qb-q-text { width: 100%; padding: 0.65rem 0.9rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #f1f5f9; font-size: 0.9rem; font-weight: 500; outline: none; resize: vertical; min-height: 64px; box-sizing: border-box; transition: border-color 0.15s; margin-bottom: 0.85rem; font-family: inherit; line-height: 1.5; }
  .qb-q-text::placeholder { color: #475569; font-weight: 400; }
  .qb-q-text:focus { border-color: #639922; }
  .qb-code-toggle-wrap { margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 6px; }
  .qb-code-add-chip { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 7px; border: 1px dashed #2d3448; background: transparent; color: #475569; font-size: 0.79rem; font-weight: 500; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; width: fit-content; font-family: inherit; }
  .qb-code-add-chip:hover { border-color: #4a5a6a; color: #94a3b8; background: rgba(255,255,255,0.02); }
  .qb-code-chip-hint { font-size: 0.71rem; color: #3a4460; padding: 1px 6px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid #2d3448; }
  .qb-code-saved-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 7px; background: rgba(99,153,34,0.07); border: 1px solid rgba(99,153,34,0.25); color: #7a9a50; font-size: 0.76rem; cursor: pointer; transition: background 0.15s; width: fit-content; }
  .qb-code-saved-badge:hover { background: rgba(99,153,34,0.12); }
  .qb-code-edit-hint { margin-left: 2px; padding: 1px 6px; border-radius: 5px; background: rgba(99,153,34,0.15); color: #c0dd97; font-size: 0.7rem; font-weight: 600; }
  .qb-code-section { background: #0c1020; border: 1px solid #252d3e; border-radius: 8px; overflow: hidden; }
  .qb-code-header { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid #1a2030; }
  .qb-code-label { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 500; color: #64748b; }
  .qb-code-header-right { display: flex; align-items: center; gap: 8px; }
  .qb-lang-select { padding: 3px 8px; font-size: 0.75rem; background: #1a2030; border-color: #2d3448; color: #94a3b8; }
  .qb-code-textarea { width: 100%; padding: 0.75rem 1rem; background: transparent; border: none; color: #c9d7e8; font-family: 'SF Mono','Fira Code','Cascadia Code',monospace; font-size: 0.82rem; outline: none; resize: vertical; min-height: 100px; box-sizing: border-box; line-height: 1.6; display: block; }
  .qb-code-textarea::placeholder { color: #2d3a50; }
  .qb-code-lang-badge { padding: 4px 10px; font-size: 0.7rem; font-weight: 600; color: #475569; background: #0a0e18; border-top: 1px solid #1a2030; text-align: right; letter-spacing: 0.3px; }
  .qb-options-section { margin-bottom: 1rem; }
  .qb-options-label { font-size: 0.78rem; font-weight: 600; color: #94a3b8; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  .qb-options-hint { font-size: 0.74rem; color: #475569; font-weight: 400; text-transform: none; letter-spacing: 0; }
  .qb-option-row { display: flex; align-items: center; gap: 8px; padding: 0.55rem 0.75rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 7px; margin-bottom: 6px; transition: border-color 0.15s, background 0.15s; }
  .qb-option-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #3a4460; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s, background 0.15s; padding: 0; }
  .qb-option-radio:hover { border-color: #639922; }
  .qb-option-radio.checked { border-width: 2px; }
  .qb-option-radio-dot { width: 8px; height: 8px; border-radius: 50%; display: block; }
  .qb-option-letter { width: 22px; height: 22px; border-radius: 5px; background: #0c1020; border: 1px solid #2d3448; color: #64748b; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.15s, color 0.15s, border-color 0.15s; }
  .qb-option-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid transparent; color: #e2e8f0; font-size: 0.85rem; outline: none; padding: 2px 4px; font-family: inherit; transition: border-color 0.15s; }
  .qb-option-input::placeholder { color: #3a4460; }
  .qb-option-input:focus { border-bottom-color: #4a5a6a; }
  .qb-correct-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; border: 1px solid; font-size: 0.7rem; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
  .qb-option-remove { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 5px; border: 1px solid transparent; background: transparent; color: #475569; cursor: pointer; flex-shrink: 0; transition: color 0.15s, background 0.15s, border-color 0.15s; padding: 0; }
  .qb-option-remove:hover { color: #f87171; background: #2a0d0d; border-color: #7f1d1d; }
  .qb-add-option-chip { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 6px; border: 1px dashed #2d3448; background: transparent; color: #475569; font-size: 0.78rem; cursor: pointer; transition: border-color 0.15s, color 0.15s; margin-top: 4px; }
  .qb-add-option-chip:hover { border-color: #639922; color: #c0dd97; }
  .qb-desc-section { border-top: 1px solid #1e2535; padding-top: 0.85rem; }
  .qb-desc-label { display: block; font-size: 0.78rem; font-weight: 500; color: #64748b; margin-bottom: 6px; }
  .qb-desc-optional { font-size: 0.73rem; color: #3a4460; font-weight: 400; }
  .qb-desc-textarea { width: 100%; padding: 0.55rem 0.85rem; background: #161b27; border: 1px solid #252d3e; border-radius: 7px; color: #94a3b8; font-size: 0.82rem; outline: none; resize: vertical; min-height: 56px; box-sizing: border-box; transition: border-color 0.15s; font-family: inherit; line-height: 1.5; }
  .qb-desc-textarea::placeholder { color: #3a4460; }
  .qb-desc-textarea:focus { border-color: #4a5a6a; color: #e2e8f0; }
  .qb-empty { text-align: center; padding: 1.5rem 1rem; color: #3a4460; font-size: 0.84rem; }
  .qb-empty p { margin: 0; }
  .qb-add-question-btn { width: 100%; padding: 0.8rem; border: 2px dashed; border-radius: 9px; background: transparent; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s, background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 0.25rem; opacity: 0.7; }
  .qb-add-question-btn:hover { opacity: 1; background: rgba(99,153,34,0.06); }
  .qb-add-q-hint { font-size: 0.72rem; padding: 1px 7px; border-radius: 10px; background: rgba(255,255,255,0.06); font-weight: 500; }

  .cb-info-box { display: flex; gap: 10px; padding: 0.85rem 1rem; background: rgba(55,138,221,0.07); border: 1px solid rgba(55,138,221,0.2); border-radius: 8px; margin-bottom: 1.2rem; }
  .cb-info-box p { font-size: 0.82rem; color: #7dd3fc; line-height: 1.5; margin: 0; }
  .cb-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 9px; margin-bottom: 1.1rem; }
  .cb-toggle-label { font-size: 0.9rem; font-weight: 500; color: #f1f5f9; margin-bottom: 2px; }
  .cb-toggle-sub { font-size: 0.8rem; color: #64748b; }
  .cb-toggle { position: relative; display: inline-block; width: 46px; height: 24px; flex-shrink: 0; }
  .cb-toggle input { opacity: 0; width: 0; height: 0; }
  .cb-toggle-slider { position: absolute; inset: 0; background: #2d3448; border-radius: 24px; cursor: pointer; transition: background 0.2s; }
  .cb-toggle-slider:before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: transform 0.2s; }
  .cb-toggle input:checked + .cb-toggle-slider { background: #639922; }
  .cb-toggle input:checked + .cb-toggle-slider:before { transform: translateX(22px); }
  .cb-timeline-wrap { margin-top: 1.2rem; }
  .cb-tl-heading { font-size: 0.82rem; font-weight: 500; color: #94a3b8; margin-bottom: 0.75rem; }
  .cb-tl-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 0; }
  .cb-tl-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .cb-tl-dot { width: 34px; height: 34px; border-radius: 8px; background: #3b6d11; border: 1px solid #639922; color: #c0dd97; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; justify-content: center; }
  .cb-tl-dot.locked { background: #1a2030; border-color: #2d3448; color: #475569; }
  .cb-tl-line { width: 1px; flex: 1; background: #2d3448; min-height: 18px; margin-top: 4px; margin-bottom: 4px; }
  .cb-tl-card { flex: 1; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 8px; }
  .cb-tl-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .cb-tl-mod-name { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; }
  .cb-tl-badge { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; }
  .cb-tl-badge.locked { color: #f87171; }
  .cb-tl-badge.unlocked { color: #4ade80; }
  .cb-tl-type-badge { font-size: 0.72rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .cb-tl-type-badge.quiz { background: rgba(124,79,212,0.15); border: 1px solid rgba(124,79,212,0.3); color: #c4b5fd; }
  .cb-tl-meta { font-size: 0.78rem; color: #64748b; margin: 0; }

  .cb-test-block { background: #1a2030; border: 1px solid #2d3448; border-radius: 10px; padding: 1.1rem 1.2rem; margin-bottom: 0.85rem; }
  .cb-test-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
  .cb-test-title-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid transparent; color: #f1f5f9; font-size: 0.95rem; font-weight: 600; outline: none; padding: 2px 4px; font-family: inherit; }
  .cb-test-title-input:hover { border-bottom-color: #3a4460; }
  .cb-test-title-input:focus { border-bottom-color: #639922; }
  .cb-test-retake-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 0.5rem; }
  .cb-checkbox-label { display: flex; align-items: center; gap: 7px; cursor: pointer; font-size: 0.84rem; color: #94a3b8; }
  .cb-retake-count { display: flex; align-items: center; gap: 7px; }

  .cb-rule-row { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1rem; border: 1px solid #2d3448; border-radius: 9px; margin-bottom: 0.7rem; }
  .cb-rule-row:hover { border-color: #3a4460; }
  .cb-rule-label { font-size: 0.88rem; font-weight: 500; color: #f1f5f9; margin-bottom: 2px; }
  .cb-rule-desc { font-size: 0.78rem; color: #64748b; }

  .cb-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 1.75rem; }

  .cb-upload-modal-info { font-size: 0.82rem; color: #94a3b8; margin: 0 0 1.1rem; line-height: 1.6; }
  .cb-upload-modal-info strong { color: #c0dd97; font-weight: 500; }
  .cb-upload-modal-zone { border: 2px dashed #5b3f8a; border-radius: 10px; padding: 1.75rem 1rem; text-align: center; cursor: pointer; background: #120a20; transition: border-color 0.15s, background 0.15s; }
  .cb-upload-modal-zone:hover { border-color: #9b6ddc; background: #180f2a; }
  .cb-upload-modal-zone.has-file { border-color: #4a9a4a; background: #0c1a0c; }
  .cb-upload-modal-icon { display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
  .cb-upload-modal-icon.success svg { stroke: #4ade80; }
  .cb-upload-modal-title { font-size: 0.88rem; font-weight: 500; color: #d4c6f4; margin: 0 0 4px; word-break: break-all; }
  .cb-upload-modal-title.success { color: #4ade80; }
  .cb-upload-modal-sub { font-size: 0.78rem; color: #8b79b0; margin: 0; }
  .cb-btn-green-solid { padding: 0.5rem 1.4rem; background: #3b6d11; border: 1px solid #639922; border-radius: 8px; color: #c0dd97; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .cb-btn-green-solid:hover:not(:disabled) { background: #27500a; }
  .cb-btn-green-solid:disabled { opacity: 0.4; cursor: not-allowed; }

  .cb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(3px); animation: cb-fadeIn 0.15s ease; }
  @keyframes cb-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .cb-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; width: 100%; margin: 1rem; animation: cb-slideUp 0.2s ease; }
  .cb-modal-sm { max-width: 420px; }
  @keyframes cb-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .cb-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.3rem; border-bottom: 1px solid #2d3448; }
  .cb-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .cb-modal-close { background: transparent; border: none; color: #64748b; font-size: 1rem; cursor: pointer; padding: 4px; border-radius: 5px; transition: color 0.12s, background 0.12s; }
  .cb-modal-close:hover { color: #e2e8f0; background: #2d3448; }
  .cb-modal-body { padding: 1.25rem 1.3rem; }
  .cb-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0.85rem 1.3rem; border-top: 1px solid #2d3448; }
  .cb-delete-warn { display: flex; gap: 12px; align-items: flex-start; }
  .cb-delete-warn p { font-size: 0.875rem; color: #94a3b8; margin: 0; line-height: 1.6; }
  .cb-btn-cancel { padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: background 0.12s; }
  .cb-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }
  .cb-btn-danger { padding: 0.5rem 1.4rem; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .cb-btn-danger:hover { background: #6b1a1a; }

  .cb-toast { position: fixed; top: 1.5rem; right: 1.5rem; background: #1a2d12; border: 1px solid #639922; border-radius: 10px; padding: 0.75rem 1.2rem; color: #c0dd97; font-size: 0.875rem; font-weight: 500; z-index: 100; animation: cb-fadeIn 0.2s ease; }

  @media (max-width: 640px) {
    .cb-page { padding: 1.25rem 1rem; }
    .cb-grid-title-cat { grid-template-columns: 1fr; }
    .cb-grid2, .cb-grid3 { grid-template-columns: 1fr; }
    .cb-steps-bar { padding: 0.85rem 0.75rem; }
    .cb-step-label { display: none; }
    .cb-thumb-preview-wrap { flex-direction: column; }
    .cb-thumb-preview-img { width: 100%; height: auto; }
    .qb-meta-grid { grid-template-columns: 1fr 1fr; }
    .qb-banner { flex-wrap: wrap; }
    .cb-collapsed-meta { display: none; }
    .cb-collapsed-title { font-size: 0.88rem; }
  }
`;
