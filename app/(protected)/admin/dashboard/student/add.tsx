"use client";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  schoolId: string;
  school: string;
  gradeId: string;
  grade: string;
  section: string;
  schoolYear: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  gpa: number;
  attendance: number;
  status: "active" | "inactive";
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  address?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  schoolId?: string;
  gradeId?: string;
  dob?: string;
  parentName?: string;
  parentEmail?: string;
}

interface Option {
  value: string;
  label: string;
}

interface AddModalProps {
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
  gradeOptions: Option[];
  schoolOptions: Option[];
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────
const SECTIONS = ["A", "B", "C", "D"];

interface PasswordStrength {
  level: number;
  label: string;
  color: string;
}

function pwStrength(pw: string): PasswordStrength {
  if (!pw) return { level: 0, label: "", color: "#2d3448" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (s <= 2) return { level: 2, label: "Fair", color: "#f59e0b" };
  if (s <= 3) return { level: 3, label: "Good", color: "#3b82f6" };
  return { level: 4, label: "Strong", color: "#c0dd97" };
}

function generateUsername(firstName: string, lastName: string): string {
  if (!firstName) return "";
  const f = firstName.toLowerCase().replace(/\s+/g, "");
  const l = (lastName || "").toLowerCase().replace(/\s+/g, "");
  const num = Math.floor(100 + Math.random() * 900);
  return l ? `${f}.${l}${num}` : `${f}${num}`;
}

function generatePassword(length: number = 10): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  
  const pw: string[] = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  
  for (let i = pw.length; i < length; i++) {
    pw.push(all[Math.floor(Math.random() * all.length)]);
  }
  
  return pw.sort(() => Math.random() - 0.5).join("");
}

function gpaColor(g: number): string {
  return g >= 9 ? "#34d399" : g >= 7 ? "#fbbf24" : "#f87171";
}

function attColor(a: number): string {
  return a >= 90 ? "#34d399" : a >= 75 ? "#fbbf24" : "#f87171";
}

// ─── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  Cap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Person: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Gender: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M9 18h6" />
    </svg>
  ),
  Building: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 21V9M16 21V9M3 9h18M8 3v6M16 3v6" />
    </svg>
  ),
  Section: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Home: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  Key: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6M15.5 7.5L19 4M17.5 9.5L21 6" />
    </svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Save: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  Loader: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
};

// ─── UI Components ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, icon, required, error, children, hint }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        <span style={{ color: "#639922" }}>{icon}</span>
        {label}
        {required && <span style={{ color: "#f87171" }}>*</span>}
        {hint && <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#3a4460", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{hint}</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: "0.72rem", color: "#f87171" }}>{error}</span>}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | Option)[];
  placeholder?: string;
}

function Select({ value, onChange, options, placeholder }: SelectProps) {
  const isOption = (item: string | Option): item is Option => {
    return typeof item === 'object' && 'value' in item && 'label' in item;
  };

  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.65rem 2rem 0.65rem 0.9rem",
          background: "#0f1117",
          border: "1px solid #2d3448",
          borderRadius: 9,
          color: value ? "#e2e8f0" : "#3a4460",
          fontSize: "0.875rem",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          fontFamily: "inherit"
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((item, index) => {
          const key = isOption(item) ? item.value : item;
          const label = isOption(item) ? item.label : item;
          return (
            <option key={key} value={key}>
              {label}
            </option>
          );
        })}
      </select>
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none", fontSize: "0.7rem" }}>
        ▾
      </span>
    </div>
  );
}

function getInputStyle(error?: string) {
  return {
    width: "100%",
    padding: "0.65rem 0.9rem",
    background: "#0f1117",
    border: `1px solid ${error ? "#7f1d1d" : "#2d3448"}`,
    borderRadius: 9,
    color: "#e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit"
  };
}

interface CredRowProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
}

