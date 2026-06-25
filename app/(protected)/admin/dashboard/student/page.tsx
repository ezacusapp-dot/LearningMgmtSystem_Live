// "use client";
// import { useState, useRef } from "react";

// // ─── Data ─────────────────────────────────────────────────────────────────────
// const INITIAL_STUDENTS = [
//   { id: "std001", name: "Aarav Mehta", email: "aarav.mehta@student.edu", phone: "+1 (555) 101-2020", dob: "2008-04-12", gender: "Male", grade: "10th", section: "A", school: "Lincoln High School", parentName: "Priya Mehta", parentPhone: "+1 (555) 101-2021", address: "123 Education St, San Francisco, CA", gpa: 9.2, attendance: 94, status: "active", enrolled: "2022-06-01", subjects: ["Math","Science","English","History"] },
//   { id: "std002", name: "Sofia Williams", email: "sofia.w@student.edu", phone: "+1 (555) 202-3030", dob: "2009-07-22", gender: "Female", grade: "9th", section: "B", school: "Tech Valley Academy", parentName: "James Williams", parentPhone: "+1 (555) 202-3031", address: "456 Innovation Ave, Seattle, WA", gpa: 8.7, attendance: 88, status: "active", enrolled: "2023-06-01", subjects: ["Math","Physics","Chemistry","English"] },
//   { id: "std003", name: "Rohan Iyer", email: "rohan.i@student.edu", phone: "+1 (555) 303-4040", dob: "2007-11-05", gender: "Male", grade: "11th", section: "A", school: "Riverside International", parentName: "Rajesh Iyer", parentPhone: "+1 (555) 303-4041", address: "789 River Road, New York, NY", gpa: 7.4, attendance: 76, status: "active", enrolled: "2021-06-01", subjects: ["Math","Biology","English","Art"] },
//   { id: "std004", name: "Emily Brown", email: "emily.b@student.edu", phone: "+1 (555) 404-5050", dob: "2010-02-18", gender: "Female", grade: "8th", section: "C", school: "Central Academy", parentName: "David Brown", parentPhone: "+1 (555) 404-5051", address: "321 Main St, Austin, TX", gpa: 6.1, attendance: 62, status: "inactive", enrolled: "2023-06-01", subjects: ["Math","Science","English"] },
//   { id: "std005", name: "Ananya Sharma", email: "ananya.s@student.edu", phone: "+1 (555) 505-6060", dob: "2008-09-30", gender: "Female", grade: "10th", section: "B", school: "Horizon STEM School", parentName: "Vikram Sharma", parentPhone: "+1 (555) 505-6061", address: "567 Science Blvd, Chicago, IL", gpa: 9.8, attendance: 98, status: "active", enrolled: "2022-06-01", subjects: ["Math","Physics","Chemistry","CS","English"] },
//   { id: "std006", name: "Lucas Chen", email: "lucas.c@student.edu", phone: "+1 (555) 606-7070", dob: "2007-05-14", gender: "Male", grade: "11th", section: "A", school: "Tech Valley Academy", parentName: "Wei Chen", parentPhone: "+1 (555) 606-7071", address: "890 Tech Park, Seattle, WA", gpa: 8.3, attendance: 91, status: "active", enrolled: "2021-06-01", subjects: ["Math","CS","Physics","English"] },
// ];

// const AVATAR_PALETTE = [
//   { bg:"#1e293b", fg:"#a78bfa" }, { bg:"#064e3b", fg:"#6ee7b7" },
//   { bg:"#4c0519", fg:"#f9a8d4" }, { bg:"#0c4a6e", fg:"#93c5fd" },
//   { bg:"#451a03", fg:"#fcd34d" }, { bg:"#2e1065", fg:"#c4b5fd" },
// ];

// const GRADES   = ["All Grades","8th","9th","10th","11th","12th"];
// const GENDERS  = ["All Genders","Male","Female","Other"];
// const STATUSES = ["All Status","Active","Inactive"];
// const SCHOOLS  = ["All Schools","Lincoln High School","Tech Valley Academy","Riverside International","Central Academy","Horizon STEM School"];
// const SECTIONS = ["A","B","C","D"];
// const GRADE_OPTS = ["8th","9th","10th","11th","12th"];

// function initials(name) { return name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
// function gpaColor(g) { return g >= 9 ? "#34d399" : g >= 7 ? "#fbbf24" : "#f87171"; }
// function attColor(a) { return a >= 90 ? "#34d399" : a >= 75 ? "#fbbf24" : "#f87171"; }
// function pwStrength(pw) {
//   if (!pw) return { level:0, label:"", color:"#2d3448" };
//   let s=0;
//   if(pw.length>=6)s++;if(pw.length>=10)s++;
//   if(/[A-Z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;
//   if(s<=1) return{level:1,label:"Weak",color:"#ef4444"};
//   if(s<=2) return{level:2,label:"Fair",color:"#f59e0b"};
//   if(s<=3) return{level:3,label:"Good",color:"#3b82f6"};
//   return{level:4,label:"Strong",color:"#c0dd97"};
// }

// const defaultForm = {
//   name:"", email:"", phone:"", dob:"", gender:"Male", grade:"10th", section:"A",
//   school:"Lincoln High School", parentName:"", parentPhone:"", address:"",
//   gpa:0, attendance:0, status:"active", password:"", confirmPassword:""
// };

// // ─── Icons ────────────────────────────────────────────────────────────────────
// const Ic = {
//   Plus:     ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
//   Search:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
//   X:        ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
//   Eye:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
//   EyeOff:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
//   Edit:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//   Trash:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
//   Users:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
//   Check:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
//   Trend:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
//   Cap:      ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
//   Person:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
//   Warn:     ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
//   Lock:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
//   Mail:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
//   Phone:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
//   Map:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
//   Save:     ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
//   Star:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
//   Calendar: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
//   Book:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
//   Home:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
//   Heart:    ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
//   Building: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9M16 21V9M3 9h18M8 3v6M16 3v6"/></svg>,
//   Gender:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>,
//   Section:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function Field({ label, icon, required, error, children }) {
//   return (
//     <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
//       <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.75rem", fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.04em" }}>
//         <span style={{ color:"#639922" }}>{icon}</span>{label}
//         {required && <span style={{ color:"#f87171" }}>*</span>}
//       </label>
//       {children}
//       {error && <span style={{ fontSize:"0.72rem", color:"#f87171" }}>{error}</span>}
//     </div>
//   );
// }

// function Sel({ value, onChange, options }) {
//   return (
//     <div style={{ position:"relative" }}>
//       <select value={value} onChange={e => onChange(e.target.value)}
//         style={{ width:"100%", padding:"0.65rem 2rem 0.65rem 0.9rem", background:"#0f1117", border:"1px solid #2d3448", borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", cursor:"pointer", appearance:"none", fontFamily:"inherit" }}>
//         {options.map(o => <option key={o} value={o}>{o}</option>)}
//       </select>
//       <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#475569", pointerEvents:"none", fontSize:"0.7rem" }}>▾</span>
//     </div>
//   );
// }

// function inp(err) {
//   return { style:{ width:"100%", padding:"0.65rem 0.9rem", background:"#0f1117", border:`1px solid ${err ? "#7f1d1d" : "#2d3448"}`, borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }};
// }

// // ─── Toast ────────────────────────────────────────────────────────────────────
// function Toast({ msg }) {
//   if (!msg) return null;
//   return <div style={{ position:"fixed", top:"1.5rem", right:"1.5rem", background:"#1a2d12", border:"1px solid #639922", borderRadius:10, padding:"0.75rem 1.2rem", color:"#c0dd97", fontSize:"0.875rem", fontWeight:500, zIndex:200, animation:"fadeIn 0.2s ease" }}>{msg}</div>;
// }

