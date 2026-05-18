


"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users, TrendingUp, CheckCircle, BookOpen, Search,
  Plus, X, Eye, Pencil, Trash2, Mail, RefreshCw, Download, Loader2,
  ChevronLeft, ChevronRight, RefreshCcw, Copy, Check, AlertCircle,
} from "lucide-react";

/* ================= TYPES ================= */
interface Student {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  studentEmail?: string;   // ✅ restored
  username?: string;
  password?: string;
  parentMobile: string;
  parentEmail?: string;
  standard: string;
  batch?: string;
  status: string;
  schoolYear: string;
  address?: string;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Grade {
  id: string;
  name: string;
  minMarks?: number;
  maxMarks?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

/* ================= CONSTANTS ================= */
const batches = ["A1", "A2", "B1", "B2", "C1", "C2"];
const schoolYears = ["2023-24", "2024-25", "2025-26"];

/* ================= VALIDATION RULES ================= */
// Username: lowercase letters, numbers, dot allowed; 6–20 chars; must start with a letter
const USERNAME_REGEX = /^[a-z][a-z0-9.]{4,18}[a-z0-9]$/;
// Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%^&*])[A-Za-z\d@#$!%^&*]{8,}$/;

type FieldErrors = Partial<Record<keyof FormState | "general", string>>;

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
  const base = (firstName.charAt(0).toUpperCase() + lastName.toLowerCase()).replace(/\s+/g, "");
  const symbols = ["@", "#", "$", "!"];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${base}${sym}${num}`;
};

const getEmptyForm = (): FormState => ({
  firstName: "",
  middleName: "",
  lastName: "",
  studentEmail: "",   // ✅ restored
  username: "",
  password: "",
  parentMobile: "",
  parentEmail: "",
  standard: "",
  batch: "A1",
  status: "Active",
  schoolYear: "2023-24",
  address: "",
});

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  studentEmail: string;   // ✅ restored
  username: string;
  password: string;
  parentMobile: string;
  parentEmail: string;
  standard: string;
  batch: string;
  status: string;
  schoolYear: string;
  address: string;
};

/* ================= PAGE ================= */
export default function Student() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>(getEmptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* ─────────────── COPY STATE ─────────────── */
  const [copiedField, setCopiedField] = useState<string | null>(null);

  /* ─────────────── GRADES FROM API ─────────────── */
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [gradesError, setGradesError] = useState("");

  /* ─────────────── DELETE POPUP STATES ─────────────── */
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ─────────────── FETCH GRADES FROM API ─────────────── */
  const fetchGrades = useCallback(async () => {
    setGradesLoading(true);
    setGradesError("");
    try {
      const response = await fetch('/api/grade?page=1&limit=100');
      if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
      const result = await response.json();
      if (result.success && result.data) {
        setGrades(result.data);
        if (!form.standard && result.data.length > 0) {
          setForm(prev => ({ ...prev, standard: result.data[0].id }));
        }
      } else {
        throw new Error(result.message || "Failed to load grades");
      }
    } catch (err: any) {
      console.error("Error fetching grades:", err);
      setGradesError(err.message || "Network error loading grades");
    } finally {
      setGradesLoading(false);
    }
  }, [form.standard]);

  /* ─────────────── FETCH STUDENTS ─────────────── */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search && { search }),
        ...(filterGrade && { grade: filterGrade }),
        ...(filterBatch && { batch: filterBatch }),
      });
      const res = await fetch(`/api/students?${params}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        setMeta(json.meta);
      } else {
        setError(json.message || "Failed to load students.");
      }
    } catch {
      setError("Network error — could not load students.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterGrade, filterBatch]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { setPage(1); }, [search, filterGrade, filterBatch]);

  /* ─────────────── FORM HANDLERS ─────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Live validation for username and password
    if (name === "username") {
      const err = validateUsername(value);
      setFieldErrors(prev => ({ ...prev, username: err }));
    }
    if (name === "password") {
      const err = validatePassword(value);
      setFieldErrors(prev => ({ ...prev, password: err }));
    }
  };

  const studentToForm = (s: Student): FormState => ({
    firstName: s.firstName || "",
    middleName: s.middleName || "",
    lastName: s.lastName || "",
    studentEmail: s.studentEmail || "",   // ✅ restored
    username: s.username || "",
    password: s.password || "",
    parentMobile: s.parentMobile || "",
    parentEmail: s.parentEmail || "",
    standard: s.standard || (grades[0]?.id || ""),
    batch: s.batch || "A1",
    status: s.status === "Active" ? "Active" : "Inactive",
    schoolYear: s.schoolYear || "2023-24",
    address: s.address || "",
  });

  const openAdd = () => {
    setForm({ ...getEmptyForm(), standard: grades[0]?.id || "" });
    setFieldErrors({});
    setEditMode(false);
    setViewMode(false);
    setError("");
    setOpen(true);
  };

  const openEdit = (s: Student) => {
    setSelectedId(s.id);
    setForm(studentToForm(s));
    setFieldErrors({});
    setEditMode(true);
    setViewMode(false);
    setError("");
    setOpen(true);
  };

  const openView = (s: Student) => {
    setSelectedId(s.id);
    setForm(studentToForm(s));
    setFieldErrors({});
    setEditMode(false);
    setViewMode(true);
    setError("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditMode(false);
    setViewMode(false);
    setSelectedId(null);
    setError("");
    setFieldErrors({});
  };

  /* ─────────────── GENERATE CREDENTIALS (manual button only) ─────────────── */
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

    // Clear username/password errors after generation (generated values are always valid)
    setFieldErrors(prev => ({ ...prev, username: "", password: "" }));
  };

  /* ─────────────── COPY TO CLIPBOARD ─────────────── */
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  /* ─────────────── FULL FORM VALIDATION ─────────────── */
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

  /* ─────────────── CREATE / UPDATE ─────────────── */
  const handleSave = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        parentMobile: form.parentMobile,
        standard: form.standard,
        schoolYear: form.schoolYear,
        status: "Active",
        username: form.username,
        password: form.password,
      };

      if (form.middleName && form.middleName.trim()) body.middleName = form.middleName;
      if (form.studentEmail && form.studentEmail.trim()) body.studentEmail = form.studentEmail;  // ✅ restored
      if (form.parentEmail && form.parentEmail.trim()) body.parentEmail = form.parentEmail;
      if (form.batch && form.batch.trim()) body.batch = form.batch;
      if (form.address && form.address.trim()) body.address = form.address;

      if (editMode) body.status = form.status;

      const url = editMode ? `/api/students/${selectedId}` : "/api/students";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Request failed.");

      closeModal();
      fetchStudents();
    } catch (e: any) {
      console.error("Save error:", e);
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────── DELETE ─────────────── */
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      fetchStudents();
    } catch (e: any) {
      alert(e.message || "Failed to delete student.");
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      handleDelete(deleteId);
      setShowDeletePopup(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setDeleteId(null);
  };

  const getGradeName = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.name : gradeId;
  };

  const gradeOptions = grades.map(grade => grade.name);
  const gradeValues = grades.map(grade => grade.id);

  /* ─── Password strength indicator ─── */
  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pwd.length >= 8) score++;
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] to-[#0f1117] text-white">

      {/* HEADER */}
      <div className="px-10 py-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Student Management</h1>
          <p className="opacity-60 mt-1">Manage student lifecycle, enrollment and progress</p>
        </div>
        <button
          onClick={openAdd}
          disabled={gradesLoading}
          className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          style={{ backgroundColor: '#3b6d11' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c520d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b6d11'}
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-5 px-6">
        <StatCard icon={<Users size={15} />} title={String(meta.total)} sub="Total Students" color="bg-yellow-600" />
        <StatCard icon={<TrendingUp size={15} />} title="66%" sub="Avg Progress" color="bg-blue-500" />
        <StatCard icon={<CheckCircle size={15} />} title="79%" sub="Avg Attendance" color="bg-green-500" />
        <StatCard icon={<BookOpen size={15} />} title="19" sub="Enrollments" color="bg-yellow-500" />
      </div>

      {/* FILTER BAR */}
      <div className="px-10 mt-6">
        <div className="bg-[#161b27] p-4 rounded-2xl flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#1e2435] border border-white/10 px-4 py-2 rounded-xl w-72">
            <Search size={16} className="opacity-40 shrink-0" />
            <input
              placeholder="Search name, email, mobile…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none ml-2 w-full text-sm placeholder-white/30"
            />
          </div>

          <FilterDrop
            label=""
            options={["All Grades", ...gradeOptions]}
            onChange={v => setFilterGrade(v === "All Grades" ? "" : v)}
            disabled={gradesLoading}
          />

          <FilterDrop
            label=""
            options={["All Batches", ...batches]}
            onChange={v => setFilterBatch(v === "All Batches" ? "" : v)}
          />

          <button
            onClick={fetchStudents}
            title="Refresh"
            className="bg-[#1e2435] border border-white/10 p-2 rounded-xl hover:bg-white/10 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button title="Export" className="bg-[#1e2435] border border-white/10 p-2 rounded-xl hover:bg-white/10 transition">
            <Download size={16} />
          </button>

          <span className="ml-auto text-xs opacity-40">
            {meta.total} student{meta.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-10 mt-6 pb-10">
        <div className="bg-[#161b27] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-8 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white/40 border-b border-white/10">
            <div className="col-span-2">Student</div>
            <div>Grade</div>
            <div>Batch</div>
            <div>Email</div>
            <div>Status</div>
            <div>Year</div>
            <div>Actions</div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16 opacity-40">
              <Loader2 size={28} className="animate-spin" />
            </div>
          )}

          {!loading && students.length === 0 && (
            <div className="text-center py-16 opacity-40 text-sm">No students found.</div>
          )}

          {!loading && students.map(s => (
            <div
              key={s.id}
              className="grid grid-cols-8 px-6 py-4 items-center border-b border-white/5 hover:bg-white/[0.03] transition"
            >
              <div className="col-span-2">
                <p className="font-semibold text-sm">{s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}</p>
              </div>

              <div className="text-sm">
                <span className="bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                  {getGradeName(s.standard)}
                </span>
              </div>

              <div className="text-sm opacity-70">{s.batch || "—"}</div>
              {/* ✅ Show studentEmail in table instead of studentMobile */}
              <div className="text-sm opacity-70 font-mono text-xs truncate">{s.studentEmail || "—"}</div>

              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === "Active"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-red-600/20 text-red-400"
                  }`}>
                  {s.status || "Inactive"}
                </span>
              </div>

              <div className="text-xs opacity-50">{s.schoolYear}</div>

              <div className="flex gap-3">
                <Eye size={16} className="text-pink-400 cursor-pointer hover:scale-110 transition" onClick={() => openView(s)}  />
                <Pencil size={16} className="text-purple-400 cursor-pointer hover:scale-110 transition" onClick={() => openEdit(s)} />
                <Mail size={16} className="text-blue-400 cursor-pointer hover:scale-110 transition"  />
                <Trash2 size={16} className="text-red-400 cursor-pointer hover:scale-110 transition" onClick={() => handleDeleteClick(s.id)} />
              </div>
            </div>
          ))}
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-5 text-sm opacity-60 select-none">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span>Page {meta.page} of {meta.totalPages}</span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-8 px-4">
          <div className="bg-[#161b27] w-full max-w-[920px] rounded-2xl p-8 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  {viewMode ? "Student Details" : editMode ? "Edit Student" : "Add Student"}
                </h2>
                {editMode && (
                  <p className="text-xs text-white/40 mt-1">ID: {selectedId}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {gradesLoading ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin inline mr-2" />
                <span className="text-white/60">Loading grades...</span>
              </div>
            ) : gradesError ? (
              <div className="text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20">
                ⚠ Error loading grades: {gradesError}
              </div>
            ) : (
              <>
                <SectionLabel>Student Details</SectionLabel>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Field
                    label="First Name *" name="firstName" placeholder="Aisha"
                    value={form.firstName} onChange={handleChange} disabled={viewMode}
                    error={fieldErrors.firstName}
                  />
                  <Field
                    label="Middle Name" name="middleName" placeholder="Kumar"
                    value={form.middleName} onChange={handleChange} disabled={viewMode}
                  />
                  <Field
                    label="Last Name *" name="lastName" placeholder="Tendulkar"
                    value={form.lastName} onChange={handleChange} disabled={viewMode}
                    error={fieldErrors.lastName}
                  />
                  {/* ✅ studentEmail field restored */}
                  <Field
                    label="Student Email" name="studentEmail" placeholder="student@school.edu"
                    value={form.studentEmail} onChange={handleChange} disabled={viewMode}
                    type="email"
                  />
                  <Field
                    label="Parent Mobile *" name="parentMobile" placeholder="9876543210"
                    value={form.parentMobile} onChange={handleChange} disabled={viewMode}
                    type="tel" error={fieldErrors.parentMobile}
                  />
                  <Field
                    label="Parent Email" name="parentEmail" placeholder="parent@email.com"
                    value={form.parentEmail} onChange={handleChange} disabled={viewMode}
                    type="email"
                  />
                </div>

                <SectionLabel>Address</SectionLabel>
                <textarea
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  disabled={viewMode}
                  placeholder="Street, City, State, PIN…"
                  className="w-full bg-[#1e2435] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-purple-500 transition resize-none mb-6 disabled:opacity-50"
                />

                <SectionLabel>Enrollment</SectionLabel>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <DynamicDropField
                    label="Grade *"
                    name="standard"
                    options={gradeOptions}
                    values={gradeValues}
                    value={form.standard}
                    onChange={handleChange}
                    disabled={viewMode}
                    error={fieldErrors.standard}
                  />
                  <DropField label="Batch" name="batch" options={batches} value={form.batch} onChange={handleChange} disabled={viewMode} />
                  <DropField label="School Year *" name="schoolYear" options={schoolYears} value={form.schoolYear} onChange={handleChange} disabled={viewMode} error={fieldErrors.schoolYear} />
                  {(editMode || viewMode) && (
                    <DropField
                      label="Status"
                      name="status"
                      options={["Active", "Inactive"]}
                      value={form.status}
                      onChange={handleChange}
                      disabled={viewMode}
                    />
                  )}
                </div>

                {/* ─── LOGIN CREDENTIALS SECTION ─── */}
                <SectionLabel>Login Credentials</SectionLabel>

                {/* Credential rules info box */}
                {/* {!viewMode && (
                  <div className="bg-[#1e2435] border border-white/10 rounded-xl px-4 py-3 mb-4 text-xs text-white/50 space-y-1">
                    <p className="font-semibold text-white/70 mb-1">Credential Rules:</p>
                    <p>• <span className="text-white/70">Username:</span> 6–20 chars, start with a letter, only lowercase letters, numbers, and dots (e.g. <span className="font-mono text-green-400">aisha.tendulkar123</span>)</p>
                    <p>• <span className="text-white/70">Password:</span> Min 8 chars, must include uppercase, lowercase, number, and special char (@#$!%^&*) (e.g. <span className="font-mono text-green-400">Aisha@123</span>)</p>
                  </div>
                )} */}

                {/* General error (e.g. name not filled before generate) */}
                {fieldErrors.general && (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 rounded-xl mb-4">
                    <AlertCircle size={14} />
                    {fieldErrors.general}
                  </div>
                )}

                {!viewMode && (
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
                )}

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
                        disabled={viewMode}
                        className="w-full bg-[#1e2435] rounded-xl px-4 py-2.5 pr-10 text-sm text-white outline-none transition placeholder-white/20 disabled:opacity-50 font-mono"
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
                        disabled={viewMode}
                        className="w-full bg-[#1e2435] rounded-xl px-4 py-2.5 pr-10 text-sm text-white outline-none transition placeholder-white/20 disabled:opacity-50 font-mono"
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
                    {/* Password strength bar */}
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

                {error && (
                  <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20">
                    ⚠ {error}
                  </p>
                )}

                {!viewMode && (
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={handleSave}
                      disabled={submitting}
                      className="w-40 py-3 rounded-xl font-semibold bg-[#3b6d11] hover:bg-[#2e550d] disabled:opacity-50 transition text-sm flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {editMode ? "Update" : "Save"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Student?</h3>
            <p className="text-gray-600 mb-6">Do you want to delete this student?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-white font-medium transition"
                style={{ backgroundColor: '#3b6d11' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c520d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b6d11'}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ icon, title, sub, color }: { icon: React.ReactNode; title: string; sub: string; color: string }) => (
  <div className="bg-[#161b27] p-4 rounded-xl text-center">
    <div className={`${color} w-10 h-10 flex items-center justify-center rounded-lg mb-3 mx-auto`}>{icon}</div>
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-xs opacity-60 mt-1">{sub}</p>
  </div>
);

const FilterDrop = ({ label, options, onChange, disabled }: { label: string; options: string[]; onChange: (v: string) => void; disabled?: boolean }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <select
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="bg-[#1e2435] border border-white/10 px-4 py-2 rounded-xl text-sm text-white outline-none cursor-pointer disabled:opacity-50"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-4 pb-2 border-b border-white/10">
    {children}
  </p>
);

const Field = ({
  label, name, placeholder, value, onChange, disabled, type = "text", error
}: {
  label: string; name: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean; type?: string; error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`bg-[#1e2435] border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition placeholder-white/20 disabled:opacity-50 ${
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
  label, name, options, value, onChange, disabled, error
}: {
  label: string; name: string; options: string[]; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean; error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`bg-[#1e2435] border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition cursor-pointer disabled:opacity-50 ${
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
  label, name, options, values, value, onChange, disabled, error
}: {
  label: string;
  name: string;
  options: string[];
  values: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/50 font-medium">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`bg-[#1e2435] border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition cursor-pointer disabled:opacity-50 ${
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

