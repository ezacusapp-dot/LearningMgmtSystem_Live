"use client";

import React, { useState } from "react";
import {
  X, RefreshCcw, Copy, Check, AlertCircle,
} from "lucide-react";

/* ================= TYPES ================= */
export interface StudentFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  studentEmail: string;
  username: string;
  password: string;
  parentMobile: string;
  parentEmail: string;
  standard: string;
  batch: string;
  schoolYear: string;
  address: string;
}

interface Grade {
  id: string;
  name: string;
}

/* ================= CONSTANTS ================= */
const batches = ["A1", "A2", "B1", "B2", "C1", "C2"];
const schoolYears = ["2023-24", "2024-25", "2025-26"];

// Hardcoded grades — swap for your own list, or pass in as a prop if you need it dynamic
const GRADES: Grade[] = [
  { id: "g1", name: "1" },
  { id: "g2", name: "2" },
  { id: "g3", name: "3" },
  { id: "g4", name: "4" },
  { id: "g5", name: "5" },
  { id: "g6", name: "6" },
];

/* ================= VALIDATION ================= */
const USERNAME_REGEX = /^[a-z][a-z0-9.]{4,18}[a-z0-9]$/;

type FieldErrors = Partial<Record<keyof StudentFormData | "general", string>>;

const validateUsername = (value: string): string => {
  if (!value) return "Username is required.";
  if (value.length < 6) return "Username must be at least 6 characters.";
  if (value.length > 20) return "Username must be at most 20 characters.";
  if (!/^[a-z]/.test(value)) return "Username must start with a lowercase letter.";
  if (!USERNAME_REGEX.test(value)) return "Username: only lowercase letters, numbers, and dots allowed.";
  return "";
};

const validatePassword = (value: string): string => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(value)) return "Password must contain at least one number.";
  if (!/[@#$!%^&*]/.test(value)) return "Password must contain at least one special character (@#$!%^&*).";
  return "";
};

/* ================= UTILS ================= */
const generateUsername = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return "";
  const first = firstName.toLowerCase().replace(/\s+/g, "");
  const last = lastName.toLowerCase().replace(/\s+/g, "");
  const num = Math.floor(100 + Math.random() * 900);
  return `${first}.${last}${num}`;
};

const generatePassword = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return "";
  const symbols = ["@", "#", "$", "!"];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  const fillerLetters = "abcdefghijklmnopqrstuvwxyz";

  let namePart = (firstName.charAt(0).toUpperCase() + lastName.toLowerCase()).replace(/[^A-Za-z]/g, "");
  while (namePart.length < 5) {
    namePart += fillerLetters[Math.floor(Math.random() * fillerLetters.length)];
  }
  const num = Math.floor(10 + Math.random() * 90);
  let password = `${namePart}${sym}${num}`;
  while (password.length < 8) {
    namePart += fillerLetters[Math.floor(Math.random() * fillerLetters.length)];
    password = `${namePart}${sym}${num}`;
  }
  return password;
};

const getEmptyForm = (): StudentFormData => ({
  firstName: "",
  middleName: "",
  lastName: "",
  studentEmail: "",
  username: "",
  password: "",
  parentMobile: "",
  parentEmail: "",
  standard: GRADES[0]?.id || "",
  batch: "A1",
  schoolYear: "2023-24",
  address: "",
});

/* ================= PROPS ================= */
interface AddStudentFormProps {
  onClose?: () => void;
  onSave?: (data: StudentFormData) => void;
}

