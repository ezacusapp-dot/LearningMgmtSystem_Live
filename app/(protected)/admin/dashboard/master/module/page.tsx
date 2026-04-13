"use client";

import { useEffect, useState } from "react";

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  courses: { id: string; title: string };
}

interface PaginatedResponse {
  status: boolean;
  data: Module[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT = 10;

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Module | null>(null);
  const [deleteItem, setDeleteItem] = useState<Module | null>(null);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    order: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch courses for dropdown ── */
  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses?limit=100");
      const json = await res.json();
      if (json.status || json.success) setCourses(json.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Fetch modules ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        search,
        ...(filterCourse && { courseId: filterCourse }),
      });
      const res = await fetch(`/api/modules?${params}`);
      const json: PaginatedResponse = await res.json();
      if (json.status) {
        setModules(json.data);
        setTotal(json.meta.total);
        setTotalPages(json.meta.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filterCourse]);

  /* ── Modal helpers ── */
  const openAdd = () => {
    setEditItem(null);
    setForm({ courseId: "", title: "", order: "", description: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (item: Module) => {
    setEditItem(item);
    setForm({
      courseId: item.courseId,
      title: item.title,
      order: String(item.order),
      description: item.description ?? "",
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.courseId || !form.title.trim() || form.order === "") return;
    setSaving(true);
    try {
      if (editItem) {
        const payload: Record<string, unknown> = {
          title: form.title.trim(),
          order: Number(form.order),
          isActive: form.isActive,
          ...(form.description && { description: form.description }),
        };
        await fetch(`/api/modules/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const payload: Record<string, unknown> = {
          courseId: form.courseId,
          title: form.title.trim(),
          order: Number(form.order),
          ...(form.description && { description: form.description }),
        };
        await fetch("/api/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      closeModal();
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await fetch(`/api/modules/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  const isFormValid = form.courseId && form.title.trim() && form.order !== "";

  return (
    <div className="mo-page">
      {/* ── Header ── */}
      <div className="mo-header">
        <div>
          <h1 className="mo-title">Course Modules</h1>
          <p className="mo-subtitle">Manage modules across all courses</p>
        </div>
        <button className="mo-btn-add" onClick={openAdd}>
          <span className="mo-btn-icon">+</span>
          Add Module
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="mo-toolbar">
        <div className="mo-search-wrap">
          <SearchIcon />
          <input
            className="mo-search"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="mo-filter-select"
          value={filterCourse}
          onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <span className="mo-count">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="mo-table-wrap">
        <table className="mo-table">
          <thead>
            <tr>
              <th className="mo-th mo-th-no">Sr.No</th>
              <th className="mo-th">Module Title</th>
              <th className="mo-th">Course</th>
              <th className="mo-th">Description</th>
              {/* <th className="mo-th mo-th-center">Order</th> */}
              <th className="mo-th mo-th-center">Status</th>
              <th className="mo-th">Created At</th>
              <th className="mo-th mo-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="mo-empty">
                  <div className="mo-spinner" />
                </td>
              </tr>
            ) : modules.length === 0 ? (
              <tr>
                <td colSpan={8} className="mo-empty">
                  <EmptyIcon />
                  <p>No modules found</p>
                </td>
              </tr>
            ) : (
              modules.map((mod, idx) => (
                <tr key={mod.id} className="mo-tr">
                  <td className="mo-td mo-td-no">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="mo-td mo-td-name">{mod.title}</td>
                  <td className="mo-td mo-td-course">{mod.courses?.title ?? "—"}</td>
                  <td className="mo-td mo-td-desc">
                    {mod.description
                      ? mod.description.length > 50
                        ? mod.description.slice(0, 50) + "…"
                        : mod.description
                      : <span className="mo-td-empty">—</span>}
                  </td>
                  {/* <td className="mo-td mo-td-center">
                    <span className="mo-order-badge">{mod.order}</span>
                  </td> */}
                  <td className="mo-td mo-td-center">
                    <span className={`mo-badge-status ${mod.isActive ? "active" : "inactive"}`}>
                      {mod.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="mo-td mo-td-date">
                    {new Date(mod.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="mo-td mo-td-actions">
                    <button className="mo-icon-btn edit" title="Edit" onClick={() => openEdit(mod)}>
                      <EditIcon />
                    </button>
                    <button className="mo-icon-btn delete" title="Delete" onClick={() => setDeleteItem(mod)}>
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mo-pagination">
          <button className="mo-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`mo-page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="mo-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next ›
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="mo-overlay" onClick={closeModal}>
          <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h2 className="mo-modal-title">
                {editItem ? "Edit Module" : "Add Module"}
              </h2>
              <button className="mo-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="mo-modal-body">
              {/* Course */}
              <div className="mo-field">
                <label className="mo-label">
                  Course <span className="mo-req">*</span>
                </label>
                <select
                  className="mo-input"
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  disabled={!!editItem}
                >
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Title + Order side by side */}
              <div className="mo-field-grid">
                <div className="mo-field">
                  <label className="mo-label">
                    Module Title <span className="mo-req">*</span>
                  </label>
                  <input
                    className="mo-input"
                    placeholder="e.g. Introduction"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="mo-field">
                  <label className="mo-label">
                    Order <span className="mo-req">*</span>
                  </label>
                  <input
                    className="mo-input"
                    type="number"
                    min={0}
                    placeholder="e.g. 1"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mo-field">
                <label className="mo-label">Description</label>
                <textarea
                  className="mo-textarea"
                  placeholder="Brief description of this module…"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Status toggle (edit only) */}
              {editItem && (
                <div className="mo-field mo-field-row">
                  <label className="mo-label">Status</label>
                  <div className="mo-toggle-wrap">
                    <button
                      className={`mo-toggle ${form.isActive ? "on" : ""}`}
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    >
                      <span className="mo-toggle-knob" />
                    </button>
                    <span className="mo-toggle-label">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mo-modal-footer">
              <button className="mo-btn-cancel" onClick={closeModal}>Cancel</button>
              <button
                className="mo-btn-save"
                onClick={handleSave}
                disabled={saving || !isFormValid}
              >
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteItem && (
        <div className="mo-overlay" onClick={() => setDeleteItem(null)}>
          <div className="mo-modal mo-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h2 className="mo-modal-title">Confirm Delete</h2>
              <button className="mo-modal-close" onClick={() => setDeleteItem(null)}>✕</button>
            </div>
            <div className="mo-modal-body">
              <div className="mo-delete-warn">
                <WarnIcon />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.title}</strong>? This will also remove all
                  associated lessons and cannot be undone.
                </p>
              </div>
            </div>
            <div className="mo-modal-footer">
              <button className="mo-btn-cancel" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button className="mo-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

/* ─────────────────── Icons ─────────────────── */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 8 }}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "#e24b4a" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

/* ─────────────────── Styles ─────────────────── */

const styles = `
  .mo-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* Header */
  .mo-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .mo-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .mo-subtitle { font-size: 0.85rem; color: #64748b; margin: 0; }

  /* Add Button */
  .mo-btn-add {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.55rem 1.1rem;
    background: #3b6d11;
    color: #c0dd97;
    border: 1px solid #639922;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .mo-btn-add:hover { background: #27500a; }
  .mo-btn-add:active { transform: scale(0.97); }
  .mo-btn-icon { font-size: 1.15rem; line-height: 1; font-weight: 400; }

  /* Toolbar */
  .mo-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }
  .mo-search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
    max-width: 300px;
    color: #64748b;
  }
  .mo-search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .mo-search {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.4rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .mo-search::placeholder { color: #475569; }
  .mo-search:focus { border-color: #639922; }

  .mo-filter-select {
    padding: 0.5rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.82rem;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .mo-filter-select:focus { border-color: #639922; color: #e2e8f0; }

  .mo-count {
    font-size: 0.8rem;
    color: #475569;
    white-space: nowrap;
    margin-left: auto;
  }

  /* Table */
  .mo-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .mo-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .mo-th {
    padding: 0.85rem 1.1rem;
    text-align: left;
    font-size: 0.78rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    border-bottom: 1px solid #2d3448;
    background: #1a2030;
    white-space: nowrap;
  }
  .mo-th-no { width: 56px; }
  .mo-th-center { text-align: center; }

  .mo-tr { transition: background 0.12s; }
  .mo-tr:hover { background: #1c2235; }
  .mo-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .mo-td { padding: 0.85rem 1.1rem; color: #cbd5e1; vertical-align: middle; }
  .mo-td-no     { color: #475569; font-size: 0.8rem; }
  .mo-td-name   { font-weight: 500; color: #e2e8f0; }
  .mo-td-course { font-size: 0.82rem; color: #94a3b8; }
  .mo-td-desc   { font-size: 0.82rem; color: #64748b; max-width: 220px; }
  .mo-td-empty  { color: #334155; }
  .mo-td-center { text-align: center; }
  .mo-td-date   { font-size: 0.82rem; color: #64748b; white-space: nowrap; }
  .mo-td-actions { text-align: center; }

  /* Order badge */
  .mo-order-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: #1e2a40;
    border: 1px solid #2d3f5c;
    color: #7dd3fc;
    font-size: 0.78rem;
    font-weight: 600;
  }

  /* Status Badge */
  .mo-badge-status {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .mo-badge-status.active  { background: #0f2d1a; color: #4ade80; border: 1px solid #166534; }
  .mo-badge-status.inactive { background: #2a1a1a; color: #f87171; border: 1px solid #7f1d1d; }

  /* Action Icons */
  .mo-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    margin: 0 2px;
  }
  .mo-icon-btn.edit { color: #60a5fa; }
  .mo-icon-btn.edit:hover { background: #0c253d; border-color: #1e4a72; color: #93c5fd; }
  .mo-icon-btn.delete { color: #f87171; }
  .mo-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
  .mo-icon-btn:active { transform: scale(0.9); }

  /* Empty / Loading */
  .mo-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
    font-size: 0.875rem;
  }
  .mo-empty p { margin: 0; }
  .mo-spinner {
    width: 28px; height: 28px;
    border: 2px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: mo-spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes mo-spin { to { transform: rotate(360deg); } }

  /* Pagination */
  .mo-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 1.5rem; }
  .mo-page-btn {
    padding: 0.4rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 7px;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .mo-page-btn:hover:not(:disabled) { background: #1c2235; color: #e2e8f0; }
  .mo-page-btn.active { background: #27500a; border-color: #3b6d11; color: #c0dd97; font-weight: 500; }
  .mo-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Modal */
  .mo-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: mo-fadeIn 0.15s ease;
  }
  @keyframes mo-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .mo-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 500px;
    margin: 1rem;
    animation: mo-slideUp 0.2s ease;
  }
  .mo-modal-sm { max-width: 400px; }
  @keyframes mo-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .mo-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .mo-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .mo-modal-close {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 1rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
  }
  .mo-modal-close:hover { color: #e2e8f0; background: #2d3448; }

  .mo-modal-body { padding: 1.4rem; }
  .mo-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* Form */
  .mo-field { margin-bottom: 1.1rem; }
  .mo-field:last-child { margin-bottom: 0; }
  .mo-field-row { display: flex; align-items: center; justify-content: space-between; }
  .mo-field-grid {
    display: grid;
    grid-template-columns: 1fr 120px;
    gap: 0.85rem;
    margin-bottom: 1.1rem;
  }
  .mo-field-grid .mo-field { margin-bottom: 0; }

  .mo-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .mo-field-row .mo-label { margin-bottom: 0; }
  .mo-req { color: #f87171; }

  .mo-input {
    width: 100%;
    padding: 0.55rem 0.85rem;
    background: #1a2030;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
    appearance: none;
  }
  .mo-input::placeholder { color: #475569; }
  .mo-input:focus { border-color: #639922; }
  .mo-input:disabled { opacity: 0.5; cursor: not-allowed; }

  .mo-textarea {
    width: 100%;
    padding: 0.6rem 0.85rem;
    background: #1a2030;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    outline: none;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.15s;
    box-sizing: border-box;
    font-family: inherit;
  }
  .mo-textarea::placeholder { color: #475569; }
  .mo-textarea:focus { border-color: #639922; }

  /* Toggle */
  .mo-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .mo-toggle {
    width: 40px; height: 22px;
    border-radius: 11px;
    background: #2d3448;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    padding: 0;
  }
  .mo-toggle.on { background: #3b6d11; }
  .mo-toggle-knob {
    position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .mo-toggle.on .mo-toggle-knob { transform: translateX(18px); }
  .mo-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  /* Buttons */
  .mo-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .mo-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }

  .mo-btn-save {
    padding: 0.5rem 1.4rem;
    background: #3b6d11;
    border: 1px solid #639922;
    border-radius: 8px;
    color: #c0dd97;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
  }
  .mo-btn-save:hover:not(:disabled) { background: #27500a; }
  .mo-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .mo-btn-danger {
    padding: 0.5rem 1.4rem;
    background: #7f1d1d;
    border: 1px solid #991b1b;
    border-radius: 8px;
    color: #fca5a5;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
  }
  .mo-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .mo-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Delete warn */
  .mo-delete-warn { display: flex; gap: 14px; align-items: flex-start; }
  .mo-delete-warn p { font-size: 0.875rem; color: #94a3b8; margin: 0; line-height: 1.6; }
  .mo-delete-warn strong { color: #e2e8f0; }
`;