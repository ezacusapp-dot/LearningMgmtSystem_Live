"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Building, User, Mail, Phone, MapPin, Home, GraduationCap, BarChart2, CreditCard, Lock, Eye, EyeOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface School {
  id: string;
  name: string;
  adminName?: string;
  adminEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  state?: string;
  students?: number;
  studentsCount?: number;
  performance?: number;
  subscription?: "active" | "trial" | "expired";
  active?: boolean;
  status?: "Active" | "Inactive";
  avatarColor?: string;
  createdAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUB_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  active:  { bg: "rgba(99,153,34,0.12)",  border: "rgba(99,153,34,0.35)",  text: "#c0dd97", dot: "#639922" },
  trial:   { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  text: "#fcd34d", dot: "#f59e0b" },
  expired: { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",   text: "#fca5a5", dot: "#ef4444" },
};

const AVATAR_PALETTE = [
  { bg: "#1e293b", fg: "#a78bfa" },
  { bg: "#064e3b", fg: "#6ee7b7" },
  { bg: "#4c0519", fg: "#f9a8d4" },
  { bg: "#0c4a6e", fg: "#93c5fd" },
  { bg: "#451a03", fg: "#fcd34d" },
  { bg: "#2e1065", fg: "#c4b5fd" },
];

const REGIONS  = ["All Regions", "North", "South", "East", "West"];
const STATES   = ["All States",  "California", "Washington", "Texas", "New York"];
const STATUSES = ["All Status",  "Active", "Inactive"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function perfColor(p: number): string {
  if (p >= 85) return "#34d399";
  if (p >= 70) return "#fbbf24";
  return "#f87171";
}

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "#2d3448" };
  let score = 0;
  if (pw.length >= 6)          score++;
  if (pw.length >= 10)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { level: 2, label: "Fair",   color: "#f59e0b" };
  if (score <= 3) return { level: 3, label: "Good",   color: "#3b82f6" };
  return               { level: 4, label: "Strong", color: "#639922" };
}

// ─── Default form state ───────────────────────────────────────────────────────

