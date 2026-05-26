"use client";

import { useState, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const OPTION_LABELS  = ["A", "B", "C", "D"];
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
const DIFFICULTIES   = ["Easy", "Medium", "Hard"];
const BLOOM_LEVELS   = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const QUESTION_TYPES = ["Conceptual", "Output Prediction", "Problem Solving", "Debugging"];

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const Icon = {
  Plus:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Code:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Image:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Check:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Info:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Grip:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>,
  Upload:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Arrow:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Back:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Explain: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Star:    () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Pencil:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

// ─── Helper: fresh question factory ──────────────────────────────────────────

function makeOption(suffix) {
  return {
    id:           `opt_${Date.now()}_${suffix}`,
    text:         "",
    imageFile:    null,
    imagePreview: null,
    showImage:    false,
  };
}

function newQuestion(index) {
  const ts = Date.now();
  return {
    id:                        `q_${ts}_${index}`,
    // Question text + image
    text:                      "",
    imageFile:                 null,
    imagePreview:              null,
    showImage:                 false,
    // Code
    showCode:                  false,
    codeSnippet:               "",
    codeLanguage:              "python",
    // Options
    options:                   [makeOption(`${ts}_0`), makeOption(`${ts}_1`), makeOption(`${ts}_2`), makeOption(`${ts}_3`)],
    correctOptionId:           "",
    // Explanation text + image
    explanation:               "",
    explanationImageFile:      null,
    explanationImagePreview:   null,
    showExplanationImage:      false,
    // Meta
    points:                    1,
    difficulty:                "Easy",
    bloomLevel:                "Remember",
    questionType:              "Conceptual",
  };
}

// ─── Tiny image uploader pill inside an option row ───────────────────────────
//   Shows:  [📷 Add Image]  →  [thumbnail | ✕]
//   All contained in a single row, no layout shift on other options

function OptionImagePill({ opt, onChange }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ imageFile: file, imagePreview: ev.target.result, showImage: true });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const remove = (e) => {
    e.stopPropagation();
    onChange({ imageFile: null, imagePreview: null, showImage: false });
  };

  if (opt.showImage && opt.imagePreview) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <div
          style={{ position: "relative", width: 44, height: 34, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(139,92,246,0.35)", cursor: "pointer" }}
          onClick={() => fileRef.current?.click()}
          title="Click to change image"
        >
          <img src={opt.imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
          >
            <span style={{ color: "#fff", opacity: 0 }}
             onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0"; }}
            ><Icon.Pencil /></span>
          </div>
        </div>
        <button
          onClick={remove}
          title="Remove option image"
          style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
        ><Icon.X /></button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>
    );
  }

  return (
    <div style={{ flexShrink: 0 }}>
      <button
        onClick={() => fileRef.current?.click()}
        title="Add image to this option"
        style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.1)", background: "transparent", color: "#475569", fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.color = "#c4b5fd"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#475569"; }}
      >
        <Icon.Image /> Img
      </button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

// ─── Image upload zone (question / explanation) ───────────────────────────────

function ImageZone({ preview, onFile, onRemove, height = 180, label = "question image" }) {
  const ref = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFile(file, ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (preview) {
    return (
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(139,92,246,0.25)", background: "#07090f" }}>
        <img src={preview} alt={label} style={{ width: "100%", maxHeight: height, objectFit: "contain", display: "block" }} />
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
          <button
            onClick={() => ref.current?.click()}
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.65)", color: "#cbd5e1", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
          >Change</button>
          <button
            onClick={onRemove}
            style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(0,0,0,0.65)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          ><Icon.X /></button>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>
    );
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      style={{ border: "1.5px dashed rgba(255,255,255,0.07)", borderRadius: 10, padding: "22px 0", textAlign: "center", cursor: "pointer", color: "#334155", transition: "border-color 0.15s, background 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.background = "rgba(139,92,246,0.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "#475569" }}><Icon.Upload /></div>
      <p style={{ fontSize: 12, margin: 0, color: "#475569" }}>Click to upload {label}</p>
      <p style={{ fontSize: 10, margin: "3px 0 0", color: "#334155" }}>PNG · JPG · WEBP</p>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

// ─── Single Question Card ─────────────────────────────────────────────────────

function QuestionCard({ q, index, total, onUpdate, onDelete }) {
  const upd = (patch) => onUpdate(q.id, patch);

  const updateOption = (optId, patch) =>
    upd({ options: q.options.map(o => o.id === optId ? { ...o, ...patch } : o) });

  const correctIdx    = q.options.findIndex(o => o.id === q.correctOptionId);
  const correctLetter = correctIdx !== -1 ? OPTION_LABELS[correctIdx] : "—";

  const diffStyle = {
    Easy:   { bg: "rgba(34,197,94,0.11)",  border: "rgba(34,197,94,0.32)",  text: "#4ade80" },
    Medium: { bg: "rgba(251,191,36,0.11)", border: "rgba(251,191,36,0.32)", text: "#fbbf24" },
    Hard:   { bg: "rgba(239,68,68,0.11)",  border: "rgba(239,68,68,0.32)",  text: "#f87171" },
  }[q.difficulty] ?? {};

  return (
    <div style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>

      {/* ══ CARD HEADER ══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)" }}>
        <span style={{ color: "#334155", cursor: "grab" }}><Icon.Grip /></span>

        {/* Q# badge */}
        <div style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.38)", borderRadius: 8, width: 29, height: 29, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c4b5fd", flexShrink: 0 }}>
          Q{index + 1}
        </div>

        <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>Question {index + 1} <span style={{ color: "#2d3748" }}>/ {total}</span></span>

        {/* Difficulty pill */}
        <div style={{ background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: diffStyle.text }}>
          {q.difficulty}
        </div>

        {/* Correct letter */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#334155" }}>Correct:</span>
          <div style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.38)", borderRadius: 6, width: 24, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#c4b5fd" }}>
            {correctLetter}
          </div>
        </div>

        {/* Marks */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "4px 10px" }}>
          <span style={{ color: "#c4b5fd" }}><Icon.Star /></span>
          <span style={{ fontSize: 10, color: "#64748b" }}>Marks</span>
          <input
            type="number" min={1} max={100} value={q.points}
            onChange={e => upd({ points: parseInt(e.target.value) || 1 })}
            style={{ width: 34, background: "transparent", border: "none", color: "#c4b5fd", fontSize: 13, fontWeight: 700, outline: "none", textAlign: "center", fontFamily: "inherit" }}
          />
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(q.id)}
          title="Delete question"
          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid transparent", background: "transparent", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.28)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
        ><Icon.Trash /></button>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Meta row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Difficulty",    key: "difficulty",    opts: DIFFICULTIES   },
            { label: "Bloom's Level", key: "bloomLevel",    opts: BLOOM_LEVELS   },
            { label: "Question Type", key: "questionType",  opts: QUESTION_TYPES },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", marginBottom: 4 }}>{label}</div>
              <select
                value={q[key]}
                onChange={e => upd({ [key]: e.target.value })}
                style={{ width: "100%", background: "#0a0c12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 10px", color: "#94a3b8", fontSize: 12, outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none" }}
              >
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* ── Question text + toggles ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Label row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Question</span>
            <div style={{ display: "flex", gap: 6 }}>
              {/* Image toggle */}
              <button
                onClick={() => {
                  if (q.showImage) upd({ showImage: false, imageFile: null, imagePreview: null });
                  else upd({ showImage: true });
                }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 6, border: `1px solid ${q.showImage ? "rgba(139,92,246,0.45)" : "rgba(255,255,255,0.07)"}`, background: q.showImage ? "rgba(139,92,246,0.1)" : "transparent", color: q.showImage ? "#c4b5fd" : "#475569", fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              ><Icon.Image /> {q.showImage ? "Hide Image" : "Add Image"}</button>
              {/* Code toggle */}
              <button
                onClick={() => upd({ showCode: !q.showCode })}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 6, border: `1px solid ${q.showCode ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.07)"}`, background: q.showCode ? "rgba(59,130,246,0.1)" : "transparent", color: q.showCode ? "#93c5fd" : "#475569", fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              ><Icon.Code /> {q.showCode ? "Hide Code" : "Add Code"}</button>
            </div>
          </div>

          {/* Question textarea */}
          <textarea
            placeholder="Type your question here…"
            value={q.text}
            rows={3}
            onChange={e => upd({ text: e.target.value })}
            style={{ width: "100%", background: "#0a0c12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 13px", color: "#f1f5f9", fontSize: 14, fontWeight: 500, outline: "none", resize: "vertical", minHeight: 70, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.5)"}
            onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
          />

          {/* Question image zone */}
          {q.showImage && (
            <ImageZone
              preview={q.imagePreview}
              label="question image"
              height={200}
              onFile={(file, prev) => upd({ imageFile: file, imagePreview: prev })}
              onRemove={() => upd({ imageFile: null, imagePreview: null })}
            />
          )}
        </div>

        {/* ── Code snippet ── */}
        {q.showCode && (
          <div style={{ border: "1px solid rgba(59,130,246,0.18)", borderRadius: 10, overflow: "hidden", background: "#06080e" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ color: "#93c5fd" }}><Icon.Code /></span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Code Snippet</span>
                <span style={{ fontSize: 9, color: "#334155", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 6px" }}>shown above question</span>
              </div>
              <select
                value={q.codeLanguage}
                onChange={e => upd({ codeLanguage: e.target.value })}
                style={{ background: "#0a0c12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "3px 8px", color: "#93c5fd", fontSize: 11, fontWeight: 600, outline: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <textarea
              placeholder={`// Write ${CODE_LANGUAGES.find(l => l.value === q.codeLanguage)?.label || "code"} snippet here…`}
              value={q.codeSnippet}
              rows={5}
              spellCheck={false}
              onChange={e => upd({ codeSnippet: e.target.value })}
              style={{ width: "100%", background: "transparent", border: "none", padding: "10px 14px", color: "#a8c4e0", fontSize: 13, outline: "none", resize: "vertical", minHeight: 96, boxSizing: "border-box", fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace", lineHeight: 1.65 }}
            />
            <div style={{ padding: "3px 12px 5px", fontSize: 9, color: "#334155", fontWeight: 700, letterSpacing: "0.06em", textAlign: "right" }}>
              {CODE_LANGUAGES.find(l => l.value === q.codeLanguage)?.label?.toUpperCase()}
            </div>
          </div>
        )}

        {/* ── Answer Options ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
              Answer Options
            </span>
            <span style={{ fontSize: 10, color: "#334155" }}>click ◎ to set correct · each option supports text + image</span>
          </div>

          {q.options.map((opt, oi) => {
            const isCorrect = q.correctOptionId === opt.id;
            const hasImage  = !!opt.imagePreview;

            return (
              <div
                key={opt.id}
                style={{ borderRadius: 10, border: `1px solid ${isCorrect ? "rgba(139,92,246,0.42)" : "rgba(255,255,255,0.055)"}`, background: isCorrect ? "rgba(139,92,246,0.07)" : "#080a10", transition: "all 0.18s", marginBottom: 7, overflow: "hidden" }}
              >
                {/* Option top row: radio + letter + text input + img pill */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px" }}>
                  {/* Radio */}
                  <button
                    onClick={() => upd({ correctOptionId: opt.id })}
                    title="Mark as correct answer"
                    style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isCorrect ? "#8b5cf6" : "#2d3748"}`, background: isCorrect ? "rgba(139,92,246,0.2)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0, transition: "all 0.15s" }}
                  >
                    {isCorrect && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c4b5fd" }} />}
                  </button>

                  {/* Letter badge */}
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: isCorrect ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${isCorrect ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`, color: isCorrect ? "#c4b5fd" : "#475569", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {OPTION_LABELS[oi]}
                  </div>

                  {/* Option text */}
                  <input
                    placeholder={`Option ${OPTION_LABELS[oi]} text…`}
                    value={opt.text}
                    onChange={e => updateOption(opt.id, { text: e.target.value })}
                    style={{ flex: 1, background: "transparent", border: "none", color: isCorrect ? "#e2e8f0" : "#64748b", fontSize: 13, outline: "none", fontFamily: "inherit", minWidth: 0 }}
                  />

                  {/* Image pill — always visible per option */}
                  <OptionImagePill
                    opt={opt}
                    onChange={patch => updateOption(opt.id, patch)}
                  />

                  {/* Correct badge */}
                  {isCorrect && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd", fontSize: 9, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
                      <Icon.Check /> Correct
                    </div>
                  )}
                </div>

                {/* Option image preview strip — only shown when image exists */}
                {hasImage && (
                  <div style={{ margin: "0 11px 10px", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(139,92,246,0.22)", background: "#07090f" }}>
                    <img
                      src={opt.imagePreview}
                      alt={`Option ${OPTION_LABELS[oi]}`}
                      style={{ width: "100%", maxHeight: 140, objectFit: "contain", display: "block" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Explanation ── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 13 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#64748b" }}><Icon.Explain /></span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Explanation</span>
              <span style={{ fontSize: 9, color: "#334155" }}>optional · shown after student submits</span>
            </div>
            {/* Explanation image toggle */}
            <button
              onClick={() => {
                if (q.showExplanationImage) upd({ showExplanationImage: false, explanationImageFile: null, explanationImagePreview: null });
                else upd({ showExplanationImage: true });
              }}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, border: `1px solid ${q.showExplanationImage ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`, background: q.showExplanationImage ? "rgba(139,92,246,0.08)" : "transparent", color: q.showExplanationImage ? "#c4b5fd" : "#334155", fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            >
              <Icon.Image /> {q.showExplanationImage ? "Hide Image" : "Add Image"}
            </button>
          </div>

          <textarea
            placeholder="Explain why the correct answer is right…"
            value={q.explanation}
            rows={2}
            onChange={e => upd({ explanation: e.target.value })}
            style={{ width: "100%", background: "#07090f", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 8, padding: "8px 12px", color: "#475569", fontSize: 13, outline: "none", resize: "vertical", minHeight: 54, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5, transition: "all 0.15s" }}
            onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.3)"; e.target.style.color = "#94a3b8"; }}
            onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.055)"; e.target.style.color = "#475569"; }}
          />

          {q.showExplanationImage && (
            <div style={{ marginTop: 8 }}>
              <ImageZone
                preview={q.explanationImagePreview}
                label="explanation image"
                height={150}
                onFile={(file, prev) => upd({ explanationImageFile: file, explanationImagePreview: prev })}
                onRemove={() => upd({ explanationImageFile: null, explanationImagePreview: null })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExamQuestionsPage() {
  const [questions, setQuestions] = useState([newQuestion(0)]);
  const [toast,     setToast]     = useState("");
  const [saving,    setSaving]    = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const addQuestion = () => {
    setQuestions(prev => [...prev, newQuestion(prev.length)]);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 60);
  };

  const updateQuestion = (id, patch) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  const deleteQuestion = (id) => {
    if (questions.length === 1) { showToast("At least one question is required"); return; }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const answered   = questions.filter(q => q.correctOptionId && q.text.trim()).length;
  const pct        = questions.length ? Math.round((answered / questions.length) * 100) : 0;

  const handleSave = async () => {
    const bad = questions.filter(q => !q.text.trim() || !q.correctOptionId);
    if (bad.length) { showToast(`${bad.length} question(s) need text + a correct answer`); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    showToast("Exam saved successfully!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c12", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-60px", left: "18%", width: 520, height: 520, background: "rgba(109,40,217,0.055)", borderRadius: "50%", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "12%", width: 380, height: 380, background: "rgba(67,56,202,0.045)", borderRadius: "50%", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "34px 22px 64px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 24 }}>
          <button
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.035)", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.035)"}
          ><Icon.Back /></button>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.4px", margin: "0 0 4px", color: "#f1f5f9" }}>Add Questions</h1>
            <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>Each question supports text, image, and code — options can have text + image</p>
          </div>

          {/* Stat chips */}
          {[
            { val: questions.length, label: "Questions", color: "#c4b5fd" },
            { val: totalMarks,       label: "Total Marks", color: "#a78bfa" },
            { val: `${answered}/${questions.length}`, label: "Complete", color: answered === questions.length ? "#4ade80" : "#fbbf24" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "7px 13px", textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 9, color: "#475569", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 99, marginBottom: 22, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#6d28d9)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>

        {/* Tip bar */}
        <div style={{ display: "flex", gap: 9, padding: "9px 13px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.13)", borderRadius: 9, marginBottom: 18 }}>
          <span style={{ color: "#7dd3fc", flexShrink: 0, marginTop: 1 }}><Icon.Info /></span>
          <p style={{ fontSize: 11, color: "#7dd3fc", margin: 0, lineHeight: 1.65 }}>
            Each <strong style={{ color: "#93c5fd" }}>question</strong> can include text, an image, and a code snippet.
            Each <strong style={{ color: "#93c5fd" }}>option (A–D)</strong> also supports text + an image — click the dashed <em>Img</em> button beside any option to attach one.
            Click ◎ to mark the correct answer.
          </p>
        </div>

        {/* Question cards */}
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={idx}
            total={questions.length}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
          />
        ))}

        {/* Add question button */}
        <button
          onClick={addQuestion}
          style={{ width: "100%", padding: "13px 0", border: "2px dashed rgba(139,92,246,0.22)", borderRadius: 13, background: "transparent", color: "#6d28d9", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 24, transition: "all 0.15s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.background = "rgba(139,92,246,0.05)"; e.currentTarget.style.color = "#8b5cf6"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.22)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6d28d9"; }}
        >
          <Icon.Plus />
          Add Question
          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 9, background: "rgba(139,92,246,0.14)", color: "#c4b5fd", fontWeight: 700 }}>Q{questions.length + 1}</span>
        </button>

        {/* Bottom action bar */}
        <div style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: answered === questions.length ? "#4ade80" : "#fbbf24" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>
              {answered === questions.length
                ? `All ${questions.length} question${questions.length > 1 ? "s" : ""} ready to save`
                : `${questions.length - answered} question${questions.length - answered > 1 ? "s" : ""} still incomplete`}
            </span>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button
              style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#94a3b8", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "background 0.14s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >← Back</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid rgba(139,92,246,0.45)", background: saving ? "rgba(109,40,217,0.35)" : "#6d28d9", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "inherit", boxShadow: "0 4px 18px rgba(109,40,217,0.28)", transition: "background 0.15s" }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#7c3aed"; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = "#6d28d9"; }}
            >{saving ? "Saving…" : <><span>Save Exam</span><Icon.Arrow /></>}</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 18, right: 18, background: "#0f1117", border: "1px solid rgba(139,92,246,0.38)", borderRadius: 9, padding: "10px 16px", color: "#c4b5fd", fontSize: 12, fontWeight: 500, zIndex: 200, boxShadow: "0 8px 30px rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease" }}>
          {toast}
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        select option { background:#0f1117; color:#e2e8f0; }
        ::placeholder { color:#2d3748 !important; }
        textarea { display:block; }
        input[type=number]::-webkit-inner-spin-button { opacity:0.35; }
        select { appearance:none; -webkit-appearance:none; }
      `}</style>
    </div>
  );
}
