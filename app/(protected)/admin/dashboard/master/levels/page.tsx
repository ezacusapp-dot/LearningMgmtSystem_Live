"use client";

import { useEffect, useState } from "react";

interface Level {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: Level[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT = 10;

export default function LevelPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Level | null>(null);
  const [deleteItem, setDeleteItem] = useState<Level | null>(null);

  const [form, setForm] = useState({ name: "", sortOrder: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/levels?page=${page}&limit=${LIMIT}&search=${search}`
      );
      const json: PaginatedResponse = await res.json();
      if (json.success) {
        setLevels(json.data);
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", sortOrder: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (item: Level) => {
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

  // const handleSave = async () => {
  //   if (!form.name.trim()) return;
  //   setSaving(true);
  //   try {
  //     const payload: Record<string, unknown> = {
  //       name: form.name.trim(),
  //       isActive: form.isActive,
  //     };
  //     if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

  //     if (editItem) {
  //       await fetch(`/api/levels/${editItem.id}`, {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });
  //     } else {
  //       await fetch("/api/levels", {
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
const handleSave = async () => {
  if (!form.name.trim()) return;
  setSaving(true);
  try {
    if (editItem) {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        isActive: form.isActive,
      };
      if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

      await fetch(`/api/levels/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
      };
      if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

      await fetch("/api/levels", {
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
      await fetch(`/api/levels/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="lv-page">
      {/* ── Header ── */}
      <div className="lv-header">
        <div>
          <h1 className="lv-title">Course Levels</h1>
          <p className="lv-subtitle">Manage master data for course levels</p>
        </div>
        <button className="lv-btn-add" onClick={openAdd}>
          <span className="lv-btn-icon">+</span>
          Add Level
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="lv-toolbar">
        <div className="lv-search-wrap">
          <SearchIcon />
          <input
            className="lv-search"
            placeholder="Search levels..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className="lv-count">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="lv-table-wrap">
        <table className="lv-table">
          <thead>
            <tr>
              <th className="lv-th lv-th-no">Sr.No</th>
              <th className="lv-th">Level Name</th>
              <th className="lv-th lv-th-center">Status</th>
              <th className="lv-th">Created At</th>
              <th className="lv-th lv-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="lv-empty">
                  <div className="lv-spinner" />
                </td>
              </tr>
            ) : levels.length === 0 ? (
              <tr>
                <td colSpan={5} className="lv-empty">
                  <EmptyIcon />
                  <p>No levels found</p>
                </td>
              </tr>
            ) : (
              levels.map((lvl, idx) => (
                <tr key={lvl.id} className="lv-tr">
                  <td className="lv-td lv-td-no">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td className="lv-td lv-td-name">{lvl.name}</td>
                  <td className="lv-td lv-td-center">
                    <span
                      className={`lv-badge-status ${lvl.isActive ? "active" : "inactive"}`}
                    >
                      {lvl.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="lv-td lv-td-date">
                    {new Date(lvl.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="lv-td lv-td-actions">
                    <button
                      className="lv-icon-btn edit"
                      title="Edit"
                      onClick={() => openEdit(lvl)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="lv-icon-btn delete"
                      title="Delete"
                      onClick={() => setDeleteItem(lvl)}
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
        <div className="lv-pagination">
          <button
            className="lv-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`lv-page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="lv-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="lv-overlay" onClick={closeModal}>
          <div className="lv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lv-modal-header">
              <h2 className="lv-modal-title">
                {editItem ? "Edit Level" : "Add Level"}
              </h2>
              <button className="lv-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="lv-modal-body">
              <div className="lv-field">
                <label className="lv-label">
                  Level Name <span className="lv-req">*</span>
                </label>
                <input
                  className="lv-input"
                  placeholder="e.g. Beginner"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {editItem && (
                <div className="lv-field lv-field-row">
                  <label className="lv-label">Status</label>
                  <div className="lv-toggle-wrap">
                    <button
                      className={`lv-toggle ${form.isActive ? "on" : ""}`}
                      onClick={() =>
                        setForm({ ...form, isActive: !form.isActive })
                      }
                    >
                      <span className="lv-toggle-knob" />
                    </button>
                    <span className="lv-toggle-label">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="lv-modal-footer">
              <button className="lv-btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="lv-btn-save"
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
        <div className="lv-overlay" onClick={() => setDeleteItem(null)}>
          <div
            className="lv-modal lv-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lv-modal-header">
              <h2 className="lv-modal-title">Confirm Delete</h2>
              <button
                className="lv-modal-close"
                onClick={() => setDeleteItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="lv-modal-body">
              <div className="lv-delete-warn">
                <WarnIcon />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.name}</strong>? This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="lv-modal-footer">
              <button
                className="lv-btn-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="lv-btn-danger"
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
  .lv-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* ── Header ── */
  .lv-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .lv-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .lv-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  /* ── Add Button ── */
  .lv-btn-add {
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
  .lv-btn-add:hover { background: #27500a; }
  .lv-btn-add:active { transform: scale(0.97); }
  .lv-btn-icon {
    font-size: 1.15rem;
    line-height: 1;
    font-weight: 400;
  }

  /* ── Toolbar ── */
  .lv-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .lv-search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
    color: #64748b;
  }
  .lv-search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .lv-search {
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
  .lv-search::placeholder { color: #475569; }
  .lv-search:focus { border-color: #639922; }
  .lv-count {
    font-size: 0.8rem;
    color: #475569;
    white-space: nowrap;
  }

  /* ── Table ── */
  .lv-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .lv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .lv-th {
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
  .lv-th-no  { width: 56px; }
  .lv-th-center { text-align: center; }

  .lv-tr { transition: background 0.12s; }
  .lv-tr:hover { background: #1c2235; }
  .lv-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .lv-td {
    padding: 0.85rem 1.1rem;
    color: #cbd5e1;
    vertical-align: middle;
  }
  .lv-td-no   { color: #475569; font-size: 0.8rem; }
  .lv-td-name { font-weight: 500; color: #e2e8f0; }
  .lv-td-center { text-align: center; }
  .lv-td-date { font-size: 0.82rem; color: #64748b; }
  .lv-td-actions { text-align: center; }

  /* ── Badges ── */
  .lv-badge-status {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .lv-badge-status.active {
    background: #0f2d1a;
    color: #4ade80;
    border: 1px solid #166534;
  }
  .lv-badge-status.inactive {
    background: #2a1a1a;
    color: #f87171;
    border: 1px solid #7f1d1d;
  }

  /* ── Action Icons ── */
  .lv-icon-btn {
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
  .lv-icon-btn.edit { color: #60a5fa; }
  .lv-icon-btn.edit:hover {
    background: #0c253d;
    border-color: #1e4a72;
    color: #93c5fd;
  }
  .lv-icon-btn.delete { color: #f87171; }
  .lv-icon-btn.delete:hover {
    background: #2a0d0d;
    border-color: #7f1d1d;
    color: #fca5a5;
  }
  .lv-icon-btn:active { transform: scale(0.9); }

  /* ── Empty / Loading ── */
  .lv-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
    font-size: 0.875rem;
  }
  .lv-empty p { margin: 0; }
  .lv-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: lv-spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes lv-spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .lv-pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 1.5rem;
  }
  .lv-page-btn {
    padding: 0.4rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 7px;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .lv-page-btn:hover:not(:disabled) {
    background: #1c2235;
    color: #e2e8f0;
  }
  .lv-page-btn.active {
    background: #27500a;
    border-color: #3b6d11;
    color: #c0dd97;
    font-weight: 500;
  }
  .lv-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Modal Overlay ── */
  .lv-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: lv-fadeIn 0.15s ease;
  }
  @keyframes lv-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .lv-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 460px;
    margin: 1rem;
    animation: lv-slideUp 0.2s ease;
  }
  .lv-modal-sm { max-width: 380px; }
  @keyframes lv-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lv-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .lv-modal-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .lv-modal-close {
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
  .lv-modal-close:hover { color: #e2e8f0; background: #2d3448; }

  .lv-modal-body { padding: 1.4rem; }
  .lv-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* ── Form Fields ── */
  .lv-field { margin-bottom: 1.1rem; }
  .lv-field:last-child { margin-bottom: 0; }
  .lv-field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lv-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .lv-field-row .lv-label { margin-bottom: 0; }
  .lv-req { color: #f87171; }
  .lv-input {
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
  .lv-input::placeholder { color: #475569; }
  .lv-input:focus { border-color: #639922; }

  /* ── Toggle ── */
  .lv-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .lv-toggle {
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
  .lv-toggle.on { background: #3b6d11; }
  .lv-toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .lv-toggle.on .lv-toggle-knob { transform: translateX(18px); }
  .lv-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  /* ── Modal Buttons ── */
  .lv-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .lv-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }

  .lv-btn-save {
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
  .lv-btn-save:hover:not(:disabled) { background: #27500a; }
  .lv-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .lv-btn-danger {
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
  .lv-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .lv-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Delete Warning ── */
  .lv-delete-warn {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .lv-delete-warn p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.6;
  }
  .lv-delete-warn strong { color: #e2e8f0; }
`;
