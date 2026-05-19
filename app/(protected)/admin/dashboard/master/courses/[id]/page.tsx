"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { QuizBuilder } from "components/QuizBuilder";

// ─── Constants (identical to create page) ─────────────────────────────────────

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
const OPTION_LABELS    = ["A", "B", "C", "D"];

const DEFAULT_RULES = [
  { id: "r1", label: "Require Module Completion",  desc: "Students must complete all lessons before proceeding to the next module", enabled: true  },
  { id: "r2", label: "Require Test Pass (60%)",    desc: "Students must pass intermediate tests to continue to the next module",    enabled: true  },
  { id: "r3", label: "Allow Course Retake",        desc: "Students can retake the entire course if they fail",                      enabled: false },
];

const today = new Date().toISOString().split("T")[0];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── API data → form state transformer ────────────────────────────────────────

function transformCourseToFormState(course) {
  const form = {
    title:         course.title         ?? "",
    categoryId:    course.categoryId    ?? "",
    levelId:       course.levelId       ?? "",
    // FIX: store the durationTypeId (from durationType.id or validityPeriodId or durationTypeId)
    durationId:    course.durationTypeId ?? course.validityPeriodId ?? course.durationType?.id ?? "",
    description:   course.description   ?? "",
    createdBy:     course.createdBy     ?? "",
    status:        course.status        ?? "Draft",
    thumbnailFile: null,
    thumbnailName: "",
    gradeIds:      (course.grades ?? []).map(g => g.gradeId),
  };

  const modules = (course.modules ?? []).map(m => {
    const base = {
      id:          m.id,
      title:       m.title       ?? "",
      type:        m.type,
      order:       m.order,
      description: m.description ?? "",
      lessons:     [],
      questions:   [],
    };

    if (m.type === "LESSON") {
      return {
        ...base,
        lessons: (m.lessons ?? []).map(l => ({
          id:          l.id,
          title:       l.title       ?? "",
          contentType: l.contentType,
          fileUrl:     l.contentType !== "VIDEO" ? (l.fileUrl ?? "") : "",
          videoLinks:  l.contentType === "VIDEO" && l.fileUrl ? [l.fileUrl] : [],
          order:       l.order,
        })),
      };
    }

    if (m.type === "REVISION") {
      const contents = m.revision?.contents ?? [];
      return {
        ...base,
        lessons: contents.map(c => ({
          id:          c.id,
          title:       c.contentType === "VIDEO" ? "Video" : "PDF",
          contentType: c.contentType,
          fileUrl:     c.contentType !== "VIDEO" ? (c.fileUrl ?? "") : "",
          videoLinks:  c.contentType === "VIDEO" ? [c.fileUrl ?? ""] : [],
          order:       c.order,
        })),
      };
    }

    if (m.type === "QUIZ" || m.type === "FINAL_QUIZ") {
      const questions = m.quiz?.questions ?? [];
      return {
        ...base,
        questions: questions.map(q => {
          const correctOpt = q.options?.find(o => o.isCorrect);
          return {
            id:              q.id,
            text:            q.question     ?? "",
            options:         (q.options ?? []).map(o => ({ id: o.id, text: o.text ?? "" })),
            correctOptionId: correctOpt?.id ?? "",
            description:     q.explanation  ?? "",
            points:          q.points       ?? 1,
            difficulty:      q.difficulty   ?? "Easy",
            bloomLevel:      q.bloomLevel   ?? "Remember",
            questionType:    q.questionType ?? "Conceptual",
            codeSnippet:     q.codeSnippet  ?? "",
            codeLanguage:    q.codeLanguage ?? "",
          };
        }),
      };
    }

    return base;
  });

  return { form, modules, thumbnailUrl: course.thumbnailUrl ?? "" };
}

// ─── Grade Multi-Select ───────────────────────────────────────────────────────

