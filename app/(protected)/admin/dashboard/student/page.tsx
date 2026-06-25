"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import AddModal from "./add";
import EditModal from "./edit";
import ViewModal from "./view";
import DeleteModal from "./delete";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudentQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  grade?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  gradeId: string;
  grade: string;
  section: string;
  school: string;
  schoolId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  gpa: number;
  attendance: number;
  status: "active" | "inactive";
  enrolled: string;
  subjects: string[];
  username: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  grade: string;
  gradeId: string;
  section: string;
  school: string;
  schoolId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  gpa: number;
  attendance: number;
  status: "active" | "inactive";
  schoolYear: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface Option {
  value: string;
  label: string;
}

// ─── Constants & Helpers ──────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: "#1e293b", fg: "#a78bfa" },
  { bg: "#064e3b", fg: "#6ee7b7" },
  { bg: "#4c0519", fg: "#f9a8d4" },
  { bg: "#0c4a6e", fg: "#93c5fd" },
  { bg: "#451a03", fg: "#fcd34d" },
  { bg: "#2e1065", fg: "#c4b5fd" },
];

const GRADES = ["All Grades", "8th", "9th", "10th", "11th", "12th"];
const GENDERS = ["All Genders", "Male", "Female", "Other"];
const STATUSES = ["All Status", "Active", "Inactive"];
const SECTIONS = ["A", "B", "C", "D"];
const GRADE_OPTS = ["8th", "9th", "10th", "11th", "12th"];

function initials(name = ""): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function gpaColor(g: number): string {
  return g >= 9 ? "#34d399" : g >= 7 ? "#fbbf24" : "#f87171";
}

function attColor(a: number): string {
  return a >= 90 ? "#34d399" : a >= 75 ? "#fbbf24" : "#f87171";
}

function formToDTO(f: FormData) {
  const [firstName, ...rest] = (f.name || "").trim().split(" ");
  const lastName = rest.join(" ");
  return {
    firstName: firstName || "",
    lastName: lastName || "",
    username: f.username,
    password: f.password,
    studentEmail: f.email,
    studentMobile: f.phone,
    parentMobile: f.parentPhone,
    parentEmail: f.parentEmail || "",
    standard: f.gradeId,
    batch: f.section,
    schoolId: f.schoolId || "",
    schoolYear: f.schoolYear || new Date().getFullYear().toString(),
    address: f.address,
    status: f.status === "active" ? "Active" : "Inactive",
  };
}

function dtoToDisplay(s: any): Student {
  return {
    id: String(s.id),
    name: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
    email: s.studentEmail || "",
    phone: s.studentMobile || "",
    dob: s.dob || "",
    gender: s.gender || "Male",
    gradeId: s.standard || "",
    grade: s.standard || "",
    section: s.batch || "A",
    school: s.school || s.schoolName || "",
    schoolId: s.schoolId || "",
    parentName: s.parentName || "",
    parentPhone: s.parentMobile || "",
    parentEmail: s.parentEmail || "",
    address: s.address || "",
    gpa: parseFloat(s.gpa) || 0,
    attendance: parseInt(s.attendance) || 0,
    status: (s.status || "").toLowerCase() === "active" ? "active" : "inactive",
    enrolled: s.createdAt ? s.createdAt.slice(0, 10) : "",
    subjects: s.subjects || [],
    username: s.username || "",
  };
}

const defaultForm: FormData = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  gender: "Male",
  grade: "",
  gradeId: "",
  section: "A",
  school: "",
  schoolId: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
  gpa: 0,
  attendance: 0,
  status: "active",
  schoolYear: new Date().getFullYear().toString(),
  username: "",
  password: "",
  confirmPassword: "",
};

