"use client";

import React, { useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helper: convert File → base64 data-url ──────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── InputModeToggle ─────────────────────────────────────────────────────────

function InputModeToggle({
  mode,
  onChange,
  accentBg,
  accentBdr,
  accentTxt,
}: {
  mode: "text" | "image";
  onChange: (m: "text" | "image") => void;
  accentBg: string;
  accentBdr: string;
  accentTxt: string;
}) {
  return (
    <div className="imt-wrap">
      <button
        type="button"
        className={`imt-btn ${mode === "text" ? "active" : ""}`}
        style={mode === "text" ? { background: accentBg, borderColor: accentBdr, color: accentTxt } : {}}
        onClick={() => onChange("text")}
        title="Text input"
      >
        <TextIcon /> Text
      </button>
      <button
        type="button"
        className={`imt-btn ${mode === "image" ? "active" : ""}`}
        style={mode === "image" ? { background: accentBg, borderColor: accentBdr, color: accentTxt } : {}}
        onClick={() => onChange("image")}
        title="Image input"
      >
        <ImageIcon /> Image
      </button>
    </div>
  );
}

// ─── ImageUploadArea ──────────────────────────────────────────────────────────

function ImageUploadArea({
  value,
  onChange,
  label = "Upload image",
  compact = false,
}: {
  value: string;
  onChange: (b64: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const b64 = await fileToBase64(file);
    onChange(b64);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`img-upload-wrap ${compact ? "compact" : ""}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {value ? (
        <div className="img-preview-wrap">
          <img src={value} alt="Question image" className={`img-preview ${compact ? "compact" : ""}`} />
          <div className="img-preview-actions">
            <button type="button" className="img-change-btn" onClick={() => inputRef.current?.click()}>
              <UploadSmIcon /> Change
            </button>
            <button type="button" className="img-remove-btn" onClick={() => onChange("")}>
              <XSmIcon /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className="img-drop-zone"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <ImageIcon size={compact ? 18 : 26} />
          <span className="img-drop-label">{label}</span>
          <span className="img-drop-sub">PNG, JPG, WEBP · click or drag</span>
        </div>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizOption {
  id: string;
  text: string;
  inputMode: "text" | "image";
  imageData: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  inputMode: "text" | "image";
  questionImage: string;
  options: QuizOption[];
  correctOptionId: string;
  description: string;
  points: number;
  difficulty: string;
  bloomLevel: string;
  questionType: string;
  codeSnippet: string;
  codeLanguage: string;
}

interface EnumOption {
  type: string;
  label: string;
}

interface Enums {
  difficulties: EnumOption[];
  bloomLevels: EnumOption[];
  questionTypes: EnumOption[];
}

interface QuizBuilderProps {
  moduleId: string;
  questions: QuizQuestion[];
  onUpdate: (questions: QuizQuestion[]) => void;
  isFinal: boolean;
  enums: Enums;
}

// ─── QuizBuilder ──────────────────────────────────────────────────────────────

export function QuizBuilder({ moduleId, questions, onUpdate, isFinal, enums }: QuizBuilderProps) {
  const accentColor = isFinal ? "#7c4fd4" : "#639922";
  const accentBg    = isFinal ? "#3d2a6e" : "#3b6d11";
  const accentBdr   = isFinal ? "#7c4fd4" : "#639922";
  const accentTxt   = isFinal ? "#c4b5fd" : "#c0dd97";

  const [codeOpenIds, setCodeOpenIds] = React.useState<string[]>([]);

  const toggleCodeSection = (qId: string) =>
    setCodeOpenIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId],
    );

  const getDefaultDifficulty   = () => enums.difficulties[0]?.type  || "Easy";
  const getDefaultBloomLevel   = () => enums.bloomLevels[0]?.type   || "Remember";
  const getDefaultQuestionType = () => enums.questionTypes[0]?.type || "Conceptual";

  // ── Add question ────────────────────────────────────────────────────────────
  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      text:          "",
      inputMode:     "text",
      questionImage: "",
      options: [
        { id: `opt_${Date.now()}_0`, text: "", inputMode: "text", imageData: "" },
        { id: `opt_${Date.now()}_1`, text: "", inputMode: "text", imageData: "" },
      ],
      correctOptionId: "",
      description:     "",
      points:          1,
      difficulty:      getDefaultDifficulty(),
      bloomLevel:      getDefaultBloomLevel(),
      questionType:    getDefaultQuestionType(),
      codeSnippet:     "",
      codeLanguage:    "",
    };
    onUpdate([...questions, newQ]);
  };

  const removeQuestion = (qId: string) => {
    setCodeOpenIds(prev => prev.filter(id => id !== qId));
    onUpdate(questions.filter(q => q.id !== qId));
  };

  const updateQuestion = (qId: string, patch: Partial<QuizQuestion>) =>
    onUpdate(questions.map(q => q.id === qId ? { ...q, ...patch } : q));

  const addOption = (qId: string) => {
    const q = questions.find(x => x.id === qId);
    if (!q || q.options.length >= 4) return;
    const newOpt: QuizOption = { id: `opt_${Date.now()}`, text: "", inputMode: "text", imageData: "" };
    updateQuestion(qId, { options: [...q.options, newOpt] });
  };

  const removeOption = (qId: string, optId: string) => {
    const q = questions.find(x => x.id === qId);
    if (!q || q.options.length <= 2) return;
    const updated   = q.options.filter(o => o.id !== optId);
    const correctId = q.correctOptionId === optId ? "" : q.correctOptionId;
    updateQuestion(qId, { options: updated, correctOptionId: correctId });
  };

  const updateOptionField = (qId: string, optId: string, patch: Partial<QuizOption>) => {
    const q = questions.find(x => x.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      options: q.options.map(o => o.id === optId ? { ...o, ...patch } : o),
    });
  };

  // ── Image handlers ──────────────────────────────────────────────────────────
  const handleQuestionImageChange = (qId: string, b64: string) =>
    updateQuestion(qId, { questionImage: b64 });

  const handleOptionImageChange = (qId: string, optId: string, b64: string) =>
    updateOptionField(qId, optId, { imageData: b64 });

  // ── Switch input mode ───────────────────────────────────────────────────────
  const switchQuestionMode = (qId: string, mode: "text" | "image") => {
    updateQuestion(qId, { inputMode: mode, text: "", questionImage: "" });
    if (mode === "image") setCodeOpenIds(prev => prev.filter(id => id !== qId));
  };

  const switchOptionMode = (qId: string, optId: string, mode: "text" | "image") =>
    updateOptionField(qId, optId, { inputMode: mode, text: "", imageData: "" });

  const getCorrectLetter = (q: QuizQuestion) => {
    if (!q.correctOptionId) return "—";
    const idx = q.options.findIndex(opt => opt.id === q.correctOptionId);
    return idx !== -1 ? OPTION_LABELS[idx] : "—";
  };

  return (
    <div className="qb-wrap">
      <style>{quizBuilderStyles}</style>

      {/* Banner */}
      <div className="qb-banner" style={{ borderColor: accentBdr, background: isFinal ? "rgba(124,79,212,0.07)" : "rgba(99,153,34,0.07)" }}>
        <span className="qb-banner-icon" style={{ background: accentBg, borderColor: accentBdr, color: accentTxt }}>
          {isFinal ? <FinalQuizIcon /> : <QuizBannerIcon />}
        </span>
        <div>
          <p className="qb-banner-title" style={{ color: accentTxt }}>{isFinal ? "Final Quiz" : "Quiz"} — Question Builder</p>
          <p className="qb-banner-sub">Add questions &amp; options as <strong>Text</strong> or <strong>Image</strong></p>
        </div>
        <span className="qb-question-count" style={{ background: accentBg, borderColor: accentBdr, color: accentTxt }}>
          {questions.length} Q
        </span>
      </div>

      {/* Empty state */}
      {questions.length === 0 ? (
        <div className="qb-empty">
          <QuizEmptyIcon />
          <p>No questions yet — add your first question below</p>
        </div>
      ) : (
        questions.map((q, qi) => {
          const codeOpen = codeOpenIds.includes(q.id);
          const hasCode  = !!q.codeSnippet?.trim();
          const qMode    = q.inputMode ?? "text";

          return (
            <div key={q.id} className="qb-question-card" style={{ borderLeftColor: accentColor }}>

              {/* Q Header */}
              <div className="qb-q-header">
                <span className="qb-q-num" style={{ background: accentBg, borderColor: accentBdr, color: accentTxt }}>Q{qi + 1}</span>
                <span className="qb-q-label">Question</span>

                <InputModeToggle
                  mode={qMode}
                  onChange={(m) => switchQuestionMode(q.id, m)}
                  accentBg={accentBg}
                  accentBdr={accentBdr}
                  accentTxt={accentTxt}
                />

                <div className="qb-q-header-right">
                  <div className="qb-pts-field">
                    <span className="qb-pts-label">Marks</span>
                    <input
                      type="number"
                      className="qb-pts-input"
                      min={1} max={100}
                      value={q.points}
                      onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <button className="cb-icon-btn delete" onClick={() => removeQuestion(q.id)} title="Delete question">
                    <DeleteIcon />
                  </button>
                </div>
              </div>

              {/* Meta grid */}
              <div className="qb-meta-grid">
                <div className="qb-meta-field">
                  <label className="qb-meta-label">Difficulty</label>
                  <select className="qb-meta-select" value={q.difficulty} onChange={e => updateQuestion(q.id, { difficulty: e.target.value })}>
                    {enums.difficulties.length > 0
                      ? enums.difficulties.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)
                      : <><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></>}
                  </select>
                </div>
                <div className="qb-meta-field">
                  <label className="qb-meta-label">Bloom's Level</label>
                  <select className="qb-meta-select" value={q.bloomLevel} onChange={e => updateQuestion(q.id, { bloomLevel: e.target.value })}>
                    {enums.bloomLevels.length > 0
                      ? enums.bloomLevels.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)
                      : <>
                          <option value="Remember">Remember</option>
                          <option value="Understand">Understand</option>
                          <option value="Apply">Apply</option>
                          <option value="Analyze">Analyze</option>
                          <option value="Evaluate">Evaluate</option>
                          <option value="Create">Create</option>
                        </>}
                  </select>
                </div>
                <div className="qb-meta-field">
                  <label className="qb-meta-label">Type</label>
                  <select className="qb-meta-select" value={q.questionType} onChange={e => updateQuestion(q.id, { questionType: e.target.value })}>
                    {enums.questionTypes.length > 0
                      ? enums.questionTypes.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)
                      : <>
                          <option value="Conceptual">Conceptual</option>
                          <option value="OutputPrediction">Output Prediction</option>
                          <option value="ProblemSolving">Problem Solving</option>
                          <option value="Debugging">Debugging</option>
                        </>}
                  </select>
                </div>
                <div className="qb-meta-field qb-correct-preview">
                  <label className="qb-meta-label">Correct Answer</label>
                  <div className="qb-correct-badge-preview" style={{ borderColor: accentBdr, color: accentTxt }}>{getCorrectLetter(q)}</div>
                </div>
              </div>

              {/* Question Input: Text or Image */}
              {qMode === "text" ? (
                <textarea
                  className="qb-q-text"
                  placeholder="Type your question here…"
                  rows={2}
                  value={q.text}
                  onChange={e => updateQuestion(q.id, { text: e.target.value })}
                />
              ) : (
                <div className="qb-q-image-wrap">
                  <ImageUploadArea
                    value={q.questionImage}
                    onChange={(b64) => handleQuestionImageChange(q.id, b64)}
                    label="Upload question image"
                  />
                </div>
              )}

              {/* Code snippet (text mode only) */}
              {qMode === "text" && (
                <div className="qb-code-toggle-wrap">
                  {!codeOpen ? (
                    <button className="qb-code-add-chip" onClick={() => toggleCodeSection(q.id)}>
                      <CodeIcon /> Add Code Snippet <span className="qb-code-chip-hint">optional</span>
                    </button>
                  ) : (
                    <div className="qb-code-section">
                      <div className="qb-code-header">
                        <span className="qb-code-label"><CodeIcon /> Code Snippet <span className="qb-desc-optional"> — shown above the question</span></span>
                        <div className="qb-code-header-right">
                          <select
                            className="qb-meta-select qb-lang-select"
                            value={q.codeLanguage || "python"}
                            onChange={e => updateQuestion(q.id, { codeLanguage: e.target.value })}
                          >
                            {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                          </select>
                          <button
                            className="qb-option-remove"
                            title="Remove code snippet"
                            onClick={() => { updateQuestion(q.id, { codeSnippet: "", codeLanguage: "" }); toggleCodeSection(q.id); }}
                          >
                            <XSmallIcon />
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="qb-code-textarea"
                        placeholder={`// Paste your ${CODE_LANGUAGES.find(l => l.value === (q.codeLanguage || "python"))?.label || "code"} snippet here…`}
                        rows={5}
                        value={q.codeSnippet}
                        onChange={e => updateQuestion(q.id, { codeSnippet: e.target.value })}
                        spellCheck={false}
                      />
                      {q.codeLanguage && (
                        <div className="qb-code-lang-badge">
                          {CODE_LANGUAGES.find(l => l.value === q.codeLanguage)?.label || q.codeLanguage}
                        </div>
                      )}
                    </div>
                  )}
                  {!codeOpen && hasCode && (
                    <span
                      className="qb-code-saved-badge"
                      onClick={() => toggleCodeSection(q.id)}
                      title="Code snippet saved — click to edit"
                    >
                      <CodeIcon /> {CODE_LANGUAGES.find(l => l.value === q.codeLanguage)?.label || "Code"} snippet saved{" "}
                      <span className="qb-code-edit-hint">Edit</span>
                    </span>
                  )}
                </div>
              )}

              {/* Options */}
              <div className="qb-options-section">
                <p className="qb-options-label">
                  Answer Options <span className="qb-options-hint">(select correct · toggle Text/Image per option)</span>
                </p>
                {q.options.map((opt, oi) => {
                  const isCorrect = q.correctOptionId === opt.id;
                  const oMode     = opt.inputMode ?? "text";
                  return (
                    <div
                      key={opt.id}
                      className={`qb-option-row ${isCorrect ? "correct" : ""} ${oMode === "image" ? "image-mode" : ""}`}
                      style={isCorrect ? { borderColor: accentColor, background: isFinal ? "rgba(124,79,212,0.09)" : "rgba(99,153,34,0.09)" } : {}}
                    >
                      {/* Correct radio */}
                      <button
                        className={`qb-option-radio ${isCorrect ? "checked" : ""}`}
                        style={isCorrect ? { background: accentBg, borderColor: accentColor } : {}}
                        onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                        title="Mark as correct answer"
                      >
                        {isCorrect && <span className="qb-option-radio-dot" style={{ background: accentTxt }} />}
                      </button>

                      {/* Letter badge */}
                      <span
                        className="qb-option-letter"
                        style={isCorrect ? { background: accentBg, borderColor: accentBdr, color: accentTxt } : {}}
                      >
                        {OPTION_LABELS[oi]}
                      </span>

                      {/* Input mode toggle (compact) */}
                      <div className="qb-opt-mode-toggle">
                        <button
                          type="button"
                          className={`qb-opt-mode-btn ${oMode === "text" ? "active" : ""}`}
                          style={oMode === "text" && isCorrect ? { color: accentTxt } : {}}
                          onClick={() => switchOptionMode(q.id, opt.id, "text")}
                          title="Text option"
                        >
                          <TextIcon size={10} />
                        </button>
                        <button
                          type="button"
                          className={`qb-opt-mode-btn ${oMode === "image" ? "active" : ""}`}
                          style={oMode === "image" && isCorrect ? { color: accentTxt } : {}}
                          onClick={() => switchOptionMode(q.id, opt.id, "image")}
                          title="Image option"
                        >
                          <ImageIcon size={10} />
                        </button>
                      </div>

                      {/* Text or Image input */}
                      {oMode === "text" ? (
                        <input
                          className="qb-option-input"
                          placeholder={`Option ${OPTION_LABELS[oi]}…`}
                          value={opt.text}
                          onChange={e => updateOptionField(q.id, opt.id, { text: e.target.value })}
                        />
                      ) : (
                        <div className="qb-opt-image-area">
                          <ImageUploadArea
                            value={opt.imageData}
                            onChange={(b64) => handleOptionImageChange(q.id, opt.id, b64)}
                            label={`Option ${OPTION_LABELS[oi]} image`}
                            compact
                          />
                        </div>
                      )}

                      {isCorrect && (
                        <span
                          className="qb-correct-badge"
                          style={{
                            background: isFinal ? "rgba(124,79,212,0.15)" : "rgba(99,153,34,0.15)",
                            borderColor: accentBdr,
                            color: accentTxt,
                          }}
                        >
                          <CheckSmallIcon /> Correct
                        </span>
                      )}
                      {q.options.length > 2 && (
                        <button className="qb-option-remove" onClick={() => removeOption(q.id, opt.id)} title="Remove option">
                          <XSmallIcon />
                        </button>
                      )}
                    </div>
                  );
                })}
                {q.options.length < 4 && (
                  <button className="qb-add-option-chip" onClick={() => addOption(q.id)}>
                    <PlusSmallIcon /> Add Option {OPTION_LABELS[q.options.length]}
                  </button>
                )}
              </div>

              {/* Explanation */}
              <div className="qb-desc-section">
                <label className="qb-desc-label">
                  <ExplainIcon /> Explanation <span className="qb-desc-optional">(optional — shown after answer)</span>
                </label>
                <textarea
                  className="qb-desc-textarea"
                  placeholder="Explain why the correct answer is right…"
                  rows={2}
                  value={q.description}
                  onChange={e => updateQuestion(q.id, { description: e.target.value })}
                />
              </div>
            </div>
          );
        })
      )}

      <button
        className="qb-add-question-btn"
        style={{ borderColor: accentBdr, color: accentTxt }}
        onClick={addQuestion}
      >
        <PlusIcon /> Add Question {questions.length > 0 && <span className="qb-add-q-hint">Q{questions.length + 1}</span>}
      </button>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TextIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7"/>
      <line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  );
}

function ImageIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function UploadSmIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}

function XSmIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function PlusSmallIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function DeleteIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}

function XSmallIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function CodeIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}

function ExplainIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}

function CheckSmallIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
}

function QuizBannerIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

function FinalQuizIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function QuizEmptyIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const quizBuilderStyles = `
  /* ── InputModeToggle ── */
  .imt-wrap {
    display: inline-flex; align-items: center; gap: 2px;
    background: #10141e; border: 1px solid #2d3448; border-radius: 7px;
    padding: 3px; flex-shrink: 0;
  }
  .imt-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 5px; border: 1px solid transparent;
    background: transparent; color: #475569;
    font-size: 0.73rem; font-weight: 600; cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    font-family: inherit; white-space: nowrap;
  }
  .imt-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }

  /* ── ImageUploadArea ── */
  .img-upload-wrap { width: 100%; margin-bottom: 0.85rem; }
  .img-upload-wrap.compact { margin-bottom: 0; flex: 1; min-width: 0; }

  .img-drop-zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 5px; padding: 1.1rem 0.75rem;
    border: 2px dashed #2d3448; border-radius: 9px;
    cursor: pointer; background: #0c1020;
    transition: border-color 0.15s, background 0.15s;
    color: #475569; text-align: center;
  }
  .img-drop-zone:hover { border-color: #4a5a7a; background: #0f1520; color: #64748b; }
  .img-drop-label { font-size: 0.78rem; font-weight: 500; color: inherit; }
  .img-drop-sub   { font-size: 0.7rem; color: #3a4460; }

  .img-preview-wrap {
    position: relative; display: flex; flex-direction: column;
    gap: 8px; align-items: flex-start;
  }
  .img-preview {
    width: 100%; max-height: 200px; object-fit: contain;
    border-radius: 8px; border: 1px solid #2d3448; background: #0c1020;
  }
  .img-preview.compact { max-height: 80px; max-width: 160px; }
  .img-preview-actions { display: flex; gap: 6px; align-items: center; }
  .img-change-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 5px; border: 1px solid #2d3448;
    background: transparent; color: #7dd3fc; font-size: 0.72rem; cursor: pointer;
    transition: background 0.12s; font-family: inherit;
  }
  .img-change-btn:hover { background: #0c1a2e; }
  .img-remove-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 5px; border: 1px solid #7f1d1d;
    background: transparent; color: #fca5a5; font-size: 0.72rem; cursor: pointer;
    transition: background 0.12s; font-family: inherit;
  }
  .img-remove-btn:hover { background: #2a0d0d; }

  /* ── Question image wrapper ── */
  .qb-q-image-wrap { margin-bottom: 0.85rem; }

  /* ── Option image ── */
  .qb-option-row.image-mode { align-items: flex-start; padding: 0.6rem 0.75rem; }
  .qb-opt-image-area { flex: 1; min-width: 0; }
  .qb-opt-image-area .img-upload-wrap { margin-bottom: 0; }
  .qb-opt-image-area .img-drop-zone {
    padding: 0.5rem 0.6rem; border-radius: 7px;
    flex-direction: row; gap: 6px; justify-content: flex-start;
  }

  /* ── Option mode mini-toggle ── */
  .qb-opt-mode-toggle {
    display: inline-flex; align-items: center;
    background: #0c1020; border: 1px solid #252d3e; border-radius: 5px;
    padding: 2px; gap: 1px; flex-shrink: 0; align-self: center;
  }
  .qb-opt-mode-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 4px; border: 1px solid transparent;
    background: transparent; color: #3a4460; cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s; padding: 0;
  }
  .qb-opt-mode-btn:hover { color: #64748b; background: rgba(255,255,255,0.04); }
  .qb-opt-mode-btn.active { background: #1a2030; border-color: #3a4460; color: #94a3b8; }

  /* ── q-header flex tweak ── */
  .qb-q-header { flex-wrap: wrap; gap: 6px; }
  .qb-q-header-right { margin-left: auto; }

  /* ── Core QuizBuilder styles (self-contained) ── */
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
  .qb-q-header-right { display: flex; align-items: center; gap: 8px; }
  .qb-pts-field { display: flex; align-items: center; gap: 6px; }
  .qb-pts-label { font-size: 0.76rem; color: #64748b; white-space: nowrap; }
  .qb-pts-input { width: 52px; padding: 4px 8px; background: #1a2030; border: 1px solid #2d3448; border-radius: 6px; color: #e2e8f0; font-size: 0.82rem; outline: none; text-align: center; font-family: inherit; }
  .qb-pts-input:focus { border-color: #639922; }
  .cb-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: background 0.15s, transform 0.1s; }
  .cb-icon-btn:active { transform: scale(0.9); }
  .cb-icon-btn.delete { color: #f87171; }
  .cb-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
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

  @media (max-width: 640px) {
    .qb-meta-grid { grid-template-columns: 1fr 1fr; }
    .qb-banner { flex-wrap: wrap; }
    .qb-q-header { flex-wrap: wrap; }
  }
`;
