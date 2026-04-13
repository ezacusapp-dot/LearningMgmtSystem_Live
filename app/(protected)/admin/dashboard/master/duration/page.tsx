"use client";

import { useEffect, useState } from "react";

interface DurationType {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: DurationType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT = 10;

export default function Duration() {
  const [durations, setDurations] = useState<DurationType[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<DurationType | null>(null);
  const [deleteItem, setDeleteItem] = useState<DurationType | null>(null);

  const [form, setForm] = useState({ name: "", sortOrder: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/duration?page=${page}&limit=${LIMIT}&search=${search}`
      );
      const json: PaginatedResponse = await res.json();
      if (json.success) {
        setDurations(json.data);
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

  const openEdit = (item: DurationType) => {
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
      if (editItem) {
        const payload: Record<string, unknown> = {
          name: form.name.trim(),
          isActive: form.isActive,
        };
        if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

        await fetch(`/api/duration/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const payload: Record<string, unknown> = {
          name: form.name.trim(),
        };
        if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

        await fetch("/api/duration", {
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
      await fetch(`/api/duration/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dt-page">
      {/* ── Header ── */}
      <div className="dt-header">
        <div>
          <h1 className="dt-title">Duration Types</h1>
          <p className="dt-subtitle">Manage master data for course duration types</p>
        </div>
        <button className="dt-btn-add" onClick={openAdd}>
          <span className="dt-btn-icon">+</span>
          Add Duration Type
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="dt-toolbar">
        <div className="dt-search-wrap">
          <SearchIcon />
          <input
            className="dt-search"
            placeholder="Search duration types..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className="dt-count">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              <th className="dt-th dt-th-no">Sr.No</th>
              <th className="dt-th">Duration Type Name</th>
              <th className="dt-th dt-th-center">Status</th>
              <th className="dt-th">Created At</th>
              <th className="dt-th dt-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="dt-empty">
                  <div className="dt-spinner" />
                </td>
              </tr>
            ) : durations.length === 0 ? (
              <tr>
                <td colSpan={5} className="dt-empty">
                  <EmptyIcon />
                  <p>No duration types found</p>
                </td>
              </tr>
            ) : (
              durations.map((dt, idx) => (
                <tr key={dt.id} className="dt-tr">
                  <td className="dt-td dt-td-no">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td className="dt-td dt-td-name">{dt.name}</td>
                  <td className="dt-td dt-td-center">
                    <span
                      className={`dt-badge-status ${dt.isActive ? "active" : "inactive"}`}
                    >
                      {dt.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="dt-td dt-td-date">
                    {new Date(dt.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="dt-td dt-td-actions">
                    <button
                      className="dt-icon-btn edit"
                      title="Edit"
                      onClick={() => openEdit(dt)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="dt-icon-btn delete"
                      title="Delete"
                      onClick={() => setDeleteItem(dt)}
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
        <div className="dt-pagination">
          <button
            className="dt-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`dt-page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="dt-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="dt-overlay" onClick={closeModal}>
          <div className="dt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h2 className="dt-modal-title">
                {editItem ? "Edit Duration Type" : "Add Duration Type"}
              </h2>
              <button className="dt-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="dt-modal-body">
              <div className="dt-field">
                <label className="dt-label">
                  Duration Type Name <span className="dt-req">*</span>
                </label>
                <input
                  className="dt-input"
                  placeholder="e.g. Monthly"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {editItem && (
                <div className="dt-field dt-field-row">
                  <label className="dt-label">Status</label>
                  <div className="dt-toggle-wrap">
                    <button
                      className={`dt-toggle ${form.isActive ? "on" : ""}`}
                      onClick={() =>
                        setForm({ ...form, isActive: !form.isActive })
                      }
                    >
                      <span className="dt-toggle-knob" />
                    </button>
                    <span className="dt-toggle-label">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="dt-modal-footer">
              <button className="dt-btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="dt-btn-save"
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
        <div className="dt-overlay" onClick={() => setDeleteItem(null)}>
          <div
            className="dt-modal dt-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dt-modal-header">
              <h2 className="dt-modal-title">Confirm Delete</h2>
              <button
                className="dt-modal-close"
                onClick={() => setDeleteItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="dt-modal-body">
              <div className="dt-delete-warn">
                <WarnIcon />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.name}</strong>? This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="dt-modal-footer">
              <button
                className="dt-btn-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="dt-btn-danger"
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
  .dt-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* ── Header ── */
  .dt-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .dt-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .dt-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  /* ── Add Button ── */
  .dt-btn-add {
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
  .dt-btn-add:hover { background: #27500a; }
  .dt-btn-add:active { transform: scale(0.97); }
  .dt-btn-icon {
    font-size: 1.15rem;
    line-height: 1;
    font-weight: 400;
  }

  /* ── Toolbar ── */
  .dt-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .dt-search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
    color: #64748b;
  }
  .dt-search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .dt-search {
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
  .dt-search::placeholder { color: #475569; }
  .dt-search:focus { border-color: #639922; }
  .dt-count {
    font-size: 0.8rem;
    color: #475569;
    white-space: nowrap;
  }

  /* ── Table ── */
  .dt-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .dt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .dt-th {
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
  .dt-th-no  { width: 56px; }
  .dt-th-center { text-align: center; }

  .dt-tr { transition: background 0.12s; }
  .dt-tr:hover { background: #1c2235; }
  .dt-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .dt-td {
    padding: 0.85rem 1.1rem;
    color: #cbd5e1;
    vertical-align: middle;
  }
  .dt-td-no   { color: #475569; font-size: 0.8rem; }
  .dt-td-name { font-weight: 500; color: #e2e8f0; }
  .dt-td-center { text-align: center; }
  .dt-td-date { font-size: 0.82rem; color: #64748b; }
  .dt-td-actions { text-align: center; }

  /* ── Badges ── */
  .dt-badge-status {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .dt-badge-status.active {
    background: #0f2d1a;
    color: #4ade80;
    border: 1px solid #166534;
  }
  .dt-badge-status.inactive {
    background: #2a1a1a;
    color: #f87171;
    border: 1px solid #7f1d1d;
  }

  /* ── Action Icons ── */
  .dt-icon-btn {
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
  .dt-icon-btn.edit { color: #60a5fa; }
  .dt-icon-btn.edit:hover {
    background: #0c253d;
    border-color: #1e4a72;
    color: #93c5fd;
  }
  .dt-icon-btn.delete { color: #f87171; }
  .dt-icon-btn.delete:hover {
    background: #2a0d0d;
    border-color: #7f1d1d;
    color: #fca5a5;
  }
  .dt-icon-btn:active { transform: scale(0.9); }

  /* ── Empty / Loading ── */
  .dt-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
    font-size: 0.875rem;
  }
  .dt-empty p { margin: 0; }
  .dt-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: dt-spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes dt-spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .dt-pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 1.5rem;
  }
  .dt-page-btn {
    padding: 0.4rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 7px;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .dt-page-btn:hover:not(:disabled) {
    background: #1c2235;
    color: #e2e8f0;
  }
  .dt-page-btn.active {
    background: #27500a;
    border-color: #3b6d11;
    color: #c0dd97;
    font-weight: 500;
  }
  .dt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Modal Overlay ── */
  .dt-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: dt-fadeIn 0.15s ease;
  }
  @keyframes dt-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .dt-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 460px;
    margin: 1rem;
    animation: dt-slideUp 0.2s ease;
  }
  .dt-modal-sm { max-width: 380px; }
  @keyframes dt-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dt-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .dt-modal-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .dt-modal-close {
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
  .dt-modal-close:hover { color: #e2e8f0; background: #2d3448; }

  .dt-modal-body { padding: 1.4rem; }
  .dt-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* ── Form Fields ── */
  .dt-field { margin-bottom: 1.1rem; }
  .dt-field:last-child { margin-bottom: 0; }
  .dt-field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dt-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .dt-field-row .dt-label { margin-bottom: 0; }
  .dt-req { color: #f87171; }
  .dt-input {
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
  .dt-input::placeholder { color: #475569; }
  .dt-input:focus { border-color: #639922; }

  /* ── Toggle ── */
  .dt-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .dt-toggle {
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
  .dt-toggle.on { background: #3b6d11; }
  .dt-toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .dt-toggle.on .dt-toggle-knob { transform: translateX(18px); }
  .dt-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  /* ── Modal Buttons ── */
  .dt-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .dt-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }

  .dt-btn-save {
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
  .dt-btn-save:hover:not(:disabled) { background: #27500a; }
  .dt-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .dt-btn-danger {
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
  .dt-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .dt-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Delete Warning ── */
  .dt-delete-warn {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .dt-delete-warn p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.6;
  }
  .dt-delete-warn strong { color: #e2e8f0; }
`;