const defaultForm = {
  name: "",
  adminName: "",
  adminEmail: "",
  phone: "",
  address: "",
  region: "North",
  state: "California",
  students: 0,
  active: true,
  subscription: "trial" as "active" | "trial" | "expired",
  performance: 0,
  password: "",
  confirmPassword: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchoolsPage() {
  const router = useRouter();

  const [schools,      setSchools]      = useState<School[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [region,       setRegion]       = useState("All Regions");
  const [state,        setState]        = useState("All States");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [delModal,     setDelModal]     = useState<{ id: string; name: string } | null>(null);
  const [toast,        setToast]        = useState("");
  const [deleting,     setDeleting]     = useState(false);

  // Modal state
  const [formModalOpen,    setFormModalOpen]    = useState(false);
  const [formMode,         setFormMode]         = useState<"add" | "edit">("add");
  const [editingSchoolId,  setEditingSchoolId]  = useState<string | null>(null);
  const [formData,         setFormData]         = useState(defaultForm);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchSchools(); }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/schools?limit=100");
      const json = await res.json();
      if (json.status || json.success) setSchools(json.data ?? []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delModal) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/schools/${delModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status || json.success) {
        setSchools((prev) => prev.filter((s) => s.id !== delModal.id));
        showToast("School deleted successfully");
      } else {
        showToast("Failed to delete school");
      }
    } catch {
      showToast("An error occurred");
    } finally {
      setDeleting(false);
      setDelModal(null);
    }
  };

  // ── Open modal ─────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setFormMode("add");
    setEditingSchoolId(null);
    setFormData(defaultForm);
    setFormModalOpen(true);
  };

  const openEditModal = (school: School) => {
    setFormMode("edit");
    setEditingSchoolId(school.id);
    setFormData({
      name:            school.name         ?? "",
      adminName:       school.adminName    ?? "",
      adminEmail:      school.adminEmail   ?? "",
      phone:           school.phone        ?? "",
      address:         school.address      ?? "",
      region:          school.region       ?? "North",
      state:           school.state        ?? "California",
      students:        school.students     ?? 0,
      active:          school.active       ?? true,
      subscription:    school.subscription ?? "trial",
      performance:     school.performance  ?? 0,
      password:        "",   // never pre-fill password
      confirmPassword: "",
    });
    setFormModalOpen(true);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      // Build payload — only include password if set
      const payload: any = {
        name:         formData.name,
        adminName:    formData.adminName,
        adminEmail:   formData.adminEmail,
        phone:        formData.phone,
        address:      formData.address,
        region:       formData.region,
        state:        formData.state,
        students:     formData.students,
        active:       formData.active,
        subscription: formData.subscription,
        performance:  formData.performance,
      };
      if (formData.password) payload.password = formData.password;

      const url    = formMode === "edit" && editingSchoolId
        ? `/api/schools/${editingSchoolId}`
        : "/api/schools";
      const method = formMode === "edit" ? "PUT" : "POST";

      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.status || json.success) {
        showToast(formMode === "add" ? "School added" : "School updated");
        fetchSchools();
        setFormModalOpen(false);
      } else {
        showToast(json.message || "Failed to save school");
      }
    } catch {
      showToast("An error occurred");
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = schools.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchQ  = !q || s.name.toLowerCase().includes(q) || (s.adminName ?? "").toLowerCase().includes(q) || (s.adminEmail ?? "").toLowerCase().includes(q);
    const matchR  = region       === "All Regions" || s.region === region;
    const matchS  = state        === "All States"  || s.state  === state || s.city === state;
    const matchSt = statusFilter === "All Status"  || (s.active ? "Active" : "Inactive") === statusFilter;
    return matchQ && matchR && matchS && matchSt;
  });

  const stats = {
    total:    schools.length,
    active:   schools.filter((s) => s.active).length,
    students: schools.reduce((a, s) => a + (s.students ?? s.studentsCount ?? 0), 0),
    avgPerf:  schools.length ? Math.round(schools.reduce((a, s) => a + (s.performance ?? 0), 0) / schools.length) : 0,
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="sm-page">

      {/* Header */}
      <div className="sm-header">
        <div>
          <h1 className="sm-title">Schools Management</h1>
          <p className="sm-subtitle">Manage schools, admins, and subscriptions</p>
        </div>
        <button className="sm-btn-add" onClick={openAddModal}>
          <PlusIcon /> Add New School
        </button>
      </div>

      {/* Stats */}
      <div className="sm-stats">
        {[
          { label: "Total Schools",   value: stats.total,                     color: "#7dd3fc", bg: "rgba(55,138,221,0.08)", icon: <GridStatIcon /> },
          { label: "Active Schools",  value: stats.active,                    color: "#c0dd97", bg: "rgba(99,153,34,0.08)",  icon: <CheckIcon /> },
          { label: "Total Students",  value: stats.students.toLocaleString(), color: "#fbbf24", bg: "rgba(245,158,11,0.08)", icon: <UsersIcon /> },
          { label: "Avg Performance", value: `${stats.avgPerf}%`,             color: "#60a5fa", bg: "rgba(59,130,246,0.08)",  icon: <TrendIcon /> },
        ].map((s) => (
          <div key={s.label} className="sm-stat-card">
            <div className="sm-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="sm-stat-val" style={{ color: s.color }}>{s.value}</div>
            <div className="sm-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="sm-toolbar">
        <div className="sm-search-wrap">
          <SearchIcon />
          <input
            className="sm-search"
            placeholder="Search schools or admins…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="sm-search-clear" onClick={() => setSearchQuery("")}><XIcon /></button>
          )}
        </div>
        <select className="sm-sel" value={region}       onChange={(e) => setRegion(e.target.value)}>
          {REGIONS.map((r)  => <option key={r}>{r}</option>)}
        </select>
        <select className="sm-sel" value={state}        onChange={(e) => setState(e.target.value)}>
          {STATES.map((s)   => <option key={s}>{s}</option>)}
        </select>
        <select className="sm-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sm-skeleton-row">
                <div className="sm-sk-avatar" />
                <div className="sm-sk-lines">
                  <div className="sm-sk-line w70" />
                  <div className="sm-sk-line w45" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sm-empty">
            <SearchEmptyIcon />
            <p className="sm-empty-title">No schools found</p>
            <p className="sm-empty-sub">Try adjusting your filters or search terms</p>
            <button className="sm-btn-outline" onClick={() => { setSearchQuery(""); setRegion("All Regions"); setState("All States"); setStatusFilter("All Status"); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>School</th>
                <th>Admin</th>
                <th>Location</th>
                <th>Students</th>
                <th>Performance</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((school, idx) => {
                const avatar = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
                const sub    = SUB_STYLES[school.subscription ?? "expired"];
                const pc     = perfColor(school.performance ?? 0);
                return (
                  <tr key={school.id} className="sm-row">
                    <td>
                      <div className="sm-school-cell">
                        <div className="sm-avatar" style={{ background: avatar.bg, color: avatar.fg }}>
                          {initials(school.name)}
                        </div>
                        <div>
                          <div className="sm-school-name">{school.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><div className="sm-admin-name">{school.adminName}</div></td>
                    <td><div className="sm-loc-city">{school.address}</div></td>
                    <td>
                      <div className="sm-stu">
                        <PersonIcon />
                        {(school.students ?? school.studentsCount ?? 0).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="sm-perf-wrap">
                        <div className="sm-perf-bg">
                          <div className="sm-perf-fill" style={{ width: `${school.performance ?? 0}%`, background: `linear-gradient(90deg,${pc}99,${pc})` }} />
                        </div>
                        <span className="sm-perf-val" style={{ color: pc }}>{school.performance ?? 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="sm-sub-badge" style={{ background: sub.bg, borderColor: sub.border, color: sub.text }}>
                        <span className="sm-sub-dot" style={{ background: sub.dot }} />
                        {(school.subscription ?? "expired").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className={`sm-status ${school.active ? "active" : "inactive"}`}>
                        <span className="sm-status-dot" />
                        {school.active ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td>
                      <div className="sm-actions">
                        <button className="sm-act-btn view" title="View school" onClick={() => router.push(`/admin/dashboard/schools/${school.id}`)}>
                          <EyeIcon />
                        </button>
                        <button className="sm-act-btn edit" title="Edit school" onClick={() => openEditModal(school)}>
                          <EditIcon />
                        </button>
                        <button className="sm-act-btn del" title="Delete school" onClick={() => setDelModal({ id: school.id, name: school.name })}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filtered.length > 0 && (
          <div className="sm-table-footer">
            <span className="sm-result-count">
              Showing <strong>{filtered.length}</strong> of <strong>{schools.length}</strong> school{schools.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {delModal && (
        <div className="sm-overlay" onClick={() => setDelModal(null)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-modal-header">
              <h2 className="sm-modal-title">Delete School</h2>
              <button className="sm-modal-close" onClick={() => setDelModal(null)}>✕</button>
            </div>
            <div className="sm-modal-body">
              <div className="sm-del-warn">
                <WarnIcon />
                <div>
                  <p className="sm-del-msg">Are you sure you want to delete <strong>"{delModal.name}"</strong>?</p>
                  <p className="sm-del-sub">This will permanently remove the school, all its admins, students, and data. This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="sm-modal-footer">
              <button className="sm-btn-cancel" onClick={() => setDelModal(null)}>Cancel</button>
              <button className="sm-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="sm-toast">{toast}</div>}

      {/* School Form Modal */}
      <SchoolFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSave}
        mode={formMode}
        formData={formData}
        setFormData={setFormData}
      />

      <style>{styles}</style>
    </div>
  );
}

// ─── School Form Modal ────────────────────────────────────────────────────────

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: "add" | "edit";
  formData: {
    name: string; adminName: string; adminEmail: string; phone: string;
    address: string; region: string; state: string; students: number;
    active: boolean; subscription: "active" | "trial" | "expired";
    performance: number; password: string; confirmPassword: string;
  };
  setFormData: (data: any) => void;
}

function SchoolFormModal({ isOpen, onClose, onSave, mode, formData, setFormData }: SchoolFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim())       errs.name       = "School name is required";
    if (!formData.adminName.trim())  errs.adminName  = "Admin name is required";
    if (!formData.adminEmail.trim()) errs.adminEmail = "Admin email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) errs.adminEmail = "Invalid email address";
    if (!formData.phone.trim())      errs.phone      = "Phone number is required";
    if (!formData.address.trim())    errs.address    = "Address is required";

    if (mode === "add") {
      if (!formData.password)                errs.password        = "Password is required";
      else if (formData.password.length < 6) errs.password        = "Minimum 6 characters";
      if (!formData.confirmPassword)         errs.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    } else if (formData.password) {
      if (formData.password.length < 6)                           errs.password        = "Minimum 6 characters";
      if (!formData.confirmPassword)                              errs.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword)    errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(); };

  const clearErr = (key: string) => setErrors((e) => { const n = { ...e }; delete n[key]; return n; });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="sf-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="sf-modal"
          >
            {/* Header */}
            <div className="sf-header">
              <div className="sf-header-left">
                <div className="sf-header-icon"><Building size={20} /></div>
                <div>
                  <h2 className="sf-title">{mode === "add" ? "Add New School" : "Edit School"}</h2>
                  <p className="sf-subtitle">{mode === "add" ? "Create a new school profile" : "Update school information"}</p>
                </div>
              </div>
              <button className="sf-close" onClick={onClose}><X size={18} /></button>
            </div>

            {/* Body */}
            <div className="sf-body">

              {/* School Name */}
              <div className="sf-field">
                <label className="sf-label"><Building size={13} />School Name <span className="sf-req">*</span></label>
                <input type="text" value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); clearErr("name"); }}
                  placeholder="Enter school name"
                  className={`sf-input ${errors.name ? "error" : ""}`} />
                {errors.name && <span className="sf-err">{errors.name}</span>}
              </div>

              {/* Admin Row */}
              <div className="sf-row-2">
                <div className="sf-field">
                  <label className="sf-label"><User size={13} />Admin Name <span className="sf-req">*</span></label>
                  <input type="text" value={formData.adminName}
                    onChange={(e) => { setFormData({ ...formData, adminName: e.target.value }); clearErr("adminName"); }}
                    placeholder="Enter admin name"
                    className={`sf-input ${errors.adminName ? "error" : ""}`} />
                  {errors.adminName && <span className="sf-err">{errors.adminName}</span>}
                </div>
                <div className="sf-field">
                  <label className="sf-label"><Mail size={13} />Admin Email <span className="sf-req">*</span></label>
                  <input type="email" value={formData.adminEmail}
                    onChange={(e) => { setFormData({ ...formData, adminEmail: e.target.value }); clearErr("adminEmail"); }}
                    placeholder="admin@school.edu"
                    className={`sf-input ${errors.adminEmail ? "error" : ""}`} />
                  {errors.adminEmail && <span className="sf-err">{errors.adminEmail}</span>}
                </div>
              </div>

              {/* Phone */}
              <div className="sf-field">
                <label className="sf-label"><Phone size={13} />Phone Number <span className="sf-req">*</span></label>
                <input type="tel" value={formData.phone}
                  onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearErr("phone"); }}
                  placeholder="+91 9999999999"
                  className={`sf-input ${errors.phone ? "error" : ""}`} />
                {errors.phone && <span className="sf-err">{errors.phone}</span>}
              </div>

              {/* Address */}
              <div className="sf-field">
                <label className="sf-label"><Home size={13} />School Address <span className="sf-req">*</span></label>
                <textarea value={formData.address}
                  onChange={(e) => { setFormData({ ...formData, address: e.target.value }); clearErr("address"); }}
                  placeholder="Enter full address" rows={3}
                  className={`sf-textarea ${errors.address ? "error" : ""}`} />
                {errors.address && <span className="sf-err">{errors.address}</span>}
              </div>

              {/* Region + State */}
              <div className="sf-row-2">
                <div className="sf-field">
                  <label className="sf-label"><MapPin size={13} />Region <span className="sf-req">*</span></label>
                  <div className="sf-select-wrap">
                    <select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="sf-select">
                      {["North","South","East","West","Central"].map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <span className="sf-select-arrow">▾</span>
                  </div>
                </div>
                <div className="sf-field">
                  <label className="sf-label"><MapPin size={13} />State <span className="sf-req">*</span></label>
                  <div className="sf-select-wrap">
                    <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="sf-select">
                      {["California","Washington","New York","Texas","Florida","Illinois"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <span className="sf-select-arrow">▾</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="sf-row-3">
                <div className="sf-field">
                  <label className="sf-label"><GraduationCap size={13} />Students</label>
                  <input type="number" value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: parseInt(e.target.value) || 0 })}
                    placeholder="0" min="0" className="sf-input" />
                </div>
                <div className="sf-field">
                  <label className="sf-label"><CreditCard size={13} />Subscription</label>
                  <div className="sf-select-wrap">
                    <select value={formData.subscription} onChange={(e) => setFormData({ ...formData, subscription: e.target.value as any })} className="sf-select">
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                    <span className="sf-select-arrow">▾</span>
                  </div>
                </div>
                <div className="sf-field">
                  <label className="sf-label"><BarChart2 size={13} />Performance (%)</label>
                  <input type="number" value={formData.performance}
                    onChange={(e) => setFormData({ ...formData, performance: parseInt(e.target.value) || 0 })}
                    placeholder="0" min="0" max="100" className="sf-input" />
                </div>
              </div>

              {/* Performance Preview */}
              {formData.performance > 0 && (
                <div className="sf-perf-preview">
                  <div className="sf-perf-bar-bg">
                    <motion.div
                      className="sf-perf-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(formData.performance, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{
                        background: formData.performance >= 85 ? "linear-gradient(90deg,#3b6d1199,#639922)"
                          : formData.performance >= 70 ? "linear-gradient(90deg,#92400e99,#f59e0b)"
                          : "linear-gradient(90deg,#7f1d1d99,#ef4444)",
                      }}
                    />
                  </div>
                  <span className="sf-perf-label" style={{ color: formData.performance >= 85 ? "#c0dd97" : formData.performance >= 70 ? "#fcd34d" : "#fca5a5" }}>
                    {formData.performance}%
                  </span>
                </div>
              )}

              {/* ── Password Section divider ── */}
              <div className="sf-section-divider">
                <span className="sf-section-label">
                  <Lock size={12} />
                  {mode === "add" ? "Set Password" : "Change Password"}
                  {mode === "edit" && <span className="sf-optional-tag">optional</span>}
                </span>
              </div>

              {/* Password + Confirm */}
              <div className="sf-row-2">
                {/* Password */}
                <div className="sf-field">
                  <label className="sf-label">
                    <Lock size={13} />Password {mode === "add" && <span className="sf-req">*</span>}
                  </label>
                  <div className="sf-pw-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearErr("password"); }}
                      placeholder={mode === "add" ? "Min. 6 characters" : "Leave blank to keep current"}
                      className={`sf-input sf-pw-input ${errors.password ? "error" : ""}`}
                    />
                    <button type="button" className="sf-pw-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <span className="sf-err">{errors.password}</span>}
                  {formData.password && (
                    <div className="sf-strength">
                      <div className="sf-strength-bars">
                        {[1, 2, 3, 4].map((lvl) => (
                          <motion.div key={lvl} className="sf-strength-bar"
                            animate={{ background: lvl <= strength.level ? strength.color : "#2d3448", opacity: lvl <= strength.level ? 1 : 0.4 }}
                            transition={{ duration: 0.25 }}
                          />
                        ))}
                      </div>
                      <span className="sf-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="sf-field">
                  <label className="sf-label">
                    <Lock size={13} />Confirm Password {mode === "add" && <span className="sf-req">*</span>}
                  </label>
                  <div className="sf-pw-wrap">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); clearErr("confirmPassword"); }}
                      placeholder="Re-enter password"
                      className={`sf-input sf-pw-input ${errors.confirmPassword ? "error" : ""}`}
                    />
                    <button type="button" className="sf-pw-eye" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="sf-err">{errors.confirmPassword}</span>}
                  {formData.confirmPassword && formData.password && (
                    <div className="sf-match-indicator">
                      {formData.password === formData.confirmPassword
                        ? <span className="sf-match ok">✓ Passwords match</span>
                        : <span className="sf-match no">✗ Passwords do not match</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <label className="sf-toggle-row">
                <div className={`sf-toggle ${formData.active ? "on" : ""}`} onClick={() => setFormData({ ...formData, active: !formData.active })}>
                  <motion.div className="sf-toggle-thumb"
                    animate={{ x: formData.active ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
                <span className="sf-toggle-label">School is <strong>{formData.active ? "Active" : "Inactive"}</strong></span>
                {formData.active && <span className="sf-active-dot" />}
              </label>
            </div>

            {/* Footer */}
            <div className="sf-footer">
              <button className="sf-btn-cancel" onClick={onClose}>Cancel</button>
              <motion.button className="sf-btn-save" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}>
                <Save size={15} />
                {mode === "add" ? "Add School" : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function XIcon()           { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function EyeIcon()         { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon()        { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function PersonIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function WarnIcon()        { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function SearchEmptyIcon() { return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: "0 auto 12px", display: "block", color: "#2d3448" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function GridStatIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function CheckIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function UsersIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function TrendIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  .sm-page {
    padding: 2rem 2.5rem; min-height: 100vh;
    background: #0f1117; color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }
  .sm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
  .sm-title  { font-size: 1.55rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.4px; margin: 0 0 3px; }
  .sm-subtitle { font-size: 0.83rem; color: #64748b; margin: 0; }
  .sm-btn-add { display: inline-flex; align-items: center; gap: 8px; padding: 0.58rem 1.2rem; background: #3b6d11; border: 1px solid #639922; border-radius: 9px; color: #c0dd97; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; white-space: nowrap; }
  .sm-btn-add:hover { background: #27500a; box-shadow: 0 0 0 3px rgba(99,153,34,0.18); }
  .sm-btn-add:active { transform: scale(0.97); }
  .sm-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 1.5rem; }
  .sm-stat-card { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; padding: 1.1rem 1.2rem; }
  .sm-stat-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
  .sm-stat-val { font-size: 1.55rem; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .sm-stat-lbl { font-size: 0.75rem; color: #64748b; font-weight: 500; }
  .sm-toolbar { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; padding: 1rem 1.2rem; display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .sm-search-wrap { position: relative; flex: 1; min-width: 200px; display: flex; align-items: center; }
  .sm-search-wrap > svg { position: absolute; left: 12px; pointer-events: none; }
  .sm-search { width: 100%; padding: 0.55rem 2.4rem 0.55rem 2.5rem; background: #0f1117; border: 1px solid #2d3448; border-radius: 9px; color: #e2e8f0; font-size: 0.855rem; outline: none; font-family: inherit; transition: border-color 0.15s; }
  .sm-search::placeholder { color: #3a4460; }
  .sm-search:focus { border-color: #639922; }
  .sm-search-clear { position: absolute; right: 10px; background: transparent; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; padding: 2px; border-radius: 4px; transition: color 0.12s; }
  .sm-search-clear:hover { color: #e2e8f0; }
  .sm-sel { padding: 0.55rem 0.85rem; background: #0f1117; border: 1px solid #2d3448; border-radius: 9px; color: #94a3b8; font-size: 0.82rem; outline: none; cursor: pointer; font-family: inherit; min-width: 130px; transition: border-color 0.15s; }
  .sm-sel:focus { border-color: #639922; }
  .sm-table-wrap { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; overflow: hidden; }
  .sm-loading { padding: 1rem; display: flex; flex-direction: column; gap: 10px; }
  .sm-skeleton-row { display: flex; align-items: center; gap: 12px; padding: 0.5rem 0.2rem; animation: sm-pulse 1.5s ease-in-out infinite; }
  .sm-sk-avatar { width: 38px; height: 38px; border-radius: 10px; background: #1a2030; flex-shrink: 0; }
  .sm-sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .sm-sk-line { height: 11px; background: #1a2030; border-radius: 5px; }
  .sm-sk-line.w70 { width: 70%; }
  .sm-sk-line.w45 { width: 45%; }
  @keyframes sm-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .sm-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
  .sm-table thead tr { border-bottom: 1px solid #2d3448; }
  .sm-table thead th { padding: 0.85rem 1rem; text-align: left; color: #64748b; font-weight: 600; font-size: 0.74rem; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
  .sm-row { border-bottom: 1px solid rgba(45,52,72,0.5); transition: background 0.12s; cursor: pointer; }
  .sm-row:last-child { border-bottom: none; }
  .sm-row:hover { background: rgba(99,153,34,0.05); }
  .sm-table td { padding: 0.9rem 1rem; vertical-align: middle; }
  .sm-school-cell { display: flex; align-items: center; gap: 10px; }
  .sm-avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.88rem; flex-shrink: 0; }
  .sm-school-name { font-weight: 600; color: #f1f5f9; font-size: 0.88rem; line-height: 1.3; }
  .sm-admin-name  { font-weight: 500; color: #e2e8f0; font-size: 0.84rem; }
  .sm-loc-city    { color: #e2e8f0; font-weight: 500; }
  .sm-stu { display: flex; align-items: center; gap: 5px; font-weight: 600; color: #f1f5f9; }
  .sm-stu svg { color: #c0dd97; }
  .sm-perf-wrap { display: flex; align-items: center; gap: 8px; min-width: 110px; }
  .sm-perf-bg { flex: 1; height: 7px; background: #2d3448; border-radius: 4px; overflow: hidden; }
  .sm-perf-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
  .sm-perf-val  { font-size: 0.78rem; font-weight: 600; min-width: 34px; text-align: right; }
  .sm-sub-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; border: 1px solid; }
  .sm-sub-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .sm-status { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 500; }
  .sm-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .sm-status.active { color: #c0dd97; }
  .sm-status.active .sm-status-dot { background: #639922; box-shadow: 0 0 5px rgba(99,153,34,0.5); }
  .sm-status.inactive { color: #64748b; }
  .sm-status.inactive .sm-status-dot { background: #64748b; }
  .sm-actions { display: flex; gap: 5px; align-items: center; }
  .sm-act-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #2d3448; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.12s, border-color 0.12s; padding: 0; }
  .sm-act-btn.view { color: #7dd3fc; }
  .sm-act-btn.view:hover { background: #0c1a2e; border-color: #163856; }
  .sm-act-btn.edit { color: #c0dd97; }
  .sm-act-btn.edit:hover { background: rgba(99,153,34,0.1); border-color: rgba(99,153,34,0.3); }
  .sm-act-btn.del  { color: #f87171; }
  .sm-act-btn.del:hover { background: #2a0d0d; border-color: #7f1d1d; }
  .sm-table-footer { display: flex; align-items: center; justify-content: center; padding: 0.9rem 1.2rem; border-top: 1px solid #2d3448; }
  .sm-result-count { font-size: 0.78rem; color: #475569; }
  .sm-result-count strong { color: #64748b; }
  .sm-empty { text-align: center; padding: 4rem 1rem; }
  .sm-empty-title { font-size: 1rem; font-weight: 600; color: #475569; margin: 0 0 6px; }
  .sm-empty-sub   { font-size: 0.83rem; color: #3a4460; margin: 0 0 1.2rem; }
  .sm-btn-outline { display: inline-flex; align-items: center; padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #64748b; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s, color 0.12s; font-family: inherit; }
  .sm-btn-outline:hover { background: #1e2230; color: #e2e8f0; }
  .sm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(3px); animation: sm-fade 0.15s ease; }
  @keyframes sm-fade { from{opacity:0} to{opacity:1} }
  .sm-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; width: 100%; max-width: 430px; margin: 1rem; animation: sm-up 0.2s ease; }
  @keyframes sm-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .sm-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.3rem; border-bottom: 1px solid #2d3448; }
  .sm-modal-title  { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .sm-modal-close  { background: transparent; border: none; color: #64748b; font-size: 1rem; cursor: pointer; padding: 4px; border-radius: 5px; transition: color 0.12s, background 0.12s; }
  .sm-modal-close:hover { color: #e2e8f0; background: #2d3448; }
  .sm-modal-body   { padding: 1.3rem; }
  .sm-del-warn     { display: flex; gap: 12px; align-items: flex-start; }
  .sm-del-msg      { font-size: 0.88rem; color: #e2e8f0; margin: 0 0 6px; line-height: 1.5; }
  .sm-del-msg strong { color: #fca5a5; }
  .sm-del-sub      { font-size: 0.78rem; color: #64748b; margin: 0; line-height: 1.6; }
  .sm-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0.85rem 1.3rem; border-top: 1px solid #2d3448; }
  .sm-btn-cancel { padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: background 0.12s; font-family: inherit; }
  .sm-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }
  .sm-btn-danger { padding: 0.5rem 1.4rem; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; font-family: inherit; }
  .sm-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .sm-btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }
  .sm-toast { position: fixed; top: 1.5rem; right: 1.5rem; background: #1a2d12; border: 1px solid #639922; border-radius: 10px; padding: 0.75rem 1.2rem; color: #c0dd97; font-size: 0.875rem; font-weight: 500; z-index: 100; animation: sm-fade 0.2s ease; }

  /* ── SchoolFormModal (sf-*) ── */
  .sf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.72); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .sf-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 24px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(99,153,34,0.08); }
  .sf-modal::-webkit-scrollbar { width: 5px; }
  .sf-modal::-webkit-scrollbar-track { background: transparent; }
  .sf-modal::-webkit-scrollbar-thumb { background: #2d3448; border-radius: 4px; }
  .sf-header { display: flex; align-items: center; justify-content: space-between; padding: 1.3rem 1.5rem; border-bottom: 1px solid #1e2535; background: #131720; border-radius: 16px 16px 0 0; flex-shrink: 0; }
  .sf-header-left { display: flex; align-items: center; gap: 12px; }
  .sf-header-icon { width: 42px; height: 42px; border-radius: 10px; background: rgba(99,153,34,0.12); border: 1px solid rgba(99,153,34,0.25); display: flex; align-items: center; justify-content: center; color: #c0dd97; flex-shrink: 0; }
  .sf-title { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin: 0 0 2px; letter-spacing: -0.2px; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-subtitle { font-size: 0.76rem; color: #475569; margin: 0; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #2d3448; background: transparent; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.12s,color 0.12s,border-color 0.12s; }
  .sf-close:hover { background: #1e2535; color: #e2e8f0; border-color: #3d4860; }
  .sf-body { padding: 1.4rem 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }
  .sf-field { display: flex; flex-direction: column; gap: 6px; }
  .sf-label { display: flex; align-items: center; gap: 6px; font-size: 0.775rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-label svg { color: #639922; }
  .sf-req { color: #f87171; }
  .sf-err { font-size: 0.72rem; color: #f87171; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-input,.sf-textarea,.sf-select { width: 100%; padding: 0.65rem 0.9rem; background: #0f1117; border: 1px solid #2d3448; border-radius: 9px; color: #e2e8f0; font-size: 0.875rem; font-family: 'DM Sans','Segoe UI',sans-serif; outline: none; transition: border-color 0.15s,box-shadow 0.15s; box-sizing: border-box; }
  .sf-input::placeholder,.sf-textarea::placeholder { color: #3a4460; }
  .sf-input:focus,.sf-textarea:focus,.sf-select:focus { border-color: #639922; box-shadow: 0 0 0 3px rgba(99,153,34,0.12); }
  .sf-input.error { border-color: #7f1d1d; box-shadow: 0 0 0 2px rgba(239,68,68,0.1); }
  .sf-textarea.error { border-color: #7f1d1d; box-shadow: 0 0 0 2px rgba(239,68,68,0.1); }
  .sf-textarea { resize: none; line-height: 1.5; }
  .sf-select-wrap { position: relative; }
  .sf-select { appearance: none; padding-right: 2.2rem; cursor: pointer; }
  .sf-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #475569; pointer-events: none; font-size: 0.7rem; }
  .sf-select option { background: #161b27; }
  .sf-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .sf-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

  /* Section divider */
  .sf-section-divider { display: flex; align-items: center; gap: 10px; margin: 0.2rem 0 -0.2rem; }
  .sf-section-divider::before,.sf-section-divider::after { content: ''; flex: 1; height: 1px; background: #1e2535; }
  .sf-section-label { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-section-label svg { color: #639922; }
  .sf-optional-tag { font-size: 0.65rem; color: #3a4460; font-weight: 500; background: #1a2030; border: 1px solid #2d3448; border-radius: 20px; padding: 1px 7px; text-transform: none; letter-spacing: 0; }

  /* Password */
  .sf-pw-wrap { position: relative; }
  .sf-pw-input { padding-right: 2.6rem !important; }
  .sf-pw-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 3px; border-radius: 5px; transition: color 0.12s; }
  .sf-pw-eye:hover { color: #94a3b8; }

  /* Strength */
  .sf-strength { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
  .sf-strength-bars { display: flex; gap: 4px; flex: 1; }
  .sf-strength-bar { height: 4px; flex: 1; border-radius: 2px; }
  .sf-strength-label { font-size: 0.7rem; font-weight: 700; min-width: 40px; text-align: right; font-family: 'DM Sans','Segoe UI',sans-serif; }

  /* Match */
  .sf-match-indicator { margin-top: 2px; }
  .sf-match { font-size: 0.72rem; font-weight: 600; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-match.ok { color: #c0dd97; }
  .sf-match.no { color: #f87171; }

  /* Perf preview */
  .sf-perf-preview { display: flex; align-items: center; gap: 10px; padding: 0.5rem 0.75rem; background: #0f1117; border: 1px solid #1e2535; border-radius: 8px; }
  .sf-perf-bar-bg  { flex: 1; height: 6px; background: #2d3448; border-radius: 3px; overflow: hidden; }
  .sf-perf-bar-fill { height: 100%; border-radius: 3px; }
  .sf-perf-label   { font-size: 0.75rem; font-weight: 700; min-width: 32px; text-align: right; font-family: 'DM Sans','Segoe UI',sans-serif; }

  /* Toggle */
  .sf-toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
  .sf-toggle { width: 44px; height: 24px; border-radius: 12px; background: #2d3448; border: 1px solid #3d4860; position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.2s,border-color 0.2s; }
  .sf-toggle.on { background: rgba(99,153,34,0.25); border-color: rgba(99,153,34,0.5); }
  .sf-toggle-thumb { position: absolute; top: 3px; width: 16px; height: 16px; border-radius: 8px; background: #64748b; }
  .sf-toggle.on .sf-toggle-thumb { background: #c0dd97; }
  .sf-toggle-label { font-size: 0.855rem; color: #94a3b8; font-family: 'DM Sans','Segoe UI',sans-serif; }
  .sf-toggle-label strong { color: #e2e8f0; }
  .sf-active-dot { width: 8px; height: 8px; border-radius: 50%; background: #639922; box-shadow: 0 0 6px rgba(99,153,34,0.6); flex-shrink: 0; }

  /* Footer */
  .sf-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 1rem 1.5rem; border-top: 1px solid #1e2535; background: #131720; border-radius: 0 0 16px 16px; flex-shrink: 0; }
  .sf-btn-cancel { padding: 0.55rem 1.2rem; background: transparent; border: 1px solid #2d3448; border-radius: 9px; color: #94a3b8; font-size: 0.875rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans','Segoe UI',sans-serif; transition: background 0.12s,color 0.12s; }
  .sf-btn-cancel:hover { background: #1e2535; color: #e2e8f0; }
  .sf-btn-save { display: inline-flex; align-items: center; gap: 7px; padding: 0.58rem 1.3rem; background: #3b6d11; border: 1px solid #639922; border-radius: 9px; color: #c0dd97; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans','Segoe UI',sans-serif; transition: background 0.15s,box-shadow 0.15s; }
  .sf-btn-save:hover { background: #27500a; box-shadow: 0 0 0 3px rgba(99,153,34,0.18); }

  @media (max-width: 900px) {
    .sm-stats { grid-template-columns: repeat(2,1fr); }
    .sm-page  { padding: 1.25rem 1rem; }
    .sm-table thead th:nth-child(5),.sm-table td:nth-child(5) { display: none; }
  }
  @media (max-width: 640px) {
    .sm-toolbar { flex-direction: column; }
    .sm-search-wrap { min-width: 100%; }
    .sm-sel { width: 100%; }
    .sm-table thead th:nth-child(4),.sm-table td:nth-child(4),
    .sm-table thead th:nth-child(6),.sm-table td:nth-child(6) { display: none; }
  }
  @media (max-width: 560px) {
    .sf-row-2,.sf-row-3 { grid-template-columns: 1fr; }
    .sf-body { padding: 1.1rem; }
    .sf-header,.sf-footer { padding-left: 1.1rem; padding-right: 1.1rem; }
  }
`;