// ─── API Layer ────────────────────────────────────────────────────────────────
const API = {
  async getStudents(params: StudentQueryParams = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.search) q.set("search", params.search);
    if (params.grade && params.grade !== "All Grades") q.set("grade", params.grade);
    const res = await fetch(`/api/students?${q}`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
  },

  async getGrades() {
    const res = await fetch("/api/grade");
    if (!res.ok) throw new Error("Failed to fetch grades");
    return res.json();
  },

  async getSchools() {
    const res = await fetch("/api/schools");
    if (!res.ok) throw new Error("Failed to fetch schools");
    return res.json();
  },

  async createStudent(data: any) {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to create student");
    return json.data;
  },

  async updateStudent(id: string, data: any) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to update student");
    return json.data;
  },

  async deleteStudent(id: string) {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to delete student");
    return json;
  },
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Trend: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
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
  Warn: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
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
  Home: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Save: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
  Book: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  Building: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 21V9M16 21V9M3 9h18M8 3v6M16 3v6" />
    </svg>
  ),
  Gender: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M9 18h6" />
    </svg>
  ),
  Section: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Refresh: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
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
  Key: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6M15.5 7.5L19 4M17.5 9.5L21 6" />
    </svg>
  ),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  msg: string;
  type?: "success" | "error";
}