// // ─── View Modal ───────────────────────────────────────────────────────────────
// function ViewModal({ student, idx, onClose }) {
//   const av = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
//   const gc = gpaColor(student.gpa), ac = attColor(student.attendance);
//   return (
//     <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)", animation:"fadeIn 0.15s ease" }} onClick={onClose}>
//       <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:16, width:"100%", maxWidth:620, margin:"1rem", animation:"slideUp 0.2s ease", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
//         {/* Header */}
//         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.3rem 1.5rem", borderBottom:"1px solid #1e2535", background:"#131720", borderRadius:"16px 16px 0 0" }}>
//           <div style={{ display:"flex", alignItems:"center", gap:14 }}>
//             <div style={{ width:52, height:52, borderRadius:14, background:av.bg, color:av.fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"1.1rem", flexShrink:0 }}>{initials(student.name)}</div>
//             <div>
//               <h2 style={{ margin:"0 0 2px", fontSize:"1.1rem", fontWeight:700, color:"#f1f5f9" }}>{student.name}</h2>
//               <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//                 <span style={{ fontSize:"0.72rem", color:"#475569" }}>{student.id}</span>
//                 <span style={{ width:4, height:4, borderRadius:"50%", background:"#2d3448", display:"inline-block" }} />
//                 <span style={{ fontSize:"0.72rem", color:"#64748b" }}>{student.grade} · Section {student.section}</span>
//               </div>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid #2d3448", background:"transparent", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Ic.X /></button>
//         </div>

//         <div style={{ padding:"1.4rem 1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
//           {/* Contact info */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
//             {[
//               { label:"Email",         value:student.email,       icon:<Ic.Mail /> },
//               { label:"Phone",         value:student.phone,       icon:<Ic.Phone /> },
//               { label:"Date of Birth", value:student.dob,         icon:<Ic.Calendar /> },
//               { label:"Gender",        value:student.gender,      icon:<Ic.Gender /> },
//               { label:"School",        value:student.school,      icon:<Ic.Building /> },
//               { label:"Enrolled",      value:student.enrolled,    icon:<Ic.Calendar /> },
//             ].map(({ label, value, icon }) => (
//               <div key={label} style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.8rem 1rem" }}>
//                 <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>{icon}{label}</div>
//                 <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Address */}
//           <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.8rem 1rem" }}>
//             <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Home />Address</div>
//             <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.address}</p>
//           </div>

//           {/* Parent info */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
//             <div style={{ background:"#0f1117", border:"1px solid rgba(99,153,34,0.2)", borderRadius:10, padding:"0.8rem 1rem" }}>
//               <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Person />Parent / Guardian</div>
//               <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.parentName}</p>
//             </div>
//             <div style={{ background:"#0f1117", border:"1px solid rgba(99,153,34,0.2)", borderRadius:10, padding:"0.8rem 1rem" }}>
//               <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Phone />Parent Phone</div>
//               <p style={{ margin:0, fontSize:"0.88rem", fontWeight:500, color:"#e2e8f0" }}>{student.parentPhone}</p>
//             </div>
//           </div>

//           {/* Performance stats */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
//             {/* GPA */}
//             <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center" }}>
//               <p style={{ margin:"0 0 4px", fontSize:"1.6rem", fontWeight:700, color:gc }}>{student.gpa.toFixed(1)}</p>
//               <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b" }}>GPA Score</p>
//               <div style={{ height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
//                 <div style={{ height:"100%", width:`${(student.gpa/10)*100}%`, background:`linear-gradient(90deg,${gc}66,${gc})`, borderRadius:2 }} />
//               </div>
//             </div>
//             {/* Attendance */}
//             <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center" }}>
//               <p style={{ margin:"0 0 4px", fontSize:"1.6rem", fontWeight:700, color:ac }}>{student.attendance}%</p>
//               <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b" }}>Attendance</p>
//               <div style={{ height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
//                 <div style={{ height:"100%", width:`${student.attendance}%`, background:`linear-gradient(90deg,${ac}66,${ac})`, borderRadius:2 }} />
//               </div>
//             </div>
//             {/* Status */}
//             <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
//               <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
//                 <span style={{ width:8, height:8, borderRadius:"50%", background: student.status === "active" ? "#639922" : "#64748b", boxShadow: student.status === "active" ? "0 0 6px rgba(99,153,34,0.5)" : "none" }} />
//                 <p style={{ margin:0, fontSize:"1rem", fontWeight:700, color: student.status === "active" ? "#c0dd97" : "#64748b" }}>{student.status === "active" ? "Active" : "Inactive"}</p>
//               </div>
//               <p style={{ margin:0, fontSize:"0.72rem", color:"#64748b" }}>Status</p>
//             </div>
//           </div>

//           {/* Subjects */}
//           {student.subjects?.length > 0 && (
//             <div style={{ background:"#0f1117", border:"1px solid #1e2535", borderRadius:10, padding:"0.9rem 1rem" }}>
//               <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10, fontSize:"0.7rem", fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}><Ic.Book />Enrolled Subjects</div>
//               <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
//                 {student.subjects.map(sub => (
//                   <span key={sub} style={{ padding:"4px 10px", background:"rgba(99,153,34,0.1)", border:"1px solid rgba(99,153,34,0.25)", borderRadius:20, fontSize:"0.75rem", fontWeight:600, color:"#c0dd97" }}>{sub}</span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <div style={{ display:"flex", justifyContent:"flex-end", padding:"1rem 1.5rem", borderTop:"1px solid #1e2535", background:"#131720", borderRadius:"0 0 16px 16px" }}>
//           <button onClick={onClose} style={{ padding:"0.55rem 1.2rem", background:"transparent", border:"1px solid #2d3448", borderRadius:9, color:"#94a3b8", fontSize:"0.875rem", cursor:"pointer" }}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Delete Modal ─────────────────────────────────────────────────────────────
// function DeleteModal({ student, onCancel, onConfirm }) {
//   return (
//     <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)", animation:"fadeIn 0.15s ease" }}>
//       <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:14, width:"100%", maxWidth:430, margin:"1rem", animation:"slideUp 0.2s ease" }}>
//         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 1.3rem", borderBottom:"1px solid #2d3448" }}>
//           <h2 style={{ margin:0, fontSize:"1rem", fontWeight:600, color:"#f1f5f9" }}>Delete Student</h2>
//           <button onClick={onCancel} style={{ background:"transparent", border:"none", color:"#64748b", cursor:"pointer", fontSize:"1rem" }}>✕</button>
//         </div>
//         <div style={{ padding:"1.3rem" }}>
//           <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
//             <div style={{ flexShrink:0, marginTop:2 }}><Ic.Warn /></div>
//             <div>
//               <p style={{ margin:"0 0 6px", fontSize:"0.88rem", color:"#e2e8f0", lineHeight:1.5 }}>Are you sure you want to delete <strong style={{ color:"#fca5a5" }}>"{student.name}"</strong>?</p>
//               <p style={{ margin:0, fontSize:"0.78rem", color:"#64748b", lineHeight:1.6 }}>All academic records, grades, and attendance data will be permanently removed. This cannot be undone.</p>
//             </div>
//           </div>
//         </div>
//         <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"0.85rem 1.3rem", borderTop:"1px solid #2d3448" }}>
//           <button onClick={onCancel} style={{ padding:"0.5rem 1.1rem", background:"transparent", border:"1px solid #2d3448", borderRadius:8, color:"#94a3b8", fontSize:"0.875rem", cursor:"pointer" }}>Cancel</button>
//           <button onClick={onConfirm} style={{ padding:"0.5rem 1.4rem", background:"#7f1d1d", border:"1px solid #991b1b", borderRadius:8, color:"#fca5a5", fontSize:"0.875rem", fontWeight:500, cursor:"pointer" }}>Yes, Delete</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Form Modal ───────────────────────────────────────────────────────────────
// function FormModal({ mode, formData, setFormData, onSave, onClose }) {
//   const [errors, setErrors] = useState({});
//   const [showPw, setShowPw] = useState(false);
//   const [showCp, setShowCp] = useState(false);
//   const strength = pwStrength(formData.password);

//   const set = (key, val) => { setFormData(p => ({ ...p, [key]: val })); setErrors(p => { const n={...p}; delete n[key]; return n; }); };

