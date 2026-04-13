"use client";

import { useEffect, useState } from "react";

interface AwardCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: AwardCategory[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 10;

export default function AwardCategoryPage() {
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AwardCategory | null>(null);
  const [deleteItem, setDeleteItem] = useState<AwardCategory | null>(null);

  const [form, setForm] = useState({ name: "", sortOrder: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `/api/award-categories?page=${page}&limit=${LIMIT}&search=${search}`
    );

    const json: PaginatedResponse = await res.json();

    if (json.success) {
      setCategories(json.data);
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

  const openEdit = (item: AwardCategory) => {
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
      if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

      if (editItem) {
        await fetch(`/api/award-categories/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/award-categories", {
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
      await fetch(`/api/award-categories/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ac-page">
      {/* ── Header ── */}
      <div className="ac-header">
        <div>
          <h1 className="ac-title">Award Categories</h1>
          <p className="ac-subtitle">Manage master data for award categories</p>
        </div>
        <button className="ac-btn-add" onClick={openAdd}>
          <span className="ac-btn-icon">+</span>
          Add Category
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="ac-toolbar">
        <div className="ac-search-wrap">
          <SearchIcon />
          <input
            className="ac-search"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className="ac-count">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="ac-table-wrap">
        <table className="ac-table">
          <thead>
            <tr>
              <th className="ac-th ac-th-no">Sr.No</th>
              <th className="ac-th">Category Name</th>
              {/* <th className="ac-th ac-th-center">Sort Order</th> */}
              <th className="ac-th ac-th-center">Status</th>
              <th className="ac-th">Created At</th>
              <th className="ac-th ac-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="ac-empty">
                  <div className="ac-spinner" />
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="ac-empty">
                  <EmptyIcon />
                  <p>No categories found</p>
                </td>
              </tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={cat.id} className="ac-tr">
                  <td className="ac-td ac-td-no">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td className="ac-td ac-td-name">{cat.name}</td>
                  {/* <td className="ac-td ac-td-center">
                    <span className="ac-badge-order">{cat.sortOrder}</span>
                  </td> */}
                  <td className="ac-td ac-td-center">
                    <span
                      className={`ac-badge-status ${cat.isActive ? "active" : "inactive"}`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="ac-td ac-td-date">
                    {new Date(cat.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="ac-td ac-td-actions">
                    <button
                      className="ac-icon-btn edit"
                      title="Edit"
                      onClick={() => openEdit(cat)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="ac-icon-btn delete"
                      title="Delete"
                      onClick={() => setDeleteItem(cat)}
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
        <div className="ac-pagination">
          <button
            className="ac-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`ac-page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="ac-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="ac-overlay" onClick={closeModal}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-header">
              <h2 className="ac-modal-title">
                {editItem ? "Edit Category" : "Add Category"}
              </h2>
              <button className="ac-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="ac-modal-body">
              <div className="ac-field">
                <label className="ac-label">
                  Category Name <span className="ac-req">*</span>
                </label>
                <input
                  className="ac-input"
                  placeholder="e.g. Best Innovation"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* <div className="ac-field">
                <label className="ac-label">Sort Order</label>
                <input
                  className="ac-input"
                  type="number"
                  min={0}
                  placeholder="e.g. 1"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                />
              </div> */}

              {editItem && (
                <div className="ac-field ac-field-row">
                  <label className="ac-label">Status</label>
                  <div className="ac-toggle-wrap">
                    <button
                      className={`ac-toggle ${form.isActive ? "on" : ""}`}
                      onClick={() =>
                        setForm({ ...form, isActive: !form.isActive })
                      }
                    >
                      <span className="ac-toggle-knob" />
                    </button>
                    <span className="ac-toggle-label">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="ac-modal-footer">
              <button className="ac-btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="ac-btn-save"
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
        <div className="ac-overlay" onClick={() => setDeleteItem(null)}>
          <div
            className="ac-modal ac-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ac-modal-header">
              <h2 className="ac-modal-title">Confirm Delete</h2>
              <button
                className="ac-modal-close"
                onClick={() => setDeleteItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="ac-modal-body">
              <div className="ac-delete-warn">
                <WarnIcon />
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.name}</strong>? This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="ac-modal-footer">
              <button
                className="ac-btn-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="ac-btn-danger"
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
  .ac-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* ── Header ── */
  .ac-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .ac-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .ac-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  /* ── Add Button ── */
  .ac-btn-add {
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
  .ac-btn-add:hover { background: #27500a; }
  .ac-btn-add:active { transform: scale(0.97); }
  .ac-btn-icon {
    font-size: 1.15rem;
    line-height: 1;
    font-weight: 400;
  }

  /* ── Toolbar ── */
  .ac-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .ac-search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
    color: #64748b;
  }
  .ac-search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .ac-search {
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
  .ac-search::placeholder { color: #475569; }
  .ac-search:focus { border-color: #639922; }
  .ac-count {
    font-size: 0.8rem;
    color: #475569;
    white-space: nowrap;
  }

  /* ── Table ── */
  .ac-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .ac-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .ac-th {
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
  .ac-th-no  { width: 56px; }
  .ac-th-center { text-align: center; }

  .ac-tr { transition: background 0.12s; }
  .ac-tr:hover { background: #1c2235; }
  .ac-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .ac-td {
    padding: 0.85rem 1.1rem;
    color: #cbd5e1;
    vertical-align: middle;
  }
  .ac-td-no   { color: #475569; font-size: 0.8rem; }
  .ac-td-name { font-weight: 500; color: #e2e8f0; }
  .ac-td-center { text-align: center; }
  .ac-td-date { font-size: 0.82rem; color: #64748b; }
  .ac-td-actions { text-align: center; }

  /* ── Badges ── */
  .ac-badge-order {
    display: inline-block;
    padding: 2px 10px;
    background: #1e2a40;
    color: #7dd3fc;
    border: 1px solid #1e4a72;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .ac-badge-status {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .ac-badge-status.active {
    background: #0f2d1a;
    color: #4ade80;
    border: 1px solid #166534;
  }
  .ac-badge-status.inactive {
    background: #2a1a1a;
    color: #f87171;
    border: 1px solid #7f1d1d;
  }

  /* ── Action Icons ── */
  .ac-icon-btn {
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
  .ac-icon-btn.edit { color: #60a5fa; }
  .ac-icon-btn.edit:hover {
    background: #0c253d;
    border-color: #1e4a72;
    color: #93c5fd;
  }
  .ac-icon-btn.delete { color: #f87171; }
  .ac-icon-btn.delete:hover {
    background: #2a0d0d;
    border-color: #7f1d1d;
    color: #fca5a5;
  }
  .ac-icon-btn:active { transform: scale(0.9); }

  /* ── Empty / Loading ── */
  .ac-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
    font-size: 0.875rem;
  }
  .ac-empty p { margin: 0; }
  .ac-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .ac-pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 1.5rem;
  }
  .ac-page-btn {
    padding: 0.4rem 0.85rem;
    background: #1e2230;
    border: 1px solid #2d3448;
    border-radius: 7px;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .ac-page-btn:hover:not(:disabled) {
    background: #1c2235;
    color: #e2e8f0;
  }
  .ac-page-btn.active {
    background: #27500a;
    border-color: #3b6d11;
    color: #c0dd97;
    font-weight: 500;
  }
  .ac-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Modal Overlay ── */
  .ac-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .ac-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 460px;
    margin: 1rem;
    animation: slideUp 0.2s ease;
  }
  .ac-modal-sm { max-width: 380px; }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ac-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .ac-modal-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .ac-modal-close {
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
  .ac-modal-close:hover { color: #e2e8f0; background: #2d3448; }

  .ac-modal-body { padding: 1.4rem; }
  .ac-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* ── Form Fields ── */
  .ac-field { margin-bottom: 1.1rem; }
  .ac-field:last-child { margin-bottom: 0; }
  .ac-field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ac-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .ac-field-row .ac-label { margin-bottom: 0; }
  .ac-req { color: #f87171; }
  .ac-input {
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
  .ac-input::placeholder { color: #475569; }
  .ac-input:focus { border-color: #639922; }

  /* ── Toggle ── */
  .ac-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .ac-toggle {
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
  .ac-toggle.on { background: #3b6d11; }
  .ac-toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .ac-toggle.on .ac-toggle-knob { transform: translateX(18px); }
  .ac-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  /* ── Modal Buttons ── */
  .ac-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .ac-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }

  .ac-btn-save {
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
  .ac-btn-save:hover:not(:disabled) { background: #27500a; }
  .ac-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

  .ac-btn-danger {
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
  .ac-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .ac-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Delete Warning ── */
  .ac-delete-warn {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .ac-delete-warn p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.6;
  }
  .ac-delete-warn strong { color: #e2e8f0; }
`;
