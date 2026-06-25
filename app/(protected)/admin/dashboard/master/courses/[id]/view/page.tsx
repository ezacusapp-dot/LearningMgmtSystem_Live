"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_TYPES = [
  { type: "LESSON",     label: "Lesson"     },
  { type: "REVISION",   label: "Revision"   },
  { type: "QUIZ",       label: "Quiz"       },
  { type: "FINAL_QUIZ", label: "Final Quiz" },
];

const OPTION_LABELS = ["A", "B", "C", "D"];

const DEFAULT_RULES = [
  { id: "r1", label: "Require Module Completion",  desc: "Students must complete all lessons before proceeding to the next module", enabled: true },
  { id: "r2", label: "Require Test Pass (60%)",    desc: "Students must pass intermediate tests to continue to the next module", enabled: true },
  { id: "r3", label: "Allow Course Retake",        desc: "Students can retake the entire course if they fail", enabled: true },
];

// Also update the interface/type for rules if you have one defined elsewhere
// If not, you can define it at the top:
interface Rule {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}
// ─── Transformer — same logic as edit page ────────────────────────────────────

function transformCourseToViewState(course) {
  const info = {
    title:        course.title        ?? "",
    categoryId:   course.categoryId   ?? course.category?.id   ?? "",
    levelId:      course.levelId      ?? course.level?.id      ?? "",
    durationId:   course.durationTypeId ?? course.validityPeriodId ?? course.durationType?.id ?? "",
    description:  course.description  ?? "",
    createdBy:    course.createdBy    ?? "",
    status:       course.status       ?? "Draft",
    thumbnailUrl: course.thumbnailUrl ?? "",
    gradeIds:     (course.grades ?? []).map(g => g.gradeId),
    createdAt:    course.createdAt    ?? "",
    // pre-resolved names (if API returns them)
    categoryName: course.categoryName ?? course.category?.name ?? "",
    levelName:    course.levelName    ?? course.level?.name    ?? "",
    gradeNames:   (course.grades ?? []).map(g => g.gradeName ?? g.name ?? ""),
    duration:     course.durationType
      ? `${course.durationType.value} ${course.durationType.unit}`
      : (course.duration ?? ""),
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
          videoLinks:  l.contentType === "VIDEO" && l.fileUrl ? [l.fileUrl] : (l.videoLinks ?? []),
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
            id:           q.id,
            text:         q.question     ?? "",
            options:      (q.options ?? []).map(o => ({ id: o.id, text: o.text ?? "", isCorrect: o.isCorrect })),
            correctOptionId: correctOpt?.id ?? "",
            description:  q.explanation  ?? "",
            points:       q.points       ?? 1,
            difficulty:   q.difficulty   ?? "Easy",
            bloomLevel:   q.bloomLevel   ?? "Remember",
            questionType: q.questionType ?? "Conceptual",
            codeSnippet:  q.codeSnippet  ?? "",
            codeLanguage: q.codeLanguage ?? "",
          };
        }),
      };
    }

    return base;
  });

  // schedule / tests / rules from course
  const schedule = course.schedule ?? { dripContent: true, startDate: "", releaseIntervalDays: 7 };
  const tests    = course.intermediateTests ?? [];
  const rules    = course.eligibilityRules  ?? DEFAULT_RULES;

  return { info, modules, schedule, tests, rules };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseViewPage() {
  const router   = useRouter();
  const params   = useParams();
  const courseId = params?.id;

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [info,    setInfo]    = useState(null);
  const [modules, setModules] = useState([]);
  const [schedule, setSchedule] = useState({ dripContent: true, startDate: "", releaseIntervalDays: 7 });
  const [tests,   setTests]   = useState([]);
  const [rules,   setRules]   = useState(DEFAULT_RULES);
  const [toast,   setToast]   = useState("");

  // lookup lists — fetched same as edit page
  const [categories,    setCategories]    = useState([]);
  const [levels,        setLevels]        = useState([]);
  const [grades,        setGrades]        = useState([]);
  const [durationTypes, setDurationTypes] = useState([]);

  // ── Fetch everything in parallel (same calls as edit page) ────────────────
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const [catRes, lvlRes, durRes, gradeRes, courseRes] = await Promise.all([
          fetch("/api/course-categories?limit=100"),
          fetch("/api/levels?limit=100"),
          fetch("/api/duration?limit=100"),
          fetch("/api/grade?limit=100"),
          fetch(`/api/courses/${courseId}`),
        ]);
        const [catJ, lvlJ, durJ, gradeJ, courseJ] = await Promise.all([
          catRes.json(), lvlRes.json(), durRes.json(), gradeRes.json(), courseRes.json(),
        ]);

        const cats  = catJ.status   || catJ.success   ? (catJ.data   ?? []) : [];
        const lvls  = lvlJ.status   || lvlJ.success   ? (lvlJ.data   ?? []) : [];
        const durs  = durJ.status   || durJ.success   ? (durJ.data   ?? []) : [];
        const grs   = gradeJ.status || gradeJ.success ? (gradeJ.data ?? []) : [];

        setCategories(cats);
        setLevels(lvls);
        setDurationTypes(durs);
        setGrades(grs);

        if (courseJ.status && courseJ.data) {
          const { info: i, modules: m, schedule: sc, tests: ts, rules: rl } =
            transformCourseToViewState(courseJ.data);

          // ── Resolve names from lookup lists ──────────────────────────────
          // Category name
          if (!i.categoryName && i.categoryId) {
            i.categoryName = cats.find(c => c.id === i.categoryId)?.name ?? "";
          }
          // Level name
          if (!i.levelName && i.levelId) {
            i.levelName = lvls.find(l => l.id === i.levelId)?.name ?? "";
          }
          // Duration label
          if (!i.duration && i.durationId) {
            const dt = durs.find(d => d.id === i.durationId);
            if (dt) i.duration = `${dt.value} ${dt.unit}`;
          }
          // Grade names
          if (i.gradeIds.length > 0 && i.gradeNames.every(n => !n)) {
            i.gradeNames = i.gradeIds.map(id => grs.find(g => g.id === id)?.name ?? id);
          }

          setInfo(i);
          setModules(m);
          setSchedule(sc);
          setTests(ts);
          setRules(rl);
        } else {
          showToast("Failed to load course");
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to load course data");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const stepConfig = [
    { num: 1, label: "Course Info"   },
    { num: 2, label: "Modules"       },
    { num: 3, label: "Timeline"      },
    { num: 4, label: "Tests & Rules" },
  ];

  const STATUS_COLORS = {
    Published: { bg: "rgba(99,153,34,0.12)",   border: "rgba(99,153,34,0.35)",   text: "#c0dd97", dot: "#639922" },
    Draft:     { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)",  text: "#94a3b8", dot: "#64748b" },
    Archived:  { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#fca5a5", dot: "#f87171" },
  };

  const getModuleHint = m => {
    if (m.type === "LESSON") {
      const v = m.lessons.filter(l => l.contentType === "VIDEO").length;
      const p = m.lessons.filter(l => l.contentType === "PDF").length;
      return `${v}/3 Videos · ${p}/1 PDF`;
    }
    if (m.type === "REVISION") {
      const v = m.lessons.filter(l => l.contentType === "VIDEO").length;
      return `${v}/1 Video (Revision)`;
    }
    return "";
  };

  const getReleaseDate = idx => {
    const base = schedule.startDate ? new Date(schedule.startDate) : new Date();
    base.setDate(base.getDate() + idx * (schedule.releaseIntervalDays ?? 7));
    return base;
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cb-page">
        <div className="cb-header">
          <div>
            <div className="cb-skeleton cb-skel-title" />
            <div className="cb-skeleton cb-skel-sub"   />
          </div>
        </div>
        <div className="cb-card">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="cb-skeleton cb-skel-row" style={{ marginBottom: 16, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="cb-page">
        <div className="cb-empty" style={{ paddingTop: "5rem" }}>
          <WarnBigIcon />
          <p style={{ color: "#f87171", marginTop: 8 }}>Course not found</p>
          <button className="cb-btn cb-btn-outline" style={{ marginTop: 16 }} onClick={() => router.back()}>← Go Back</button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  const sc = STATUS_COLORS[info.status] ?? STATUS_COLORS.Draft;

  return (
    <div className="cb-page">

      {/* ── Header ── */}
      <div className="cb-header">
        <div>
          <div className="cb-view-badge"><EyeIcon /> Viewing Course</div>
          <h1 className="cb-title">{info.title || "Untitled Course"}</h1>
          <p className="cb-subtitle">Read-only view of this course and all its modules</p>
        </div>
        <div className="cb-header-actions">
          <button className="cb-btn cb-btn-outline" onClick={() => router.push("/admin/dashboard/master/courses")}>
            ← Back to List
          </button>
          <button className="cb-btn cb-btn-green" onClick={() => router.push(`/admin/dashboard/master/courses/${courseId}`)}>
            <EditIcon /> Edit Course
          </button>
        </div>
      </div>

      {/* ── Steps bar — 4 steps same as edit page ── */}
      <div className="cb-steps-bar">
        {stepConfig.map((s, i) => (
          <div key={s.num} className="cb-step-item">
            <button className="cb-step-btn" onClick={() => setStep(s.num)}>
              <div className={`cb-step-circle ${step === s.num ? "active" : step > s.num ? "done" : "todo"}`}>{s.num}</div>
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

          {/* Title + Category */}
          <div className="cb-grid-title-cat">
            <div className="cb-field">
              <label className="cb-label">Title</label>
              <div className="cb-view-field">{info.title || <Em />}</div>
            </div>
            <div className="cb-field">
              <label className="cb-label">Category</label>
              <div className="cb-view-field">{info.categoryName || <Em />}</div>
            </div>
          </div>

          {/* Level + Duration + Grade */}
          <div className="cb-grid3">
            <div className="cb-field">
              <label className="cb-label">Level</label>
              <div className="cb-view-field">{info.levelName || <Em />}</div>
            </div>
            <div className="cb-field">
              <label className="cb-label">Duration</label>
              <div className="cb-view-field">{info.duration || <Em />}</div>
            </div>
            <div className="cb-field">
              <label className="cb-label">Grade</label>
              <div className="cb-view-field cb-view-tags">
                {info.gradeNames && info.gradeNames.filter(Boolean).length > 0
                  ? info.gradeNames.filter(Boolean).map((g, i) => <span key={i} className="cb-view-tag">{g}</span>)
                  : <Em />
                }
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="cb-field">
            <label className="cb-label">Description</label>
            <div className="cb-view-field cb-view-textarea">{info.description || <Em />}</div>
          </div>

          {/* Thumbnail */}
          <div className="cb-field">
            <label className="cb-label">Thumbnail</label>
            {info.thumbnailUrl ? (
              <div className="cb-thumb-preview-wrap">
                <img src={info.thumbnailUrl} alt="Thumbnail" className="cb-thumb-preview-img" />
                <div className="cb-thumb-preview-info">
                  <p className="cb-thumb-filename">{info.thumbnailUrl.split("/").pop()}</p>
                  <p className="cb-thumb-meta">Course thumbnail</p>
                </div>
              </div>
            ) : (
              <div className="cb-view-field"><Em text="No thumbnail uploaded" /></div>
            )}
          </div>

          {/* Created By + Status */}
          <div className="cb-grid2">
            <div className="cb-field" style={{ marginBottom: 0 }}>
              <label className="cb-label">Created By</label>
              <div className="cb-view-field">{info.createdBy || <Em />}</div>
            </div>
            <div className="cb-field" style={{ marginBottom: 0 }}>
              <label className="cb-label">Status</label>
              <div className="cb-view-field">
                <span className="cb-status-badge" style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}>
                  <span className="cb-status-dot" style={{ background: sc.dot }} />
                  {info.status}
                </span>
              </div>
            </div>
          </div>

          <div className="cb-nav" style={{ marginTop: "1.75rem" }}>
            <span />
            <button className="cb-btn cb-btn-green" onClick={() => setStep(2)}>Next: Modules →</button>
          </div>
        </div>
      )}

      {/* ══ STEP 2 — Modules ══ */}
      {step === 2 && (
        <div>
          <div className="cb-section-head">
            <span className="cb-section-heading">Modules & Lessons</span>
            <span className="cb-modules-count-badge">{modules.length} module{modules.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="cb-info-box" style={{ marginBottom: "1rem" }}>
            <InfoIcon />
            <p>
              <strong style={{ color: "#c0dd97" }}>Lesson</strong> — up to 3 Videos, 1 PDF.&nbsp;
              <strong style={{ color: "#7dd3fc" }}>Revision</strong> — 1 Video only.&nbsp;
              <strong style={{ color: "#c4b5fd" }}>Quiz / Final Quiz</strong> — question builder.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="cb-empty"><ModulesIcon /><p>No modules in this course yet</p></div>
          ) : (
            modules.map((m, idx) => {
              const isQuiz  = m.type === "QUIZ" || m.type === "FINAL_QUIZ";
              const isFinal = m.type === "FINAL_QUIZ";
              const typeLabel = MODULE_TYPES.find(t => t.type === m.type)?.label ?? m.type;

              return (
                <div key={m.id} className={`cb-module-block ${isQuiz ? (isFinal ? "mod-final-quiz" : "mod-quiz") : ""}`}>
                  {/* Header */}
                  <div className="cb-module-header">
                    <div className={`cb-module-num ${isQuiz ? (isFinal ? "quiz-final" : "quiz") : ""}`}>{idx + 1}</div>
                    <span className="cb-module-title-view">{m.title || `Module ${idx + 1}`}</span>
                    <div className="cb-module-header-right">
                      <span className={`cb-module-type-view ${isQuiz ? (isFinal ? "final-quiz-view" : "quiz-view") : ""}`}>{typeLabel}</span>
                      <span className={`cb-count-badge ${isQuiz ? (isFinal ? "quiz-final-badge" : "quiz-badge") : ""}`}>
                        {isQuiz ? (m.questions?.length ?? 0) : m.lessons.length}
                      </span>
                    </div>
                  </div>

                  {/* Hint */}
                  {!isQuiz && (m.type === "LESSON" || m.type === "REVISION") && (
                    <div className="cb-module-hint"><HintIcon /><span>{getModuleHint(m)}</span></div>
                  )}

                  {/* Quiz questions */}
                  {isQuiz ? (
                    <div className="cb-quiz-view-wrap">
                      {m.questions.length === 0 ? (
                        <div className="cb-quiz-empty">No questions added</div>
                      ) : (
                        m.questions.map((q, qi) => (
                          <div key={q.id} className="cb-q-view-card">
                            <div className="cb-q-view-header">
                              <span className="cb-q-num">Q{qi + 1}</span>
                              <div className="cb-q-meta-chips">
                                <span className="cb-q-chip difficulty">{q.difficulty}</span>
                                <span className="cb-q-chip bloom">{q.bloomLevel}</span>
                                <span className="cb-q-chip type">{q.questionType}</span>
                                <span className="cb-q-chip points">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                            <p className="cb-q-text">{q.text || <Em text="No question text" />}</p>
                            {q.codeSnippet && (
                              <div className="cb-q-code-block">
                                {q.codeLanguage && <span className="cb-q-code-lang">{q.codeLanguage}</span>}
                                <pre className="cb-q-code-pre"><code>{q.codeSnippet}</code></pre>
                              </div>
                            )}
                            <div className="cb-q-options">
                              {q.options.map((o, oi) => (
                                <div key={o.id} className={`cb-q-option ${o.id === q.correctOptionId ? "correct" : ""}`}>
                                  <span className="cb-q-option-label">{OPTION_LABELS[oi]}</span>
                                  <span className="cb-q-option-text">{o.text}</span>
                                  {o.id === q.correctOptionId && <span className="cb-q-correct-tick"><CheckSmallIcon /></span>}
                                </div>
                              ))}
                            </div>
                            {q.description && (
                              <div className="cb-q-explanation">
                                <span className="cb-q-exp-label">Explanation:</span> {q.description}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Lessons */
                    <div className="cb-lessons-wrap">
                      {m.lessons.length === 0 ? (
                        <div className="cb-lesson-empty">No lessons added</div>
                      ) : (
                        m.lessons.map(l => (
                          <div key={l.id} className="cb-lesson-row">
                            <span className={`cb-lesson-icon lt-${l.contentType.toLowerCase()}`}>
                              <LessonTypeIcon type={l.contentType} />
                            </span>
                            <span className="cb-lesson-title-view">{l.title}</span>
                            {l.contentType === "VIDEO" && l.videoLinks?.length > 0 && (
                              <span className="cb-lesson-uploaded-badge">
                                <CheckSmallIcon />{l.videoLinks.length} link{l.videoLinks.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {l.contentType === "PDF" && l.fileUrl && (
                              <span className="cb-lesson-uploaded-badge"><CheckSmallIcon /> Uploaded</span>
                            )}
                            {l.contentType === "VIDEO" && (!l.videoLinks || l.videoLinks.length === 0) && (
                              <span className="cb-lesson-no-content">No link</span>
                            )}
                            {l.contentType === "PDF" && !l.fileUrl && (
                              <span className="cb-lesson-no-content">No file</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div className="cb-nav" style={{ marginTop: "1.5rem" }}>
            <button className="cb-btn cb-btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={() => setStep(3)}>Next: Timeline →</button>
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Timeline ══ */}
      {step === 3 && (
        <div className="cb-card">
          <h2 className="cb-card-title">Timeline & Schedule</h2>
          <div className="cb-info-box"><InfoIcon /><p>Module release interval controls how many days students wait between module access.</p></div>

          {/* Drip toggle — read only */}
          <div className="cb-toggle-row">
            <div>
              <p className="cb-toggle-label">Drip Content System</p>
              <span className="cb-toggle-sub">Release modules gradually over time</span>
            </div>
            <span className={`cb-view-toggle-pill ${schedule.dripContent ? "on" : "off"}`}>
              {schedule.dripContent ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Start date + interval */}
          <div className="cb-grid2">
            <div className="cb-field">
              <label className="cb-label">Start Date</label>
              <div className="cb-view-field">
                {schedule.startDate
                  ? new Date(schedule.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : <Em />}
              </div>
            </div>
            <div className="cb-field">
              <label className="cb-label">Release Interval (days)</label>
              <div className="cb-view-field">{schedule.releaseIntervalDays ?? 7}</div>
            </div>
          </div>

          {/* Timeline preview — same as edit page */}
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
                          {isQuiz && (
                            <span className="cb-tl-type-badge quiz">
                              {m.type === "FINAL_QUIZ" ? "Final Quiz" : "Quiz"} · {m.questions?.length ?? 0}Q
                            </span>
                          )}
                          {locked
                            ? <span className="cb-tl-badge locked"><LockIcon /> Locked</span>
                            : <span className="cb-tl-badge unlocked"><UnlockIcon /> Available</span>
                          }
                        </div>
                      </div>
                      <p className="cb-tl-meta">
                        Releases: {dateStr}
                        {isQuiz
                          ? ` · ${m.questions?.length ?? 0} question${(m.questions?.length ?? 0) !== 1 ? "s" : ""}`
                          : ` · ${m.lessons.length} lesson${m.lessons.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="cb-nav">
            <button className="cb-btn cb-btn-outline" onClick={() => setStep(2)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={() => setStep(4)}>Next: Tests & Rules →</button>
          </div>
        </div>
      )}

      {/* ══ STEP 4 — Tests & Rules ══ */}
      {step === 4 && (
        <div className="cb-card">
          <h2 className="cb-card-title">Intermediate Tests</h2>

          {tests.length === 0
            ? <p className="cb-empty-inline">No intermediate tests configured</p>
            : tests.map(t => (
              <div key={t.id} className="cb-test-block">
                <div className="cb-test-header">
                  <QuizIcon />
                  <span className="cb-test-title-view">{t.name}</span>
                </div>
                <div className="cb-grid2">
                  <div className="cb-field">
                    <label className="cb-label">After Module</label>
                    <div className="cb-view-field">
                      {modules.find(m => m.id === t.afterModuleId)?.title ?? <Em text="Unknown module" />}
                    </div>
                  </div>
                  <div className="cb-field">
                    <label className="cb-label">Passing Score (%)</label>
                    <div className="cb-view-field">{t.passingScore ?? 0}%</div>
                  </div>
                </div>
                <div className="cb-test-retake-row">
                  <span className={`cb-view-toggle-pill ${t.retakeAllowed ? "on" : "off"}`} style={{ fontSize: "0.78rem" }}>
                    {t.retakeAllowed ? "Retakes Allowed" : "No Retakes"}
                  </span>
                  {t.retakeAllowed && (
                    <span className="cb-view-field" style={{ width: "auto", minHeight: "unset", padding: "3px 10px", fontSize: "0.78rem" }}>
                      Max retakes: <strong style={{ color: "#f1f5f9", marginLeft: 4 }}>{t.maxRetakes}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))
          }

          <h2 className="cb-card-title" style={{ borderTop: "1px solid #2d3448", paddingTop: "1.25rem", marginTop: "1.5rem" }}>
            Eligibility Rules
          </h2>

          {rules.map(r => (
            <div key={r.id} className="cb-rule-row">
              <div>
                <p className="cb-rule-label">{r.label}</p>
                <span className="cb-rule-desc">{r.desc}</span>
              </div>
              <span className={`cb-view-toggle-pill ${r.enabled ? "on" : "off"}`}>
                {r.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          ))}

          <div className="cb-nav">
            <button className="cb-btn cb-btn-outline" onClick={() => setStep(3)}>← Back</button>
            <button className="cb-btn cb-btn-green" onClick={() => router.push(`/admin/dashboard/master/courses/${courseId}`)}>
              <EditIcon /> Edit Course
            </button>
          </div>
        </div>
      )}

      {toast && <div className="cb-toast">{toast}</div>}
      <style>{styles}</style>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Em({ text = "—" }) {
  return <span className="cb-view-empty">{text}</span>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function EyeIcon()        { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function InfoIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function HintIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function LockIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UnlockIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>; }
function ModulesIcon()    { return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.25 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function QuizIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function CheckSmallIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function WarnBigIcon()    { return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" style={{ margin: "0 auto", display: "block" }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function LessonTypeIcon({ type }) {
  switch (type) {
    case "VIDEO":    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case "PDF":      return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "DOCUMENT": return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
    default: return null;
  }
}

// ─── Styles — identical to edit page + view-only additions ────────────────────

const styles = `
  .cb-page { padding: 2rem 2.5rem; min-height: 100vh; background: #0f1117; color: #e2e8f0; font-family: 'DM Sans','Segoe UI',sans-serif; }

  .cb-skeleton { background: linear-gradient(90deg,#1a2030 25%,#252d3e 50%,#1a2030 75%); background-size:200% 100%; animation: cb-shimmer 1.5s infinite; border-radius:8px; }
  .cb-skel-title { height:28px;width:40%;margin-bottom:10px; }
  .cb-skel-sub   { height:16px;width:60%;margin-bottom:0; }
  .cb-skel-row   { height:48px;width:100%; }
  @keyframes cb-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .cb-view-badge { display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;background:rgba(125,211,252,0.1);border:1px solid rgba(125,211,252,0.3);color:#7dd3fc;font-size:0.72rem;font-weight:700;letter-spacing:0.05em;margin-bottom:6px; }

  .cb-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem; }
  .cb-title  { font-size:1.55rem;font-weight:600;color:#f1f5f9;margin:0 0 4px;letter-spacing:-0.3px; }
  .cb-subtitle { font-size:0.84rem;color:#64748b;margin:0; }
  .cb-header-actions { display:flex;gap:10px;align-items:center;flex-wrap:wrap; }

  .cb-btn { display:inline-flex;align-items:center;gap:7px;padding:0.5rem 1.1rem;border-radius:8px;font-size:0.875rem;font-weight:500;cursor:pointer;transition:background 0.15s,transform 0.1s;white-space:nowrap;border:1px solid transparent; }
  .cb-btn:active { transform:scale(0.97); }
  .cb-btn-green { background:#3b6d11;color:#c0dd97;border-color:#639922; }
  .cb-btn-green:hover { background:#27500a; }
  .cb-btn-outline { background:transparent;color:#94a3b8;border-color:#2d3448; }
  .cb-btn-outline:hover { background:#1e2230;color:#e2e8f0; }

  .cb-steps-bar { display:flex;align-items:center;background:#161b27;border:1px solid #2d3448;border-radius:12px;padding:1.1rem 1.5rem;margin-bottom:2rem; }
  .cb-step-item { display:flex;align-items:center;flex:1; }
  .cb-step-btn  { display:flex;align-items:center;gap:10px;padding:0.4rem 0.6rem;border-radius:8px;background:none;border:none;cursor:pointer;transition:background 0.15s; }
  .cb-step-btn:hover { background:#1e2230; }
  .cb-step-circle { width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:600;transition:background 0.2s; }
  .cb-step-circle.active { background:#3b6d11;color:#c0dd97;border:1px solid #639922;box-shadow:0 0 0 3px rgba(99,153,34,0.18); }
  .cb-step-circle.done   { background:#3b6d11;color:#c0dd97;border:1px solid #639922; }
  .cb-step-circle.todo   { background:#1a2030;border:1px solid #2d3448;color:#475569; }
  .cb-step-label { font-size:0.82rem;font-weight:500;color:#64748b; }
  .cb-step-label.active { color:#f1f5f9; }
  .cb-step-divider { flex:1;height:1px;background:#2d3448;margin:0 6px; }

  .cb-card { background:#161b27;border:1px solid #2d3448;border-radius:12px;padding:1.75rem; }
  .cb-card-title { font-size:1.05rem;font-weight:600;color:#f1f5f9;margin:0 0 1.4rem; }

  .cb-grid-title-cat { display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-bottom:1.1rem;align-items:start; }
  .cb-field  { margin-bottom:1.1rem; }
  .cb-grid2  { display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-bottom:1.1rem; }
  .cb-grid3  { display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.85rem;margin-bottom:1.1rem; }
  .cb-label  { display:block;font-size:0.81rem;font-weight:500;color:#94a3b8;margin-bottom:6px; }

  .cb-view-field {
    width:100%; padding:0.52rem 0.85rem;
    background:#1a2030; border:1px solid #2d3448;
    border-radius:8px; color:#e2e8f0;
    font-size:0.875rem; box-sizing:border-box;
    min-height:38px; display:flex; align-items:center; flex-wrap:wrap; gap:5px;
    line-height:1.5;
  }
  .cb-view-field.cb-view-textarea {
    align-items:flex-start; min-height:80px;
    white-space:pre-wrap; word-break:break-word;
    padding:0.6rem 0.85rem;
  }
  .cb-view-field.cb-view-tags { flex-wrap:wrap; }
  .cb-view-empty { color:#475569;font-style:italic; }
  .cb-view-tag { padding:2px 9px;border-radius:20px;background:#3b6d11;border:1px solid #639922;color:#c0dd97;font-size:0.72rem;font-weight:600; }

  .cb-status-badge { display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid;font-size:0.76rem;font-weight:600; }
  .cb-status-dot   { width:6px;height:6px;border-radius:50%;flex-shrink:0; }

  /* View-only toggle pill — replaces interactive toggle */
  .cb-view-toggle-pill { display:inline-flex;align-items:center;padding:4px 12px;border-radius:20px;font-size:0.78rem;font-weight:600;flex-shrink:0; }
  .cb-view-toggle-pill.on  { background:rgba(99,153,34,0.12);border:1px solid rgba(99,153,34,0.35);color:#c0dd97; }
  .cb-view-toggle-pill.off { background:rgba(100,116,139,0.1);border:1px solid rgba(100,116,139,0.25);color:#64748b; }

  .cb-thumb-preview-wrap { display:flex;align-items:flex-start;gap:1.1rem;padding:0.85rem;background:#1a2030;border:1px solid #2d3448;border-radius:10px; }
  .cb-thumb-preview-img  { width:128px;height:72px;object-fit:cover;border-radius:6px;flex-shrink:0;border:1px solid #2d3448; }
  .cb-thumb-preview-info { display:flex;flex-direction:column;gap:4px;min-width:0; }
  .cb-thumb-filename { font-size:0.84rem;font-weight:500;color:#f1f5f9;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px; }
  .cb-thumb-meta     { font-size:0.75rem;color:#64748b;margin:0; }

  .cb-section-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem; }
  .cb-section-heading { font-size:1.05rem;font-weight:600;color:#f1f5f9; }
  .cb-modules-count-badge { padding:3px 12px;border-radius:20px;background:#1a2030;border:1px solid #2d3448;color:#64748b;font-size:0.78rem;font-weight:600; }

  .cb-info-box { display:flex;gap:10px;padding:0.85rem 1rem;background:rgba(55,138,221,0.07);border:1px solid rgba(55,138,221,0.2);border-radius:8px;margin-bottom:1.2rem; }
  .cb-info-box p { font-size:0.82rem;color:#7dd3fc;line-height:1.5;margin:0; }

  .cb-module-block { background:#1a2030;border:1px solid #2d3448;border-radius:10px;padding:1.1rem 1.2rem;margin-bottom:0.85rem;animation:cb-slideUp 0.2s ease; }
  .cb-module-block:hover { border-color:#3a4460; }
  .cb-module-block.mod-quiz { border-color:#2d3a1a; }
  .cb-module-block.mod-quiz:hover { border-color:#3b6d11; }
  .cb-module-block.mod-final-quiz { border-color:#3d2a6e; }
  .cb-module-block.mod-final-quiz:hover { border-color:#7c4fd4; }

  .cb-module-header { display:flex;align-items:center;gap:10px;margin-bottom:0.5rem; }
  .cb-module-num { width:28px;height:28px;border-radius:6px;background:#3b6d11;border:1px solid #639922;color:#c0dd97;font-size:0.78rem;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .cb-module-num.quiz       { background:#3b6d11;border-color:#639922;color:#c0dd97; }
  .cb-module-num.quiz-final { background:#3d2a6e;border-color:#7c4fd4;color:#c4b5fd; }
  .cb-module-title-view { flex:1;color:#f1f5f9;font-size:1rem;font-weight:600;padding:2px 4px; }
  .cb-module-header-right { display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:auto; }

  .cb-module-type-view { padding:5px 14px;background:#12111e;border:1px solid #3d2a6e;border-radius:20px;color:#c4b5fd;font-size:0.78rem;font-weight:600; }
  .cb-module-type-view.quiz-view       { background:#111a08;border-color:#3b6d11;color:#c0dd97; }
  .cb-module-type-view.final-quiz-view { background:#12111e;border-color:#7c4fd4;color:#c4b5fd; }

  .cb-count-badge { display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 6px;border-radius:8px;background:#0c1627;border:1px solid #1a3a5e;color:#60a5fa;font-size:0.78rem;font-weight:700;flex-shrink:0; }
  .cb-count-badge.quiz-badge       { background:#0c1a08;border-color:#1a4a0a;color:#86efac; }
  .cb-count-badge.quiz-final-badge { background:#1a0c2e;border-color:#4a1a7a;color:#c4b5fd; }

  .cb-module-hint { display:flex;align-items:center;gap:6px;padding:5px 4px 10px;font-size:0.75rem;color:#64748b; }

  .cb-lessons-wrap { padding-left:38px; }
  .cb-lesson-row  { display:flex;align-items:center;gap:8px;padding:0.52rem 0.75rem;background:#161b27;border:1px solid #2d3448;border-radius:7px;margin-bottom:6px; }
  .cb-lesson-icon { width:24px;height:24px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .lt-video    { background:#0c1a2e;border:1px solid #163856;color:#7dd3fc; }
  .lt-pdf      { background:#1a0c0c;border:1px solid #5a1a1a;color:#fca5a5; }
  .lt-document { background:#1a1430;border:1px solid #3d2060;color:#c4b5fd; }
  .cb-lesson-title-view { flex:1;color:#e2e8f0;font-size:0.84rem; }
  .cb-lesson-uploaded-badge { display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;background:#0c1a0c;border:1px solid #1a5a1a;color:#86efac;font-size:0.72rem;white-space:nowrap; }
  .cb-lesson-no-content     { display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;background:#1a1a0a;border:1px solid #3a3010;color:#ca8a04;font-size:0.72rem;white-space:nowrap; }
  .cb-lesson-empty { font-size:0.82rem;color:#475569;padding:0.6rem 0;text-align:center; }

  .cb-quiz-view-wrap { margin-top:0.5rem; }
  .cb-quiz-empty { font-size:0.82rem;color:#475569;padding:0.6rem 0;text-align:center; }

  .cb-q-view-card { background:#161b27;border:1px solid #2d3448;border-radius:9px;padding:1rem 1.1rem;margin-bottom:0.7rem; }
  .cb-q-view-header { display:flex;align-items:center;gap:10px;margin-bottom:0.6rem;flex-wrap:wrap; }
  .cb-q-num { width:28px;height:28px;border-radius:6px;background:#0c1627;border:1px solid #1a3a5e;color:#60a5fa;font-size:0.78rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .cb-q-meta-chips { display:flex;gap:5px;flex-wrap:wrap; }
  .cb-q-chip { padding:2px 8px;border-radius:20px;font-size:0.7rem;font-weight:600; }
  .cb-q-chip.difficulty { background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#fbbf24; }
  .cb-q-chip.bloom      { background:rgba(124,79,212,0.1);border:1px solid rgba(124,79,212,0.25);color:#c4b5fd; }
  .cb-q-chip.type       { background:rgba(55,138,221,0.08);border:1px solid rgba(55,138,221,0.2);color:#7dd3fc; }
  .cb-q-chip.points     { background:rgba(99,153,34,0.1);border:1px solid rgba(99,153,34,0.25);color:#c0dd97; }
  .cb-q-text { font-size:0.875rem;color:#e2e8f0;margin:0 0 0.75rem;line-height:1.6; }

  .cb-q-code-block { position:relative;background:#0d1117;border:1px solid #2d3448;border-radius:7px;margin-bottom:0.75rem;overflow:hidden; }
  .cb-q-code-lang  { display:block;padding:4px 10px;background:#161b27;border-bottom:1px solid #2d3448;font-size:0.68rem;font-weight:600;color:#639922;letter-spacing:0.06em;text-transform:uppercase; }
  .cb-q-code-pre   { margin:0;padding:0.75rem 1rem;overflow-x:auto;font-size:0.78rem;line-height:1.7; }
  .cb-q-code-pre code { color:#c9d1d9;font-family:'JetBrains Mono','Fira Code',monospace; }

  .cb-q-options { display:flex;flex-direction:column;gap:6px;margin-bottom:0.6rem; }
  .cb-q-option  { display:flex;align-items:center;gap:10px;padding:0.45rem 0.85rem;border-radius:7px;background:#1a2030;border:1px solid #2d3448; }
  .cb-q-option.correct { background:#0c1a0c;border-color:#1a5a1a; }
  .cb-q-option-label { width:22px;height:22px;border-radius:5px;background:#252d3e;border:1px solid #3a4460;color:#94a3b8;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .cb-q-option.correct .cb-q-option-label { background:#1a5a1a;border-color:#4ade80;color:#86efac; }
  .cb-q-option-text { flex:1;font-size:0.84rem;color:#e2e8f0; }
  .cb-q-option.correct .cb-q-option-text { color:#86efac; }
  .cb-q-correct-tick { color:#4ade80;display:flex;align-items:center; }
  .cb-q-explanation { font-size:0.78rem;color:#64748b;background:#131720;border:1px solid #1e2535;border-radius:6px;padding:0.5rem 0.75rem;line-height:1.6; }
  .cb-q-exp-label { color:#94a3b8;font-weight:600; }

  /* Timeline — same as edit page */
  .cb-toggle-row { display:flex;align-items:center;justify-content:space-between;padding:0.85rem 1rem;background:#1a2030;border:1px solid #2d3448;border-radius:9px;margin-bottom:1.1rem; }
  .cb-toggle-label { font-size:0.9rem;font-weight:500;color:#f1f5f9;margin-bottom:2px; }
  .cb-toggle-sub   { font-size:0.8rem;color:#64748b; }
  .cb-timeline-wrap { margin-top:1.2rem; }
  .cb-tl-heading { font-size:0.82rem;font-weight:500;color:#94a3b8;margin-bottom:0.75rem; }
  .cb-tl-item { display:flex;align-items:flex-start;gap:14px;margin-bottom:0; }
  .cb-tl-col  { display:flex;flex-direction:column;align-items:center;flex-shrink:0; }
  .cb-tl-dot  { width:34px;height:34px;border-radius:8px;background:#3b6d11;border:1px solid #639922;color:#c0dd97;font-size:0.8rem;font-weight:600;display:flex;align-items:center;justify-content:center; }
  .cb-tl-dot.locked { background:#1a2030;border-color:#2d3448;color:#475569; }
  .cb-tl-line { width:1px;flex:1;background:#2d3448;min-height:18px;margin:4px 0; }
  .cb-tl-card { flex:1;background:#1a2030;border:1px solid #2d3448;border-radius:8px;padding:0.8rem 1rem;margin-bottom:8px; }
  .cb-tl-card-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px; }
  .cb-tl-mod-name { font-size:0.88rem;font-weight:600;color:#f1f5f9; }
  .cb-tl-badge { display:flex;align-items:center;gap:5px;font-size:0.75rem; }
  .cb-tl-badge.locked   { color:#f87171; }
  .cb-tl-badge.unlocked { color:#4ade80; }
  .cb-tl-type-badge { font-size:0.72rem;padding:2px 8px;border-radius:10px;font-weight:600; }
  .cb-tl-type-badge.quiz { background:rgba(124,79,212,0.15);border:1px solid rgba(124,79,212,0.3);color:#c4b5fd; }
  .cb-tl-meta { font-size:0.78rem;color:#64748b;margin:0; }

  /* Tests & Rules */
  .cb-test-block  { background:#1a2030;border:1px solid #2d3448;border-radius:10px;padding:1.1rem 1.2rem;margin-bottom:0.85rem; }
  .cb-test-header { display:flex;align-items:center;gap:10px;margin-bottom:1rem; }
  .cb-test-title-view { flex:1;color:#f1f5f9;font-size:0.95rem;font-weight:600; }
  .cb-test-retake-row { display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:0.5rem; }
  .cb-rule-row  { display:flex;align-items:center;justify-content:space-between;padding:0.9rem 1rem;border:1px solid #2d3448;border-radius:9px;margin-bottom:0.7rem; }
  .cb-rule-row:hover { border-color:#3a4460; }
  .cb-rule-label { font-size:0.88rem;font-weight:500;color:#f1f5f9;margin-bottom:2px; }
  .cb-rule-desc  { font-size:0.78rem;color:#64748b; }

  .cb-nav { display:flex;align-items:center;justify-content:space-between;margin-top:1.75rem; }
  .cb-empty { text-align:center;padding:3rem 1rem;color:#475569;font-size:0.875rem; }
  .cb-empty p { margin:0; }
  .cb-empty-inline { text-align:center;padding:1.5rem 0 2rem;color:#475569;font-size:0.84rem; }

  .cb-toast { position:fixed;top:1.5rem;right:1.5rem;background:#1a2d12;border:1px solid #639922;border-radius:10px;padding:0.75rem 1.2rem;color:#c0dd97;font-size:0.875rem;font-weight:500;z-index:100;animation:cb-fadeIn 0.2s ease; }
  @keyframes cb-fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes cb-slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  @media (max-width: 640px) {
    .cb-page { padding:1.25rem 1rem; }
    .cb-grid-title-cat,.cb-grid2,.cb-grid3 { grid-template-columns:1fr; }
    .cb-steps-bar { padding:0.85rem 0.75rem; }
    .cb-step-label { display:none; }
    .cb-header-actions { flex-wrap:wrap; }
    .cb-thumb-preview-wrap { flex-direction:column; }
    .cb-thumb-preview-img  { width:100%;height:auto; }
  }
`;