//   const validate = () => {
//     const errs = {};
//     if (!formData.name.trim())       errs.name = "Student name is required";
//     if (!formData.email.trim())      errs.email = "Email is required";
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email address";
//     if (!formData.phone.trim())      errs.phone = "Phone is required";
//     if (!formData.dob)               errs.dob = "Date of birth is required";
//     if (!formData.parentName.trim()) errs.parentName = "Parent name is required";
//     if (!formData.parentPhone.trim()) errs.parentPhone = "Parent phone is required";
//     if (!formData.address.trim())    errs.address = "Address is required";
//     if (mode === "add") {
//       if (!formData.password)             errs.password = "Password is required";
//       else if (formData.password.length < 6) errs.password = "Min 6 characters";
//       if (!formData.confirmPassword)      errs.confirmPassword = "Please confirm password";
//       else if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
//     } else if (formData.password) {
//       if (formData.password.length < 6)  errs.password = "Min 6 characters";
//       if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
//     }
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   return (
//     <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", zIndex:100, backdropFilter:"blur(4px)", animation:"fadeIn 0.2s ease" }} onClick={onClose}>
//       <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:16, width:"100%", maxWidth:700, maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.6)", animation:"slideUp 0.25s ease" }} onClick={e => e.stopPropagation()}>

//         {/* Header */}
//         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.3rem 1.5rem", borderBottom:"1px solid #1e2535", background:"#131720", borderRadius:"16px 16px 0 0", flexShrink:0 }}>
//           <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//             <div style={{ width:42, height:42, borderRadius:10, background:"rgba(99,153,34,0.12)", border:"1px solid rgba(99,153,34,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#c0dd97" }}><Ic.Cap /></div>
//             <div>
//               <h2 style={{ margin:"0 0 2px", fontSize:"1.05rem", fontWeight:700, color:"#f1f5f9" }}>{mode === "add" ? "Add New Student" : "Edit Student"}</h2>
//               <p style={{ margin:0, fontSize:"0.76rem", color:"#475569" }}>{mode === "add" ? "Register a new student profile" : "Update student information"}</p>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid #2d3448", background:"transparent", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Ic.X /></button>
//         </div>

//         {/* Body */}
//         <div style={{ padding:"1.4rem 1.5rem", display:"flex", flexDirection:"column", gap:"1.1rem" }}>

//           {/* Name */}
//           <Field label="Full Name" icon={<Ic.Person />} required error={errors.name}>
//             <input value={formData.name} onChange={e => set("name", e.target.value)} placeholder="Student full name" {...inp(errors.name)} />
//           </Field>

//           {/* Email + Phone */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
//             <Field label="Email" icon={<Ic.Mail />} required error={errors.email}>
//               <input type="email" value={formData.email} onChange={e => set("email", e.target.value)} placeholder="student@school.edu" {...inp(errors.email)} />
//             </Field>
//             <Field label="Phone" icon={<Ic.Phone />} required error={errors.phone}>
//               <input type="tel" value={formData.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" {...inp(errors.phone)} />
//             </Field>
//           </div>

//           {/* DOB + Gender */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
//             <Field label="Date of Birth" icon={<Ic.Calendar />} required error={errors.dob}>
//               <input type="date" value={formData.dob} onChange={e => set("dob", e.target.value)} {...inp(errors.dob)} />
//             </Field>
//             <Field label="Gender" icon={<Ic.Gender />} required>
//               <Sel value={formData.gender} onChange={v => set("gender", v)} options={["Male","Female","Other"]} />
//             </Field>
//           </div>

//           {/* School + Grade + Section */}
//           <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"1rem" }}>
//             <Field label="School" icon={<Ic.Building />} required>
//               <Sel value={formData.school} onChange={v => set("school", v)} options={["Lincoln High School","Tech Valley Academy","Riverside International","Central Academy","Horizon STEM School"]} />
//             </Field>
//             <Field label="Grade" icon={<Ic.Cap />} required>
//               <Sel value={formData.grade} onChange={v => set("grade", v)} options={GRADE_OPTS} />
//             </Field>
//             <Field label="Section" icon={<Ic.Section />} required>
//               <Sel value={formData.section} onChange={v => set("section", v)} options={SECTIONS} />
//             </Field>
//           </div>

//           {/* Parent info */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
//             <Field label="Parent / Guardian Name" icon={<Ic.Person />} required error={errors.parentName}>
//               <input value={formData.parentName} onChange={e => set("parentName", e.target.value)} placeholder="Parent full name" {...inp(errors.parentName)} />
//             </Field>
//             <Field label="Parent Phone" icon={<Ic.Phone />} required error={errors.parentPhone}>
//               <input type="tel" value={formData.parentPhone} onChange={e => set("parentPhone", e.target.value)} placeholder="+1 (555) 000-0000" {...inp(errors.parentPhone)} />
//             </Field>
//           </div>

//           {/* Address */}
//           <Field label="Home Address" icon={<Ic.Home />} required error={errors.address}>
//             <textarea value={formData.address} onChange={e => set("address", e.target.value)} placeholder="Enter full home address" rows={2}
//               style={{ width:"100%", padding:"0.65rem 0.9rem", background:"#0f1117", border:`1px solid ${errors.address ? "#7f1d1d" : "#2d3448"}`, borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit", resize:"none", lineHeight:1.5 }} />
//           </Field>

//           {/* GPA + Attendance */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
//             <Field label="GPA Score (0–10)" icon={<Ic.Star />}>
//               <input type="number" value={formData.gpa} min="0" max="10" step="0.1"
//                 onChange={e => set("gpa", Math.min(10, parseFloat(e.target.value)||0))} placeholder="0.0" {...inp()} />
//               {formData.gpa > 0 && (
//                 <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//                   <div style={{ flex:1, height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
//                     <div style={{ height:"100%", width:`${(formData.gpa/10)*100}%`, background:`linear-gradient(90deg,${gpaColor(formData.gpa)}66,${gpaColor(formData.gpa)})`, borderRadius:2, transition:"width 0.3s" }} />
//                   </div>
//                   <span style={{ fontSize:"0.7rem", fontWeight:700, color:gpaColor(formData.gpa), minWidth:28 }}>{formData.gpa.toFixed(1)}</span>
//                 </div>
//               )}
//             </Field>
//             <Field label="Attendance (%)" icon={<Ic.Heart />}>
//               <input type="number" value={formData.attendance} min="0" max="100"
//                 onChange={e => set("attendance", Math.min(100, parseInt(e.target.value)||0))} placeholder="0" {...inp()} />
//               {formData.attendance > 0 && (
//                 <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//                   <div style={{ flex:1, height:4, background:"#2d3448", borderRadius:2, overflow:"hidden" }}>
//                     <div style={{ height:"100%", width:`${formData.attendance}%`, background:`linear-gradient(90deg,${attColor(formData.attendance)}66,${attColor(formData.attendance)})`, borderRadius:2, transition:"width 0.3s" }} />
//                   </div>
//                   <span style={{ fontSize:"0.7rem", fontWeight:700, color:attColor(formData.attendance), minWidth:28 }}>{formData.attendance}%</span>
//                 </div>
//               )}
//             </Field>
//           </div>

//           {/* Password divider */}
//           <div style={{ display:"flex", alignItems:"center", gap:10, margin:"0.2rem 0 -0.2rem" }}>
//             <div style={{ flex:1, height:1, background:"#1e2535" }} />
//             <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.7rem", fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
//               <Ic.Lock />{mode === "add" ? "Set Password" : "Change Password"}
//               {mode === "edit" && <span style={{ fontSize:"0.65rem", color:"#3a4460", fontWeight:500, background:"#1a2030", border:"1px solid #2d3448", borderRadius:20, padding:"1px 7px", textTransform:"none" }}>optional</span>}
//             </span>
//             <div style={{ flex:1, height:1, background:"#1e2535" }} />
//           </div>

//           {/* Password row */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
//             <Field label="Password" icon={<Ic.Lock />} required={mode === "add"} error={errors.password}>
//               <div style={{ position:"relative" }}>
//                 <input type={showPw ? "text" : "password"} value={formData.password}
//                   onChange={e => set("password", e.target.value)}
//                   placeholder={mode === "add" ? "Min 6 characters" : "Leave blank to keep current"}
//                   style={{ width:"100%", padding:"0.65rem 2.6rem 0.65rem 0.9rem", background:"#0f1117", border:`1px solid ${errors.password ? "#7f1d1d" : "#2d3448"}`, borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
//                 <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:"#475569", cursor:"pointer", display:"flex", padding:3 }}>
//                   {showPw ? <Ic.EyeOff /> : <Ic.Eye />}
//                 </button>
//               </div>
//               {formData.password && (
//                 <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
//                   <div style={{ display:"flex", gap:4, flex:1 }}>
//                     {[1,2,3,4].map(lvl => (
//                       <div key={lvl} style={{ height:4, flex:1, borderRadius:2, background: lvl <= strength.level ? strength.color : "#2d3448", transition:"background 0.25s" }} />
//                     ))}
//                   </div>
//                   <span style={{ fontSize:"0.7rem", fontWeight:700, color:strength.color, minWidth:40 }}>{strength.label}</span>
//                 </div>
//               )}
//             </Field>
//             <Field label="Confirm Password" icon={<Ic.Lock />} required={mode === "add"} error={errors.confirmPassword}>
//               <div style={{ position:"relative" }}>
//                 <input type={showCp ? "text" : "password"} value={formData.confirmPassword}
//                   onChange={e => set("confirmPassword", e.target.value)}
//                   placeholder="Re-enter password"
//                   style={{ width:"100%", padding:"0.65rem 2.6rem 0.65rem 0.9rem", background:"#0f1117", border:`1px solid ${errors.confirmPassword ? "#7f1d1d" : "#2d3448"}`, borderRadius:9, color:"#e2e8f0", fontSize:"0.875rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
//                 <button type="button" onClick={() => setShowCp(v => !v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:"#475569", cursor:"pointer", display:"flex", padding:3 }}>
//                   {showCp ? <Ic.EyeOff /> : <Ic.Eye />}
//                 </button>
//               </div>
//               {formData.confirmPassword && formData.password && (
//                 <span style={{ fontSize:"0.72rem", fontWeight:600, color: formData.password === formData.confirmPassword ? "#c0dd97" : "#f87171" }}>
//                   {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
//                 </span>
//               )}
//             </Field>
//           </div>

//           {/* Status toggle */}
//           <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => set("status", formData.status === "active" ? "inactive" : "active")}>
//             <div style={{ width:44, height:24, borderRadius:12, background: formData.status === "active" ? "rgba(99,153,34,0.25)" : "#2d3448", border:`1px solid ${formData.status === "active" ? "rgba(99,153,34,0.5)" : "#3d4860"}`, position:"relative", transition:"all 0.2s", flexShrink:0 }}>
//               <div style={{ position:"absolute", top:3, left: formData.status === "active" ? 22 : 3, width:16, height:16, borderRadius:8, background: formData.status === "active" ? "#c0dd97" : "#64748b", transition:"left 0.2s" }} />
//             </div>
//             <span style={{ fontSize:"0.855rem", color:"#94a3b8" }}>Student is <strong style={{ color:"#e2e8f0" }}>{formData.status === "active" ? "Active" : "Inactive"}</strong></span>
//             {formData.status === "active" && <span style={{ width:8, height:8, borderRadius:"50%", background:"#639922", boxShadow:"0 0 6px rgba(99,153,34,0.6)", display:"inline-block" }} />}
//           </div>
//         </div>

//         {/* Footer */}
//         <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, padding:"1rem 1.5rem", borderTop:"1px solid #1e2535", background:"#131720", borderRadius:"0 0 16px 16px", flexShrink:0 }}>
//           <button onClick={onClose} style={{ padding:"0.55rem 1.2rem", background:"transparent", border:"1px solid #2d3448", borderRadius:9, color:"#94a3b8", fontSize:"0.875rem", fontWeight:500, cursor:"pointer" }}>Cancel</button>
//           <button onClick={() => { if(validate()) onSave(); }}
//             style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"0.58rem 1.3rem", background:"#3b6d11", border:"1px solid #639922", borderRadius:9, color:"#c0dd97", fontSize:"0.875rem", fontWeight:600, cursor:"pointer" }}>
//             <Ic.Save />{mode === "add" ? "Add Student" : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main ─────────────────────────────────────────────────────────────────────
// export default function StudentsManagement() {
//   const [students, setStudents] = useState(INITIAL_STUDENTS);
//   const [search, setSearch]     = useState("");
//   const [grade, setGrade]       = useState("All Grades");
//   const [gender, setGender]     = useState("All Genders");
//   const [status, setStatus]     = useState("All Status");
//   const [school, setSchool]     = useState("All Schools");
//   const [toast, setToast]       = useState("");
//   const [viewIdx, setViewIdx]   = useState(null);
//   const [delStudent, setDelStudent] = useState(null);
//   const [formOpen, setFormOpen] = useState(false);
//   const [formMode, setFormMode] = useState("add");
//   const [editId, setEditId]     = useState(null);
//   const [formData, setFormData] = useState(defaultForm);
//   const nextId = useRef(INITIAL_STUDENTS.length + 1);

//   const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

//   const filtered = students.filter(s => {
//     const q = search.toLowerCase();
//     return (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.school.toLowerCase().includes(q))
//       && (grade  === "All Grades"  || s.grade  === grade)
//       && (gender === "All Genders" || s.gender === gender)
//       && (status === "All Status"  || (s.status === "active" ? "Active" : "Inactive") === status)
//       && (school === "All Schools" || s.school === school);
//   });

//   const stats = {
//     total:    students.length,
//     active:   students.filter(s => s.status === "active").length,
//     avgGpa:   (students.reduce((a,s) => a+s.gpa, 0) / (students.length||1)).toFixed(1),
//     avgAtt:   Math.round(students.reduce((a,s) => a+s.attendance, 0) / (students.length||1)),
//   };

//   const openAdd = () => { setFormData(defaultForm); setFormMode("add"); setEditId(null); setFormOpen(true); };
//   const openEdit = s => {
//     setFormData({ name:s.name, email:s.email, phone:s.phone, dob:s.dob, gender:s.gender, grade:s.grade, section:s.section, school:s.school, parentName:s.parentName, parentPhone:s.parentPhone, address:s.address, gpa:s.gpa, attendance:s.attendance, status:s.status, password:"", confirmPassword:"" });
//     setFormMode("edit"); setEditId(s.id); setFormOpen(true);
//   };

//   const handleSave = () => {
//     if (formMode === "add") {
//       const id = `std${String(nextId.current++).padStart(3,"0")}`;
//       setStudents(p => [...p, { ...formData, id, enrolled: new Date().toISOString().slice(0,10), subjects:[] }]);
//       showToast("Student added successfully");
//     } else {
//       setStudents(p => p.map(s => s.id === editId ? { ...s, ...formData } : s));
//       showToast("Student updated successfully");
//     }
//     setFormOpen(false);
//   };

//   const handleDelete = () => {
//     setStudents(p => p.filter(s => s.id !== delStudent.id));
//     setDelStudent(null);
//     showToast("Student deleted successfully");
//   };

//   return (
//     <div style={{ padding:"2rem 2.5rem", minHeight:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
//       <style>{`
//         @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
//         @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
//         * { box-sizing:border-box; }
//         input::placeholder, textarea::placeholder { color:#3a4460; }
//         select option { background:#161b27; }
//         input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
//         ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#2d3448;border-radius:4px}
//         .row-hover:hover { background:rgba(99,153,34,0.04) !important; }
//         .stat-card:hover { transform:translateY(-2px); }
//         .add-btn:hover { background:#27500a !important; }
//       `}</style>

//       {/* Header */}
//       <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
//         <div>
//           <h1 style={{ margin:"0 0 3px", fontSize:"1.6rem", fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.4px" }}>Students Management</h1>
//           <p style={{ margin:0, fontSize:"0.83rem", color:"#64748b" }}>Manage student profiles, academics, and attendance</p>
//         </div>
//         <button className="add-btn" onClick={openAdd}
//           style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"0.58rem 1.2rem", background:"#3b6d11", border:"1px solid #639922", borderRadius:9, color:"#c0dd97", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", transition:"background 0.15s", whiteSpace:"nowrap" }}>
//           <Ic.Plus /> Add New Student
//         </button>
//       </div>

//       {/* Stats */}
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"1.5rem" }}>
//         {[
//           { label:"Total Students", value:stats.total,        color:"#7dd3fc", bg:"rgba(55,138,221,0.08)",  icon:<Ic.Users /> },
//           { label:"Active Students",value:stats.active,       color:"#c0dd97", bg:"rgba(99,153,34,0.08)",   icon:<Ic.Check /> },
//           { label:"Average GPA",    value:`${stats.avgGpa}/10`, color:"#fbbf24", bg:"rgba(245,158,11,0.08)", icon:<Ic.Star /> },
//           { label:"Avg Attendance", value:`${stats.avgAtt}%`, color:"#60a5fa", bg:"rgba(59,130,246,0.08)",  icon:<Ic.Trend /> },
//         ].map(s => (
//           <div key={s.label} className="stat-card" style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:12, padding:"1.1rem 1.2rem", transition:"transform 0.15s" }}>
//             <div style={{ width:38, height:38, borderRadius:9, background:s.bg, color:s.color, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>{s.icon}</div>
//             <div style={{ fontSize:"1.55rem", fontWeight:700, lineHeight:1, marginBottom:4, color:s.color }}>{s.value}</div>
//             <div style={{ fontSize:"0.75rem", color:"#64748b", fontWeight:500 }}>{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Toolbar */}
//       <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:12, padding:"1rem 1.2rem", display:"flex", alignItems:"center", gap:10, marginBottom:"1.5rem", flexWrap:"wrap" }}>
//         <div style={{ position:"relative", flex:1, minWidth:200, display:"flex", alignItems:"center" }}>
//           <span style={{ position:"absolute", left:12, pointerEvents:"none" }}><Ic.Search /></span>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or school…"
//             style={{ width:"100%", padding:"0.55rem 2.4rem 0.55rem 2.5rem", background:"#0f1117", border:"1px solid #2d3448", borderRadius:9, color:"#e2e8f0", fontSize:"0.855rem", outline:"none", fontFamily:"inherit" }} />
//           {search && <button onClick={() => setSearch("")} style={{ position:"absolute", right:10, background:"transparent", border:"none", color:"#64748b", cursor:"pointer", display:"flex", padding:2, borderRadius:4 }}><Ic.X /></button>}
//         </div>
//         {[
//           { val:grade,  set:setGrade,  opts:GRADES },
//           { val:gender, set:setGender, opts:GENDERS },
//           { val:status, set:setStatus, opts:STATUSES },
//           { val:school, set:setSchool, opts:SCHOOLS },
//         ].map((sel,i) => (
//           <div key={i} style={{ position:"relative" }}>
//             <select value={sel.val} onChange={e => sel.set(e.target.value)}
//               style={{ padding:"0.55rem 2rem 0.55rem 0.85rem", background:"#0f1117", border:"1px solid #2d3448", borderRadius:9, color:"#94a3b8", fontSize:"0.82rem", outline:"none", cursor:"pointer", appearance:"none", fontFamily:"inherit", minWidth:130 }}>
//               {sel.opts.map(o => <option key={o}>{o}</option>)}
//             </select>
//             <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#475569", pointerEvents:"none", fontSize:"0.7rem" }}>▾</span>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:12, overflow:"hidden" }}>
//         <div style={{ overflowX:"auto" }}>
//           <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem" }}>
//             <thead>
//               <tr style={{ borderBottom:"1px solid #2d3448" }}>
//                 {["Student","Contact","School · Grade","GPA","Attendance","Status","Actions"].map(h => (
//                   <th key={h} style={{ padding:"0.85rem 1rem", textAlign:"left", color:"#64748b", fontWeight:600, fontSize:"0.74rem", letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr><td colSpan={7} style={{ padding:"4rem 1rem", textAlign:"center" }}>
//                   <p style={{ margin:"0 0 6px", fontSize:"1rem", fontWeight:600, color:"#475569" }}>No students found</p>
//                   <p style={{ margin:"0 0 1.2rem", fontSize:"0.83rem", color:"#3a4460" }}>Try adjusting your filters or search terms</p>
//                   <button onClick={() => { setSearch(""); setGrade("All Grades"); setGender("All Genders"); setStatus("All Status"); setSchool("All Schools"); }}
//                     style={{ padding:"0.5rem 1.1rem", background:"transparent", border:"1px solid #2d3448", borderRadius:8, color:"#64748b", fontSize:"0.875rem", cursor:"pointer", fontFamily:"inherit" }}>Clear filters</button>
//                 </td></tr>
//               ) : filtered.map((s, idx) => {
//                 const av = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
//                 const gc = gpaColor(s.gpa), ac = attColor(s.attendance);
//                 return (
//                   <tr key={s.id} className="row-hover" style={{ borderBottom:"1px solid rgba(45,52,72,0.5)", transition:"background 0.12s" }}>
//                     {/* Student */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//                         <div style={{ width:40, height:40, borderRadius:11, background:av.bg, color:av.fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.88rem", flexShrink:0 }}>{initials(s.name)}</div>
//                         <div>
//                           <div style={{ fontWeight:600, color:"#f1f5f9", fontSize:"0.88rem" }}>{s.name}</div>
//                           <div style={{ fontSize:"0.72rem", color:"#3a4460" }}>{s.id} · {s.gender}</div>
//                         </div>
//                       </div>
//                     </td>
//                     {/* Contact */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ fontWeight:500, color:"#e2e8f0", fontSize:"0.84rem" }}>{s.email}</div>
//                       <div style={{ fontSize:"0.72rem", color:"#475569" }}>{s.phone}</div>
//                     </td>
//                     {/* School · Grade */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ color:"#e2e8f0", fontWeight:500, fontSize:"0.84rem", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.school}</div>
//                       <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
//                         <span style={{ fontSize:"0.72rem", color:"#64748b" }}>{s.grade}</span>
//                         <span style={{ padding:"1px 7px", background:"rgba(99,153,34,0.1)", border:"1px solid rgba(99,153,34,0.2)", borderRadius:20, fontSize:"0.68rem", fontWeight:600, color:"#c0dd97" }}>Sec {s.section}</span>
//                       </div>
//                     </td>
//                     {/* GPA */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:100 }}>
//                         <div style={{ flex:1, height:6, background:"#2d3448", borderRadius:3, overflow:"hidden" }}>
//                           <div style={{ height:"100%", width:`${(s.gpa/10)*100}%`, background:`linear-gradient(90deg,${gc}66,${gc})`, borderRadius:3 }} />
//                         </div>
//                         <span style={{ fontSize:"0.8rem", fontWeight:700, color:gc, minWidth:28 }}>{s.gpa.toFixed(1)}</span>
//                       </div>
//                     </td>
//                     {/* Attendance */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:100 }}>
//                         <div style={{ flex:1, height:6, background:"#2d3448", borderRadius:3, overflow:"hidden" }}>
//                           <div style={{ height:"100%", width:`${s.attendance}%`, background:`linear-gradient(90deg,${ac}66,${ac})`, borderRadius:3 }} />
//                         </div>
//                         <span style={{ fontSize:"0.8rem", fontWeight:700, color:ac, minWidth:34 }}>{s.attendance}%</span>
//                       </div>
//                     </td>
//                     {/* Status */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"0.82rem", fontWeight:500, color: s.status === "active" ? "#c0dd97" : "#64748b" }}>
//                         <span style={{ width:8, height:8, borderRadius:"50%", background: s.status === "active" ? "#639922" : "#64748b", boxShadow: s.status === "active" ? "0 0 5px rgba(99,153,34,0.5)" : "none" }} />
//                         {s.status === "active" ? "Active" : "Inactive"}
//                       </div>
//                     </td>
//                     {/* Actions */}
//                     <td style={{ padding:"0.9rem 1rem" }}>
//                       <div style={{ display:"flex", gap:5 }}>
//                         {[
//                           { title:"View",   color:"#7dd3fc", hbg:"#0c1a2e", onClick:()=>setViewIdx(idx),        icon:<Ic.Eye /> },
//                           { title:"Edit",   color:"#c0dd97", hbg:"rgba(99,153,34,0.1)", onClick:()=>openEdit(s), icon:<Ic.Edit /> },
//                           { title:"Delete", color:"#f87171", hbg:"#2a0d0d", onClick:()=>setDelStudent(s),        icon:<Ic.Trash /> },
//                         ].map(btn => (
//                           <button key={btn.title} title={btn.title} onClick={btn.onClick}
//                             style={{ width:30, height:30, borderRadius:8, border:"1px solid #2d3448", background:"transparent", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", padding:0, color:btn.color, transition:"background 0.12s" }}
//                             onMouseEnter={e => e.currentTarget.style.background=btn.hbg}
//                             onMouseLeave={e => e.currentTarget.style.background="transparent"}>
//                             {btn.icon}
//                           </button>
//                         ))}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//         {filtered.length > 0 && (
//           <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0.9rem 1.2rem", borderTop:"1px solid #2d3448" }}>
//             <span style={{ fontSize:"0.78rem", color:"#475569" }}>Showing <strong style={{ color:"#64748b" }}>{filtered.length}</strong> of <strong style={{ color:"#64748b" }}>{students.length}</strong> student{students.length !== 1 ? "s" : ""}</span>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {viewIdx !== null && filtered[viewIdx] && <ViewModal student={filtered[viewIdx]} idx={viewIdx} onClose={() => setViewIdx(null)} />}
//       {delStudent && <DeleteModal student={delStudent} onCancel={() => setDelStudent(null)} onConfirm={handleDelete} />}
//       {formOpen && <FormModal mode={formMode} formData={formData} setFormData={setFormData} onSave={handleSave} onClose={() => setFormOpen(false)} />}
//       <Toast msg={toast} />
//     </div>
//   );
// }

