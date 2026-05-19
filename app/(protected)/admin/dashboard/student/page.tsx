"use client";
import { useState, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_STUDENTS = [
  { id: "std001", name: "Aarav Mehta", email: "aarav.mehta@student.edu", phone: "+1 (555) 101-2020", dob: "2008-04-12", gender: "Male", grade: "10th", section: "A", school: "Lincoln High School", parentName: "Priya Mehta", parentPhone: "+1 (555) 101-2021", address: "123 Education St, San Francisco, CA", gpa: 9.2, attendance: 94, status: "active", enrolled: "2022-06-01", subjects: ["Math","Science","English","History"] },
  { id: "std002", name: "Sofia Williams", email: "sofia.w@student.edu", phone: "+1 (555) 202-3030", dob: "2009-07-22", gender: "Female", grade: "9th", section: "B", school: "Tech Valley Academy", parentName: "James Williams", parentPhone: "+1 (555) 202-3031", address: "456 Innovation Ave, Seattle, WA", gpa: 8.7, attendance: 88, status: "active", enrolled: "2023-06-01", subjects: ["Math","Physics","Chemistry","English"] },
  { id: "std003", name: "Rohan Iyer", email: "rohan.i@student.edu", phone: "+1 (555) 303-4040", dob: "2007-11-05", gender: "Male", grade: "11th", section: "A", school: "Riverside International", parentName: "Rajesh Iyer", parentPhone: "+1 (555) 303-4041", address: "789 River Road, New York, NY", gpa: 7.4, attendance: 76, status: "active", enrolled: "2021-06-01", subjects: ["Math","Biology","English","Art"] },
  { id: "std004", name: "Emily Brown", email: "emily.b@student.edu", phone: "+1 (555) 404-5050", dob: "2010-02-18", gender: "Female", grade: "8th", section: "C", school: "Central Academy", parentName: "David Brown", parentPhone: "+1 (555) 404-5051", address: "321 Main St, Austin, TX", gpa: 6.1, attendance: 62, status: "inactive", enrolled: "2023-06-01", subjects: ["Math","Science","English"] },
  { id: "std005", name: "Ananya Sharma", email: "ananya.s@student.edu", phone: "+1 (555) 505-6060", dob: "2008-09-30", gender: "Female", grade: "10th", section: "B", school: "Horizon STEM School", parentName: "Vikram Sharma", parentPhone: "+1 (555) 505-6061", address: "567 Science Blvd, Chicago, IL", gpa: 9.8, attendance: 98, status: "active", enrolled: "2022-06-01", subjects: ["Math","Physics","Chemistry","CS","English"] },
  { id: "std006", name: "Lucas Chen", email: "lucas.c@student.edu", phone: "+1 (555) 606-7070", dob: "2007-05-14", gender: "Male", grade: "11th", section: "A", school: "Tech Valley Academy", parentName: "Wei Chen", parentPhone: "+1 (555) 606-7071", address: "890 Tech Park, Seattle, WA", gpa: 8.3, attendance: 91, status: "active", enrolled: "2021-06-01", subjects: ["Math","CS","Physics","English"] },
];

const AVATAR_PALETTE = [
  { bg:"#1e293b", fg:"#a78bfa" }, { bg:"#064e3b", fg:"#6ee7b7" },
  { bg:"#4c0519", fg:"#f9a8d4" }, { bg:"#0c4a6e", fg:"#93c5fd" },
  { bg:"#451a03", fg:"#fcd34d" }, { bg:"#2e1065", fg:"#c4b5fd" },
];

const GRADES   = ["All Grades","8th","9th","10th","11th","12th"];
const GENDERS  = ["All Genders","Male","Female","Other"];
const STATUSES = ["All Status","Active","Inactive"];
const SCHOOLS  = ["All Schools","Lincoln High School","Tech Valley Academy","Riverside International","Central Academy","Horizon STEM School"];
const SECTIONS = ["A","B","C","D"];
const GRADE_OPTS = ["8th","9th","10th","11th","12th"];

function initials(name) { return name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
function gpaColor(g) { return g >= 9 ? "#34d399" : g >= 7 ? "#fbbf24" : "#f87171"; }
function attColor(a) { return a >= 90 ? "#34d399" : a >= 75 ? "#fbbf24" : "#f87171"; }
function pwStrength(pw) {
  if (!pw) return { level:0, label:"", color:"#2d3448" };
  let s=0;
  if(pw.length>=6)s++;if(pw.length>=10)s++;
  if(/[A-Z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;
  if(s<=1) return{level:1,label:"Weak",color:"#ef4444"};
  if(s<=2) return{level:2,label:"Fair",color:"#f59e0b"};
  if(s<=3) return{level:3,label:"Good",color:"#3b82f6"};
  return{level:4,label:"Strong",color:"#c0dd97"};
}

const defaultForm = {
  name:"", email:"", phone:"", dob:"", gender:"Male", grade:"10th", section:"A",
  school:"Lincoln High School", parentName:"", parentPhone:"", address:"",
  gpa:0, attendance:0, status:"active", password:"", confirmPassword:""
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Plus:     ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:        ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Edit:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Users:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Trend:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Cap:      ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Person:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Warn:     ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Lock:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Mail:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Map:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Save:     ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Star:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Calendar: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Book:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Home:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Heart:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Building: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9M16 21V9M3 9h18M8 3v6M16 3v6"/></svg>,
  Gender:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>,
  Section:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, icon, required, error, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.75rem", fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.04em" }}>
        <span style={{ color:"#639922" }}>{icon}</span>{label}
        {required && <span style={{ color:"#f87171" }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize:"0.72rem", color:"#f87171" }}>{error}</span>}
    </div>
  );
}