/* ================= COMPONENT ================= */
export default function AddStudentForm({ onClose, onSave }: AddStudentFormProps) {
  const [form, setForm] = useState<StudentFormData>(getEmptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const gradeOptions = GRADES.map(g => g.name);
  const gradeValues = GRADES.map(g => g.id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "username") {
      setFieldErrors(prev => ({ ...prev, username: validateUsername(value) }));
    }
    if (name === "password") {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const regenerateCredentials = () => {
    if (!form.firstName && !form.lastName) {
      setFieldErrors(prev => ({
        ...prev,
        general: "Please enter First Name and Last Name before generating credentials.",
      }));
      return;
    }
    setFieldErrors(prev => ({ ...prev, general: undefined }));

    const newUsername = generateUsername(form.firstName, form.lastName);
    const newPassword = generatePassword(form.firstName, form.lastName);

    setForm(prev => ({ ...prev, username: newUsername, password: newPassword }));
    setFieldErrors(prev => ({ ...prev, username: "", password: "" }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback: no-op
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";
    if (!form.parentMobile.trim()) errors.parentMobile = "Parent mobile is required.";
    if (!form.standard) errors.standard = "Grade/Standard is required.";
    if (!form.schoolYear) errors.schoolYear = "School year is required.";

    const usernameError = validateUsername(form.username);
    if (usernameError) errors.username = usernameError;

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave?.(form);
  };

  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pwd.length >= 5) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@#$!%^&*]/.test(pwd)) score++;
    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (score <= 3) return { label: "Fair", color: "bg-yellow-400", width: "60%" };
    if (score === 4) return { label: "Good", color: "bg-blue-400", width: "80%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-[#0f1117] flex justify-center items-start py-10 px-4">
      <div className="bg-[#161b27] w-full max-w-[920px] rounded-2xl p-8 shadow-2xl border border-white/10 text-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Add Student</h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        <SectionLabel>Student Details</SectionLabel>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Field
            label="First Name *" name="firstName" placeholder="Aisha"
            value={form.firstName} onChange={handleChange}
            error={fieldErrors.firstName}
          />
          <Field
            label="Middle Name" name="middleName" placeholder="Kumar"
            value={form.middleName} onChange={handleChange}
          />
          <Field
            label="Last Name *" name="lastName" placeholder="Tendulkar"
            value={form.lastName} onChange={handleChange}
            error={fieldErrors.lastName}
          />
          <Field
            label="Student Email" name="studentEmail" placeholder="student@school.edu"
            value={form.studentEmail} onChange={handleChange}
            type="email"
          />
          <Field
            label="Parent Mobile *" name="parentMobile" placeholder="9876543210"
            value={form.parentMobile} onChange={handleChange}
            type="tel" error={fieldErrors.parentMobile}
          />
          <Field
            label="Parent Email" name="parentEmail" placeholder="parent@email.com"
            value={form.parentEmail} onChange={handleChange}
            type="email"
          />
        </div>

        <SectionLabel>Address</SectionLabel>
        <textarea
          name="address"
          rows={3}
          value={form.address}
          onChange={handleChange}
          placeholder="Street, City, State, PIN…"
          className="w-full bg-[#1e2435] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500 transition resize-none mb-6"
        />

        <SectionLabel>Enrollment</SectionLabel>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <DynamicDropField
            label="Grade *"
            name="standard"
            options={gradeOptions}
            values={gradeValues}
            value={form.standard}
            onChange={handleChange}
            error={fieldErrors.standard}
          />
          <DropField label="Batch" name="batch" options={batches} value={form.batch} onChange={handleChange} />
          <DropField label="School Year *" name="schoolYear" options={schoolYears} value={form.schoolYear} onChange={handleChange} error={fieldErrors.schoolYear} />
        </div>

        {/* ─── LOGIN CREDENTIALS SECTION ─── */}
        <SectionLabel>Login Credentials</SectionLabel>

        {fieldErrors.general && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 rounded-xl mb-4">
            <AlertCircle size={14} />
            {fieldErrors.general}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={regenerateCredentials}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#3b6d11]/40 hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #3b6d11 0%, #2c520d 100%)', boxShadow: '0 4px 14px rgba(59,109,17,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #4a8a15 0%, #3b6d11 100%)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #3b6d11 0%, #2c520d 100%)')}
          >
            <RefreshCcw size={14} />
            Generate Credentials
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          {/* USERNAME */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 font-medium">Username *</label>
            <div className={`relative flex items-center rounded-xl border transition ${fieldErrors.username ? "border-red-500/60" : "border-white/10"}`}>
              <input
                type="text"
                name="username"
                placeholder="e.g. aisha.tendulkar123"
                value={form.username}
                onChange={handleChange}
                className="w-full bg-[#1e2435] rounded-xl px-4 py-2.5 pr-10 text-sm text-white outline-none transition placeholder-white/20 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(form.username, "username")}
                className="absolute right-3 text-white/30 hover:text-white/70 transition"
                title="Copy username"
              >
                {copiedField === "username" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            {fieldErrors.username && (
              <p className="flex items-center gap-1 text-red-400 text-xs mt-0.5">
                <AlertCircle size={11} /> {fieldErrors.username}
              </p>
            )}
            {!fieldErrors.username && form.username && (
              <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                <Check size={11} /> Username looks good
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 font-medium">Password *</label>
            <div className={`relative flex items-center rounded-xl border transition ${fieldErrors.password ? "border-red-500/60" : "border-white/10"}`}>
              <input
                type="text"
                name="password"
                placeholder="e.g. Aisha@123"
                value={form.password}
                onChange={handleChange}
                maxLength={20}
                className="w-full bg-[#1e2435] rounded-xl px-4 py-2.5 pr-10 text-sm text-white outline-none transition placeholder-white/20 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(form.password, "password")}
                className="absolute right-3 text-white/30 hover:text-white/70 transition"
                title="Copy password"
              >
                {copiedField === "password" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-1">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
                <p className={`text-xs mt-0.5 ${
                  passwordStrength.label === "Strong" ? "text-green-400" :
                  passwordStrength.label === "Good" ? "text-blue-400" :
                  passwordStrength.label === "Fair" ? "text-yellow-400" : "text-red-400"
                }`}>
                  Strength: {passwordStrength.label}
                </p>
              </div>
            )}
            {fieldErrors.password && (
              <p className="flex items-center gap-1 text-red-400 text-xs mt-0.5">
                <AlertCircle size={11} /> {fieldErrors.password}
              </p>
            )}
            {!fieldErrors.password && form.password && (
              <p className="text-green-400 text-xs flex items-center gap-1">
                <Check size={11} /> Password meets requirements
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleSave}
            className="w-40 py-3 rounded-xl font-semibold bg-[#3b6d11] hover:bg-[#2e550d] transition text-sm flex items-center justify-center gap-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE FIELD COMPONENTS ================= */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-4 pb-2 border-b border-white/10">
    {children}
  </p>
);

const Field = ({
  label, name, placeholder, value, onChange, type = "text", error
}: {
  label: string; name: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`bg-[#1e2435] border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition placeholder-white/20 ${
        error ? "border-red-500/60" : "border-white/10"
      }`}
    />
    {error && (
      <p className="flex items-center gap-1 text-red-400 text-xs">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const DropField = ({
  label, name, options, value, onChange, error
}: {
  label: string; name: string; options: string[]; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`bg-[#1e2435] border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition cursor-pointer ${
        error ? "border-red-500/60" : "border-white/10"
      }`}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && (
      <p className="flex items-center gap-1 text-red-400 text-xs">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const DynamicDropField = ({
  label, name, options, values, value, onChange, error
}: {
  label: string;
  name: string;
  options: string[];
  values: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`bg-[#1e2435] border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition cursor-pointer ${
        error ? "border-red-500/60" : "border-white/10"
      }`}
    >
      {options.map((option, index) => (
        <option key={values[index]} value={values[index]}>
          {option}
        </option>
      ))}
    </select>
    {error && (
      <p className="flex items-center gap-1 text-red-400 text-xs">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);