//************************************************************************* */

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import AddModal from "./add";      // now ./add.tsx
import EditModal from "./edit";    // ./edit.tsx
import ViewModal from "./view";    // ./view.tsx
import DeleteModal from "./delete";

// ─── Constants & Helpers (duplicated here) ──────────────────────────────────
const AVATAR_PALETTE = [
  { bg:"#1e293b", fg:"#a78bfa" }, { bg:"#064e3b", fg:"#6ee7b7" },
  { bg:"#4c0519", fg:"#f9a8d4" }, { bg:"#0c4a6e", fg:"#93c5fd" },
  { bg:"#451a03", fg:"#fcd34d" }, { bg:"#2e1065", fg:"#c4b5fd" },
];

const GRADES    = ["All Grades","8th","9th","10th","11th","12th"];
const GENDERS   = ["All Genders","Male","Female","Other"];
const STATUSES  = ["All Status","Active","Inactive"];
const SECTIONS  = ["A","B","C","D"];
const GRADE_OPTS = ["8th","9th","10th","11th","12th"];

function initials(name = "") { return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(); }
function gpaColor(g)  { return g >= 9 ? "#34d399" : g >= 7 ? "#fbbf24" : "#f87171"; }
function attColor(a)  { return a >= 90 ? "#34d399" : a >= 75 ? "#fbbf24" : "#f87171"; }