function Sel({ value, onChange, options }) {
  return (
    <div style={{ position:"relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width:"100%", padding:"0.65rem 2rem 0.65rem 0.9rem", background:"#0f1117", border:"1px solid #2d3448", borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", cursor:"pointer", appearance:"none", fontFamily:"inherit" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#475569", pointerEvents:"none", fontSize:"0.7rem" }}>▾</span>
    </div>
  );
}

function inp(err) {
  return { style:{ width:"100%", padding:"0.65rem 0.9rem", background:"#0f1117", border:`1px solid ${err ? "#7f1d1d" : "#2d3448"}`, borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }};
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position:"fixed", top:"1.5rem", right:"1.5rem", background:"#1a2d12", border:"1px solid #639922", borderRadius:10, padding:"0.75rem 1.2rem", color:"#c0dd97", fontSize:"0.875rem", fontWeight:500, zIndex:200, animation:"fadeIn 0.2s ease" }}>{msg}</div>;
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ student, idx, onClose }) {
  const av = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
  const gc = gpaColor(student.gpa), ac = attColor(student.attendance);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)", animation:"fadeIn 0.15s ease" }} onClick={onClose}>
      <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:16, width:"100%", maxWidth:620, margin:"1rem", animation:"slideUp 0.2s ease", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.3rem 1.5rem", borderBottom:"1px solid #1e2535", background:"#131720", borderRadius:"16px 16px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:av.bg, color:av.fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"1.1rem", flexShrink:0 }}>{initials(student.name)}</div>
            <div>
              <h2 style={{ margin:"0 0 2px", fontSize:"1.1rem", fontWeight:700, color:"#f1f5f9" }}>{student.name}</h2>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"0.72rem", color:"#475569" }}>{student.id}</span>
                <span style={{ width:4, height:4, borderRadius:"50%", background:"#2d3448", display:"inline-block" }} />
                <span style={{ fontSize:"0.72rem", color:"#64748b" }}>{student.grade} · Section {student.section}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid #2d3448", background:"transparent", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Ic.X /></button>
        </div>

        <div style={{ padding:"1.4rem 1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
          {/* Contact info */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Email",         value:student.email,       icon:<Ic.Mail /> },
              { label:"Phone",         value:student.phone,       icon:<Ic.Phone /> },
              { label:"Date of Birth", value:student.dob,         icon:<Ic.Calendar /> },
              { label:"Gender",        value:student.gender,      icon:<Ic.Gender /> },
              { label:"School",        value:student.school,      icon:<Ic.Building /> },
              { label:"Enrolled",      value:student.enrolled,    icon:<Ic.Calendar /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.8rem 1rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>{icon}{label}</div>
                <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.8rem 1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Home />Address</div>
            <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.address}</p>
          </div>

          {/* Parent info */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div style={{ background:"#0f1117", border:"1px solid rgba(99,153,34,0.2)", borderRadius:10, padding:"0.8rem 1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Person />Parent / Guardian</div>
              <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.parentName}</p>
            </div>
            <div style={{ background:"#0f1117", border:"1px solid rgba(99,153,34,0.2)", borderRadius:10, padding:"0.8rem 1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Phone />Parent Phone</div>
              <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.parentPhone}</p>
            </div>
          </div>

          {/* Performance stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {/* GPA */}
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:"1.6rem", fontWeight:700, color:gc }}>{student.gpa.toFixed(1)}</p>
              <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b" }}>GPA Score</p>
              <div style={{ height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(student.gpa/10)*100}%`, background:`linear-gradient(90deg,${gc}66,${gc})`, borderRadius:2 }} />
              </div>
            </div>
            {/* Attendance */}
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:"1.6rem", fontWeight:700, color:ac }}>{student.attendance}%</p>
              <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b" }}>Attendance</p>
              <div style={{ height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${student.attendance}%`, background:`linear-gradient(90deg,${ac}66,${ac})`, borderRadius:2 }} />
              </div>
            </div>
            {/* Status */}
            <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background: student.status === "active" ? "#639922" : "#64748b", boxShadow: student.status === "active" ? "0 0 6px rgba(99,153,34,0.5)" : "none" }} />
                <p style={{ margin:0, fontSize:"1rem", fontWeight:700, color: student.status === "active" ? "#c0dd97" : "#64748b" }}>{student.status === "active" ? "Active" : "Inactive"}</p>
              </div>
              <p style={{ margin:0, fontSize:"0.72rem", color:"#64748b" }}>Status</p>
            </div>
          </div>

          {/* Subjects */}
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

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ student, onCancel, onConfirm }) {
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
          <button onClick={onCancel} style={{ padding:"0.5rem 1.1rem", background:"transparent", border:"1px solid #2d3448", borderRadius:8, color:"#94a3b8", fontSize:"0.875rem", cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:"0.5rem 1.4rem", background:"#7f1d1d", border:"1px solid #991b1b", borderRadius:8, color:"#fca5a5", fontSize:"0.875rem", fontWeight:500, cursor:"pointer" }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}
function FormModal({
  mode,
  formData,
  setFormData,
  onSave,
  onClose,
}: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = pwStrength(formData.password);

  const updateField = (key: string, val: any) => {
    setFormData((p: any) => ({ ...p, [key]: val }));

    setErrors((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name?.trim())
      errs.name = "Student name is required";

    if (!formData.email?.trim())
      errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Invalid email address";

    if (!formData.phone?.trim())
      errs.phone = "Phone is required";

    if (!formData.dob)
      errs.dob = "Date of birth is required";

    if (!formData.parentName?.trim())
      errs.parentName = "Parent name is required";

    if (!formData.parentPhone?.trim())
      errs.parentPhone = "Parent phone is required";

    if (!formData.address?.trim())
      errs.address = "Address is required";

    if (mode === "add") {
      if (!formData.password)
        errs.password = "Password is required";
      else if (formData.password.length < 6)
        errs.password = "Min 6 characters";

      if (!formData.confirmPassword)
        errs.confirmPassword = "Please confirm password";
      else if (formData.password !== formData.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    } else if (formData.password) {
      if (formData.password.length < 6)
        errs.password = "Min 6 characters";

      if (formData.password !== formData.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIXED INPUT STYLE (TS-safe)
  const inp = (err?: string): React.CSSProperties => ({
    width: "100%",
    padding: "0.65rem 0.9rem",
    background: "#0f1117",
    border: `1px solid ${err ? "#7f1d1d" : "#2d3448"}`,
    borderRadius: 9,
    color: "#e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#161b27",
          border: "1px solid #2d3448",
          borderRadius: 16,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div style={{ padding: "1.3rem 1.5rem" }}>
          <h2 style={{ margin: 0 }}>
            {mode === "add" ? "Add Student" : "Edit Student"}
          </h2>
        </div>

        {/* BODY */}
        <div style={{ padding: "1.4rem 1.5rem", display: "flex", flexDirection: "column", gap: 14 }}>
          
          <Field label="Full Name" icon={<Ic.Person />} required error={errors.name}>
            <input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Student full name"
              style={inp(errors.name)}
            />
          </Field>

          <Field label="Email" icon={<Ic.Mail />} required error={errors.email}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              style={inp(errors.email)}
            />
          </Field>

          <Field label="Phone" icon={<Ic.Phone />} required error={errors.phone}>
            <input
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              style={inp(errors.phone)}
            />
          </Field>

          <Field label="DOB" icon={<Ic.Calendar />} required error={errors.dob}>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => updateField("dob", e.target.value)}
              style={inp(errors.dob)}
            />
          </Field>

          <Field label="Address" icon={<Ic.Home />} required error={errors.address}>
            <textarea
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              style={inp(errors.address)}
            />
          </Field>

          {/* PASSWORD */}
          <Field label="Password" icon={<Ic.Lock />} required={mode === "add"} error={errors.password}>
            <input
              type={showPw ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              style={inp(errors.password)}
            />
          </Field>

          <Field label="Confirm Password" icon={<Ic.Lock />} required={mode === "add"} error={errors.confirmPassword}>
            <input
              type={showCp ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              style={inp(errors.confirmPassword)}
            />
          </Field>
        </div>

        {/* FOOTER */}
        <div style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : mode === "add" ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}