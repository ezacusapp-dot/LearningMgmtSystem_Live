"use client";

import { useEffect, useState } from "react";

interface Module {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: string;
  fileUrl?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  module: { id: string; title: string };
}

interface PaginatedResponse {
  status: boolean;
  data: Lesson[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT = 10;

const CONTENT_TYPES = ["Video", "PDF", "Audio", "Text", "Quiz", "Assignment"];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lesson | null>(null);
  const [deleteItem, setDeleteItem] = useState<Lesson | null>(null);

  const [form, setForm] = useState({
    moduleId: "",
    title: "",
    contentType: "",
    fileUrl: "",
    order: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch modules for dropdown ── */
  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules?limit=100");
      const json = await res.json();
      if (json.status || json.success) setModules(json.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Fetch lessons ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        search,
        ...(filterModule && { moduleId: filterModule }),
        ...(filterType && { contentType: filterType }),
      });
      const res = await fetch(`/api/lessons?${params}`);
      const json: PaginatedResponse = await res.json();
      if (json.status) {
        setLessons(json.data);
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
    fetchModules();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filterModule, filterType]);

  /* ── Modal helpers ── */
  const openAdd = () => {
    setEditItem(null);
    setForm({ moduleId: "", title: "", contentType: "", fileUrl: "", order: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (item: Lesson) => {
    setEditItem(item);
    setForm({
      moduleId: item.moduleId,
      title: item.title,
      contentType: item.contentType,
      fileUrl: item.fileUrl ?? "",
      order: item.order !== undefined ? String(item.order) : "",
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  /* ── Save ── */
  // const handleSave = async () => {
  //   if (!form.moduleId || !form.title.trim() || !form.contentType) return;
  //   setSaving(true);
  //   try {
  //     if (editItem) {
  //       const payload: Record<string, unknown> = {
  //         title: form.title.trim(),
  //         contentType: form.contentType,
  //         isActive: form.isActive,
  //         ...(form.fileUrl && { fileUrl: form.fileUrl }),
  //         ...(form.order !== "" && { order: Number(form.order) }),
  //       };
  //       await fetch(`/api/lessons/${editItem.id}`, {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });
  //     } else {
  //       const payload: Record<string, unknown> = {
  //         moduleId: form.moduleId,
  //         title: form.title.trim(),
  //         contentType: form.contentType,
  //         ...(form.fileUrl && { fileUrl: form.fileUrl }),
  //         ...(form.order !== "" && { order: Number(form.order) }),
  //       };
  //       await fetch("/api/lessons", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });
  //     }
  //     closeModal();
  //     fetchData();
  //   } finally {
  //     setSaving(false);
  //   }
  // };
/* ── Save ── */
// const handleSave = async () => {

//   if (!form.moduleId || !form.title.trim() || !form.contentType) return;
//   setSaving(true);
//   try {
//     if (editItem) {
//       const payload: Record<string, unknown> = {
//         title: form.title.trim(),
//         contentType: form.contentType,
//         isActive: Boolean(form.isActive),   // ← explicit cast, never drops false
//         fileUrl: form.fileUrl || null,       // ← always send, even empty
//         ...(form.order !== "" && { order: Number(form.order) }),
//       };
//       await fetch(`/api/lessons/${editItem.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//     } else {
//       const payload: Record<string, unknown> = {
//         moduleId: form.moduleId,
//         title: form.title.trim(),
//         contentType: form.contentType,
//         ...(form.fileUrl && { fileUrl: form.fileUrl }),
//         ...(form.order !== "" && { order: Number(form.order) }),
//       };
//       await fetch("/api/lessons", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//     }
//     closeModal();
//     fetchData();
//   } finally {
//     setSaving(false);
//   }
// };
/* ── Save ── */
const handleSave = async () => {
  if (!form.moduleId || !form.title.trim() || !form.contentType) return;
  setSaving(true);
  try {
    if (editItem) {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        contentType: form.contentType,
       isActive: form.isActive,   // ← explicit cast, never drops false
        fileUrl: form.fileUrl || null,       // ← always send, even empty
        ...(form.order !== "" && { order: Number(form.order) }),
      };
      await fetch(`/api/lessons/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      const payload: Record<string, unknown> = {
        moduleId: form.moduleId,
        title: form.title.trim(),
        contentType: form.contentType,
        ...(form.fileUrl && { fileUrl: form.fileUrl }),
        ...(form.order !== "" && { order: Number(form.order) }),
      };
      await fetch("/api/lessons", {
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
      await fetch(`/api/lessons/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  // const isFormValid = form.moduleId && form.title.trim() && form.contentType;
  // Keep isFormValid as original — no isActive restriction
const isFormValid = form.moduleId && form.title.trim() && form.contentType;

  return (
    <div className="ls-page">
      {/* ── Header ── */}
      <div className="ls-header">
        <div>
          <h1 className="ls-title">Lessons</h1>
          <p className="ls-subtitle">Manage lessons across all course modules</p>
        </div>
        <button className="ls-btn-add" onClick={openAdd}>
          <span className="ls-btn-icon">+</span>
          Add Lesson
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="ls-toolbar">
        <div className="ls-search-wrap">
          <SearchIcon />
          <input
            className="ls-search"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="ls-filter-select"
          value={filterModule}
          onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}
        >
          <option value="">All Modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>

        <select
          className="ls-filter-select"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span className="ls-count">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="ls-table-wrap">
        <table className="ls-table">
          <thead>
            <tr>
              <th className="ls-th ls-th-no">Sr.No</th>
              <th className="ls-th">Title</th>
              <th className="ls-th">Module</th>
              <th className="ls-th ls-th-center">Content Type</th>
              <th className="ls-th ls-th-center">Order</th>
              <th className="ls-th ls-th-center">Status</th>
              <th className="ls-th">Created At</th>
              <th className="ls-th ls-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="ls-empty">
                  <div className="ls-spinner" />
                </td>
              </tr>
            ) : lessons.length === 0 ? (
              <tr>
                <td colSpan={8} className="ls-empty">
                  <EmptyIcon />
                  <p>No lessons found</p>
                </td>
              </tr>
            ) : (
              lessons.map((lesson, idx) => (
                <tr key={lesson.id} className="ls-tr">
                  <td className="ls-td ls-td-no">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="ls-td ls-td-name">{lesson.title}</td>
                  <td className="ls-td ls-td-module">{lesson.module?.title ?? "—"}</td>
                  <td className="ls-td ls-td-center">
                    <span className={`ls-badge-type ls-type-${lesson.contentType.toLowerCase()}`}>
                      {lesson.contentType}
                    </span>
                  </td>
                  <td className="ls-td ls-td-center ls-td-order">
                    {lesson.order ?? "—"}
                  </td>
                  <td className="ls-td ls-td-center">
                    <span className={`ls-badge-status ${lesson.isActive ? "active" : "inactive"}`}>
                      {lesson.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="ls-td ls-td-date">
                    {new Date(lesson.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="ls-td ls-td-actions">
                    <button className="ls-icon-btn edit" title="Edit" onClick={() => openEdit(lesson)}>
                      <EditIcon />
                    </button>
                    <button className="ls-icon-btn delete" title="Delete" onClick={() => setDeleteItem(lesson)}>
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
        <div className="ls-pagination">
          <button className="ls-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`ls-page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="ls-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next ›
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="ls-overlay" onClick={closeModal}>
          <div className="ls-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ls-modal-header">
              <h2 className="ls-modal-title">
                {editItem ? "Edit Lesson" : "Add Lesson"}
              </h2>
              <button className="ls-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="ls-modal-body">
              {/* Module */}
              <div className="ls-field">
                <label className="ls-label">
                  Module <span className="ls-req">*</span>
                </label>
                <select
                  className="ls-input"
                  value={form.moduleId}
                  onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                  disabled={!!editItem}
                >
                  <option value="">Select a module…</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="ls-field">
                <label className="ls-label">
                  Lesson Title <span className="ls-req">*</span>
                </label>
                <input
                  className="ls-input"
                  placeholder="e.g. Introduction to Variables"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Content Type */}
              <div className="ls-field">
                <label className="ls-label">
                  Content Type <span className="ls-req">*</span>
                </label>
                <select
                  className="ls-input"
                  value={form.contentType}
                  onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                >
                  <option value="">Select content type…</option>
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* File URL + Order side by side */}
              <div className="ls-field-grid">
                <div className="ls-field">
                  <label className="ls-label">File URL</label>
                  <input
                    className="ls-input"
                    placeholder="https://…"
                    value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  />
                </div>
                <div className="ls-field">
                  <label className="ls-label">Order</label>
                  <input
                    className="ls-input"
                    type="number"
                    min={0}
                    placeholder="e.g. 1"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                  />
                </div>
              </div>

              {/* Status toggle (edit only) */}
            {/* Status toggle (edit only) */}
{editItem && (
  <div className="ls-field ls-field-row">
    <label className="ls-label">Status</label>
    <div className="ls-toggle-wrap">
      <button
        type="button"
        className={`ls-toggle ${form.isActive ? "on" : ""}`}
        onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
      >
        <span className="ls-toggle-knob" />
      </button>
      <span className="ls-toggle-label">
        {form.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  </div>
)}
            </div>

            <div className="ls-modal-footer">
              <button className="ls-btn-cancel" onClick={closeModal}>Cancel</button>
              <button
                className="ls-btn-save"
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
        <div className="ls-overlay" onClick={() => setDeleteItem(null)}>
          <div className="ls-modal ls-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="ls-modal-header">
              <h2 className="ls-modal-title">Confirm Delete</h2>
              <button className="ls-modal-close" onClick={() => setDeleteItem(null)}>✕</button>
            </div>
            <div className="ls-modal-body">
              <div className="ls-delete-warn">
                <WarnIcon />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.title}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="ls-modal-footer">
              <button className="ls-btn-cancel" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button className="ls-btn-danger" onClick={handleDelete} disabled={deleting}>
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
  .ls-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* Header */
  .ls-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .ls-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .ls-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  /* Add Button */
  .ls-btn-add {
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
  .ls-btn-add:hover { background: #27500a; }
  .ls-btn-add:active { transform: scale(0.97); }
  .ls-btn-icon { font-size: 1.15rem; line-height: 1; font-weight: 400; }

  /* Toolbar */
  .ls-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }
  .ls-search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
    max-width: 300px;
    color: #64748b;
  }
  .ls-search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .ls-search {
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
  .ls-search::placeholder { color: #475569; }
  .ls-search:focus { border-color: #639922; }

  .ls-filter-select {
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
  .ls-filter-select:focus { border-color: #639922; color: #e2e8f0; }

  .ls-count {
    font-size: 0.8rem;
    color: #475569;
    white-space: nowrap;
    margin-left: auto;
  }

  /* Table */
  .ls-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .ls-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .ls-th {
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
  .ls-th-no { width: 56px; }
  .ls-th-center { text-align: center; }

  .ls-tr { transition: background 0.12s; }
  .ls-tr:hover { background: #1c2235; }
  .ls-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .ls-td {
    padding: 0.85rem 1.1rem;
    color: #cbd5e1;
    vertical-align: middle;
  }
  .ls-td-no    { color: #475569; font-size: 0.8rem; }
  .ls-td-name  { font-weight: 500; color: #e2e8f0; }
  .ls-td-module { font-size: 0.82rem; color: #94a3b8; }
  .ls-td-center { text-align: center; }
  .ls-td-order { font-size: 0.82rem; color: #64748b; }
  .ls-td-date  { font-size: 0.82rem; color: #64748b; }
  .ls-td-actions { text-align: center; }

  /* Content Type Badge */
  .ls-badge-type {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    background: #1e2a40;
    color: #7dd3fc;
    border: 1px solid #1e4a72;
  }
  .ls-type-video   { background: #1a1a3e; color: #a78bfa; border-color: #4c1d95; }
  .ls-type-pdf     { background: #2a1a1a; color: #fca5a5; border-color: #7f1d1d; }
  .ls-type-audio   { background: #1a2a1a; color: #86efac; border-color: #14532d; }
  .ls-type-text    { background: #1e2a40; color: #7dd3fc; border-color: #1e4a72; }
  .ls-type-quiz    { background: #2a2010; color: #fcd34d; border-color: #78350f; }
  .ls-type-assignment { background: #1a2030; color: #94a3b8; border-color: #2d3448; }

  /* Status Badge */
  .ls-badge-status {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .ls-badge-status.active {
    background: #0f2d1a;
    color: #4ade80;
    border: 1px solid #166534;
  }
  .ls-badge-status.inactive {
    background: #2a1a1a;
    color: #f87171;
    border: 1px solid #7f1d1d;
  }

  /* Action Icons */
  .ls-icon-btn {
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
  .ls-icon-btn.edit { color: #60a5fa; }
  .ls-icon-btn.edit:hover { background: #0c253d; border-color: #1e4a72; color: #93c5fd; }
  .ls-icon-btn.delete { color: #f87171; }
  .ls-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
  .ls-icon-btn:active { transform: scale(0.9); }

  /* Empty / Loading */
  .ls-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
    font-size: 0.875rem;
  }
  .ls-empty p { margin: 0; }
  .ls-spinner {
    width: 28px; height: 28px;
    border: 2px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: ls-spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes ls-spin { to { transform: rotate(360deg); } }

  /* Pagination */
  .ls-pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 1.5rem;
  }
  .ls-page-btn {
    padding: 0.4rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 7px;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .ls-page-btn:hover:not(:disabled) { background: #1c2235; color: #e2e8f0; }
  .ls-page-btn.active { background: #27500a; border-color: #3b6d11; color: #c0dd97; font-weight: 500; }
  .ls-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Modal */
  .ls-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: ls-fadeIn 0.15s ease;
  }
  @keyframes ls-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .ls-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 500px;
    margin: 1rem;
    animation: ls-slideUp 0.2s ease;
  }
  .ls-modal-sm { max-width: 380px; }
  @keyframes ls-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ls-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .ls-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .ls-modal-close {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 1rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
  }
  .ls-modal-close:hover { color: #e2e8f0; background: #2d3448; }

  .ls-modal-body { padding: 1.4rem; }
  .ls-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* Form */
  .ls-field { margin-bottom: 1.1rem; }
  .ls-field:last-child { margin-bottom: 0; }
  .ls-field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ls-field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
    margin-bottom: 1.1rem;
  }
  .ls-field-grid .ls-field { margin-bottom: 0; }

  .ls-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .ls-field-row .ls-label { margin-bottom: 0; }
  .ls-req { color: #f87171; }

  .ls-input {
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
  .ls-input::placeholder { color: #475569; }
  .ls-input:focus { border-color: #639922; }
  .ls-input:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Toggle */
  .ls-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .ls-toggle {
    width: 40px; height: 22px;
    border-radius: 11px;
    background: #2d3448;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    padding: 0;
  }
  .ls-toggle.on { background: #3b6d11; }
  .ls-toggle-knob {
    position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .ls-toggle.on .ls-toggle-knob { transform: translateX(18px); }
  .ls-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  /* Buttons */
  .ls-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .ls-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }

  .ls-btn-save {
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
  .ls-btn-save:hover:not(:disabled) { background: #27500a; }
  .ls-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .ls-btn-danger {
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
  .ls-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .ls-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Delete warn */
  .ls-delete-warn { display: flex; gap: 14px; align-items: flex-start; }
  .ls-delete-warn p { font-size: 0.875rem; color: #94a3b8; margin: 0; line-height: 1.6; }
  .ls-delete-warn strong { color: #e2e8f0; }
`;