function formToDTO(f) {
  const [firstName, ...rest] = (f.name || "").trim().split(" ");
  const lastName = rest.join(" ");
  return {
    firstName:     firstName || "",
    lastName:      lastName  || "",
    username:      f.username,
    password:      f.password,
    studentEmail:  f.email,
    studentMobile: f.phone,
    parentMobile:  f.parentPhone,
    parentEmail:   f.parentEmail || "",
    standard:      f.gradeId,
    batch:         f.section,
    schoolId:      f.schoolId || "",
    schoolYear:    f.schoolYear || new Date().getFullYear().toString(),
    address:       f.address,
    status:        f.status === "active" ? "Active" : "Inactive",
  };
}

function dtoToDisplay(s) {
  return {
    id:           String(s.id),
    name:         `${s.firstName || ""} ${s.lastName || ""}`.trim(),
    email:        s.studentEmail  || "",
    phone:        s.studentMobile || "",
    dob:          s.dob           || "",
    gender:       s.gender        || "Male",
    gradeId:      s.standard      || "",
    grade:        s.standard      || "",
    section:      s.batch         || "A",
    school:       s.school        || s.schoolName || "",
    schoolId:     s.schoolId      || "",
    parentName:   s.parentName    || "",
    parentPhone:  s.parentMobile  || "",
    parentEmail:  s.parentEmail   || "",
    address:      s.address       || "",
    gpa:          parseFloat(s.gpa) || 0,
    attendance:   parseInt(s.attendance) || 0,
    status:       (s.status || "").toLowerCase() === "active" ? "active" : "inactive",
    enrolled:     s.createdAt ? s.createdAt.slice(0,10) : "",
    subjects:     s.subjects || [],
    username:     s.username || "",
  };
}

