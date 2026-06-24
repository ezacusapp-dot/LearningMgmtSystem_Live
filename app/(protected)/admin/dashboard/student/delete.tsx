"use client";

// ─── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  X:        () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Warn:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Loader:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>,
};

export default function DeleteModal({ student, onCancel, onConfirm, loading }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)", animation:"fadeIn 0.15s ease" }}>
      <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:14, width:"100%", maxWidth:430, margin:"1rem", animation:"slideUp 0.2s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 1.3rem", borderBottom:"1px solid #2d3448" }}>
          <h2 style={{ margin:0, fontSize:"1rem", fontWeight:600, color:"#f1f5f9" }}>Delete Student</h2>
          <button onClick={onCancel} style={{ background:"transparent", border:"none", color:"#64748b", cursor:"pointer", fontSize:"1rem" }}>✕</button>
        </div>
        <div style={{ padding:"1.3rem" }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0, marginTop:2 }}><Ic.Warn /></div>
            <div>
              <p style={{ margin:"0 0 6px", fontSize:"0.88rem", color:"#e2e8f0", lineHeight:1.5 }}>Are you sure you want to delete <strong style={{ color:"#fca5a5" }}>"{student.name}"</strong>?</p>
              <p style={{ margin:0, fontSize:"0.78rem", color:"#64748b", lineHeight:1.6 }}>All academic records, grades, and attendance data will be permanently removed. This cannot be undone.</p>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"0.85rem 1.3rem", borderTop:"1px solid #2d3448" }}>
          <button onClick={onCancel} disabled={loading} style={{ padding:"0.5rem 1.1rem", background:"transparent", border:"1px solid #2d3448", borderRadius:8, color:"#94a3b8", fontSize:"0.875rem", cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"0.5rem 1.4rem", background:"#7f1d1d", border:"1px solid #991b1b", borderRadius:8, color:"#fca5a5", fontSize:"0.875rem", fontWeight:500, cursor:loading ? "not-allowed" : "pointer", opacity:loading ? 0.7 : 1 }}>
            {loading ? <><Ic.Loader />Deleting…</> : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}