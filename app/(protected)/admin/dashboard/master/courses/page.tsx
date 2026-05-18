"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description?: string;
  status: "Draft" | "Published" | "Archived";
  categoryId?: string;
  categoryName?: string;
  levelId?: string;
  levelName?: string;
  duration?: string;
  createdBy?: string;
  thumbnailUrl?: string;
  modulesCount?: number;
  lessonsCount?: number;
  createdAt?: string;
  gradeNames?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Published: { bg: "rgba(99,153,34,0.12)", border: "rgba(99,153,34,0.35)", text: "#c0dd97", dot: "#639922" },
  Draft:     { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)", text: "#94a3b8", dot: "#64748b" },
  Archived:  { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#fca5a5", dot: "#f87171" },
};

const FILTER_OPTIONS = ["All", "Published", "Draft", "Archived"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseListPage() {
  const router = useRouter();

  const [courses,     setCourses]     = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter,      setFilter]      = useState("All");
  const [delModal,    setDelModal]    = useState<{ id: string; title: string } | null>(null);
  const [toast,       setToast]       = useState("");
  const [deleting,    setDeleting]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Fetch courses ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/courses?limit=100");
      const json = await res.json();
      if (json.status || json.success) {
        setCourses(json.data ?? []);
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // ── Close menu on outside click ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delModal) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/courses/${delModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status || json.success) {
        setCourses(prev => prev.filter(c => c.id !== delModal.id));
        showToast("Course deleted successfully");
      } else {
        showToast("Failed to delete course");
      }
    } catch {
      showToast("An error occurred");
    } finally {
      setDeleting(false);
      setDelModal(null);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.categoryName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.createdBy    ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === "All" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total:     courses.length,
    published: courses.filter(c => c.status === "Published").length,
    draft:     courses.filter(c => c.status === "Draft").length,
    archived:  courses.filter(c => c.status === "Archived").length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="cl-page">

      {/* ── Header ── */}
      <div className="cl-header">
        <div className="cl-header-left">
          <div className="cl-header-icon">
            <BookIcon />
          </div>
          <div>
            <h1 className="cl-title">Courses</h1>
            <p className="cl-subtitle">Manage and publish your course library</p>
          </div>
        </div>
        <button
          className="cl-btn-add"
          onClick={() => router.push("/admin/dashboard/master/courses/add")}
        >
          <PlusIcon />
          Add Course
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="cl-stats-strip">
        {[
          { label: "Total",     value: stats.total,     color: "#7dd3fc", bg: "rgba(55,138,221,0.08)",  border: "rgba(55,138,221,0.18)"  },
          { label: "Published", value: stats.published, color: "#c0dd97", bg: "rgba(99,153,34,0.08)",   border: "rgba(99,153,34,0.2)"    },
          { label: "Draft",     value: stats.draft,     color: "#94a3b8", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)"  },
          { label: "Archived",  value: stats.archived,  color: "#fca5a5", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.18)" },
        ].map(s => (
          <div key={s.label} className="cl-stat-chip" style={{ background: s.bg, borderColor: s.border }}>
            <span className="cl-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="cl-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="cl-toolbar">
         <div className="cl-filter-tabs">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              className={`cl-filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="cl-filter-tab-count">
                  {f === "Published" ? stats.published : f === "Draft" ? stats.draft : stats.archived}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="cl-search-wrap">
          <SearchIcon />
          <input
            className="cl-search"
            placeholder="Search by title, category, instructor…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="cl-search-clear" onClick={() => setSearchQuery("")}>
              <XIcon />
            </button>
          )}
        </div>
        
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="cl-loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cl-skeleton-card">
              <div className="cl-skeleton-thumb" />
              <div className="cl-skeleton-body">
                <div className="cl-skeleton-line wide" />
                <div className="cl-skeleton-line mid" />
                <div className="cl-skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cl-empty-state">
          {searchQuery || filter !== "All" ? (
            <>
              <SearchEmptyIcon />
              <p className="cl-empty-title">No courses match your search</p>
              <p className="cl-empty-sub">Try adjusting your filters or search terms</p>
              <button className="cl-btn-outline" onClick={() => { setSearchQuery(""); setFilter("All"); }}>
                Clear filters
              </button>
            </>
          ) : (
            <>
              <EmptyCoursesIcon />
              <p className="cl-empty-title">No courses yet</p>
              <p className="cl-empty-sub">Create your first course to get started</p>
              <button className="cl-btn-add" onClick={() => router.push("/admin/dashboard/master/courses/add")}>
                <PlusIcon /> Add Course
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="cl-grid">
          {filtered.map(course => {
            const sc     = STATUS_COLORS[course.status] ?? STATUS_COLORS.Draft;
            const isOpen = menuOpen === course.id;
            return (
              <div key={course.id} className="cl-card">

                {/* Thumbnail */}
                <div className="cl-card-thumb">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="cl-thumb-img" />
                  ) : (
                    <div className="cl-thumb-placeholder">
                      <BookIcon />
                    </div>
                  )}

                  {/* Status badge */}
                  <span
                    className="cl-status-badge"
                    style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}
                  >
                    <span className="cl-status-dot" style={{ background: sc.dot }} />
                    {course.status}
                  </span>
                </div>

                {/* Body */}
                <div className="cl-card-body">
                  <h3 className="cl-card-title" title={course.title}>
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="cl-card-desc">{course.description}</p>
                  )}

                  {/* Meta pills */}
                  <div className="cl-meta-row">
                    {course.categoryName && (
                      <span className="cl-meta-pill category">
                        <TagIcon /> {course.categoryName}
                      </span>
                    )}
                    {course.levelName && (
                      <span className="cl-meta-pill level">
                        <LevelIcon /> {course.levelName}
                      </span>
                    )}
                    {course.duration && (
                      <span className="cl-meta-pill duration">
                        <ClockIcon /> {course.duration}
                      </span>
                    )}
                  </div>

                  {/* Grade tags */}
                  {course.gradeNames && course.gradeNames.length > 0 && (
                    <div className="cl-grade-row">
                      {course.gradeNames.slice(0, 4).map(g => (
                        <span key={g} className="cl-grade-tag">{g}</span>
                      ))}
                      {course.gradeNames.length > 4 && (
                        <span className="cl-grade-tag muted">+{course.gradeNames.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="cl-card-divider" />

                  {/* Footer */}
                  <div className="cl-card-footer">
                    <div className="cl-card-counts">
                      {course.modulesCount !== undefined && (
                        <span className="cl-count-chip">
                          <GridIcon />
                          {course.modulesCount} module{course.modulesCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {course.lessonsCount !== undefined && (
                        <span className="cl-count-chip">
                          <PlayIcon />
                          {course.lessonsCount} lesson{course.lessonsCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="cl-card-actions" ref={isOpen ? menuRef : null}>
                      {/* Edit button */}
                      <button
                        className="cl-action-btn edit"
                        title="Edit course"
                        onClick={() => router.push(`/admin/dashboard/master/courses/${course.id}`)}
                      >
                        <EditIcon />
                      </button>

                      {/* Kebab menu */}
                      <div className="cl-menu-wrap">
                        <button
                          className={`cl-action-btn menu ${isOpen ? "open" : ""}`}
                          title="More options"
                          onClick={() => setMenuOpen(isOpen ? null : course.id)}
                        >
                          <DotsIcon />
                        </button>
                        {isOpen && (
                          <div className="cl-dropdown">
                            <button
                              className="cl-dropdown-item"
                              onClick={() => {
                                setMenuOpen(null);
                              router.push(`/admin/dashboard/master/courses/${course.id}`);
                              }}
                            >
                              <EditIcon /> Edit Course
                            </button>
                            <button
                              className="cl-dropdown-item"
                              onClick={() => {
                                setMenuOpen(null);
                                // duplicate logic — call your API or handle locally
                                showToast("Duplicate coming soon");
                              }}
                            >
                              <CopyIcon /> Duplicate
                            </button>
                            <div className="cl-dropdown-divider" />
                            <button
                              className="cl-dropdown-item danger"
                              onClick={() => {
                                setMenuOpen(null);
                                setDelModal({ id: course.id, title: course.title });
                              }}
                            >
                              <TrashIcon /> Delete Course
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Instructor + date */}
                  <div className="cl-card-meta-bottom">
                    {course.createdBy && (
                      <span className="cl-instructor">
                        <PersonIcon /> {course.createdBy}
                      </span>
                    )}
                    {course.createdAt && (
                      <span className="cl-created-at">{timeAgo(course.createdAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Result count ── */}
      {!loading && filtered.length > 0 && (
        <p className="cl-result-count">
          Showing <strong>{filtered.length}</strong> of <strong>{courses.length}</strong> course{courses.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ══ Delete Confirmation Modal ══ */}
      {delModal && (
        <div className="cl-overlay" onClick={() => setDelModal(null)}>
          <div className="cl-modal" onClick={e => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h2 className="cl-modal-title">Delete Course</h2>
              <button className="cl-modal-close" onClick={() => setDelModal(null)}>✕</button>
            </div>
            <div className="cl-modal-body">
              <div className="cl-del-warn">
                <WarnIcon />
                <div>
                  <p className="cl-del-msg">
                    Are you sure you want to delete <strong>"{delModal.title}"</strong>?
                  </p>
                  <p className="cl-del-sub">
                    This will permanently remove the course, all its modules, lessons, and quiz questions. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="cl-modal-footer">
              <button className="cl-btn-cancel" onClick={() => setDelModal(null)}>Cancel</button>
              <button className="cl-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Toast ══ */}
      {toast && <div className="cl-toast">{toast}</div>}

      <style>{styles}</style>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function XIcon()          { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function EditIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function DotsIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>; }
function CopyIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function BookIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function TagIcon()        { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function LevelIcon()      { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function ClockIcon()      { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function GridIcon()       { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function PlayIcon()       { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
function PersonIcon()     { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function WarnIcon()       { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function SearchEmptyIcon(){ return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: "0 auto 12px", display: "block", color: "#2d3448" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function EmptyCoursesIcon(){ return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: "0 auto 12px", display: "block", color: "#2d3448" }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  .cl-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans','Segoe UI',sans-serif;
  }

  /* ── Header ── */
  .cl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .cl-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .cl-header-icon {
    width: 44px; height: 44px;
    border-radius: 11px;
    background: #1a2030;
    border: 1px solid #2d3448;
    display: flex; align-items: center; justify-content: center;
    color: #639922;
    flex-shrink: 0;
  }
  .cl-title {
    font-size: 1.55rem; font-weight: 700;
    color: #f1f5f9; margin: 0 0 3px;
    letter-spacing: -0.4px;
  }
  .cl-subtitle {
    font-size: 0.83rem; color: #64748b; margin: 0;
  }

  /* ── Add button ── */
  .cl-btn-add {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.58rem 1.2rem;
    background: #3b6d11; border: 1px solid #639922;
    border-radius: 9px; color: #c0dd97;
    font-size: 0.875rem; font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    white-space: nowrap;
    box-shadow: 0 0 0 0 rgba(99,153,34,0);
  }
  .cl-btn-add:hover {
    background: #27500a;
    box-shadow: 0 0 0 3px rgba(99,153,34,0.18);
  }
  .cl-btn-add:active { transform: scale(0.97); }

  /* ── Stats strip ── */
  .cl-stats-strip {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-bottom: 1.4rem;
  }
  .cl-stat-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 0.5rem 1rem;
    border-radius: 8px; border: 1px solid;
  }
  .cl-stat-value {
    font-size: 1.2rem; font-weight: 700; line-height: 1;
  }
  .cl-stat-label {
    font-size: 0.78rem; color: #64748b; font-weight: 500;
  }

  /* ── Toolbar ── */
  .cl-toolbar {
    display: flex; align-items: center; gap: 12px;justify-content: space-between; 
    margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .cl-search-wrap {
    position: relative; display: flex; align-items: center;
    flex: 1; min-width: 220px; max-width: 400px;
  }
  .cl-search-wrap > svg { position: absolute; left: 12px; pointer-events: none; }
  .cl-search {
    width: 100%;
    padding: 0.55rem 2.4rem 0.55rem 2.5rem;
    background: #161b27; border: 1px solid #2d3448;
    border-radius: 9px; color: #e2e8f0;
    font-size: 0.855rem; outline: none;
    transition: border-color 0.15s;
    font-family: inherit;
  }
  .cl-search::placeholder { color: #3a4460; }
  .cl-search:focus { border-color: #639922; }
  .cl-search-clear {
    position: absolute; right: 10px;
    background: transparent; border: none;
    color: #64748b; cursor: pointer; display: flex; align-items: center;
    padding: 2px; border-radius: 4px;
    transition: color 0.12s;
  }
  .cl-search-clear:hover { color: #e2e8f0; }

  /* Filter tabs */
  .cl-filter-tabs {
    display: flex; align-items: center; gap: 4px;
    background: #161b27; border: 1px solid #2d3448;
    border-radius: 9px; padding: 4px;
    flex-shrink: 0;
  }
  .cl-filter-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.4rem 0.85rem;
    border-radius: 6px; border: none;
    background: transparent; color: #64748b;
    font-size: 0.82rem; font-weight: 500;
    cursor: pointer; transition: background 0.15s, color 0.15s;
    white-space: nowrap; font-family: inherit;
  }
  .cl-filter-tab:hover { color: #e2e8f0; background: #1e2230; }
  .cl-filter-tab.active {
    background: #3b6d11; color: #c0dd97;
    border: 1px solid rgba(99,153,34,0.4);
  }
  .cl-filter-tab-count {
    background: rgba(255,255,255,0.07);
    border-radius: 10px; padding: 1px 6px;
    font-size: 0.72rem; font-weight: 700;
  }
  .cl-filter-tab.active .cl-filter-tab-count {
    background: rgba(192,221,151,0.15);
    color: #c0dd97;
  }

  /* ── Skeleton loading ── */
  .cl-loading {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  .cl-skeleton-card {
    background: #161b27; border: 1px solid #2d3448;
    border-radius: 12px; overflow: hidden;
    animation: cl-pulse 1.5s ease-in-out infinite;
  }
  .cl-skeleton-thumb {
    height: 152px; background: #1a2030;
  }
  .cl-skeleton-body { padding: 1rem; display: flex; flex-direction: column; gap: 10px; }
  .cl-skeleton-line {
    height: 12px; background: #1e2535; border-radius: 6px;
  }
  .cl-skeleton-line.wide { width: 80%; }
  .cl-skeleton-line.mid  { width: 55%; }
  .cl-skeleton-line.short{ width: 35%; }
  @keyframes cl-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── Grid ── */
  .cl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  /* ── Course Card ── */
  .cl-card {
    background: #161b27; border: 1px solid #2d3448;
    border-radius: 12px; overflow: hidden;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
    display: flex; flex-direction: column;
  }
  .cl-card:hover {
    border-color: #3a4460;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    transform: translateY(-2px);
  }

  /* Thumbnail */
  .cl-card-thumb {
    position: relative; width: 100%; height: 152px;
    background: #1a2030; overflow: hidden; flex-shrink: 0;
  }
  .cl-thumb-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.3s;
  }
  .cl-card:hover .cl-thumb-img { transform: scale(1.03); }
  .cl-thumb-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #161b27 0%, #1a2030 50%, #161b27 100%);
    color: #2d3448;
  }
  .cl-thumb-placeholder svg { width: 36px; height: 36px; stroke-width: 1.2; }

  /* Status badge */
  .cl-status-badge {
    position: absolute; top: 10px; left: 10px;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px;
    border: 1px solid; font-size: 0.72rem; font-weight: 600;
    backdrop-filter: blur(4px);
  }
  .cl-status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    flex-shrink: 0;
  }

  /* Card body */
  .cl-card-body {
    padding: 1rem 1.1rem;
    display: flex; flex-direction: column; flex: 1;
  }
  .cl-card-title {
    font-size: 0.95rem; font-weight: 600; color: #f1f5f9;
    margin: 0 0 6px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.35;
  }
  .cl-card-desc {
    font-size: 0.78rem; color: #64748b; margin: 0 0 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; line-height: 1.5;
  }

  /* Meta pills */
  .cl-meta-row {
    display: flex; flex-wrap: wrap; gap: 5px;
    margin-bottom: 8px;
  }
  .cl-meta-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 6px;
    font-size: 0.72rem; font-weight: 500;
    white-space: nowrap;
  }
  .cl-meta-pill.category {
    background: rgba(55,138,221,0.08);
    border: 1px solid rgba(55,138,221,0.18);
    color: #7dd3fc;
  }
  .cl-meta-pill.level {
    background: rgba(124,79,212,0.08);
    border: 1px solid rgba(124,79,212,0.2);
    color: #c4b5fd;
  }
  .cl-meta-pill.duration {
    background: rgba(100,116,139,0.08);
    border: 1px solid rgba(100,116,139,0.2);
    color: #94a3b8;
  }

  /* Grade tags */
  .cl-grade-row {
    display: flex; flex-wrap: wrap; gap: 4px;
    margin-bottom: 8px;
  }
  .cl-grade-tag {
    padding: 2px 7px; border-radius: 5px;
    background: #1a2030; border: 1px solid #2d3448;
    color: #64748b; font-size: 0.7rem; font-weight: 500;
  }
  .cl-grade-tag.muted { color: #3a4460; border-color: #1e2535; }

  .cl-card-divider {
    height: 1px; background: #1e2535;
    margin: 10px 0;
  }

  /* Footer */
  .cl-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px;
  }
  .cl-card-counts {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .cl-count-chip {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.72rem; color: #475569;
  }
  .cl-card-actions {
    display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  }
  .cl-action-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 30px;
    border-radius: 7px; border: 1px solid #2d3448;
    background: transparent; cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    padding: 0;
  }
  .cl-action-btn.edit { color: #7dd3fc; }
  .cl-action-btn.edit:hover { background: #0c1a2e; border-color: #163856; color: #bae6fd; }
  .cl-action-btn.menu { color: #64748b; }
  .cl-action-btn.menu:hover,
  .cl-action-btn.menu.open { background: #1e2230; border-color: #3a4460; color: #e2e8f0; }

  /* Dropdown menu */
  .cl-menu-wrap { position: relative; }
  .cl-dropdown {
    position: absolute; right: 0; top: calc(100% + 6px);
    background: #1a2030; border: 1px solid #2d3448;
    border-radius: 10px; padding: 5px;
    min-width: 170px; z-index: 20;
    box-shadow: 0 8px 28px rgba(0,0,0,0.4);
    animation: cl-dropIn 0.13s ease;
  }
  @keyframes cl-dropIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  .cl-dropdown-item {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 0.5rem 0.75rem;
    background: transparent; border: none;
    border-radius: 7px; color: #94a3b8;
    font-size: 0.82rem; font-weight: 500;
    cursor: pointer; text-align: left;
    transition: background 0.12s, color 0.12s;
    font-family: inherit;
  }
  .cl-dropdown-item:hover { background: #252d3e; color: #f1f5f9; }
  .cl-dropdown-item.danger { color: #f87171; }
  .cl-dropdown-item.danger:hover { background: #2a0d0d; color: #fca5a5; }
  .cl-dropdown-divider {
    height: 1px; background: #252d3e; margin: 4px 0;
  }

  /* Bottom meta */
  .cl-card-meta-bottom {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 8px;
  }
  .cl-instructor {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.72rem; color: #475569;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
  }
  .cl-created-at {
    font-size: 0.7rem; color: #3a4460; flex-shrink: 0;
  }

  /* ── Empty state ── */
  .cl-empty-state {
    text-align: center;
    padding: 4rem 1rem;
    color: #3a4460;
  }
  .cl-empty-title { font-size: 1rem; font-weight: 600; color: #475569; margin: 0 0 6px; }
  .cl-empty-sub   { font-size: 0.83rem; color: #3a4460; margin: 0 0 1.2rem; }
  .cl-btn-outline {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 0.5rem 1.1rem;
    background: transparent; border: 1px solid #2d3448;
    border-radius: 8px; color: #64748b;
    font-size: 0.875rem; font-weight: 500; cursor: pointer;
    transition: background 0.12s, color 0.12s;
    font-family: inherit;
  }
  .cl-btn-outline:hover { background: #1e2230; color: #e2e8f0; }

  /* ── Result count ── */
  .cl-result-count {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.78rem;
    color: #3a4460;
  }
  .cl-result-count strong { color: #64748b; }

  /* ── Delete Modal ── */
  .cl-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; backdrop-filter: blur(3px);
    animation: cl-fadeIn 0.15s ease;
  }
  @keyframes cl-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .cl-modal {
    background: #161b27; border: 1px solid #2d3448;
    border-radius: 14px; width: 100%; max-width: 430px;
    margin: 1rem;
    animation: cl-slideUp 0.2s ease;
  }
  @keyframes cl-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cl-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.3rem; border-bottom: 1px solid #2d3448;
  }
  .cl-modal-title { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin: 0; }
  .cl-modal-close {
    background: transparent; border: none; color: #64748b;
    font-size: 1rem; cursor: pointer; padding: 4px;
    border-radius: 5px; transition: color 0.12s, background 0.12s;
  }
  .cl-modal-close:hover { color: #e2e8f0; background: #2d3448; }
  .cl-modal-body { padding: 1.3rem; }
  .cl-del-warn { display: flex; gap: 12px; align-items: flex-start; }
  .cl-del-msg { font-size: 0.88rem; color: #e2e8f0; margin: 0 0 6px; line-height: 1.5; }
  .cl-del-msg strong { color: #fca5a5; }
  .cl-del-sub { font-size: 0.78rem; color: #64748b; margin: 0; line-height: 1.6; }
  .cl-modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 0.85rem 1.3rem; border-top: 1px solid #2d3448;
  }
  .cl-btn-cancel {
    padding: 0.5rem 1.1rem; background: transparent;
    border: 1px solid #2d3448; border-radius: 8px;
    color: #94a3b8; font-size: 0.875rem; cursor: pointer;
    transition: background 0.12s; font-family: inherit;
  }
  .cl-btn-cancel:hover { background: #1e2230; color: #e2e8f0; }
  .cl-btn-danger {
    padding: 0.5rem 1.4rem; background: #7f1d1d;
    border: 1px solid #991b1b; border-radius: 8px;
    color: #fca5a5; font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: background 0.12s;
    font-family: inherit;
  }
  .cl-btn-danger:hover:not(:disabled) { background: #6b1a1a; }
  .cl-btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Toast ── */
  .cl-toast {
    position: fixed; top: 1.5rem; right: 1.5rem;
    background: #1a2d12; border: 1px solid #639922;
    border-radius: 10px; padding: 0.75rem 1.2rem;
    color: #c0dd97; font-size: 0.875rem; font-weight: 500;
    z-index: 100; animation: cl-fadeIn 0.2s ease;
  }

  @media (max-width: 640px) {
    .cl-page { padding: 1.25rem 1rem; }
    .cl-grid { grid-template-columns: 1fr; }
    .cl-toolbar { flex-direction: column; align-items: stretch; }
    .cl-search-wrap { max-width: 100%; }
    .cl-filter-tabs { width: 100%; overflow-x: auto; }
    .cl-stats-strip { gap: 6px; }
    .cl-stat-chip { flex: 1; justify-content: center; min-width: 70px; }
  }
`;