const defaultForm = {
  name:"", email:"", phone:"", dob:"", gender:"Male",
  grade:"", gradeId:"", section:"A",
  school:"", schoolId:"",
  parentName:"", parentPhone:"", parentEmail:"",
  address:"", gpa:0, attendance:0, status:"active",
  schoolYear: new Date().getFullYear().toString(),
  username:"", password:"", confirmPassword:"",
};

// ─── API Layer ────────────────────────────────────────────────────────────────
const API = {
  async getStudents(params = {}) {
    const q = new URLSearchParams();
    if (params.page)   q.set("page",   params.page);
    if (params.limit)  q.set("limit",  params.limit);
    if (params.search) q.set("search", params.search);
    if (params.grade && params.grade !== "All Grades") q.set("grade", params.grade);
    const res = await fetch(`/api/students?${q}`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
  },

  async getGrades() {
    const res = await fetch("/api/grade");
    if (!res.ok) throw new Error("Failed to fetch grades");
    return res.json();
  },

  async getSchools() {
    const res = await fetch("/api/schools");
    if (!res.ok) throw new Error("Failed to fetch schools");
    return res.json();
  },

  async createStudent(data) {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to create student");
    return json.data;
  },

  async updateStudent(id, data) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to update student");
    return json.data;
  },

  async deleteStudent(id) {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to delete student");
    return json;
  },
};