function CredRow({ label, icon, value, mono, onCopy }: CredRowProps) {
  const [copied, setCopied] = useState(false);
  
  const doCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).catch(() => {});
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0a0d14", border: "1px solid #252d3d", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
      <span style={{ color: "#639922", flexShrink: 0 }}>{icon}</span>
      <span style={{
        flex: 1,
        fontSize: mono ? "0.8rem" : "0.85rem",
        fontFamily: mono ? "'Fira Mono','Consolas',monospace" : "inherit",
        color: "#e2e8f0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const
      }}>
        {value || <span style={{ color: "#3a4460" }}>—</span>}
      </span>
      {value && (
        <button
          title="Copy"
          onClick={doCopy}
          style={{
            background: "transparent",
            border: "none",
            color: copied ? "#c0dd97" : "#475569",
            cursor: "pointer",
            padding: "2px 3px",
            borderRadius: 4,
            display: "flex",
            flexShrink: 0,
            transition: "color 0.15s"
          }}
        >
          <Ic.Copy />
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AddModal({
  formData,
  setFormData,
  onSave,
  onClose,
  loading,
  gradeOptions,
  schoolOptions,
}: AddModalProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const strength = pwStrength(formData.password);

  const setField = (key: keyof StudentFormData, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleNameChange = (val: string) => {
    setField("name", val);
    if (formData.username) {
      const [first, ...rest] = val.trim().split(" ");
      const last = rest.join(" ");
      if (first) setField("username", generateUsername(first, last));
    }
  };

  const handleGenerateBoth = () => {
    const [first, ...rest] = (formData.name || "").trim().split(" ");
    const last = rest.join(" ");
    const newUser = generateUsername(first || "student", last);
    const newPw = generatePassword(12);
    setFormData((prev) => ({
      ...prev,
      username: newUser,
      password: newPw,
      confirmPassword: newPw
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.username;
      delete next.password;
      delete next.confirmPassword;
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    
    if (!formData.name.trim()) errs.name = "Student name is required";
    
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      errs.email = "Invalid email address";
    }
    
    if (!formData.phone.trim()) {
      errs.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      errs.phone = "Phone must be exactly 10 digits";
    }
    
    if (!formData.parentPhone.trim()) {
      errs.parentPhone = "Parent phone is required";
    } else if (!/^\d{10}$/.test(formData.parentPhone.replace(/\s/g, ''))) {
      errs.parentPhone = "Parent phone must be exactly 10 digits";
    }
    
    if (!formData.address.trim()) errs.address = "Address is required";
    
    if (!formData.username.trim()) errs.username = "Username is required";
    
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 6) {
      errs.password = "Min 6 characters";
    }
    
    if (!formData.confirmPassword) {
      errs.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 100,
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#161b27",
          border: "1px solid #2d3448",
          borderRadius: 16,
          width: "100%",
          maxWidth: 720,
          maxHeight: "92vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "slideUp 0.25s ease"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.3rem 1.5rem",
            borderBottom: "1px solid #1e2535",
            background: "#131720",
            borderRadius: "16px 16px 0 0",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(99,153,34,0.12)",
                border: "1px solid rgba(99,153,34,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c0dd97"
              }}
            >
              <Ic.Cap />
            </div>
            <div>
              <h2 style={{ margin: "0 0 2px", fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9" }}>
                Add New Student
              </h2>
              <p style={{ margin: 0, fontSize: "0.76rem", color: "#475569" }}>
                Register a new student profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid #2d3448",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ic.X />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.4rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field label="Full Name" icon={<Ic.Person />} required error={errors.name}>
            <input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Student full name"
              style={getInputStyle(errors.name)}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Email" icon={<Ic.Mail />} required error={errors.email}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="student@school.edu"
                style={getInputStyle(errors.email)}
              />
            </Field>
            <Field label="Phone" icon={<Ic.Phone />} required error={errors.phone}>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="10-digit number"
                style={getInputStyle(errors.phone)}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Date of Birth" icon={<Ic.Calendar />} error={errors.dob}>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setField("dob", e.target.value)}
                style={getInputStyle(errors.dob)}
              />
            </Field>
            <Field label="Gender" icon={<Ic.Gender />}>
              <Select
                value={formData.gender}
                onChange={(v) => setField("gender", v)}
                options={["Male", "Female", "Other"]}
              />
            </Field>
          </div>

          <Field label="School" icon={<Ic.Building />} required error={errors.schoolId}>
            <Select
              value={formData.schoolId}
              onChange={(v) => {
                const found = schoolOptions.find((s) => String(s.value) === String(v));
                setFormData((prev) => ({
                  ...prev,
                  schoolId: v,
                  school: found?.label || ""
                }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.schoolId;
                  return next;
                });
              }}
              options={schoolOptions}
              placeholder="Select School"
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Grade / Standard" icon={<Ic.Cap />} required error={errors.gradeId}>
              <Select
                value={formData.gradeId}
                onChange={(v) => {
                  const found = gradeOptions.find((g) => String(g.value) === String(v));
                  setFormData((prev) => ({
                    ...prev,
                    gradeId: v,
                    grade: found?.label || v
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.gradeId;
                    return next;
                  });
                }}
                options={gradeOptions}
                placeholder="Select Grade"
              />
            </Field>
            <Field label="Section / Batch" icon={<Ic.Section />} required>
              <Select
                value={formData.section}
                onChange={(v) => setField("section", v)}
                options={SECTIONS}
              />
            </Field>
          </div>

          <Field label="School Year" icon={<Ic.Calendar />} required>
            <input
              value={formData.schoolYear}
              onChange={(e) => setField("schoolYear", e.target.value)}
              placeholder="2024"
              style={getInputStyle()}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Parent / Guardian Name" icon={<Ic.Person />} error={errors.parentName}>
              <input
                value={formData.parentName}
                onChange={(e) => setField("parentName", e.target.value)}
                placeholder="Parent full name"
                style={getInputStyle(errors.parentName)}
              />
            </Field>
            <Field label="Parent Phone" icon={<Ic.Phone />} required error={errors.parentPhone}>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setField("parentPhone", e.target.value)}
                placeholder="10-digit number"
                style={getInputStyle(errors.parentPhone)}
              />
            </Field>
          </div>

          <Field label="Parent Email" icon={<Ic.Mail />} error={errors.parentEmail}>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => setField("parentEmail", e.target.value)}
              placeholder="parent@email.com"
              style={getInputStyle(errors.parentEmail)}
            />
          </Field>

          <Field label="Home Address" icon={<Ic.Home />} required error={errors.address}>
            <textarea
              value={formData.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Enter full home address"
              rows={2}
              style={{
                width: "100%",
                padding: "0.65rem 0.9rem",
                background: "#0f1117",
                border: `1px solid ${errors.address ? "#7f1d1d" : "#2d3448"}`,
                borderRadius: 9,
                color: "#e2e8f0",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                resize: "none",
                lineHeight: 1.5
              }}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="GPA Score (0–10)" icon={<Ic.Star />}>
              <input
                type="number"
                value={formData.gpa}
                min="0"
                max="10"
                step="0.1"
                onChange={(e) => setField("gpa", Math.min(10, parseFloat(e.target.value) || 0))}
                placeholder="0.0"
                style={getInputStyle()}
              />
              {formData.gpa > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "#2d3448", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(formData.gpa / 10) * 100}%`,
                        background: `linear-gradient(90deg,${gpaColor(formData.gpa)}66,${gpaColor(formData.gpa)})`,
                        borderRadius: 2,
                        transition: "width 0.3s"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: gpaColor(formData.gpa), minWidth: 28 }}>
                    {formData.gpa.toFixed(1)}
                  </span>
                </div>
              )}
            </Field>
            <Field label="Attendance (%)" icon={<Ic.Heart />}>
              <input
                type="number"
                value={formData.attendance}
                min="0"
                max="100"
                onChange={(e) => setField("attendance", Math.min(100, parseInt(e.target.value) || 0))}
                placeholder="0"
                style={getInputStyle()}
              />
              {formData.attendance > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "#2d3448", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${formData.attendance}%`,
                        background: `linear-gradient(90deg,${attColor(formData.attendance)}66,${attColor(formData.attendance)})`,
                        borderRadius: 2,
                        transition: "width 0.3s"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: attColor(formData.attendance), minWidth: 28 }}>
                    {formData.attendance}%
                  </span>
                </div>
              )}
            </Field>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => setField("status", formData.status === "active" ? "inactive" : "active")}
          >
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: formData.status === "active" ? "rgba(99,153,34,0.25)" : "#2d3448",
                border: `1px solid ${formData.status === "active" ? "rgba(99,153,34,0.5)" : "#3d4860"}`,
                position: "relative",
                transition: "all 0.2s",
                flexShrink: 0
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: formData.status === "active" ? 22 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: formData.status === "active" ? "#c0dd97" : "#64748b",
                  transition: "left 0.2s"
                }}
              />
            </div>
            <span style={{ fontSize: "0.855rem", color: "#94a3b8" }}>
              Student is <strong style={{ color: "#e2e8f0" }}>
                {formData.status === "active" ? "Active" : "Inactive"}
              </strong>
            </span>
            {formData.status === "active" && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#639922",
                  boxShadow: "0 0 6px rgba(99,153,34,0.6)",
                  display: "inline-block"
                }}
              />
            )}
          </div>

          <div style={{ marginTop: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <div style={{ flex: 1, height: 1, background: "#1e2535" }} />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap"
                }}
              >
                <Ic.Key />
                Login Credentials
              </span>
              <div style={{ flex: 1, height: 1, background: "#1e2535" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.2rem" }}>
              <button
                type="button"
                onClick={handleGenerateBoth}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.6rem 1.4rem",
                  background: "rgba(99,153,34,0.12)",
                  border: "1px solid rgba(99,153,34,0.35)",
                  borderRadius: 10,
                  color: "#c0dd97",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(99,153,34,0.2)";
                  e.currentTarget.style.borderColor = "rgba(99,153,34,0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(99,153,34,0.12)";
                  e.currentTarget.style.borderColor = "rgba(99,153,34,0.35)";
                }}
              >
                <Ic.Sparkle />
                Generate Credentials
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <Field
                label="Username"
                icon={<Ic.Person />}
                required
                error={errors.username}
                hint="Auto-filled from name"
              >
                <input
                  value={formData.username}
                  onChange={(e) => setField("username", e.target.value)}
                  placeholder="e.g. john.doe123"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    background: "#0f1117",
                    border: `1px solid ${errors.username ? "#7f1d1d" : "#2d3448"}`,
                    borderRadius: 9,
                    color: "#e2e8f0",
                    fontSize: "0.875rem",
                    outline: "none",
                    fontFamily: "'Fira Mono','Consolas',monospace",
                    boxSizing: "border-box"
                  }}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Password" icon={<Ic.Lock />} required error={errors.password}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder="Min 6 characters"
                      style={{
                        width: "100%",
                        padding: "0.65rem 2.6rem 0.65rem 0.9rem",
                        background: "#0f1117",
                        border: `1px solid ${errors.password ? "#7f1d1d" : "#2d3448"}`,
                        borderRadius: 9,
                        color: "#e2e8f0",
                        fontSize: "0.875rem",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "'Fira Mono','Consolas',monospace"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        color: "#475569",
                        cursor: "pointer",
                        display: "flex",
                        padding: 3
                      }}
                    >
                      {showPw ? <Ic.EyeOff /> : <Ic.Eye />}
                    </button>
                  </div>
                  {formData.password && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <div style={{ display: "flex", gap: 4, flex: 1 }}>
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            style={{
                              height: 4,
                              flex: 1,
                              borderRadius: 2,
                              background: lvl <= strength.level ? strength.color : "#2d3448",
                              transition: "background 0.25s"
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: strength.color, minWidth: 40 }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </Field>
                <Field label="Confirm Password" icon={<Ic.Lock />} required error={errors.confirmPassword}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCp ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                      placeholder="Re-enter password"
                      style={{
                        width: "100%",
                        padding: "0.65rem 2.6rem 0.65rem 0.9rem",
                        background: "#0f1117",
                        border: `1px solid ${errors.confirmPassword ? "#7f1d1d" : "#2d3448"}`,
                        borderRadius: 9,
                        color: "#e2e8f0",
                        fontSize: "0.875rem",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "'Fira Mono','Consolas',monospace"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCp((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        color: "#475569",
                        cursor: "pointer",
                        display: "flex",
                        padding: 3
                      }}
                    >
                      {showCp ? <Ic.EyeOff /> : <Ic.Eye />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: formData.password === formData.confirmPassword ? "#c0dd97" : "#f87171"
                      }}
                    >
                      {formData.password === formData.confirmPassword
                        ? "✓ Passwords match"
                        : "✗ Do not match"}
                    </span>
                  )}
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            padding: "1rem 1.5rem",
            borderTop: "1px solid #1e2535",
            background: "#131720",
            borderRadius: "0 0 16px 16px",
            flexShrink: 0
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "0.55rem 1.2rem",
              background: "transparent",
              border: "1px solid #2d3448",
              borderRadius: 9,
              color: "#94a3b8",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "0.58rem 1.3rem",
              background: loading ? "#2a3d14" : "#3b6d11",
              border: "1px solid #639922",
              borderRadius: 9,
              color: "#c0dd97",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? (
              <>
                <Ic.Loader />
                Saving…
              </>
            ) : (
              <>
                <Ic.Save />
                Add Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}