function GradeMultiSelect({ grades, selected, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = id => {
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
        {selected.length > 0 && <span className="gms-count-pill">{selected.length}</span>}
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
                <button key={g.id} type="button" className={`gms-option ${isSelected ? "selected" : ""}`} onClick={() => toggle(g.id)}>
                  <span className="gms-option-check">{isSelected && <CheckSmallIcon />}</span>
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

// ─── Main Edit Component ──────────────────────────────────────────────────────

export default function CourseEditPage() {
  const router   = useRouter();
  const params   = useParams();
  const courseId = params?.id;

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(true);

  const [categories,    setCategories]    = useState([]);
  const [levels,        setLevels]        = useState([]);
  const [grades,        setGrades]        = useState([]);
  // FIX: single durationTypes list, same as create page
  const [durationTypes, setDurationTypes] = useState([]);

  // FIX: form now uses durationId (same field name as create page)
  const [form, setForm] = useState({
    title: "", categoryId: "", levelId: "",
    durationId: "",
    description: "", createdBy: "", status: "Draft",
    thumbnailFile: null, thumbnailName: "",
    gradeIds: [],
  });
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview]         = useState("");
  const thumbnailInputRef = useRef(null);

  const [errors,         setErrors]         = useState({});
  const [modules,        setModules]        = useState([]);
  const [savedModuleIds, setSavedModuleIds] = useState([]);
  const [schedule,       setSchedule]       = useState({ dripContent: true, startDate: today, releaseIntervalDays: 7 });
  const [tests,          setTests]          = useState([]);
  const [rules,          setRules]          = useState(DEFAULT_RULES);
  const [saving,         setSaving]         = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [toast,          setToast]          = useState("");
  const [delModal,       setDelModal]       = useState(null);
  const [uploadTarget,   setUploadTarget]   = useState(null);
  const [uploadFile,     setUploadFile]     = useState(null);
  const [videoLinkDraft, setVideoLinkDraft] = useState(["", "", ""]);
  const fileInputRef = useRef(null);
  const [enums, setEnums] = useState({ difficulties: [], bloomLevels: [], questionTypes: [] });

  // ── Load master data + course ──────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const [catRes, lvlRes, durRes, enumRes, gradeRes, courseRes] = await Promise.all([
          fetch("/api/course-categories?limit=100"),
          fetch("/api/levels?limit=100"),
          fetch("/api/duration?limit=100"),
          fetch("/api/enums"),
          fetch("/api/grade?limit=100"),
          fetch(`/api/courses/${courseId}`),
        ]);
        const [catJ, lvlJ, durJ, enumJ, gradeJ, courseJ] = await Promise.all([
          catRes.json(), lvlRes.json(), durRes.json(),
          enumRes.json(), gradeRes.json(), courseRes.json(),
        ]);

        if (catJ.status   || catJ.success)   setCategories(catJ.data   ?? []);
        if (lvlJ.status   || lvlJ.success)   setLevels(lvlJ.data       ?? []);
        // FIX: store into durationTypes (same as create page)
        if (durJ.status   || durJ.success)   setDurationTypes(durJ.data ?? []);
        if (gradeJ.status || gradeJ.success) setGrades(gradeJ.data     ?? []);
        if (enumJ.status) {
          setEnums({
            difficulties:  enumJ.data.difficulties  || [],
            bloomLevels:   enumJ.data.bloomLevels   || [],
            questionTypes: enumJ.data.questionTypes || [],
          });
        }

        if (courseJ.status && courseJ.data) {
          const { form: f, modules: m, thumbnailUrl } = transformCourseToFormState(courseJ.data);
          setForm(f);
          setModules(m);
          setSavedModuleIds(m.map(mod => mod.id));
          setExistingThumbnailUrl(thumbnailUrl);
          if (thumbnailUrl) setThumbnailPreview(thumbnailUrl);
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to load course data");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const showToast     = msg => { setToast(msg); setTimeout(() => setToast(""), 3500); };
  const confirmDelete = (msg, onConfirm) => setDelModal({ msg, onConfirm });

  // ── Validation — identical to create page ──────────────────────────────────
  // const validateStep1 = () => {
  //   const e = {};
  //   if (!form.title.trim())           e.title       = "Title is required";
  //   if (!form.categoryId)             e.categoryId  = "Category is required";
  //   if (!form.levelId)                e.levelId     = "Level is required";
  //   if (!form.durationId)             e.durationId  = "Duration is required";
  //   if (form.gradeIds.length === 0)   e.gradeIds    = "At least one grade is required";
  //   if (!form.description.trim())     e.description = "Description is required";
  //   if (!form.thumbnailFile && !existingThumbnailUrl) e.thumbnail = "Thumbnail is required";
  //   if (!form.createdBy.trim())       e.createdBy   = "Created By is required";
  //   if (!form.status)                 e.status      = "Status is required";
  //   setErrors(e);
  //   return Object.keys(e).length === 0;
  // };

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

  if (!form.thumbnailFile && !existingThumbnailUrl)
    e.thumbnail = "Thumbnail is required";

  if (!form.createdBy.trim())
    e.createdBy = "Created By is required";

  if (!form.status)
    e.status = "Status is required";

  setErrors(e);

  return Object.keys(e).length === 0;
};

  const clearError = field => setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  // ── Thumbnail ──────────────────────────────────────────────────────────────
  const handleThumbnailChange = e => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm(prev => ({ ...prev, thumbnailFile: file, thumbnailName: file.name }));
    clearError("thumbnail");
    const reader = new FileReader();
    reader.onload = ev => setThumbnailPreview(ev.target?.result ?? "");
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setForm(prev => ({ ...prev, thumbnailFile: null, thumbnailName: "" }));
    setThumbnailPreview("");
    setExistingThumbnailUrl("");
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  // ── Thumbnail upload helper ────────────────────────────────────────────────
  const uploadThumbnail = async file => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "thumbnails");
    const res = await fetch("/api/uploads", { method: "POST", body: formData });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Upload failed"); }
    const result = await res.json();
    if (!result.success) throw new Error(result.error || "Upload failed");
    return result.data.url;
  };

  // ── Module helpers ─────────────────────────────────────────────────────────
  const addModule = () =>
    setModules(prev => [...prev, { id: `mod_${Date.now()}`, title: `Module ${prev.length + 1}`, type: "LESSON", order: prev.length + 1, description: "", lessons: [], questions: [] }]);

  const removeModule = id =>
    confirmDelete("Delete this module and all its content?", () => {
      setModules(prev => prev.filter(m => m.id !== id));
      setSavedModuleIds(prev => prev.filter(sid => sid !== id));
    });

  const updateModule          = (id, patch) => setModules(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  const updateModuleQuestions = (moduleId, questions) => setModules(prev => prev.map(m => m.id === moduleId ? { ...m, questions } : m));
  const saveModule            = id => { setSavedModuleIds(prev => [...prev, id]); showToast("Module saved!"); };
  const editModule            = id => setSavedModuleIds(prev => prev.filter(sid => sid !== id));

  // ── Lesson helpers ─────────────────────────────────────────────────────────
  const addLesson = (moduleId, contentType) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    if (!canAddLesson(module, contentType)) { showToast(disabledReason(module, contentType)); return; }
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m, lessons: [...m.lessons, { id: `les_${Date.now()}`, title: contentType.charAt(0) + contentType.slice(1).toLowerCase(), contentType, fileUrl: "", videoLinks: [], order: m.lessons.length + 1 }],
    } : m));
  };

  const removeLesson = (moduleId, lessonId) =>
    confirmDelete("Delete this lesson?", () =>
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m)));

  const updateLesson = (moduleId, lessonId, patch) =>
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l) } : m));

  // ── Upload modal ───────────────────────────────────────────────────────────
  const openUploadModal = (moduleId, lessonId, contentType) => {
    const lesson = modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
    setUploadTarget({ moduleId, lessonId, contentType });
    setUploadFile(null);
    if (contentType === "VIDEO") { const ex = lesson?.videoLinks ?? []; setVideoLinkDraft([ex[0] ?? "", ex[1] ?? "", ex[2] ?? ""]); }
    else setVideoLinkDraft(["", "", ""]);
  };
  const closeUploadModal = () => { setUploadTarget(null); setUploadFile(null); setVideoLinkDraft(["", "", ""]); };
  const handleFileChange  = e => setUploadFile(e.target.files?.[0] ?? null);
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
  const addTest    = () => setTests(prev => [...prev, { id: `tst_${Date.now()}`, name: `Intermediate Test ${prev.length + 1}`, afterModuleId: modules[0]?.id ?? "", passingScore: 70, retakeAllowed: true, maxRetakes: 3 }]);
  const removeTest = id => confirmDelete("Delete this test?", () => setTests(prev => prev.filter(t => t.id !== id)));
  const updateTest = (id, patch) => setTests(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  // ── Save (update) — FIX: mirrors create page payload exactly ──────────────
  const handleSave = async () => {
    if (!validateStep1()) { setStep(1); showToast("Please fill in all required fields"); return; }
    setSaving(true);
    try {
      // FIX: use form.durationId directly (same as create page's form.durationId)
      let thumbnailUrl = existingThumbnailUrl;
      if (form.thumbnailFile) thumbnailUrl = await uploadThumbnail(form.thumbnailFile);
      if (!thumbnailUrl) { showToast("Thumbnail is required"); setSaving(false); return; }

      // FIX: payload matches create page exactly — validityPeriodId maps to durationTypeId via Zod transform
      const payload = {
        title:            form.title,
        description:      form.description,
        categoryId:       form.categoryId,
        levelId:          form.levelId,
        validityPeriodId: form.durationId,   // Zod schema accepts this and normalises → durationTypeId
        status:           form.status,
        createdBy:        form.createdBy,
        thumbnailUrl,
        gradeIds:         form.gradeIds,
        modules: modules.map(m => ({
          title:       m.title,
          type:        m.type,
          order:       m.order,
          description: m.description,
          lessons: m.lessons.map(l => ({
            title:       l.title,
            contentType: l.contentType,
            fileUrl:     l.fileUrl,
            videoLinks:  l.videoLinks,
            order:       l.order,
          })),
          questions: (m.type === "QUIZ" || m.type === "FINAL_QUIZ")
            ? m.questions.map(q => ({
                text:          q.text          ?? "",
                inputMode:     q.inputMode     ?? "text",
                questionImage: q.questionImage ?? null,
                points:        q.points,
                difficulty:    q.difficulty,
                bloomLevel:    q.bloomLevel,
                questionType:  q.questionType,
                codeSnippet:   q.codeSnippet   || null,
                codeLanguage:  q.codeLanguage  || null,
                explanation:   q.description   || null,
                options: q.options.map((o, oi) => ({
                  text:      o.text      ?? "",
                  isCorrect: o.id === q.correctOptionId,
                  order:     oi + 1,
                  inputMode: o.inputMode ?? "text",
                  imageData: o.imageData ?? null,
                })),
              }))
            : [],
        })),
        schedule,
        intermediateTests: tests,
        eligibilityRules:  rules,
      };

      const res  = await fetch(`/api/courses/${courseId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();

      if (json.status || json.success) {
        showToast("Course updated successfully!");
        setTimeout(() => router.push("/admin/dashboard/master/courses"), 1200);
      } else {
        showToast(json.message || "Failed to update course");
      }
    } catch (e) {
      console.error(e); showToast(e.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete course ──────────────────────────────────────────────────────────
  const handleDeleteCourse = () => {
    confirmDelete("Permanently delete this course? This will remove all modules, lessons, quizzes, and enrollments.", async () => {
      setDeleting(true);
      try {
        const res  = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
        const json = await res.json();
        if (json.status || json.success) {
          showToast("Course deleted");
          setTimeout(() => router.push("/admin/dashboard/master/courses"), 1000);
        } else showToast(json.message || "Failed to delete");
      } catch (e) { showToast(e.message || "Error"); }
      finally { setDeleting(false); }
    });
  };

  const getReleaseDate = idx => {
    const base = schedule.startDate ? new Date(schedule.startDate) : new Date();
    base.setDate(base.getDate() + idx * schedule.releaseIntervalDays);
    return base;
  };

  const goStep = n => {
    if (n > 1 && step === 1 && !validateStep1()) { showToast("Please fill in all required fields"); return; }
    setStep(n);
  };

  const stepConfig = [
    { num: 1, label: "Course Info"   },
    { num: 2, label: "Modules"       },
    { num: 3, label: "Timeline"      },
    { num: 4, label: "Tests & Rules" },
  ];

  const lessonHasContent = l =>
    l.contentType === "VIDEO" ? l.videoLinks?.length > 0 : !!l.fileUrl;

  const getModuleHint = m => {
    if (m.type === "LESSON")   { const v = m.lessons.filter(l => l.contentType === "VIDEO").length; const p = m.lessons.filter(l => l.contentType === "PDF").length; return `${v}/3 Videos · ${p}/1 PDF`; }
    if (m.type === "REVISION") { const v = m.lessons.filter(l => l.contentType === "VIDEO").length; return `${v}/1 Video (Revision)`; }
    return "";
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cb-page">
        <div className="cb-header">
          <div>
            <div className="cb-skeleton cb-skel-title" />
            <div className="cb-skeleton cb-skel-sub" />
          </div>
        </div>
        <div className="cb-card">
          {[...Array(5)].map((_, i) => <div key={i} className="cb-skeleton cb-skel-row" style={{ marginBottom: 16, animationDelay: `${i * 0.07}s` }} />)}
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="cb-page">

      {/* ── Header ── */}
      <div className="cb-header">
        <div>
          <div className="cb-edit-badge"><EditBadgeIcon /> Editing Course</div>
          <h1 className="cb-title">{form.title || "Untitled Course"}</h1>
          <p className="cb-subtitle">Make changes below and save — all modules will be replaced on save</p>
        </div>
        <div className="cb-header-actions">
          <button className="cb-btn cb-btn-danger-outline" onClick={handleDeleteCourse} disabled={deleting}>
            <DeleteIcon /> {deleting ? "Deleting…" : "Delete Course"}
          </button>
          <button className="cb-btn cb-btn-outline" onClick={() => router.push("/admin/dashboard/master/courses")}>
            ← Back to List
          </button>
          <button className="cb-btn cb-btn-green" onClick={handleSave} disabled={saving}>
            <SaveIcon /> {saving ? "Saving…" : "Save Changes"}
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

          {/* Row 2: Level + Duration + Grade — identical to create page */}
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

            {/* FIX: single dropdown matching create page exactly */}
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
                    {dt.value} {dt.unit}{!dt.isActive ? " (Inactive)" : ""}
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
                onChange={ids => { setForm(prev => ({ ...prev, gradeIds: ids })); clearError("gradeIds"); }}
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
                  <p className="cb-thumb-filename">{form.thumbnailName || existingThumbnailUrl.split("/").pop() || "Current thumbnail"}</p>
                  <p className="cb-thumb-meta">{form.thumbnailFile ? `${(form.thumbnailFile.size / 1048576).toFixed(1)} MB` : "Existing thumbnail"}</p>
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
            <button className="cb-btn cb-btn-green" onClick={() => goStep(2)}>Next: Modules →</button>
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
              <strong style={{ color: "#f59e0b" }}>Note:</strong> Saving replaces all modules with the current list.&nbsp;
              <strong style={{ color: "#c0dd97" }}>Lesson</strong> — up to 3 Videos, 1 PDF.&nbsp;
              <strong style={{ color: "#7dd3fc" }}>Revision</strong> — 1 Video only.&nbsp;
              <strong style={{ color: "#c4b5fd" }}>Quiz / Final Quiz</strong> — question builder.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="cb-empty"><ModulesIcon /><p>No modules yet — add your first module above</p></div>
          ) : (
            modules.map((m, idx) => {
              const isSaved = savedModuleIds.includes(m.id);
              const isQuiz  = m.type === "QUIZ" || m.type === "FINAL_QUIZ";
              const isFinal = m.type === "FINAL_QUIZ";

              if (isSaved) {
                return <CollapsedModuleRow key={m.id} m={m} idx={idx} onEdit={editModule} onDelete={removeModule} />;
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
                    <QuizBuilder moduleId={m.id} questions={m.questions ?? []} onUpdate={qs => updateModuleQuestions(m.id, qs)} isFinal={isFinal} enums={enums} />
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
                            <button className="cb-icon-btn cb-upload-btn" title={l.contentType === "VIDEO" ? "Add video links" : "Upload PDF"} onClick={() => openUploadModal(m.id, l.id, l.contentType)}>
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
                    <button className="cb-save-module-btn" onClick={() => saveModule(m.id)}><CheckSmallIcon /> Save Module</button>
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
          <div className="cb-info-box"><InfoIcon /><p>Module release interval controls how many days students wait between module access.</p></div>
          <div className="cb-toggle-row">
            <div><p className="cb-toggle-label">Drip Content System</p><span className="cb-toggle-sub">Release modules gradually over time</span></div>
            <label className="cb-toggle"><input type="checkbox" checked={schedule.dripContent} onChange={e => setSchedule({ ...schedule, dripContent: e.target.checked })} /><span className="cb-toggle-slider" /></label>
          </div>
          <div className="cb-grid2">
            <div className="cb-field"><label className="cb-label">Start Date</label><input type="date" className="cb-input" value={schedule.startDate} onChange={e => setSchedule({ ...schedule, startDate: e.target.value })} /></div>
            <div className="cb-field"><label className="cb-label">Release Interval (days)</label><input type="number" className="cb-input" min={1} value={schedule.releaseIntervalDays} onChange={e => setSchedule({ ...schedule, releaseIntervalDays: parseInt(e.target.value) || 1 })} /></div>
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
                      <p className="cb-tl-meta">Releases: {dateStr}{isQuiz ? ` · ${m.questions?.length ?? 0} question${(m.questions?.length ?? 0) !== 1 ? "s" : ""}` : ` · ${m.lessons.length} lesson${m.lessons.length !== 1 ? "s" : ""}`}</p>
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
                <div className="cb-field"><label className="cb-label">After Module</label><select className="cb-input" value={t.afterModuleId} onChange={e => updateTest(t.id, { afterModuleId: e.target.value })}>{modules.length === 0 ? <option value="">— Add modules first —</option> : modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
                <div className="cb-field"><label className="cb-label">Passing Score (%)</label><input type="number" className="cb-input" min={0} max={100} value={t.passingScore} onChange={e => updateTest(t.id, { passingScore: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="cb-test-retake-row">
                <label className="cb-checkbox-label"><input type="checkbox" checked={t.retakeAllowed} onChange={e => updateTest(t.id, { retakeAllowed: e.target.checked })} /> Allow Retakes</label>
                {t.retakeAllowed && <div className="cb-retake-count"><span className="cb-label" style={{ margin: 0 }}>Max retakes:</span><input type="number" className="cb-input" min={0} max={10} style={{ width: 72 }} value={t.maxRetakes} onChange={e => updateTest(t.id, { maxRetakes: parseInt(e.target.value) || 0 })} /></div>}
              </div>
            </div>
          ))}
          <button className="cb-add-module-btn" onClick={addTest} style={{ marginBottom: "2rem" }}><PlusIcon /> Add Intermediate Test</button>

          <h2 className="cb-card-title" style={{ borderTop: "1px solid #2d3448", paddingTop: "1.25rem" }}>Eligibility Rules</h2>
          {rules.map(r => (
            <div key={r.id} className="cb-rule-row">
              <div><p className="cb-rule-label">{r.label}</p><span className="cb-rule-desc">{r.desc}</span></div>
              <label className="cb-toggle"><input type="checkbox" checked={r.enabled} onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: e.target.checked } : x))} /><span className="cb-toggle-slider" /></label>
            </div>
          ))}
          <div className="cb-nav">
            <button className="cb-btn cb-btn-outline" onClick={() => goStep(3)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={handleSave} disabled={saving}><SaveIcon /> {saving ? "Saving…" : "Save Changes"}</button>
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
                  <div className="cb-field">
                    <label className="cb-label">Video Link <span className="cb-req">*</span></label>
                    <input className="cb-input" placeholder="https://youtube.com/watch?v=..." value={videoLinkDraft[0]} onChange={e => { const u = [...videoLinkDraft]; u[0] = e.target.value; setVideoLinkDraft(u); }} />
                  </div>
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
                      <><div className="cb-upload-modal-icon"><UploadBigIcon /></div><p className="cb-upload-modal-title">Click to upload PDF</p><p className="cb-upload-modal-sub">PDF only · Max 50MB</p></>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="cb-modal-footer">
              <button className="cb-btn-cancel" onClick={closeUploadModal}>Cancel</button>
              <button className="cb-btn-green-solid" onClick={handleUploadConfirm} disabled={uploadTarget.contentType === "VIDEO" ? !videoLinkDraft[0].trim() : !uploadFile}>
                {uploadTarget.contentType === "VIDEO" ? "Save Link" : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Confirm Modal ══ */}
      {delModal && (
        <div className="cb-overlay" onClick={() => setDelModal(null)}>
          <div className="cb-modal cb-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cb-modal-header">
              <h2 className="cb-modal-title">Confirm Delete</h2>
              <button className="cb-modal-close" onClick={() => setDelModal(null)}>✕</button>
            </div>
            <div className="cb-modal-body"><div className="cb-delete-warn"><WarnIcon /><p>{delModal.msg}</p></div></div>
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

function PlusIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function PlusSmallIcon()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SaveIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function DeleteIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function EditIcon()        { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function EditBadgeIcon()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function XSmallIcon()      { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function GripIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>; }
function InfoIcon()        { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function HintIcon()        { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function LockIcon()        { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UnlockIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>; }
function WarnIcon()        { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function ModulesIcon()     { return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.25 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function QuizIcon()        { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function CheckSmallIcon()  { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function CheckIcon()       { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function UploadIcon()      { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", color: "#475569" }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function UploadSmallIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function UploadBigIcon()   { return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7c4fd4" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function ErrorIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function ChevronIcon({ open }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>;
}
function LessonTypeIcon({ type }) {
  switch (type) {
    case "VIDEO":    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case "PDF":      return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "DOCUMENT": return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
    default: return null;
  }
}

// ─── Styles (identical to create page) ───────────────────────────────────────

const styles = `
  .cb-page { padding: 2rem 2.5rem; min-height: 100vh; background: #0f1117; color: #e2e8f0; font-family: 'DM Sans','Segoe UI',sans-serif; }

  .cb-skeleton { background: linear-gradient(90deg,#1a2030 25%,#252d3e 50%,#1a2030 75%); background-size:200% 100%; animation: cb-shimmer 1.5s infinite; border-radius:8px; }
  .cb-skel-title { height:28px;width:40%;margin-bottom:10px; }
  .cb-skel-sub   { height:16px;width:60%;margin-bottom:0; }
  .cb-skel-row   { height:48px;width:100%; }
  @keyframes cb-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .cb-edit-badge { display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);color:#f59e0b;font-size:0.72rem;font-weight:700;letter-spacing:0.05em;margin-bottom:6px; }

  .cb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .cb-title { font-size: 1.55rem; font-weight: 600; color: #f1f5f9; margin: 0 0 4px; letter-spacing: -0.3px; }
  .cb-subtitle { font-size: 0.84rem; color: #64748b; margin: 0; }
  .cb-header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  .cb-btn { display: inline-flex; align-items: center; gap: 7px; padding: 0.5rem 1.1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; border: 1px solid transparent; }
  .cb-btn:active { transform: scale(0.97); }
  .cb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cb-btn-green { background: #3b6d11; color: #c0dd97; border-color: #639922; }
  .cb-btn-green:hover:not(:disabled) { background: #27500a; }
  .cb-btn-outline { background: transparent; color: #94a3b8; border-color: #2d3448; }
  .cb-btn-outline:hover { background: #1e2230; color: #e2e8f0; }
  .cb-btn-danger-outline { background: transparent; color: #f87171; border-color: #7f1d1d; }
  .cb-btn-danger-outline:hover:not(:disabled) { background: #2a0d0d; border-color: #f87171; }
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

  .cb-grid-title-cat { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.1rem; align-items: start; }
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

  .gms-wrap { position: relative; width: 100%; }
  .gms-trigger { width: 100%; padding: 0.52rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: border-color 0.15s; box-sizing: border-box; font-family: inherit; text-align: left; }
  .gms-trigger:hover { border-color: #3a4460; }
  .gms-trigger:focus,.gms-trigger-open { border-color: #639922; }
  .gms-trigger-error { border-color: #e24b4a !important; }
  .gms-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gms-label.placeholder { color: #475569; }
  .gms-count-pill { background: #3b6d11; border: 1px solid #639922; color: #c0dd97; font-size: 0.7rem; font-weight: 700; padding: 1px 7px; border-radius: 20px; flex-shrink: 0; }
  .gms-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 40; background: #1a2030; border: 1px solid #3a4460; border-radius: 9px; padding: 4px; max-height: 220px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.45); animation: cb-slideUp 0.15s ease; }
  .gms-empty { padding: 10px 12px; font-size: 0.8rem; color: #475569; }
  .gms-option { width: 100%; display: flex; align-items: center; gap: 10px; padding: 0.55rem 0.75rem; border-radius: 6px; border: none; background: transparent; color: #94a3b8; font-size: 0.85rem; cursor: pointer; transition: background 0.12s,color 0.12s; text-align: left; font-family: inherit; }
  .gms-option:hover { background: #252f42; color: #e2e8f0; }
  .gms-option.selected { color: #c0dd97; }
  .gms-option.selected:hover { background: #1f3d09; }
  .gms-option-check { width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0; border: 1.5px solid #3a4460; display: flex; align-items: center; justify-content: center; transition: background 0.12s,border-color 0.12s; }
  .gms-option.selected .gms-option-check { background: #3b6d11; border-color: #639922; color: #c0dd97; }
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

  .cb-collapsed-row { display: flex; align-items: center; gap: 12px; background: #161b27; border: 1px solid #2d3448; border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 0.6rem; transition: border-color 0.15s,background 0.15s; animation: cb-slideUp 0.2s ease; }
  .cb-collapsed-row:hover { border-color: #3a4460; background: #1a2030; }
  .cb-collapsed-row.collapsed-lesson { border-left: 3px solid #3a4460; }
  .cb-collapsed-row.collapsed-quiz  { border-left: 3px solid #639922; }
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

  .cb-module-block { background: #1a2030; border: 1px solid #2d3448; border-radius: 10px; padding: 1.1rem 1.2rem; margin-bottom: 0.85rem; animation: cb-slideUp 0.2s ease; }
  .cb-module-block:hover { border-color: #3a4460; }
  .cb-module-block.mod-quiz { border-color: #2d3a1a; }
  .cb-module-block.mod-quiz:hover { border-color: #3b6d11; }
  .cb-module-block.mod-final-quiz { border-color: #3d2a6e; }
  .cb-module-block.mod-final-quiz:hover { border-color: #7c4fd4; }
  .cb-module-header { display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; }
  .cb-module-header > svg { color: #475569; cursor: grab; }
  .cb-module-num { width: 28px; height: 28px; border-radius: 6px; background: #3b6d11; border: 1px solid #639922; color: #c0dd97; font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cb-module-num.quiz { background: #3b6d11; border-color: #639922; color: #c0dd97; }
  .cb-module-num.quiz-final { background: #3d2a6e; border-color: #7c4fd4; color: #c4b5fd; }
  .cb-module-title-input { flex: 1; background: transparent; border: none; border-bottom: 1.5px solid transparent; color: #f1f5f9; font-size: 1rem; font-weight: 600; outline: none; padding: 2px 4px; transition: border-color 0.15s; font-family: inherit; }
  .cb-module-title-input:hover { border-bottom-color: #3a4460; }
  .cb-module-title-input:focus { border-bottom-color: #639922; }
  .cb-module-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }
  .cb-module-type-select { padding: 5px 26px 5px 12px; background: #12111e; border: 1px solid #3d2a6e; border-radius: 20px; color: #c4b5fd; font-size: 0.78rem; font-weight: 600; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23a78bfa' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; transition: border-color 0.15s; font-family: inherit; }
  .cb-module-type-select:focus { border-color: #7c4fd4; }
  .cb-module-type-select.quiz-select { background-color: #111a08; border-color: #3b6d11; color: #c0dd97; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23639922' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); }
  .cb-module-type-select.final-quiz-select { background-color: #12111e; border-color: #7c4fd4; color: #c4b5fd; }
  .cb-module-type-select option { background: #161b27; color: #e2e8f0; }
  .cb-count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 8px; background: #0c1627; border: 1px solid #1a3a5e; color: #60a5fa; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
  .cb-count-badge.quiz-badge { background: #0c1a08; border-color: #1a4a0a; color: #86efac; }
  .cb-count-badge.quiz-final-badge { background: #1a0c2e; border-color: #4a1a7a; color: #c4b5fd; }
  .cb-module-hint { display: flex; align-items: center; gap: 6px; padding: 5px 4px 10px; font-size: 0.75rem; color: #64748b; }
  .cb-module-save-row { display: flex; justify-content: flex-end; margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid #252d3e; }
  .cb-save-module-btn { display: inline-flex; align-items: center; gap: 7px; padding: 0.5rem 1.25rem; background: #3b6d11; border: 1px solid #639922; border-radius: 8px; color: #c0dd97; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.15s,transform 0.1s; font-family: inherit; }
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
  .cb-add-lesson-chip { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; border: 1px solid #2d3448; background: transparent; color: #64748b; font-size: 0.78rem; cursor: pointer; transition: border-color 0.15s,color 0.15s; }
  .cb-add-lesson-chip:hover:not(:disabled) { border-color: #639922; color: #c0dd97; }
  .cb-add-lesson-chip.disabled,.cb-add-lesson-chip:disabled { opacity: 0.35; cursor: not-allowed; }
  .cb-add-module-btn { width: 100%; padding: 0.85rem; border: 2px dashed #2d3448; border-radius: 10px; background: transparent; color: #64748b; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: border-color 0.15s,color 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .cb-add-module-btn:hover { border-color: #639922; color: #c0dd97; }
  .cb-empty { text-align: center; padding: 3rem 1rem; color: #475569; font-size: 0.875rem; }
  .cb-empty p { margin: 0; }
  .cb-empty-inline { text-align: center; padding: 1.5rem 0 2rem; color: #475569; font-size: 0.84rem; }

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
  .cb-tl-line { width: 1px; flex: 1; background: #2d3448; min-height: 18px; margin: 4px 0; }
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
  .cb-upload-modal-zone { border: 2px dashed #5b3f8a; border-radius: 10px; padding: 1.75rem 1rem; text-align: center; cursor: pointer; background: #120a20; transition: border-color 0.15s,background 0.15s; }
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
  @keyframes cb-fadeIn { from{opacity:0} to{opacity:1} }
  .cb-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; width: 100%; margin: 1rem; animation: cb-slideUp 0.2s ease; }
  .cb-modal-sm { max-width: 420px; }
  @keyframes cb-slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .cb-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.3rem; border-bottom: 1px solid #2d3448; }
  .cb-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .cb-modal-close { background: transparent; border: none; color: #64748b; font-size: 1rem; cursor: pointer; padding: 4px; border-radius: 5px; transition: color 0.12s,background 0.12s; }
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
    .cb-grid-title-cat,.cb-grid2,.cb-grid3 { grid-template-columns: 1fr; }
    .cb-steps-bar { padding: 0.85rem 0.75rem; }
    .cb-step-label { display: none; }
    .cb-header-actions { flex-wrap: wrap; }
    .cb-thumb-preview-wrap { flex-direction: column; }
    .cb-thumb-preview-img { width: 100%; height: auto; }
    .cb-collapsed-meta { display: none; }
  }
`;
