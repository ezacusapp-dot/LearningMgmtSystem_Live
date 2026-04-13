"use client";

import { useEffect, useState } from "react";

interface ValidityPeriod {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: ValidityPeriod[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const LIMIT = 10;

export default function ValidityPeriodPage() {
  const [items,      setItems]      = useState<ValidityPeriod[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(false);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<ValidityPeriod | null>(null);
  const [deleteItem, setDeleteItem] = useState<ValidityPeriod | null>(null);

  const [form, setForm] = useState({ name: "", sortOrder: "", isActive: true });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/validity-periods?page=${page}&limit=${LIMIT}&search=${search}`);
      const json: PaginatedResponse = await res.json();
      if (json.success) {
        setItems(json.data);
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
    setForm({ name: "", sortOrder: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (item: ValidityPeriod) => {
    setEditItem(item);
    setForm({ name: item.name, sortOrder: String(item.sortOrder), isActive: item.isActive });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  /* ── Save ── */
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

       await fetch(`/api/validity-periods/${editItem.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
      } else {
        const payload: Record<string, unknown> = { name: form.name.trim() };
        if (form.sortOrder !== "") payload.sortOrder = Number(form.sortOrder);

        await fetch("/api/validity-periods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      await fetch(`/api/validity-periods/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null); fetchData();
    } finally { setDeleting(false); }
  };

  return (
    <div className="vp-page">

      {/* ── Header ── */}
      <div className="vp-header">
        <div>
          <h1 className="vp-title">Validity Periods</h1>
          <p className="vp-subtitle">Manage master data for validity periods</p>
        </div>
        <button className="vp-btn-add" onClick={openAdd}>
          <span className="vp-btn-icon">+</span>Add Validity Period
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="vp-toolbar">
        <div className="vp-search-wrap">
          <SearchIcon />
          <input
            className="vp-search"
            placeholder="Search validity periods..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <span className="vp-count">{total} {total === 1 ? "record" : "records"}</span>
      </div>

      {/* ── Table ── */}
      <div className="vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th className="vp-th vp-th-no">Sr.No</th>
              <th className="vp-th">Name</th>
              {/* <th className="vp-th vp-th-center">Sort Order</th> */}
              <th className="vp-th vp-th-center">Status</th>
              <th className="vp-th">Created At</th>
              <th className="vp-th vp-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="vp-empty"><div className="vp-spinner" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="vp-empty"><EmptyIcon /><p>No validity periods found</p></td></tr>
            ) : items.map((item, idx) => (
              <tr key={item.id} className="vp-tr">
                <td className="vp-td vp-td-no">{(page - 1) * LIMIT + idx + 1}</td>
                <td className="vp-td vp-td-name">{item.name}</td>
                {/* <td className="vp-td vp-td-center">
                  <span className="vp-order-badge">{item.sortOrder}</span>
                </td> */}
                <td className="vp-td vp-td-center">
                  <span className={`vp-badge-status ${item.isActive ? "active" : "inactive"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="vp-td vp-td-date">
                  {new Date(item.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                </td>
                <td className="vp-td vp-td-actions">
                  <button className="vp-icon-btn edit"   title="Edit"   onClick={() => openEdit(item)}><EditIcon /></button>
                  <button className="vp-icon-btn delete" title="Delete" onClick={() => setDeleteItem(item)}><DeleteIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="vp-pagination">
          <button className="vp-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`vp-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="vp-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="vp-overlay" onClick={closeModal}>
          <div className="vp-modal" onClick={e => e.stopPropagation()}>
            <div className="vp-modal-header">
              <h2 className="vp-modal-title">{editItem ? "Edit Validity Period" : "Add Validity Period"}</h2>
              <button className="vp-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="vp-modal-body">
              {/* Name + Sort Order */}
              <div className="vp-field-grid">
                <div className="vp-field">
                  <label className="vp-label">Name <span className="vp-req">*</span></label>
                  <input className="vp-input" placeholder="e.g. 1 Month"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                {/* <div className="vp-field">
                  <label className="vp-label">Sort Order</label>
                  <input className="vp-input" type="number" min={0} placeholder="e.g. 1"
                    value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} />
                </div> */}
              </div>

              {/* Status toggle — edit only */}
              {editItem && (
                <div className="vp-field vp-field-row">
                  <label className="vp-label">Status</label>
                  <div className="vp-toggle-wrap">
                    <button
                      className={`vp-toggle ${form.isActive ? "on" : ""}`}
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    >
                      <span className="vp-toggle-knob" />
                    </button>
                    <span className="vp-toggle-label">{form.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="vp-modal-footer">
              <button className="vp-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="vp-btn-save" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteItem && (
        <div className="vp-overlay" onClick={() => setDeleteItem(null)}>
          <div className="vp-modal vp-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="vp-modal-header">
              <h2 className="vp-modal-title">Confirm Delete</h2>
              <button className="vp-modal-close" onClick={() => setDeleteItem(null)}>✕</button>
            </div>
            <div className="vp-modal-body">
              <div className="vp-delete-warn">
                <WarnIcon />
                <p>Are you sure you want to delete <strong>{deleteItem.name}</strong>? This action cannot be undone.</p>
              </div>
            </div>
            <div className="vp-modal-footer">
              <button className="vp-btn-cancel" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button className="vp-btn-danger" onClick={handleDelete} disabled={deleting}>
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
  .vp-page { padding: 2rem 2.5rem; min-height: 100vh; background: #0f1117; color: #e2e8f0; font-family: 'DM Sans','Segoe UI',sans-serif; }

  .vp-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
  .vp-title  { font-size: 1.6rem; font-weight: 600; color: #f1f5f9; margin: 0 0 4px; letter-spacing: -0.3px; }
  .vp-subtitle { font-size: 0.85rem; color: #64748b; margin: 0; }

  .vp-btn-add { display: flex; align-items: center; gap: 8px; padding: 0.55rem 1.1rem; background: #3b6d11; color: #c0dd97; border: 1px solid #639922; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; }
  .vp-btn-add:hover { background: #27500a; }
  .vp-btn-add:active { transform: scale(0.97); }
  .vp-btn-icon { font-size: 1.15rem; line-height: 1; font-weight: 400; }

  .vp-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
  .vp-search-wrap { position: relative; flex: 1; max-width: 360px; color: #64748b; }
  .vp-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .vp-search { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.4rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
  .vp-search::placeholder { color: #475569; }
  .vp-search:focus { border-color: #639922; }
  .vp-count { font-size: 0.8rem; color: #475569; white-space: nowrap; }

  .vp-table-wrap { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; overflow: hidden; }
  .vp-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .vp-th { padding: 0.85rem 1.1rem; text-align: left; font-size: 0.78rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #2d3448; background: #1a2030; white-space: nowrap; }
  .vp-th-no { width: 56px; }
  .vp-th-center { text-align: center; }
  .vp-tr { transition: background 0.12s; }
  .vp-tr:hover { background: #1c2235; }
  .vp-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }
  .vp-td { padding: 0.85rem 1.1rem; color: #cbd5e1; vertical-align: middle; }
  .vp-td-no   { color: #475569; font-size: 0.8rem; }
  .vp-td-name { font-weight: 500; color: #e2e8f0; }
  .vp-td-center { text-align: center; }
  .vp-td-date { font-size: 0.82rem; color: #64748b; white-space: nowrap; }
  .vp-td-actions { text-align: center; }

  .vp-order-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 7px; background: #1e2a40; border: 1px solid #2d3f5c; color: #7dd3fc; font-size: 0.78rem; font-weight: 600; }

  .vp-badge-status { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; }
  .vp-badge-status.active   { background: #0f2d1a; color: #4ade80; border: 1px solid #166534; }
  .vp-badge-status.inactive { background: #2a1a1a; color: #f87171; border: 1px solid #7f1d1d; }

  .vp-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: background 0.15s, border-color 0.15s, transform 0.1s; margin: 0 2px; }
  .vp-icon-btn.edit { color: #60a5fa; }
  .vp-icon-btn.edit:hover { background: #0c253d; border-color: #1e4a72; color: #93c5fd; }
  .vp-icon-btn.delete { color: #f87171; }
  .vp-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
  .vp-icon-btn:active { transform: scale(0.9); }

  .vp-empty { padding: 3.5rem 1rem; text-align: center; color: #475569; font-size: 0.875rem; }
  .vp-empty p { margin: 0; }
  .vp-spinner { width: 28px; height: 28px; border: 2px solid #2d3448; border-top-color: #639922; border-radius: 50%; animation: vp-spin 0.7s linear infinite; margin: 0 auto; }
  @keyframes vp-spin { to { transform: rotate(360deg); } }

  .vp-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 1.5rem; }
  .vp-page-btn { padding: 0.4rem 0.85rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 7px; color: #94a3b8; font-size: 0.82rem; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .vp-page-btn:hover:not(:disabled) { background: #1c2235; color: #e2e8f0; }
  .vp-page-btn.active { background: #27500a; border-color: #3b6d11; color: #c0dd97; font-weight: 500; }
  .vp-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .vp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(3px); animation: vp-fadeIn 0.15s ease; }
  @keyframes vp-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .vp-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; width: 100%; max-width: 460px; margin: 1rem; animation: vp-slideUp 0.2s ease; }
  .vp-modal-sm { max-width: 380px; }
  @keyframes vp-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .vp-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid #2d3448; }
  .vp-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .vp-modal-close { background: transparent; border: none; color: #64748b; font-size: 1rem; cursor: pointer; padding: 4px; border-radius: 5px; transition: color 0.12s, background 0.12s; }
  .vp-modal-close:hover { color: #e2e8f0; background: #2d3448; }
  .vp-modal-body { padding: 1.4rem; }
  .vp-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 1rem 1.4rem; border-top: 1px solid #2d3448; }

  .vp-field { margin-bottom: 1.1rem; }
  .vp-field:last-child { margin-bottom: 0; }
  .vp-field-row { display: flex; align-items: center; justify-content: space-between; }
  .vp-field-grid { display: grid; grid-template-columns: 1fr 140px; gap: 0.85rem; margin-bottom: 1.1rem; }
  .vp-field-grid .vp-field { margin-bottom: 0; }
  .vp-label { display: block; font-size: 0.82rem; font-weight: 500; color: #94a3b8; margin-bottom: 6px; }
  .vp-field-row .vp-label { margin-bottom: 0; }
  .vp-req { color: #f87171; }
  .vp-input { width: 100%; padding: 0.55rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; appearance: none; }
  .vp-input::placeholder { color: #475569; }
  .vp-input:focus { border-color: #639922; }

  .vp-toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .vp-toggle { width: 40px; height: 22px; border-radius: 11px; background: #2d3448; border: none; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
  .vp-toggle.on { background: #3b6d11; }
  .vp-toggle-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
  .vp-toggle.on .vp-toggle-knob { transform: translateX(18px); }
  .vp-toggle-label { font-size: 0.82rem; color: #94a3b8; }

  .vp-btn-cancel { padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .vp-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }
  .vp-btn-save { padding: 0.5rem 1.4rem; background: #3b6d11; border: 1px solid #639922; border-radius: 8px; color: #c0dd97; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .vp-btn-save:hover:not(:disabled) { background: #27500a; }
  .vp-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
  .vp-btn-danger { padding: 0.5rem 1.4rem; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .vp-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .vp-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  .vp-delete-warn { display: flex; gap: 14px; align-items: flex-start; }
  .vp-delete-warn p { font-size: 0.875rem; color: #94a3b8; margin: 0; line-height: 1.6; }
  .vp-delete-warn strong { color: #e2e8f0; }
`;