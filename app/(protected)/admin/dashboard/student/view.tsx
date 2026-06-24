"use client";

// ─── Helpers (duplicated) ──────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg:"#1e293b", fg:"#a78bfa" }, { bg:"#064e3b", fg:"#6ee7b7" },
  { bg:"#4c0519", fg:"#f9a8d4" }, { bg:"#0c4a6e", fg:"#93c5fd" },
  { bg:"#451a03", fg:"#fcd34d" }, { bg:"#2e1065", fg:"#c4b5fd" },
];

function initials(name = "") { return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(); }
function gpaColor(g)  { return g >= 9 ? "#34d399" : g >= 7 ? "#fbbf24" : "#f87171"; }
function attColor(a)  { return a >= 90 ? "#34d399" : a >= 75 ? "#fbbf24" : "#f87171"; }

// ─── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  X:        () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Mail:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Calendar: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Gender:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>,
  Building: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9M16 21V9M3 9h18M8 3v6M16 3v6"/></svg>,
  Home:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Person:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Book:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
};

export default function ViewModal({ student, idx, onClose }) {
  const av = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
  const gc = gpaColor(student.gpa), ac = attColor(student.attendance);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)", animation:"fadeIn 0.15s ease" }} onClick={onClose}>
      <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:16, width:"100%", maxWidth:620, margin:"1rem", animation:"slideUp 0.2s ease", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.3rem 1.5rem", borderBottom:"1px solid #1e2535", background:"#131720", borderRadius:"16px 16px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:av.bg, color:av.fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"1.1rem", flexShrink:0 }}>{initials(student.name)}</div>
            <div>
              <h2 style={{ margin:"0 0 2px", fontSize:"1.1rem", fontWeight:700, color:"#f1f5f9" }}>{student.name}</h2>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"0.72rem", color:"#475569" }}>{student.id}</span>
                <span style={{ width:4, height:4, borderRadius:"50%", background:"#2d3448", display:"inline-block" }} />
                <span style={{ fontSize:"0.72rem", color:"#64748b" }}>{student.grade} · Section {student.section}</span>
                {student.username && <>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:"#2d3448", display:"inline-block" }} />
                  <span style={{ fontSize:"0.72rem", color:"#639922" }}>@{student.username}</span>
                </>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid #2d3448", background:"transparent", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Ic.X /></button>
        </div>
        <div style={{ padding:"1.4rem 1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Email",         value:student.email,      icon:<Ic.Mail /> },
              { label:"Phone",         value:student.phone,      icon:<Ic.Phone /> },
              { label:"Date of Birth", value:student.dob,        icon:<Ic.Calendar /> },
              { label:"Gender",        value:student.gender,     icon:<Ic.Gender /> },
              { label:"School",        value:student.school,     icon:<Ic.Building /> },
              { label:"Enrolled",      value:student.enrolled,   icon:<Ic.Calendar /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.8rem 1rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>{icon}{label}</div>
                <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{value || "—"}</p>
              </div>
            ))}
          </div>
          <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.8rem 1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Home />Address</div>
            <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.address || "—"}</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div style={{ background:"#0f1117", border:"1px solid rgba(99,153,34,0.2)", borderRadius:10, padding:"0.8rem 1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Person />Parent / Guardian</div>
              <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.parentName || "—"}</p>
            </div>
            <div style={{ background:"#0f1117", border:"1px solid rgba(99,153,34,0.2)", borderRadius:10, padding:"0.8rem 1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Phone />Parent Phone</div>
              <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.parentPhone || "—"}</p>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:"1.6rem", fontWeight:700, color:gc }}>{student.gpa.toFixed(1)}</p>
              <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b" }}>GPA Score</p>
              <div style={{ height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(student.gpa/10)*100}%`, background:`linear-gradient(90deg,${gc}66,${gc})`, borderRadius:2 }} />
              </div>
            </div>
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:"1.6rem", fontWeight:700, color:ac }}>{student.attendance}%</p>
              <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b" }}>Attendance</p>
              <div style={{ height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${student.attendance}%`, background:`linear-gradient(90deg,${ac}66,${ac})`, borderRadius:2 }} />
              </div>
            </div>
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:student.status === "active" ? "#639922" : "#64748b", boxShadow:student.status === "active" ? "0 0 6px rgba(99,153,34,0.5)" : "none" }} />
                <p style={{ margin:0, fontSize:"1rem", fontWeight:700, color:student.status === "active" ? "#c0dd97" : "#64748b" }}>{student.status === "active" ? "Active" : "Inactive"}</p>
              </div>
              <p style={{ margin:0, fontSize:"0.72rem", color:"#64748b" }}>Status</p>
            </div>
          </div>
          {student.subjects?.length > 0 && (
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Book />Enrolled Subjects</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {student.subjects.map(sub => (
                  <span key={sub} style={{ padding:"4px 10px", background:"rgba(99,153,34,0.1)", border:"1px solid rgba(99,153,34,0.25)", borderRadius:20, fontSize:"0.75rem", fontWeight:600, color:"#c0dd97" }}>{sub}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"1rem 1.5rem", borderTop:"1px solid #1e2535", background:"#131720", borderRadius:"0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding:"0.55rem 1.2rem", background:"transparent", border:"1px solid #2d3448", borderRadius:9, color:"#94a3b8", fontSize:"0.875rem", cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}