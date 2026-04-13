// app/(dashboard)/courses/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Category { id: string; name: string; }
interface Level    { id: string; name: string; }

interface Course {
  id: string;
  title: string;
  categoryId: string | null;
  levelId: string | null;
  duration: string | null;
  description: string | null;
  createdBy: string | null;
  status: string;
  createdAt: string;
  CourseCategory: { id: string; name: string } | null;
  CourseLevel:    { id: string; name: string } | null;
  Modules: { id: string }[];
}

interface PaginatedResponse {
  status: boolean;
  data: Course[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const LIMIT = 10;
const STATUS_OPTIONS = ["Draft", "Published", "Archived"];

export default function CoursesPage() {
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [levels,     setLevels]     = useState<Level[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("");
  const [filterLvl,  setFilterLvl]  = useState("");
  const [loading,    setLoading]    = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem,  setEditItem]  = useState<Course | null>(null);
  const [deleteItem,setDeleteItem]= useState<Course | null>(null);

  const [form, setForm] = useState({
    title: "", categoryId: "", levelId: "",
    duration: "", description: "", createdBy: "", status: "Draft",
  });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch dropdowns ── */
  const fetchMeta = async () => {
    try {
      const [catRes, lvlRes] = await Promise.all([
        fetch("/api/course-categories?limit=100"),
        fetch("/api/levels?limit=100"),
      ]);
      const catJson = await catRes.json();
      const lvlJson = await lvlRes.json();
      if (catJson.status || catJson.success) setCategories(catJson.data ?? []);
      if (lvlJson.status || lvlJson.success) setLevels(lvlJson.data ?? []);
    } catch (e) { console.error(e); }
  };

  /* ── Fetch courses ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(LIMIT), search,
        ...(filterCat && { categoryId: filterCat }),
        ...(filterLvl && { levelId: filterLvl }),
      });
      const res  = await fetch(`/api/courses?${params}`);
      const json: PaginatedResponse = await res.json();
      if (json.status) {
        setCourses(json.data);
        setTotal(json.meta.total);
        setTotalPages(json.meta.totalPages);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchData(); }, [page, search, filterCat, filterLvl]); // eslint-disable-line

  /* ── Modal helpers ── */
  const openAdd = () => {
    setEditItem(null);
    setForm({ title:"", categoryId:"", levelId:"", duration:"", description:"", createdBy:"", status:"Draft" });
    setModalOpen(true);
  };
  const openEdit = (item: Course) => {
    setEditItem(item);
    setForm({
      title:       item.title,
      categoryId:  item.categoryId  ?? "",
      levelId:     item.levelId     ?? "",
      duration:    item.duration    ?? "",
      description: item.description ?? "",
      createdBy:   item.createdBy   ?? "",
      status:      item.status,
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        status:      form.status,
        ...(form.categoryId  && { categoryId:  form.categoryId }),
        ...(form.levelId     && { levelId:     form.levelId }),
        ...(form.duration    && { duration:    form.duration }),
        ...(form.description && { description: form.description }),
        ...(form.createdBy   && { createdBy:   form.createdBy }),
      };
      if (editItem) {
        await fetch(`/api/courses/${editItem.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/courses", {
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
      await fetch(`/api/courses/${deleteItem.id}`, { method: "DELETE" });
      setDeleteItem(null); fetchData();
    } finally { setDeleting(false); }
  };

  const statusColor = (s: string) => {
    if (s === "Published") return "published";
    if (s === "Archived")  return "archived";
    return "draft";
  };

  return (
    <div className="co-page">

      {/* ── Header ── */}
      <div className="co-header">
        <div>
          <h1 className="co-title">Courses</h1>
          <p className="co-subtitle">Manage all courses in the platform</p>
        </div>
        <button className="co-btn-add" onClick={openAdd}>
          <span className="co-btn-icon">+</span>Add Course
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="co-toolbar">
        <div className="co-search-wrap">
          <SearchIcon />
          <input
            className="co-search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select className="co-filter-select" value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className="co-filter-select" value={filterLvl}
          onChange={(e) => { setFilterLvl(e.target.value); setPage(1); }}>
          <option value="">All Levels</option>
          {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>

        <span className="co-count">{total} {total === 1 ? "record" : "records"}</span>
      </div>

      {/* ── Table ── */}
      <div className="co-table-wrap">
        <table className="co-table">
          <thead>
            <tr>
              <th className="co-th co-th-no">Sr.No</th>
              <th className="co-th">Title</th>
              <th className="co-th">Category</th>
              <th className="co-th">Level</th>
              <th className="co-th">Duration</th>
              <th className="co-th co-th-center">Modules</th>
              <th className="co-th co-th-center">Status</th>
              <th className="co-th">Created At</th>
              <th className="co-th co-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="co-empty"><div className="co-spinner" /></td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={9} className="co-empty"><EmptyIcon /><p>No courses found</p></td></tr>
            ) : courses.map((c, idx) => (
              <tr key={c.id} className="co-tr">
                <td className="co-td co-td-no">{(page - 1) * LIMIT + idx + 1}</td>
                <td className="co-td co-td-name">{c.title}</td>
                <td className="co-td co-td-meta">{c.CourseCategory?.name ?? <span className="co-td-empty">—</span>}</td>
                <td className="co-td co-td-meta">{c.CourseLevel?.name    ?? <span className="co-td-empty">—</span>}</td>
                <td className="co-td co-td-meta">{c.duration ?? <span className="co-td-empty">—</span>}</td>
                <td className="co-td co-td-center">
                  <span className="co-module-badge">{c.Modules?.length ?? 0}</span>
                </td>
                <td className="co-td co-td-center">
                  <span className={`co-badge-status ${statusColor(c.status)}`}>{c.status}</span>
                </td>
                <td className="co-td co-td-date">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                </td>
                <td className="co-td co-td-actions">
                  <button className="co-icon-btn edit" title="Edit" onClick={() => openEdit(c)}><EditIcon /></button>
                  <button className="co-icon-btn delete" title="Delete" onClick={() => setDeleteItem(c)}><DeleteIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="co-pagination">
          <button className="co-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`co-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="co-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="co-overlay" onClick={closeModal}>
          <div className="co-modal" onClick={e => e.stopPropagation()}>
            <div className="co-modal-header">
              <h2 className="co-modal-title">{editItem ? "Edit Course" : "Add Course"}</h2>
              <button className="co-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="co-modal-body">
              {/* Title */}
              <div className="co-field">
                <label className="co-label">Title <span className="co-req">*</span></label>
                <input className="co-input" placeholder="e.g. React for Beginners"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Category + Level */}
              <div className="co-field-grid2">
                <div className="co-field">
                  <label className="co-label">Category</label>
                  <select className="co-input" value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="co-field">
                  <label className="co-label">Level</label>
                  <select className="co-input" value={form.levelId}
                    onChange={e => setForm({ ...form, levelId: e.target.value })}>
                    <option value="">Select level…</option>
                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Duration + Status */}
              <div className="co-field-grid2">
                <div className="co-field">
                  <label className="co-label">Duration</label>
                  <input className="co-input" placeholder="e.g. 4 weeks"
                    value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div className="co-field">
                  <label className="co-label">Status</label>
                  <select className="co-input" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="co-field">
                <label className="co-label">Description</label>
                <textarea className="co-textarea" rows={3} placeholder="Brief description of this course…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Created By */}
              <div className="co-field">
                <label className="co-label">Created By</label>
                <input className="co-input" placeholder="Instructor name…"
                  value={form.createdBy} onChange={e => setForm({ ...form, createdBy: e.target.value })} />
              </div>
            </div>

            <div className="co-modal-footer">
              <button className="co-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="co-btn-save" onClick={handleSave}
                disabled={saving || !form.title.trim()}>
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteItem && (
        <div className="co-overlay" onClick={() => setDeleteItem(null)}>
          <div className="co-modal co-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="co-modal-header">
              <h2 className="co-modal-title">Confirm Delete</h2>
              <button className="co-modal-close" onClick={() => setDeleteItem(null)}>✕</button>
            </div>
            <div className="co-modal-body">
              <div className="co-delete-warn">
                <WarnIcon />
                <p>Are you sure you want to delete <strong>{deleteItem.title}</strong>?
                  This will also remove all associated modules and cannot be undone.</p>
              </div>
            </div>
            <div className="co-modal-footer">
              <button className="co-btn-cancel" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button className="co-btn-danger" onClick={handleDelete} disabled={deleting}>
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
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 8 }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function WarnIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "#e24b4a" }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

/* ── Styles ── */
const styles = `
  .co-page { padding: 2rem 2.5rem; min-height: 100vh; background: #0f1117; color: #e2e8f0; font-family: 'DM Sans','Segoe UI',sans-serif; }

  .co-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
  .co-title { font-size: 1.6rem; font-weight: 600; color: #f1f5f9; margin: 0 0 4px; letter-spacing: -0.3px; }
  .co-subtitle { font-size: 0.85rem; color: #64748b; margin: 0; }

  .co-btn-add { display: flex; align-items: center; gap: 8px; padding: 0.55rem 1.1rem; background: #3b6d11; color: #c0dd97; border: 1px solid #639922; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; }
  .co-btn-add:hover { background: #27500a; }
  .co-btn-add:active { transform: scale(0.97); }
  .co-btn-icon { font-size: 1.15rem; line-height: 1; }

  .co-toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .co-search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 280px; color: #64748b; }
  .co-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .co-search { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.4rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
  .co-search::placeholder { color: #475569; }
  .co-search:focus { border-color: #639922; }
  .co-filter-select { padding: 0.5rem 0.85rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.82rem; outline: none; cursor: pointer; transition: border-color 0.15s; }
  .co-filter-select:focus { border-color: #639922; color: #e2e8f0; }
  .co-count { font-size: 0.8rem; color: #475569; white-space: nowrap; margin-left: auto; }

  .co-table-wrap { background: #161b27; border: 1px solid #2d3448; border-radius: 12px; overflow: hidden; }
  .co-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .co-th { padding: 0.85rem 1.1rem; text-align: left; font-size: 0.78rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #2d3448; background: #1a2030; white-space: nowrap; }
  .co-th-no { width: 56px; }
  .co-th-center { text-align: center; }
  .co-tr { transition: background 0.12s; }
  .co-tr:hover { background: #1c2235; }
  .co-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }
  .co-td { padding: 0.85rem 1.1rem; color: #cbd5e1; vertical-align: middle; }
  .co-td-no   { color: #475569; font-size: 0.8rem; }
  .co-td-name { font-weight: 500; color: #e2e8f0; }
  .co-td-meta { font-size: 0.82rem; color: #94a3b8; }
  .co-td-empty { color: #334155; }
  .co-td-center { text-align: center; }
  .co-td-date { font-size: 0.82rem; color: #64748b; white-space: nowrap; }
  .co-td-actions { text-align: center; }

  .co-module-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 6px; border-radius: 7px; background: #1e2a40; border: 1px solid #2d3f5c; color: #7dd3fc; font-size: 0.78rem; font-weight: 600; }

  .co-badge-status { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; }
  .co-badge-status.published { background: #0f2d1a; color: #4ade80; border: 1px solid #166534; }
  .co-badge-status.draft     { background: #1e2a40; color: #93c5fd; border: 1px solid #1e4a72; }
  .co-badge-status.archived  { background: #2a1a1a; color: #f87171; border: 1px solid #7f1d1d; }

  .co-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: background 0.15s, border-color 0.15s, transform 0.1s; margin: 0 2px; }
  .co-icon-btn.edit { color: #60a5fa; }
  .co-icon-btn.edit:hover { background: #0c253d; border-color: #1e4a72; color: #93c5fd; }
  .co-icon-btn.delete { color: #f87171; }
  .co-icon-btn.delete:hover { background: #2a0d0d; border-color: #7f1d1d; color: #fca5a5; }
  .co-icon-btn:active { transform: scale(0.9); }

  .co-empty { padding: 3.5rem 1rem; text-align: center; color: #475569; font-size: 0.875rem; }
  .co-empty p { margin: 0; }
  .co-spinner { width: 28px; height: 28px; border: 2px solid #2d3448; border-top-color: #639922; border-radius: 50%; animation: co-spin 0.7s linear infinite; margin: 0 auto; }
  @keyframes co-spin { to { transform: rotate(360deg); } }

  .co-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 1.5rem; }
  .co-page-btn { padding: 0.4rem 0.85rem; background: #1e2230; border: 1px solid #2d3448; border-radius: 7px; color: #94a3b8; font-size: 0.82rem; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .co-page-btn:hover:not(:disabled) { background: #1c2235; color: #e2e8f0; }
  .co-page-btn.active { background: #27500a; border-color: #3b6d11; color: #c0dd97; font-weight: 500; }
  .co-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .co-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(3px); animation: co-fadeIn 0.15s ease; }
  @keyframes co-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .co-modal { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; width: 100%; max-width: 520px; margin: 1rem; animation: co-slideUp 0.2s ease; max-height: 90vh; overflow-y: auto; }
  .co-modal-sm { max-width: 400px; }
  @keyframes co-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .co-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid #2d3448; position: sticky; top: 0; background: #161b27; z-index: 1; }
  .co-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .co-modal-close { background: transparent; border: none; color: #64748b; font-size: 1rem; cursor: pointer; padding: 4px; border-radius: 5px; transition: color 0.12s, background 0.12s; }
  .co-modal-close:hover { color: #e2e8f0; background: #2d3448; }
  .co-modal-body { padding: 1.4rem; }
  .co-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 1rem 1.4rem; border-top: 1px solid #2d3448; position: sticky; bottom: 0; background: #161b27; }

  .co-field { margin-bottom: 1.1rem; }
  .co-field:last-child { margin-bottom: 0; }
  .co-field-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.1rem; }
  .co-field-grid2 .co-field { margin-bottom: 0; }
  .co-label { display: block; font-size: 0.82rem; font-weight: 500; color: #94a3b8; margin-bottom: 6px; }
  .co-req { color: #f87171; }
  .co-input { width: 100%; padding: 0.55rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; appearance: none; }
  .co-input::placeholder { color: #475569; }
  .co-input:focus { border-color: #639922; }
  .co-textarea { width: 100%; padding: 0.6rem 0.85rem; background: #1a2030; border: 1px solid #2d3448; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; outline: none; resize: vertical; min-height: 80px; transition: border-color 0.15s; box-sizing: border-box; font-family: inherit; }
  .co-textarea::placeholder { color: #475569; }
  .co-textarea:focus { border-color: #639922; }

  .co-btn-cancel { padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .co-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }
  .co-btn-save { padding: 0.5rem 1.4rem; background: #3b6d11; border: 1px solid #639922; border-radius: 8px; color: #c0dd97; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .co-btn-save:hover:not(:disabled) { background: #27500a; }
  .co-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
  .co-btn-danger { padding: 0.5rem 1.4rem; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.12s; }
  .co-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .co-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  .co-delete-warn { display: flex; gap: 14px; align-items: flex-start; }
  .co-delete-warn p { font-size: 0.875rem; color: #94a3b8; margin: 0; line-height: 1.6; }
  .co-delete-warn strong { color: #e2e8f0; }
`;