function Toast({ msg, type = "success" }: ToastProps) {
  if (!msg) return null;
  const colors = type === "error"
    ? { bg: "#2a0d0d", border: "#991b1b", color: "#fca5a5" }
    : { bg: "#1a2d12", border: "#639922", color: "#c0dd97" };
  return (
    <div style={{
      position: "fixed",
      top: "1.5rem",
      right: "1.5rem",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
      padding: "0.75rem 1.2rem",
      color: colors.color,
      fontSize: "0.875rem",
      fontWeight: 500,
      zIndex: 200,
      animation: "fadeIn 0.2s ease",
      maxWidth: 320
    }}>
      {msg}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("All Grades");
  const [gender, setGender] = useState("All Genders");
  const [status, setStatus] = useState("All Status");

  const [gradeOptions, setGradeOptions] = useState<Option[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<Option[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<string, string>>({});
  const [schoolMap, setSchoolMap] = useState<Record<string, string>>({});
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const [delStudent, setDelStudent] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultForm);

  const [listLoading, setListLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [listError, setListError] = useState("");

  const optionsLoadedRef = useRef(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Load grade & school options
  useEffect(() => {
    if (optionsLoadedRef.current) return;
    optionsLoadedRef.current = true;

    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        let gradesData: any[] = [];
        let schoolsData: any[] = [];
        try {
          const gradesRes = await API.getGrades();
          gradesData = gradesRes?.data || [];
          if (!Array.isArray(gradesData)) gradesData = [];
        } catch (e: any) {
          console.warn("⚠️ Grades API failed:", e.message);
        }

        try {
          const schoolsRes = await API.getSchools();
          schoolsData = schoolsRes?.data || [];
          if (!Array.isArray(schoolsData)) schoolsData = [];
        } catch (e: any) {
          console.warn("⚠️ Schools API failed:", e.message);
        }

        if (gradesData.length > 0) {
          const mapped: Option[] = gradesData.map(g => ({
            value: String(g.id ?? g._id ?? g.gradeId ?? g.value),
            label: g.name ?? g.gradeName ?? g.label ?? String(g.id),
          }));
          setGradeOptions(mapped);
          const map: Record<string, string> = {};
          mapped.forEach(g => { map[g.value] = g.label; });
          setGradeMap(map);
        } else {
          const fallback: Option[] = GRADE_OPTS.map(g => ({ value: g, label: g }));
          setGradeOptions(fallback);
          const map: Record<string, string> = {};
          fallback.forEach(g => { map[g.value] = g.label; });
          setGradeMap(map);
        }

        if (schoolsData.length > 0) {
          const mapped: Option[] = schoolsData.map(s => ({
            value: String(s.id ?? s._id ?? s.schoolId ?? s.value),
            label: s.name ?? s.schoolName ?? s.label ?? String(s.id),
          }));
          setSchoolOptions(mapped);
          const map: Record<string, string> = {};
          mapped.forEach(s => { map[s.value] = s.label; });
          setSchoolMap(map);
        } else {
          const fallback: Option[] = [
            "Lincoln High School", "Tech Valley Academy", "Riverside International",
            "Central Academy", "Horizon STEM School"
          ].map(s => ({ value: s, label: s }));
          setSchoolOptions(fallback);
          const map: Record<string, string> = {};
          fallback.forEach(s => { map[s.value] = s.label; });
          setSchoolMap(map);
        }
      } catch (e) {
        console.error("Error loading options:", e);
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, []);

  // Fetch students - FIXED with proper typing
  const fetchStudents = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const params: StudentQueryParams = { page, limit, search };
      if (grade !== "All Grades") params.grade = grade;
      const res = await API.getStudents(params);
      const rows = (res.data || []).map(dtoToDisplay);
      setStudents(rows);
      setTotal(res.meta?.total || rows.length);
    } catch (e: any) {
      setListError(e.message || "Failed to load students");
    } finally {
      setListLoading(false);
    }
  }, [page, search, grade]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter(s =>
    (gender === "All Genders" || s.gender === gender) &&
    (status === "All Status" || (s.status === "active" ? "Active" : "Inactive") === status)
  );

  const stats = {
    total: total,
    active: students.filter(s => s.status === "active").length,
    avgGpa: students.length ? (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(1) : "0.0",
    avgAtt: students.length ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) : 0,
  };

  const openAdd = () => {
    setFormData(defaultForm);
    setFormMode("add");
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (s: Student) => {
    const gradeOpt = gradeOptions.find(g => g.value === s.gradeId || g.label === s.grade);
    const schoolOpt = schoolOptions.find(sc => sc.value === s.schoolId || sc.label === s.school);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone,
      dob: s.dob,
      gender: s.gender,
      grade: gradeOpt?.label || s.grade || "",
      gradeId: gradeOpt?.value || s.gradeId || s.grade || "",
      section: s.section,
      school: schoolOpt?.label || s.school || "",
      schoolId: schoolOpt?.value || s.schoolId || "",
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail || "",
      address: s.address,
      gpa: s.gpa,
      attendance: s.attendance,
      status: s.status,
      schoolYear: new Date().getFullYear().toString(),
      username: s.username || "",
      password: "",
      confirmPassword: "",
    });
    setFormMode("edit");
    setEditId(s.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const dto = formToDTO(formData);
      if (formMode === "add") {
        await API.createStudent(dto);
        showToast("Student added successfully");
      } else {
        const updateDto = { ...dto };
        if (!formData.password) delete updateDto.password;
        await API.updateStudent(editId!, updateDto);
        showToast("Student updated successfully");
      }
      setFormOpen(false);
      fetchStudents();
    } catch (e: any) {
      showToast(e.message || "Something went wrong", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!delStudent) return;
    setDelLoading(true);
    try {
      await API.deleteStudent(delStudent.id);
      setDelStudent(null);
      showToast("Student deleted successfully");
      fetchStudents();
    } catch (e: any) {
      showToast(e.message || "Failed to delete student", "error");
    } finally {
      setDelLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getGradeName = (student: Student): string => {
    if (student.grade && gradeMap[student.grade]) return gradeMap[student.grade];
    if (student.gradeId && gradeMap[student.gradeId]) return gradeMap[student.gradeId];
    return student.grade || student.gradeId || "—";
  };

  const getSchoolName = (student: Student): string => {
    if (student.school) return student.school;
    if (student.schoolId && schoolMap[student.schoolId]) return schoolMap[student.schoolId];
    return student.schoolId || "—";
  };

  return (
    <div style={{ padding: "2rem 2.5rem", minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        input::placeholder,textarea::placeholder{color:#3a4460}
        select option{background:#161b27}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.5);cursor:pointer}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2d3448;border-radius:4px}
        .row-hover:hover{background:rgba(99,153,34,0.04)!important}
        .stat-card:hover{transform:translateY(-2px)}
        .add-btn:hover{background:#27500a!important}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 3px", fontSize: "1.6rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.4px" }}>Students Management</h1>
          <p style={{ margin: 0, fontSize: "0.83rem", color: "#64748b" }}>Manage student profiles, academics, and attendance</p>
        </div>
        <button className="add-btn" onClick={openAdd}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.58rem 1.2rem", background: "#3b6d11", border: "1px solid #639922", borderRadius: 9, color: "#c0dd97", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap" }}>
          <Ic.Plus />Add New Student
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total Students", value: stats.total, color: "#7dd3fc", bg: "rgba(55,138,221,0.08)", icon: <Ic.Users /> },
          { label: "Active Students", value: stats.active, color: "#c0dd97", bg: "rgba(99,153,34,0.08)", icon: <Ic.Check /> },
          { label: "Average GPA", value: `${stats.avgGpa}/10`, color: "#fbbf24", bg: "rgba(245,158,11,0.08)", icon: <Ic.Star /> },
          { label: "Avg Attendance", value: `${stats.avgAtt}%`, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", icon: <Ic.Trend /> },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: "#161b27", border: "1px solid #2d3448", borderRadius: 12, padding: "1.1rem 1.2rem", transition: "transform 0.15s" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: "1.55rem", fontWeight: 700, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: "#161b27", border: "1px solid #2d3448", borderRadius: 12, padding: "1rem 1.2rem", display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Ic.Search /></span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email or username…"
            style={{ width: "100%", padding: "0.55rem 2.4rem 0.55rem 2.5rem", background: "#0f1117", border: "1px solid #2d3448", borderRadius: 9, color: "#e2e8f0", fontSize: "0.855rem", outline: "none", fontFamily: "inherit" }} />
          {search && <button onClick={() => { setSearch(""); setPage(1); setTimeout(fetchStudents, 0); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", padding: 2, borderRadius: 4 }}><Ic.X /></button>}
        </div>
        {[
          { val: grade, set: (v: string) => { setGrade(v); setPage(1); }, opts: gradeOptions.length ? gradeOptions.map(o => o.label) : GRADES },
          { val: gender, set: (v: string) => { setGender(v); setPage(1); }, opts: GENDERS },
          { val: status, set: (v: string) => { setStatus(v); setPage(1); }, opts: STATUSES },
        ].map((sel, i) => {
          const optLabels = sel.opts;
          return (
            <div key={i} style={{ position: "relative" }}>
              <select value={sel.val} onChange={e => sel.set(e.target.value)}
                style={{ padding: "0.55rem 2rem 0.55rem 0.85rem", background: "#0f1117", border: "1px solid #2d3448", borderRadius: 9, color: "#94a3b8", fontSize: "0.82rem", outline: "none", cursor: "pointer", appearance: "none", fontFamily: "inherit", minWidth: 130 }}>
                {optLabels.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none", fontSize: "0.7rem" }}>▾</span>
            </div>
          );
        })}
        <button onClick={fetchStudents} title="Refresh" style={{ padding: "0.55rem 0.75rem", background: "transparent", border: "1px solid #2d3448", borderRadius: 9, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Ic.Refresh />
        </button>
        <button
          onClick={() => {
            setSearch("");
            setGrade("All Grades");
            setGender("All Genders");
            setStatus("All Status");
            setPage(1);
            setTimeout(fetchStudents, 0);
          }}
          style={{ padding: "0.5rem 1.1rem", background: "transparent", border: "1px solid #2d3448", borderRadius: 8, color: "#64748b", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#161b27", border: "1px solid #2d3448", borderRadius: 12, overflow: "hidden" }}>
        {listError && (
          <div style={{ padding: "1rem 1.2rem", background: "rgba(127,29,29,0.15)", borderBottom: "1px solid #7f1d1d", display: "flex", alignItems: "center", gap: 8 }}>
            <Ic.Warn />
            <span style={{ fontSize: "0.85rem", color: "#fca5a5" }}>{listError}</span>
            <button onClick={fetchStudents} style={{ marginLeft: "auto", padding: "0.3rem 0.7rem", background: "transparent", border: "1px solid #991b1b", borderRadius: 6, color: "#fca5a5", fontSize: "0.8rem", cursor: "pointer" }}>Retry</button>
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2d3448" }}>
                {["STUDENT", "CONTACT", "SCHOOL-GRADE", "GPA", "ATTENDANCE", "STATUS", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan={7} style={{ padding: "4rem 1rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#475569" }}>
                    <Ic.Loader />
                    <span style={{ fontSize: "0.88rem" }}>Loading students…</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 1rem", textAlign: "center" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "1rem", fontWeight: 600, color: "#475569" }}>No students found</p>
                  <p style={{ margin: "0 0 1.2rem", fontSize: "0.83rem", color: "#3a4460" }}>Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setGrade("All Grades");
                      setGender("All Genders");
                      setStatus("All Status");
                      setPage(1);
                      setTimeout(fetchStudents, 0);
                    }}
                    style={{ padding: "0.5rem 1.1rem", background: "transparent", border: "1px solid #2d3448", borderRadius: 8, color: "#64748b", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Clear filters
                  </button>
                </td></tr>
              ) : filtered.map((s, idx) => {
                const av = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
                const gc = gpaColor(s.gpa), ac = attColor(s.attendance);
                const gradeName = getGradeName(s);
                const schoolName = getSchoolName(s);
                return (
                  <tr key={s.id} className="row-hover" style={{ borderBottom: "1px solid rgba(45,52,72,0.5)", transition: "background 0.12s" }}>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: av.bg, color: av.fg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.88rem", flexShrink: 0 }}>{initials(s.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.88rem" }}>{s.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#3a4460" }}>{s.id} · {s.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.84rem" }}>{s.email}</div>
                      <div style={{ fontSize: "0.72rem", color: "#475569" }}>{s.phone}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ fontSize: "0.84rem", color: "#e2e8f0" }}>{schoolName}</div>
                      <span style={{ padding: "1px 7px", background: "rgba(99,153,34,0.1)", border: "1px solid rgba(99,153,34,0.2)", borderRadius: 20, fontSize: "0.68rem", fontWeight: 600, color: "#c0dd97" }}>
                        {gradeName} · Sec {s.section}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 90 }}>
                        <div style={{ flex: 1, height: 6, background: "#2d3448", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(s.gpa / 10) * 100}%`, background: `linear-gradient(90deg,${gc}66,${gc})`, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: gc, minWidth: 28 }}>{s.gpa.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 90 }}>
                        <div style={{ flex: 1, height: 6, background: "#2d3448", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${s.attendance}%`, background: `linear-gradient(90deg,${ac}66,${ac})`, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: ac, minWidth: 34 }}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 500, color: s.status === "active" ? "#c0dd97" : "#64748b" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.status === "active" ? "#639922" : "#64748b", boxShadow: s.status === "active" ? "0 0 5px rgba(99,153,34,0.5)" : "none" }} />
                        {s.status === "active" ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {[
                          { title: "View", color: "#7dd3fc", hbg: "#0c1a2e", onClick: () => setViewIdx(idx), icon: <Ic.Eye /> },
                          { title: "Edit", color: "#c0dd97", hbg: "rgba(99,153,34,0.1)", onClick: () => openEdit(s), icon: <Ic.Edit /> },
                          { title: "Delete", color: "#f87171", hbg: "#2a0d0d", onClick: () => setDelStudent(s), icon: <Ic.Trash /> },
                        ].map(btn => (
                          <button key={btn.title} title={btn.title} onClick={btn.onClick}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #2d3448", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, color: btn.color, transition: "background 0.12s" }}
                            onMouseEnter={e => e.currentTarget.style.background = btn.hbg}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!listLoading && filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1.2rem", borderTop: "1px solid #2d3448" }}>
            <span style={{ fontSize: "0.78rem", color: "#475569" }}>
              Showing <strong style={{ color: "#64748b" }}>{filtered.length}</strong> of <strong style={{ color: "#64748b" }}>{total}</strong> student{total !== 1 ? "s" : ""}
            </span>
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "0.35rem 0.7rem", background: "transparent", border: "1px solid #2d3448", borderRadius: 7, color: page === 1 ? "#3a4460" : "#94a3b8", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "0.8rem" }}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ padding: "0.35rem 0.65rem", background: page === p ? "rgba(99,153,34,0.15)" : "transparent", border: `1px solid ${page === p ? "rgba(99,153,34,0.4)" : "#2d3448"}`, borderRadius: 7, color: page === p ? "#c0dd97" : "#94a3b8", cursor: "pointer", fontSize: "0.8rem" }}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: "0.35rem 0.7rem", background: "transparent", border: "1px solid #2d3448", borderRadius: 7, color: page === totalPages ? "#3a4460" : "#94a3b8", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: "0.8rem" }}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewIdx !== null && filtered[viewIdx] && (
        <ViewModal student={filtered[viewIdx]} idx={viewIdx} onClose={() => setViewIdx(null)} />
      )}
      {delStudent && (
        <DeleteModal student={delStudent} onCancel={() => setDelStudent(null)} onConfirm={handleDelete} loading={delLoading} />
      )}
      {formOpen && (
        formMode === "add" ? (
          <AddModal
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onClose={() => setFormOpen(false)}
            loading={formLoading}
            gradeOptions={gradeOptions}
            schoolOptions={schoolOptions}
          />
        ) : (
          <EditModal
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onClose={() => setFormOpen(false)}
            loading={formLoading}
            gradeOptions={gradeOptions}
            schoolOptions={schoolOptions}
          />
        )
      )}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}