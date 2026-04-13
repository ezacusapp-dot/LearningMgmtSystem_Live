// app/(dashboard)/course-categories/page.tsx
"use client";

import { useEffect, useState } from "react";

interface CourseCategory {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
  isDraft: boolean;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  status: boolean;
  data: CourseCategory[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const LIMIT = 10;
const DEFAULT_COLOR = "#639922";

export default function CourseCategoryPage() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(false);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<CourseCategory | null>(null);
  const [deleteItem, setDeleteItem] = useState<CourseCategory | null>(null);

  const [form, setForm] = useState({
    name: "", code: "", description: "",
    color: DEFAULT_COLOR, icon: "",
    isDraft: false, isActive: true,
  });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), search });
      const res  = await fetch(`/api/course-categories?${params}`);
      const json: PaginatedResponse = await res.json();
      if (json.status) {
        setCategories(json.data);
        setTotal(json.meta.total);
        setTotalPages(json.meta.totalPages);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]); // eslint-disable-line

  /* ── Modal helpers ── */
  const openAdd = () => {
    setEditItem(null);
    setForm({ name:"", code:"", description:"", color: DEFAULT_COLOR, icon:"", isDraft:false, isActive:true });
    setModalOpen(true);
  };
  const openEdit = (item: CourseCategory) => {
    setEditItem(item);
    setForm({
      name:        item.name,
      code:        item.code,
      description: item.description ?? "",
      color:       item.color       ?? DEFAULT_COLOR,
      icon:        item.icon        ?? "",
      isDraft:     item.isDraft,
      isActive:    item.isActive,
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        code:        form.code.trim(),
        isDraft:     form.isDraft,
        isActive:    form.isActive,
        ...(form.color       && { color:       form.color }),
        ...(form.description && { description: form.description }),
        ...(form.icon        && { icon:        form.icon }),
      };
      if (editItem) {
        await fetch(`/api/course-categories/${editItem.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/course-categories", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      closeModal(); fetchData();
    } finally { setSaving(false); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await fetch(`/api/course-categories/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null); fetchData();
    } finally { setDeleting(false); }
  };

  const isFormValid = form.name.trim() && form.code.trim();

  return (
    <div className="cc-page">

      {/* ── Header ── */}
      <div className="cc-header">
        <div>
          <h1 className="cc-title">Course Categories</h1>
          <p className="cc-subtitle">Manage categories for all courses</p>
        </div>
        <button className="cc-btn-add" onClick={openAdd}>
          <span className="cc-btn-icon">+</span>Add Category
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="cc-toolbar">
        <div className="cc-search-wrap">
          <SearchIcon />
          <input
            className="cc-search"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <span className="cc-count">{total} {total === 1 ? "record" : "records"}</span>
      </div>

      {/* ── Table ── */}
      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th className="cc-th cc-th-no">Sr.No</th>
              <th className="cc-th">Name</th>
              <th className="cc-th">Code</th>
              <th className="cc-th">Description</th>
              <th className="cc-th cc-th-center">Color</th>
              <th className="cc-th cc-th-center">Draft</th>
              <th className="cc-th cc-th-center">Status</th>
              <th className="cc-th">Created At</th>
              <th className="cc-th cc-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="cc-empty"><div className="cc-spinner" /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={9} className="cc-empty"><EmptyIcon /><p>No categories found</p></td></tr>
            ) : categories.map((cat, idx) => (
              <tr key={cat.id} className="cc-tr">
                <td className="cc-td cc-td-no">{(page - 1) * LIMIT + idx + 1}</td>
                <td className="cc-td cc-td-name">{cat.name}</td>
                <td className="cc-td">
                  <span className="cc-code-badge">{cat.code}</span>
                </td>
                <td className="cc-td cc-td-desc">
                  {cat.description
                    ? cat.description.length > 45 ? cat.description.slice(0, 45) + "…" : cat.description
                    : <span className="cc-td-empty">—</span>}
                </td>
                <td className="cc-td cc-td-center">
                  <span
                    className="cc-color-dot"
                    style={{ background: cat.color || DEFAULT_COLOR }}
                    title={cat.color || DEFAULT_COLOR}
                  />
                </td>
                <td className="cc-td cc-td-center">
                  <span className={`cc-badge-draft ${cat.isDraft ? "yes" : "no"}`}>
                    {cat.isDraft ? "Draft" : "Live"}
                  </span>
                </td>
                <td className="cc-td cc-td-center">
                  <span className={`cc-badge-status ${cat.isActive ? "active" : "inactive"}`}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="cc-td cc-td-date">
                  {new Date(cat.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                </td>
                <td className="cc-td cc-td-actions">
                  <button className="cc-icon-btn edit"   title="Edit"   onClick={() => openEdit(cat)}><EditIcon /></button>
                  <button className="cc-icon-btn delete" title="Delete" onClick={() => setDeleteItem(cat)}><DeleteIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="cc-pagination">
          <button className="cc-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`cc-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="cc-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="cc-overlay" onClick={closeModal}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h2 className="cc-modal-title">{editItem ? "Edit Category" : "Add Category"}</h2>
              <button className="cc-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="cc-modal-body">
              {/* Name + Code */}
              <div className="cc-field-grid2">
                <div className="cc-field">
                  <label className="cc-label">Name <span className="cc-req">*</span></label>
                  <input className="cc-input" placeholder="e.g. Web Development"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="cc-field">
                  <label className="cc-label">Code <span className="cc-req">*</span></label>
                  <input className="cc-input" placeholder="e.g. WEB-DEV"
                    value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                </div>
              </div>

              {/* Description */}
              <div className="cc-field">
                <label className="cc-label">Description</label>
                <textarea className="cc-textarea" rows={3} placeholder="Brief description…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Color + Icon */}
              <div className="cc-field-grid2">
                <div className="cc-field">
                  <label className="cc-label">Color</label>
                  <div className="cc-color-wrap">
                    <input type="color" className="cc-color-picker" value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })} />
                    <input className="cc-input cc-color-text" placeholder="#639922"
                      value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                  </div>
                </div>
                <div className="cc-field">
                  <label className="cc-label">Icon</label>
                  <input className="cc-input" placeholder="e.g. 💻 or icon name"
                    value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                </div>
              </div>

              {/* Toggles */}
              <div className="cc-toggles-row">
                {/* Draft toggle — always visible */}
                <div className="cc-field cc-field-row">
                  <label className="cc-label">Draft</label>
                  <div className="cc-toggle-wrap">
                    <button className={`cc-toggle ${form.isDraft ? "on" : ""}`}
                      onClick={() => setForm({ ...form, isDraft: !form.isDraft })}>
                      <span className="cc-toggle-knob" />
                    </button>
                    <span className="cc-toggle-label">{form.isDraft ? "Draft" : "Live"}</span>
                  </div>
                </div>

                {/* Status toggle — edit only */}
                {editItem && (
                  <div className="cc-field cc-field-row">
                    <label className="cc-label">Status</label>
                    <div className="cc-toggle-wrap">
                      <button className={`cc-toggle ${form.isActive ? "on" : ""}`}
                        onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                        <span className="cc-toggle-knob" />
                      </button>
                      <span className="cc-toggle-label">{form.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="cc-modal-footer">
              <button className="cc-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="cc-btn-save" onClick={handleSave} disabled={saving || !isFormValid}>
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteItem && (
        <div className="cc-overlay" onClick={() => setDeleteItem(null)}>
          <div className="cc-modal cc-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h2 className="cc-modal-title">Confirm Delete</h2>
              <button className="cc-modal-close" onClick={() => setDeleteItem(null)}>✕</button>
            </div>
            <div className="cc-modal-body">
              <div className="cc-delete-warn">
                <WarnIcon />
                <p>Are you sure you want to delete <strong>{deleteItem.name}</strong>?
                  This action cannot be undone.</p>
              </div>
            </div>
            <div className="cc-modal-footer">
              <button className="cc-btn-cancel" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button className="cc-btn-danger" onClick={handleDelete} disabled={deleting}>
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

/* ── Icons ── */
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function DeleteIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function EmptyIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3, marginBottom:8 }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function WarnIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, color:"#e24b4a" }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

/* ── Styles ── */
const styles = `
  .cc-page { padding: 2rem 2.5rem; min-height: 100vh; background: #0f1117; color: #e2e8f0; font-family: 'DM Sans','Segoe UI',sans-serif; }

  .cc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
  .cc-title { font-size: 1.6rem; font-weight: 600; color: #f1f5f9; margin: 0 0 4px; letter-spacing: -0.3px; }
  .cc-subtitle { font-size: 0.85rem; color: #64748b; margin: 0; }

  .cc-btn-add { display: flex; align-items: center; gap: 8px; padding: 0.55rem 1.1rem; background: #3b6d11; color: #c0dd97; border: 1px solid #639922; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; }
  .cc-btn-add:hover { background: #27500a; }
  .cc-btn-add:active { transform: scale(0.97); }
  .cc-btn-icon { font-size: 1.15rem; line-height: 1; }

  .cc-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
  .cc-search-wrap { position: relative; flex: 1; max-width: 360px; color: #64748b; }
  .cc-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .cc-search { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.4rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
  .cc-search::placeholder { color: #475569; }
  .cc-search:focus { border-color: #639922; }
  .cc-count { font-size: 0.8rem; color: #475569; white-space: nowrap; }

  .cc-table-wrap { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; overflow: hidden; }
  .cc-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .cc-th { padding: 0.85rem 1.1rem; text-align: left; font-size: 0.78rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #2d3448; background: #1a2030; white-space: nowrap; }
  .cc-th-no { width: 56px; }
  .cc-th-center { text-align: center; }
  .cc-tr { transition: background 0.12s; }
  .cc-tr:hover { background: #1c2235; }
  .cc-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }
  .cc-td { padding: 0.85rem 1.1rem; color: #cbd5e1; vertical-align: middle; }
  .cc-td-no   { color: #475569; font-size: 0.8rem; }
  .cc-td-name { font-weight: 500; color: #e2e8f0; }
  .cc-td-desc { font-size: 0.82rem; color: #64748b; max-width: 200px; }
  .cc-td-empty { color: #334155; }
  .cc-td-center { text-align: center; }
  .cc-td-date { font-size: 0.82rem; color: #64748b; white-space: nowrap; }
  .cc-td-actions { text-align: center; }

  .cc-code-badge { display: inline-block; padding: 2px 10px; background: #1e2a40; color: #7dd3fc; border: 1px solid #1e4a72; border-radius: 6px; font-size: 0.75rem; font-weight: 600; font-family: monospace; letter-spacing: 0.05em; }

  .cc-color-dot { display: inline-block; width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 0 1px rgba(0,0,0,0.3); }

  .cc-badge-draft { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
  .cc-badge-draft.yes { background: #2a1f10; color: #fbbf24; border: 1px solid #78350f; }
  .cc-badge-draft.no  { background: #1a2030; color: #64748b; border: 1px solid #2d3448; }

  .cc-badge-status { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; }
  .cc-badge-status.active   { background: #0f2d1a; color: #4ade80; border: 1px solid #166534; }
  .cc-badge-status.inactive { background: #2a1a1a; color: #f87171; border: 1px solid #7f1d1d; }

  .cc-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: background 0.15s, border-color 0.15s, transform 0.1s; margin: 0 2px; }
  .cc-icon-btn.edit { color: #60a5fa; }
  .cc-icon-btn.edit:hover { background: #0c253d; border-color: #1e4a72; color: #93c5fd; }
  .cc-icon-btn.delete { color: #f87171; }
  .cc-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
  .cc-icon-btn:active { transform: scale(0.9); }

  .cc-empty { padding: 3.5rem 1rem; text-align: center; color: #475569; font-size: 0.875rem; }
  .cc-empty p { margin: 0; }
  .cc-spinner { width: 28px; height: 28px; border: 2px solid #2d3448; border-top-color: #639922; border-radius: 50%; animation: cc-spin 0.7s linear infinite; margin: 0 auto; }
  @keyframes cc-spin { to { transform: rotate(360deg); } }

  .cc-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 1.5rem; }
  .cc-page-btn { padding: 0.4rem 0.85rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 7px; color: #94a3b8; font-size: 0.82rem; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .cc-page-btn:hover:not(:disabled) { background: #1c2235; color: #e2e8f0; }
  .cc-page-btn.active { background: #27500a; border-color: #3b6d11; color: #c0dd97; font-weight: 500; }
  .cc-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .cc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(3px); animation: cc-fadeIn 0.15s ease; }
  @keyframes cc-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .cc-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; width: 100%; max-width: 520px; margin: 1rem; animation: cc-slideUp 0.2s ease; max-height: 90vh; overflow-y: auto; }
  .cc-modal-sm { max-width: 400px; }
  @keyframes cc-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .cc-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid #2d3448; position: sticky; top: 0; background: #161b27; z-index: 1; }
  .cc-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .cc-modal-close { background: transparent; border: none; color: #64748b; font-size: 1rem; cursor: pointer; padding: 4px; border-radius: 5px; transition: color 0.12s, background 0.12s; }
  .cc-modal-close:hover { color: #e2e8f0; background: #2d3448; }
  .cc-modal-body { padding: 1.4rem; }
  .cc-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 1rem 1.4rem; border-top: 1px solid #2d3448; position: sticky; bottom: 0; background: #161b27; }

  .cc-field { margin-bottom: 1.1rem; }
  .cc-field:last-child { margin-bottom: 0; }
  .cc-field-row { display: flex; align-items: center; justify-content: space-between; }
  .cc-field-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.1rem; }
  .cc-field-grid2 .cc-field { margin-bottom: 0; }
  .cc-label { display: block; font-size: 0.82rem; font-weight: 500; color: #94a3b8; margin-bottom: 6px; }
  .cc-field-row .cc-label { margin-bottom: 0; }
  .cc-req { color: #f87171; }

  .cc-input { width: 100%; padding: 0.55rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; appearance: none; }
  .cc-input::placeholder { color: #475569; }
  .cc-input:focus { border-color: #639922; }

  .cc-textarea { width: 100%; padding: 0.6rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; resize: vertical; min-height: 80px; transition: border-color 0.15s; box-sizing: border-box; font-family: inherit; }
  .cc-textarea::placeholder { color: #475569; }
  .cc-textarea:focus { border-color: #639922; }

  .cc-color-wrap { display: flex; align-items: center; gap: 8px; }
  .cc-color-picker { width: 38px; height: 38px; padding: 2px; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; cursor: pointer; flex-shrink: 0; }
  .cc-color-text { flex: 1; }

  .cc-toggles-row { display: flex; flex-direction: column; gap: 0.85rem; }

  .cc-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .cc-toggle { width: 40px; height: 22px; border-radius: 11px; background: #2d3448; border: none; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
  .cc-toggle.on { background: #3b6d11; }
  .cc-toggle-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
  .cc-toggle.on .cc-toggle-knob { transform: translateX(18px); }
  .cc-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  .cc-btn-cancel { padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .cc-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }
  .cc-btn-save { padding: 0.5rem 1.4rem; background: #3b6d11; border: 1px solid #639922; border-radius: 8px; color: #c0dd97; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .cc-btn-save:hover:not(:disabled) { background: #27500a; }
  .cc-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
  .cc-btn-danger { padding: 0.5rem 1.4rem; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .cc-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .cc-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  .cc-delete-warn { display: flex; gap: 14px; align-items: flex-start; }
  .cc-delete-warn p { font-size: 0.875rem; color: #94a3b8; margin: 0; line-height: 1.6; }
  .cc-delete-warn strong { color: #e2e8f0; }
`;