// ─── Icons (duplicated) ──────────────────────────────────────────────────────
const Ic = {
  Plus:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:        () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Users:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Trend:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Cap:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Person:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Warn:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Lock:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Mail:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Home:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Save:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Star:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Calendar: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Book:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Heart:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Building: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9M16 21V9M3 9h18M8 3v6M16 3v6"/></svg>,
  Gender:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>,
  Section:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  Copy:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Refresh:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Sparkle:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>,
  Loader:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>,
  Key:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5L19 4M17.5 9.5L21 6"/></svg>,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success" }) {
  if (!msg) return null;
  const colors = type === "error"
    ? { bg:"#2a0d0d", border:"#991b1b", color:"#fca5a5" }
    : { bg:"#1a2d12", border:"#639922", color:"#c0dd97" };
  return (
    <div style={{ position:"fixed", top:"1.5rem", right:"1.5rem", background:colors.bg, border:`1px solid ${colors.border}`, borderRadius:10, padding:"0.75rem 1.2rem", color:colors.color, fontSize:"0.875rem", fontWeight:500, zIndex:200, animation:"fadeIn 0.2s ease", maxWidth:320 }}>
      {msg}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StudentsManagement() {
  const [students, setStudents]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const limit = 20;

  const [search, setSearch]         = useState("");
  const [grade, setGrade]           = useState("All Grades");
  const [gender, setGender]         = useState("All Genders");
  const [status, setStatus]         = useState("All Status");

  const [gradeOptions, setGradeOptions]   = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [gradeMap, setGradeMap] = useState({});
  const [schoolMap, setSchoolMap] = useState({});
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [toast, setToast]           = useState({ msg:"", type:"success" });
  const [viewIdx, setViewIdx]       = useState(null);
  const [delStudent, setDelStudent] = useState(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [formMode, setFormMode]     = useState("add");
  const [editId, setEditId]         = useState(null);
  const [formData, setFormData]     = useState(defaultForm);

  const [listLoading, setListLoading]   = useState(false);
  const [formLoading, setFormLoading]   = useState(false);
  const [delLoading, setDelLoading]     = useState(false);
  const [listError, setListError]       = useState("");

  const optionsLoadedRef = useRef(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 3500);
  };

  // Load grade & school options
  useEffect(() => {
    if (optionsLoadedRef.current) return;
    optionsLoadedRef.current = true;

    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        let gradesData = [];
        let schoolsData = [];
        try {
          const gradesRes = await API.getGrades();
          gradesData = gradesRes?.data || [];
          if (!Array.isArray(gradesData)) gradesData = [];
        } catch (e) {
          console.warn("⚠️ Grades API failed:", e.message);
        }

        try {
          const schoolsRes = await API.getSchools();
          schoolsData = schoolsRes?.data || [];
          if (!Array.isArray(schoolsData)) schoolsData = [];
        } catch (e) {
          console.warn("⚠️ Schools API failed:", e.message);
        }

        if (gradesData.length > 0) {
          const mapped = gradesData.map(g => ({
            value: String(g.id ?? g._id ?? g.gradeId ?? g.value),
            label: g.name ?? g.gradeName ?? g.label ?? String(g.id),
          }));
          setGradeOptions(mapped);
          const map = {};
          mapped.forEach(g => { map[g.value] = g.label; });
          setGradeMap(map);
        } else {
          const fallback = GRADE_OPTS.map(g => ({ value: g, label: g }));
          setGradeOptions(fallback);
          const map = {};
          fallback.forEach(g => { map[g.value] = g.label; });
          setGradeMap(map);
        }

        if (schoolsData.length > 0) {
          const mapped = schoolsData.map(s => ({
            value: String(s.id ?? s._id ?? s.schoolId ?? s.value),
            label: s.name ?? s.schoolName ?? s.label ?? String(s.id),
          }));
          setSchoolOptions(mapped);
          const map = {};
          mapped.forEach(s => { map[s.value] = s.label; });
          setSchoolMap(map);
        } else {
          const fallback = [
            "Lincoln High School","Tech Valley Academy","Riverside International",
            "Central Academy","Horizon STEM School"
          ].map(s => ({ value: s, label: s }));
          setSchoolOptions(fallback);
          const map = {};
          fallback.forEach(s => { map[s.value] = s.label; });
          setSchoolMap(map);
        }
      } catch (e) {
        console.error("Error loading options:", e);
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const params = { page, limit, search };
      if (grade !== "All Grades") params.grade = grade;
      const res = await API.getStudents(params);
      const rows = (res.data || []).map(dtoToDisplay);
      setStudents(rows);
      setTotal(res.meta?.total || rows.length);
    } catch (e) {
      setListError(e.message || "Failed to load students");
    } finally {
      setListLoading(false);
    }
  }, [page, search, grade]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter(s =>
    (gender === "All Genders" || s.gender === gender) &&
    (status === "All Status"  || (s.status === "active" ? "Active" : "Inactive") === status)
  );

  const stats = {
    total:   total,
    active:  students.filter(s => s.status === "active").length,
    avgGpa:  students.length ? (students.reduce((a,s) => a+s.gpa,0)/students.length).toFixed(1) : "0.0",
    avgAtt:  students.length ? Math.round(students.reduce((a,s) => a+s.attendance,0)/students.length) : 0,
  };

  const openAdd = () => {
    setFormData(defaultForm);
    setFormMode("add");
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = s => {
    const gradeOpt  = gradeOptions.find(g => g.value === s.gradeId || g.label === s.grade);
    const schoolOpt = schoolOptions.find(sc => sc.value === s.schoolId || sc.label === s.school);
    setFormData({
      name: s.name, email: s.email, phone: s.phone, dob: s.dob,
      gender: s.gender,
      grade: gradeOpt?.label || s.grade || "",
      gradeId: gradeOpt?.value || s.gradeId || s.grade || "",
      section: s.section,
      school: schoolOpt?.label || s.school || "",
      schoolId: schoolOpt?.value || s.schoolId || "",
      parentName: s.parentName, parentPhone: s.parentPhone,
      parentEmail: s.parentEmail || "",
      address: s.address, gpa: s.gpa, attendance: s.attendance,
      status: s.status, schoolYear: new Date().getFullYear().toString(),
      username: s.username || "", password: "", confirmPassword: "",
    });
    setFormMode("edit");
    setEditId(s.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    try {
      const dto = formToDTO(formData);
      if (formMode === "add") {
        await API.createStudent(dto);
        showToast("Student added successfully");
      } else {
        const updateDto = { ...dto };
        if (!formData.password) delete updateDto.password;
        await API.updateStudent(editId, updateDto);
        showToast("Student updated successfully");
      }
      setFormOpen(false);
      fetchStudents();
    } catch (e) {
      showToast(e.message || "Something went wrong", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await API.deleteStudent(delStudent.id);
      setDelStudent(null);
      showToast("Student deleted successfully");
      fetchStudents();
    } catch (e) {
      showToast(e.message || "Failed to delete student", "error");
    } finally {
      setDelLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getGradeName = (student) => {
    if (student.grade && gradeMap[student.grade]) return gradeMap[student.grade];
    if (student.gradeId && gradeMap[student.gradeId]) return gradeMap[student.gradeId];
    return student.grade || student.gradeId || "—";
  };

  const getSchoolName = (student) => {
    if (student.school) return student.school;
    if (student.schoolId && schoolMap[student.schoolId]) return schoolMap[student.schoolId];
    return student.schoolId || "—";
  };

  return (
    <div style={{ padding:"2rem 2.5rem", minHeight:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        input::placeholder,textarea::placeholder{color:#3a4460}
        select option{background:#161b27}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.5);cursor:pointer}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2d3448;border-radius:4px}
        .row-hover:hover{background:rgba(99,153,34,0.04)!important}
        .stat-card:hover{transform:translateY(-2px)}
        .add-btn:hover{background:#27500a!important}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ margin:"0 0 3px", fontSize:"1.6rem", fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.4px" }}>Students Management</h1>
          <p style={{ margin:0, fontSize:"0.83rem", color:"#64748b" }}>Manage student profiles, academics, and attendance</p>
        </div>
        <button className="add-btn" onClick={openAdd}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"0.58rem 1.2rem", background:"#3b6d11", border:"1px solid #639922", borderRadius:9, color:"#c0dd97", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", transition:"background 0.15s", whiteSpace:"nowrap" }}>
          <Ic.Plus />Add New Student
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"1.5rem" }}>
        {[
          { label:"Total Students",  value:stats.total,           color:"#7dd3fc", bg:"rgba(55,138,221,0.08)", icon:<Ic.Users /> },
          { label:"Active Students", value:stats.active,          color:"#c0dd97", bg:"rgba(99,153,34,0.08)",  icon:<Ic.Check /> },
          { label:"Average GPA",     value:`${stats.avgGpa}/10`,  color:"#fbbf24", bg:"rgba(245,158,11,0.08)", icon:<Ic.Star /> },
          { label:"Avg Attendance",  value:`${stats.avgAtt}%`,    color:"#60a5fa", bg:"rgba(59,130,246,0.08)", icon:<Ic.Trend /> },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:12, padding:"1.1rem 1.2rem", transition:"transform 0.15s" }}>
            <div style={{ width:38, height:38, borderRadius:9, background:s.bg, color:s.color, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontSize:"1.55rem", fontWeight:700, lineHeight:1, marginBottom:4, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:"0.75rem", color:"#64748b", fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:12, padding:"1rem 1.2rem", display:"flex", alignItems:"center", gap:10, marginBottom:"1.5rem", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><Ic.Search /></span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email or username…"
            style={{ width:"100%", padding:"0.55rem 2.4rem 0.55rem 2.5rem", background:"#0f1117", border:"1px solid #2d3448", borderRadius:9, color:"#e2e8f0", fontSize:"0.855rem", outline:"none", fontFamily:"inherit" }} />
          {search && <button onClick={() => { setSearch(""); setPage(1); setTimeout(fetchStudents, 0); }} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:"#64748b", cursor:"pointer", display:"flex", padding:2, borderRadius:4 }}><Ic.X /></button>}
        </div>
        {[
          { val:grade,  set:v => { setGrade(v);  setPage(1); }, opts: gradeOptions.length ? gradeOptions.map(o => o.label) : GRADES },
          { val:gender, set:v => { setGender(v); setPage(1); }, opts:GENDERS },
          { val:status, set:v => { setStatus(v); setPage(1); }, opts:STATUSES },
        ].map((sel,i) => {
          const optLabels = sel.opts;
          return (
            <div key={i} style={{ position:"relative" }}>
              <select value={sel.val} onChange={e => sel.set(e.target.value)}
                style={{ padding:"0.55rem 2rem 0.55rem 0.85rem", background:"#0f1117", border:"1px solid #2d3448", borderRadius:9, color:"#94a3b8", fontSize:"0.82rem", outline:"none", cursor:"pointer", appearance:"none", fontFamily:"inherit", minWidth:130 }}>
                {optLabels.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#475569", pointerEvents:"none", fontSize:"0.7rem" }}>▾</span>
            </div>
          );
        })}
        <button onClick={fetchStudents} title="Refresh" style={{ padding:"0.55rem 0.75rem", background:"transparent", border:"1px solid #2d3448", borderRadius:9, color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center" }}>
          <Ic.Refresh />
        </button>
        <button
          onClick={() => {
            setSearch("");
            setGrade("All Grades");
            setGender("All Genders");
            setStatus("All Status");
            setPage(1);
            setTimeout(fetchStudents, 0);
          }}
          style={{ padding:"0.5rem 1.1rem", background:"transparent", border:"1px solid #2d3448", borderRadius:8, color:"#64748b", fontSize:"0.875rem", cursor:"pointer", fontFamily:"inherit" }}
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background:"#161b27", border:"1px solid #2d3448", borderRadius:12, overflow:"hidden" }}>
        {listError && (
          <div style={{ padding:"1rem 1.2rem", background:"rgba(127,29,29,0.15)", borderBottom:"1px solid #7f1d1d", display:"flex", alignItems:"center", gap:8 }}>
            <Ic.Warn />
            <span style={{ fontSize:"0.85rem", color:"#fca5a5" }}>{listError}</span>
            <button onClick={fetchStudents} style={{ marginLeft:"auto", padding:"0.3rem 0.7rem", background:"transparent", border:"1px solid #991b1b", borderRadius:6, color:"#fca5a5", fontSize:"0.8rem", cursor:"pointer" }}>Retry</button>
          </div>
        )}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #2d3448" }}>
                {["STUDENT", "CONTACT", "SCHOOL-GRADE", "GPA", "ATTENDANCE", "STATUS", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding:"0.85rem 1rem", textAlign:"left", color:"#64748b", fontWeight:600, fontSize:"0.74rem", letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan={7} style={{ padding:"4rem 1rem", textAlign:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, color:"#475569" }}>
                    <Ic.Loader />
                    <span style={{ fontSize:"0.88rem" }}>Loading students…</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:"4rem 1rem", textAlign:"center" }}>
                  <p style={{ margin:"0 0 6px", fontSize:"1rem", fontWeight:600, color:"#475569" }}>No students found</p>
                  <p style={{ margin:"0 0 1.2rem", fontSize:"0.83rem", color:"#3a4460" }}>Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setGrade("All Grades");
                      setGender("All Genders");
                      setStatus("All Status");
                      setPage(1);
                      setTimeout(fetchStudents, 0);
                    }}
                    style={{ padding:"0.5rem 1.1rem", background:"transparent", border:"1px solid #2d3448", borderRadius:8, color:"#64748b", fontSize:"0.875rem", cursor:"pointer", fontFamily:"inherit" }}
                  >
                    Clear filters
                  </button>
                </td></tr>
              ) : filtered.map((s, idx) => {
                const av = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
                const gc = gpaColor(s.gpa), ac = attColor(s.attendance);
                const gradeName = getGradeName(s);
                const schoolName = getSchoolName(s);
                return (
                  <tr key={s.id} className="row-hover" style={{ borderBottom:"1px solid rgba(45,52,72,0.5)", transition:"background 0.12s" }}>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:40, height:40, borderRadius:11, background:av.bg, color:av.fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.88rem", flexShrink:0 }}>{initials(s.name)}</div>
                        <div>
                          <div style={{ fontWeight:600, color:"#f1f5f9", fontSize:"0.88rem" }}>{s.name}</div>
                          <div style={{ fontSize:"0.72rem", color:"#3a4460" }}>{s.id} · {s.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ fontWeight:500, color:"#e2e8f0", fontSize:"0.84rem" }}>{s.email}</div>
                      <div style={{ fontSize:"0.72rem", color:"#475569" }}>{s.phone}</div>
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ fontSize:"0.84rem", color:"#e2e8f0" }}>{schoolName}</div>
                      <span style={{ padding:"1px 7px", background:"rgba(99,153,34,0.1)", border:"1px solid rgba(99,153,34,0.2)", borderRadius:20, fontSize:"0.68rem", fontWeight:600, color:"#c0dd97" }}>
                        {gradeName} · Sec {s.section}
                      </span>
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:90 }}>
                        <div style={{ flex:1, height:6, background:"#2d3448", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(s.gpa/10)*100}%`, background:`linear-gradient(90deg,${gc}66,${gc})`, borderRadius:3 }} />
                        </div>
                        <span style={{ fontSize:"0.8rem", fontWeight:700, color:gc, minWidth:28 }}>{s.gpa.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:90 }}>
                        <div style={{ flex:1, height:6, background:"#2d3448", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${s.attendance}%`, background:`linear-gradient(90deg,${ac}66,${ac})`, borderRadius:3 }} />
                        </div>
                        <span style={{ fontSize:"0.8rem", fontWeight:700, color:ac, minWidth:34 }}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"0.82rem", fontWeight:500, color:s.status === "active" ? "#c0dd97" : "#64748b" }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:s.status === "active" ? "#639922" : "#64748b", boxShadow:s.status === "active" ? "0 0 5px rgba(99,153,34,0.5)" : "none" }} />
                        {s.status === "active" ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        {[
                          { title:"View",   color:"#7dd3fc", hbg:"#0c1a2e", onClick:()=>setViewIdx(idx),    icon:<Ic.Eye /> },
                          { title:"Edit",   color:"#c0dd97", hbg:"rgba(99,153,34,0.1)", onClick:()=>openEdit(s), icon:<Ic.Edit /> },
                          { title:"Delete", color:"#f87171", hbg:"#2a0d0d", onClick:()=>setDelStudent(s),    icon:<Ic.Trash /> },
                        ].map(btn => (
                          <button key={btn.title} title={btn.title} onClick={btn.onClick}
                            style={{ width:30, height:30, borderRadius:8, border:"1px solid #2d3448", background:"transparent", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", padding:0, color:btn.color, transition:"background 0.12s" }}
                            onMouseEnter={e => e.currentTarget.style.background=btn.hbg}
                            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!listLoading && filtered.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.9rem 1.2rem", borderTop:"1px solid #2d3448" }}>
            <span style={{ fontSize:"0.78rem", color:"#475569" }}>
              Showing <strong style={{ color:"#64748b" }}>{filtered.length}</strong> of <strong style={{ color:"#64748b" }}>{total}</strong> student{total !== 1 ? "s" : ""}
            </span>
            {totalPages > 1 && (
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page === 1}
                  style={{ padding:"0.35rem 0.7rem", background:"transparent", border:"1px solid #2d3448", borderRadius:7, color: page===1 ? "#3a4460" : "#94a3b8", cursor:page===1 ? "not-allowed" : "pointer", fontSize:"0.8rem" }}>← Prev</button>
                {Array.from({ length: Math.min(totalPages,5) }, (_,i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ padding:"0.35rem 0.65rem", background: page===p ? "rgba(99,153,34,0.15)" : "transparent", border:`1px solid ${page===p ? "rgba(99,153,34,0.4)" : "#2d3448"}`, borderRadius:7, color:page===p ? "#c0dd97" : "#94a3b8", cursor:"pointer", fontSize:"0.8rem" }}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page === totalPages}
                  style={{ padding:"0.35rem 0.7rem", background:"transparent", border:"1px solid #2d3448", borderRadius:7, color:page===totalPages ? "#3a4460" : "#94a3b8", cursor:page===totalPages ? "not-allowed" : "pointer", fontSize:"0.8rem" }}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewIdx !== null && filtered[viewIdx] && (
        <ViewModal student={filtered[viewIdx]} idx={viewIdx} onClose={() => setViewIdx(null)} />
      )}
      {delStudent && (
        <DeleteModal student={delStudent} onCancel={() => setDelStudent(null)} onConfirm={handleDelete} loading={delLoading} />
      )}
      {formOpen && (
        formMode === "add" ? (
          <AddModal
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onClose={() => setFormOpen(false)}
            loading={formLoading}
            gradeOptions={gradeOptions}
            schoolOptions={schoolOptions}
          />
        ) : (
          <EditModal
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onClose={() => setFormOpen(false)}
            loading={formLoading}
            gradeOptions={gradeOptions}
            schoolOptions={schoolOptions}
          />
        )
      )}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}