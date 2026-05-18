"use client";

import { useEffect, useState } from "react";

interface Grade {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: Grade[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 10;

export default function GradePage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Grade | null>(null);
  const [deleteItem, setDeleteItem] = useState<Grade | null>(null);

  const [form, setForm] = useState({
    name: "",
    // minMarks: "",
    // maxMarks: "",
    sortOrder: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/grade?page=${page}&limit=${LIMIT}&search=${search}`
      );
      const json: PaginatedResponse = await res.json();
      if (json.success) {
        setGrades(json.data);
        setTotal(json.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", sortOrder: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (item: Grade) => {
    setEditItem(item);
    setForm({
      name: item.name,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        isActive: form.isActive,
      };
      // if (form.minMarks !== "") payload.minMarks = Number(form.minMarks);
      // if (form.maxMarks !== "") payload.maxMarks = Number(form.maxMarks);
      if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

      if (editItem) {
        await fetch(`/api/grade/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/grade", {
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

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await fetch(`/api/grade/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="gr-page">
      {/* ── Header ── */}
      <div className="gr-header">
        <div>
          <h1 className="gr-title">Grades</h1>
          <p className="gr-subtitle">Manage master data for grade configurations</p>
        </div>
        <button className="gr-btn-add" onClick={openAdd}>
          <span className="gr-btn-icon">+</span>
          Add Grade
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="gr-toolbar">
        <div className="gr-search-wrap">
          <SearchIcon />
          <input
            className="gr-search"
            placeholder="Search grades..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className="gr-count">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="gr-table-wrap">
        <table className="gr-table">
          <thead>
            <tr>
              <th className="gr-th gr-th-no">Sr.No</th>
              <th className="gr-th">Grade Name</th>
              {/* <th className="gr-th gr-th-center">Min Marks</th>
              <th className="gr-th gr-th-center">Max Marks</th> */}
              <th className="gr-th gr-th-center">Status</th>
              <th className="gr-th">Created At</th>
              <th className="gr-th gr-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="gr-empty">
                  <div className="gr-spinner" />
                </td>
              </tr>
            ) : grades.length === 0 ? (
              <tr>
                <td colSpan={7} className="gr-empty">
                  <EmptyIcon />
                  <p>No grades found</p>
                </td>
              </tr>
            ) : (
              grades.map((grade, idx) => (
                <tr key={grade.id} className="gr-tr">
                  <td className="gr-td gr-td-no">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td className="gr-td gr-td-name">{grade.name}</td>
                  {/* <td className="gr-td gr-td-center">
                    {grade.minMarks !== undefined && grade.minMarks !== null ? (
                      <span className="gr-badge-marks">{grade.minMarks}</span>
                    ) : (
                      <span className="gr-dash">—</span>
                    )}
                  </td>
                  <td className="gr-td gr-td-center">
                    {grade.maxMarks !== undefined && grade.maxMarks !== null ? (
                      <span className="gr-badge-marks">{grade.maxMarks}</span>
                    ) : (
                      <span className="gr-dash">—</span>
                    )}
                  </td> */}
                  <td className="gr-td gr-td-center">
                    <span
                      className={`gr-badge-status ${grade.isActive ? "active" : "inactive"}`}
                    >
                      {grade.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="gr-td gr-td-date">
                    {new Date(grade.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="gr-td gr-td-actions">
                    <button
                      className="gr-icon-btn edit"
                      title="Edit"
                      onClick={() => openEdit(grade)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="gr-icon-btn delete"
                      title="Delete"
                      onClick={() => setDeleteItem(grade)}
                    >
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
        <div className="gr-pagination">
          <button
            className="gr-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`gr-page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="gr-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="gr-overlay" onClick={closeModal}>
          <div className="gr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gr-modal-header">
              <h2 className="gr-modal-title">
                {editItem ? "Edit Grade" : "Add Grade"}
              </h2>
              <button className="gr-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="gr-modal-body">
              <div className="gr-field">
                <label className="gr-label">
                  Grade Name <span className="gr-req">*</span>
                </label>
                <input
                  className="gr-input"
                  placeholder="First Class"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* <div className="gr-field-row-2">
                <div className="gr-field">
                  <label className="gr-label">Min Marks</label>
                  <input
                    className="gr-input"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 60"
                    value={form.minMarks}
                    onChange={(e) =>
                      setForm({ ...form, minMarks: e.target.value })
                    }
                  />
                </div>
                <div className="gr-field">
                  <label className="gr-label">Max Marks</label>
                  <input
                    className="gr-input"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 100"
                    value={form.maxMarks}
                    onChange={(e) =>
                      setForm({ ...form, maxMarks: e.target.value })
                    }
                  />
                </div>
              </div> */}

              {editItem && (
                <div className="gr-field gr-field-inline">
                  <label className="gr-label">Status</label>
                  <div className="gr-toggle-wrap">
                    <button
                      className={`gr-toggle ${form.isActive ? "on" : ""}`}
                      onClick={() =>
                        setForm({ ...form, isActive: !form.isActive })
                      }
                    >
                      <span className="gr-toggle-knob" />
                    </button>
                    <span className="gr-toggle-label">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="gr-modal-footer">
              <button className="gr-btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="gr-btn-save"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
              >
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteItem && (
        <div className="gr-overlay" onClick={() => setDeleteItem(null)}>
          <div
            className="gr-modal gr-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gr-modal-header">
              <h2 className="gr-modal-title">Confirm Delete</h2>
              <button
                className="gr-modal-close"
                onClick={() => setDeleteItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="gr-modal-body">
              <div className="gr-delete-warn">
                <WarnIcon />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.name}</strong>? This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="gr-modal-footer">
              <button
                className="gr-btn-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="gr-btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
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

/* ──────────────────────────────────────────────
   Inline SVG Icons
────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────
   Styles
────────────────────────────────────────────── */

const styles = `
  /* ── Layout ── */
  .gr-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* ── Header ── */
  .gr-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .gr-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .gr-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  /* ── Add Button ── */
  .gr-btn-add {
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
  .gr-btn-add:hover { background: #27500a; }
  .gr-btn-add:active { transform: scale(0.97); }
  .gr-btn-icon {
    font-size: 1.15rem;
    line-height: 1;
    font-weight: 400;
  }

  /* ── Toolbar ── */
  .gr-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .gr-search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
    color: #64748b;
  }
  .gr-search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .gr-search {
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
  .gr-search::placeholder { color: #475569; }
  .gr-search:focus { border-color: #639922; }
  .gr-count {
    font-size: 0.8rem;
    color: #475569;
    white-space: nowrap;
  }

  /* ── Table ── */
  .gr-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .gr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .gr-th {
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
  .gr-th-no  { width: 56px; }
  .gr-th-center { text-align: center; }

  .gr-tr { transition: background 0.12s; }
  .gr-tr:hover { background: #1c2235; }
  .gr-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .gr-td {
    padding: 0.85rem 1.1rem;
    color: #cbd5e1;
    vertical-align: middle;
  }
  .gr-td-no   { color: #475569; font-size: 0.8rem; }
  .gr-td-name { font-weight: 500; color: #e2e8f0; }
  .gr-td-center { text-align: center; }
  .gr-td-date { font-size: 0.82rem; color: #64748b; }
  .gr-td-actions { text-align: center; }

  /* ── Badges ── */
  .gr-badge-marks {
    display: inline-block;
    padding: 2px 10px;
    background: #1e2a40;
    color: #7dd3fc;
    border: 1px solid #1e4a72;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .gr-dash {
    color: #334155;
    font-size: 0.9rem;
  }
  .gr-badge-status {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .gr-badge-status.active {
    background: #0f2d1a;
    color: #4ade80;
    border: 1px solid #166534;
  }
  .gr-badge-status.inactive {
    background: #2a1a1a;
    color: #f87171;
    border: 1px solid #7f1d1d;
  }

  /* ── Action Icons ── */
  .gr-icon-btn {
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
  .gr-icon-btn.edit { color: #60a5fa; }
  .gr-icon-btn.edit:hover {
    background: #0c253d;
    border-color: #1e4a72;
    color: #93c5fd;
  }
  .gr-icon-btn.delete { color: #f87171; }
  .gr-icon-btn.delete:hover {
    background: #2a0d0d;
    border-color: #7f1d1d;
    color: #fca5a5;
  }
  .gr-icon-btn:active { transform: scale(0.9); }

  /* ── Empty / Loading ── */
  .gr-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
    font-size: 0.875rem;
  }
  .gr-empty p { margin: 0; }
  .gr-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: gr-spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes gr-spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .gr-pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 1.5rem;
  }
  .gr-page-btn {
    padding: 0.4rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 7px;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .gr-page-btn:hover:not(:disabled) {
    background: #1c2235;
    color: #e2e8f0;
  }
  .gr-page-btn.active {
    background: #27500a;
    border-color: #3b6d11;
    color: #c0dd97;
    font-weight: 500;
  }
  .gr-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Modal Overlay ── */
  .gr-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: gr-fadeIn 0.15s ease;
  }
  @keyframes gr-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .gr-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 460px;
    margin: 1rem;
    animation: gr-slideUp 0.2s ease;
  }
  .gr-modal-sm { max-width: 380px; }
  @keyframes gr-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gr-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .gr-modal-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .gr-modal-close {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 1rem;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
  }
  .gr-modal-close:hover { color: #e2e8f0; background: #2d3448; }

  .gr-modal-body { padding: 1.4rem; }
  .gr-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* ── Form Fields ── */
  .gr-field { margin-bottom: 1.1rem; }
  .gr-field:last-child { margin-bottom: 0; }
  .gr-field-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 1.1rem;
  }
  .gr-field-row-2 .gr-field { margin-bottom: 0; }
  .gr-field-inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .gr-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .gr-field-inline .gr-label { margin-bottom: 0; }
  .gr-req { color: #f87171; }
  .gr-input {
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
  }
  .gr-input::placeholder { color: #475569; }
  .gr-input:focus { border-color: #639922; }

  /* ── Toggle ── */
  .gr-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .gr-toggle {
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: #2d3448;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    padding: 0;
  }
  .gr-toggle.on { background: #3b6d11; }
  .gr-toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .gr-toggle.on .gr-toggle-knob { transform: translateX(18px); }
  .gr-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  /* ── Modal Buttons ── */
  .gr-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .gr-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }

  .gr-btn-save {
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
  .gr-btn-save:hover:not(:disabled) { background: #27500a; }
  .gr-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .gr-btn-danger {
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
  .gr-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .gr-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Delete Warning ── */
  .gr-delete-warn {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .gr-delete-warn p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.6;
  }
  .gr-delete-warn strong { color: #e2e8f0; }
`;
