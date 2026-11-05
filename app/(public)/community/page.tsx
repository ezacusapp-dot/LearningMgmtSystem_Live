// "use client";
// // Save as: app/community/page.jsx   (or pages/community.jsx if you use the Pages Router)
// import { useState, useEffect, useMemo, useRef } from "react";
// import Link from "next/link";

// // ------------------------------ DATA -----------------------------------------
// const COURSES = ["Scratch 3", "Python Basics", "Web Development", "App Development"];

// const courseStyle = {
//   "Scratch 3": { cover: "from-yellow-400 to-orange-500", chip: "bg-yellow-100 text-yellow-800" },
//   "Python Basics": { cover: "from-sky-500 to-indigo-600", chip: "bg-sky-100 text-sky-800" },
//   "Web Development": { cover: "from-orange-400 to-pink-500", chip: "bg-pink-100 text-pink-800" },
//   "App Development": { cover: "from-emerald-400 to-cyan-600", chip: "bg-emerald-100 text-emerald-800" },
// };

// const avatarColors = [
//   "from-[#49205E] to-[#BC579E]",
//   "from-sky-500 to-indigo-500",
//   "from-orange-400 to-pink-500",
//   "from-emerald-400 to-teal-600",
//   "from-yellow-400 to-orange-500",
// ];

// // Sample posts. Replace with data from your API / database.
// // `link` is optional: when present, a "View project" link is shown.
// const seedProjects = [
//   { id: 1, user: "aarav_codes", title: "Catch the Stars", course: "Scratch 3", description: "A fast arcade game where you move a basket to catch falling stars. Gets quicker every level and keeps a high score.", tags: ["Game", "Animation"], likes: 48, time: "2 days ago", link: "" },
//   { id: 2, user: "diya.builds", title: "Weather Buddy", course: "Python Basics", description: "Type a city and get the temperature with a simple tip on what to wear. Built with functions and a free weather API.", tags: ["API", "Beginner"], likes: 36, time: "3 days ago", link: "" },
//   { id: 3, user: "rohan_dev", title: "My Portfolio Site", course: "Web Development", description: "A personal website with an about page, project gallery and a contact form. Fully responsive on phones.", tags: ["HTML", "CSS", "JavaScript"], likes: 62, time: "5 days ago", link: "" },
//   { id: 4, user: "ananya_k", title: "Study Planner", course: "App Development", description: "A mobile app to add homework, set reminders and tick tasks off. Includes a dark mode.", tags: ["Mobile", "Productivity"], likes: 41, time: "1 week ago", link: "" },
//   { id: 5, user: "kabir_scratch", title: "Maze Runner", course: "Scratch 3", description: "Guide the cat through three mazes before the timer runs out. Includes a sound effect for every wall hit.", tags: ["Game", "Sound"], likes: 27, time: "1 week ago", link: "" },
//   { id: 6, user: "meera.py", title: "Quiz Master", course: "Python Basics", description: "A quiz game with a question bank, score tracking and a leaderboard saved to a file.", tags: ["Game", "Files"], likes: 33, time: "2 weeks ago", link: "" },
//   { id: 7, user: "ishaan_web", title: "Recipe Finder", course: "Web Development", description: "Search recipes by ingredient, save favourites and print a shopping list.", tags: ["JavaScript", "Search"], likes: 29, time: "2 weeks ago", link: "" },
// ];

// // ------------------------------ HELPERS --------------------------------------
// const hash = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
// const initials = (u) => u.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "S";

// function Avatar({ user, size = "w-9 h-9 text-xs" }) {
//   return (
//     <span className={`flex-none rounded-full bg-gradient-to-br ${avatarColors[hash(user) % avatarColors.length]} text-white font-bold flex items-center justify-center ${size}`}>
//       {initials(user)}
//     </span>
//   );
// }

// function Heart({ filled }) {
//   return (
//     <svg className="w-5 h-5" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
//     </svg>
//   );
// }

// // ------------------------------ CARDS ----------------------------------------
// function Cover({ p, tall }) {
//   return (
//     <div className={`relative overflow-hidden bg-gradient-to-br ${courseStyle[p.course].cover} ${tall ? "h-full min-h-[200px]" : "h-36"}`}>
//       <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-2 border-dashed border-white/40" />
//       <div className="absolute -left-6 -bottom-10 w-28 h-28 rounded-full bg-white/15" />
//       <span className="absolute right-4 bottom-0 text-8xl font-extrabold text-white/25 leading-none select-none">{p.title[0]}</span>
//       <span className="absolute left-4 top-4 text-xs font-semibold bg-white/90 text-gray-800 rounded-full px-3 py-1">{p.course}</span>
//     </div>
//   );
// }

// function LikeButton({ liked, count, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       aria-pressed={liked}
//       aria-label={liked ? "Remove like" : "Like this project"}
//       className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-1.5 transition-all duration-200 active:scale-90 focus-visible:ring-2 focus-visible:ring-[#BC579E] ${
//         liked ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500"
//       }`}
//     >
//       <Heart filled={liked} />
//       {count}
//     </button>
//   );
// }

// function ProjectCard({ p, liked, onLike }) {
//   return (
//     <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
//       <Cover p={p} />
//       <div className="p-5 flex flex-col flex-1">
//         <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-[#49205E] transition-colors">{p.title}</h3>
//         <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">{p.description}</p>
//         <div className="flex flex-wrap gap-1.5 mb-5">
//           {p.tags.map((t) => (
//             <span key={t} className={`text-xs font-medium rounded-full px-2.5 py-1 ${courseStyle[p.course].chip}`}>{t}</span>
//           ))}
//         </div>
//         <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
//           <div className="flex items-center gap-2.5 min-w-0">
//             <Avatar user={p.user} />
//             <div className="min-w-0">
//               <div className="text-sm font-semibold text-gray-900 truncate">@{p.user}</div>
//               <div className="text-xs text-gray-400">{p.time}</div>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {p.link && (
//               <a href={p.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.title}`} className="w-9 h-9 rounded-full bg-purple-50 text-[#49205E] flex items-center justify-center hover:bg-[#49205E] hover:text-white transition-colors">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H18m0 0v4.5M18 6l-8.25 8.25M10.5 6H7.5A2.25 2.25 0 005.25 8.25v8.25A2.25 2.25 0 007.5 18.75h8.25A2.25 2.25 0 0018 16.5v-3" /></svg>
//               </a>
//             )}
//             <LikeButton liked={liked} count={p.likes} onClick={onLike} />
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// function FeaturedCard({ p, liked, onLike }) {
//   return (
//     <article className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden grid md:grid-cols-5 mb-10">
//       <div className="md:col-span-2"><Cover p={p} tall /></div>
//       <div className="md:col-span-3 p-6 sm:p-8 flex flex-col">
//         <span className="self-start inline-flex items-center gap-1.5 text-xs font-bold bg-[#c8e03a] text-gray-900 rounded-full px-3 py-1 mb-4">
//           <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" /></svg>
//           Most loved project
//         </span>
//         <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{p.title}</h3>
//         <p className="text-gray-500 leading-relaxed mb-5">{p.description}</p>
//         <div className="flex flex-wrap gap-1.5 mb-6">
//           {p.tags.map((t) => <span key={t} className={`text-xs font-medium rounded-full px-2.5 py-1 ${courseStyle[p.course].chip}`}>{t}</span>)}
//         </div>
//         <div className="mt-auto flex items-center justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <Avatar user={p.user} size="w-11 h-11 text-sm" />
//             <div>
//               <div className="font-semibold text-gray-900">@{p.user}</div>
//               <div className="text-xs text-gray-400">{p.time}</div>
//             </div>
//           </div>
//           <LikeButton liked={liked} count={p.likes} onClick={onLike} />
//         </div>
//       </div>
//     </article>
//   );
// }

// // ------------------------------ SHARE FORM -----------------------------------
// function ShareModal({ onClose, onSubmit }) {
//   const [form, setForm] = useState({ user: "", title: "", course: COURSES[0], description: "", tags: "", link: "" });
//   const [errors, setErrors] = useState({});
//   const firstField = useRef(null);

//   useEffect(() => {
//     firstField.current?.focus();
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => {
//       document.body.style.overflow = prev;
//       window.removeEventListener("keydown", onKey);
//     };
//   }, [onClose]);

//   const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

//   const submit = (e) => {
//     e.preventDefault();
//     const er = {};
//     if (!form.user.trim()) er.user = "Enter your username";
//     if (!form.title.trim()) er.title = "Give your project a title";
//     if (form.description.trim().length < 20) er.description = "Tell us a little more (at least 20 characters)";
//     if (form.link && !/^https?:\/\//i.test(form.link)) er.link = "Link must start with http:// or https://";
//     setErrors(er);
//     if (Object.keys(er).length) return;
//     onSubmit({
//       id: Date.now(),
//       user: form.user.trim().replace(/^@/, ""),
//       title: form.title.trim(),
//       course: form.course,
//       description: form.description.trim(),
//       tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4),
//       likes: 0,
//       time: "Just now",
//       link: form.link.trim(),
//     });
//   };

//   const input = (err) =>
//     `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-[#BC579E]/40 ${err ? "border-red-400" : "border-gray-200 focus:border-[#BC579E]"}`;

//   return (
//     <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="share-title">
//       <div className="absolute inset-0 bg-[#2a0f38]/60 backdrop-blur-sm" onClick={onClose} />
//       <form onSubmit={submit} noValidate className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <h2 id="share-title" className="text-xl font-extrabold text-gray-900">Share your project</h2>
//           <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <label className="block">
//               <span className="text-sm font-semibold text-gray-700">Username</span>
//               <input ref={firstField} value={form.user} onChange={set("user")} placeholder="e.g. aarav_codes" className={`mt-1.5 ${input(errors.user)}`} />
//               {errors.user && <span className="text-xs text-red-500">{errors.user}</span>}
//             </label>
//             <label className="block">
//               <span className="text-sm font-semibold text-gray-700">Course</span>
//               <select value={form.course} onChange={set("course")} className={`mt-1.5 bg-white ${input()}`}>
//                 {COURSES.map((c) => <option key={c}>{c}</option>)}
//               </select>
//             </label>
//           </div>
//           <label className="block">
//             <span className="text-sm font-semibold text-gray-700">Project title</span>
//             <input value={form.title} onChange={set("title")} placeholder="Give your project a name" maxLength={60} className={`mt-1.5 ${input(errors.title)}`} />
//             {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
//           </label>
//           <label className="block">
//             <span className="text-sm font-semibold text-gray-700">What does it do?</span>
//             <textarea value={form.description} onChange={set("description")} rows={4} maxLength={300} placeholder="Describe your project in a few sentences" className={`mt-1.5 resize-none ${input(errors.description)}`} />
//             <span className="flex justify-between text-xs">
//               <span className="text-red-500">{errors.description}</span>
//               <span className="text-gray-400">{form.description.length}/300</span>
//             </span>
//           </label>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <label className="block">
//               <span className="text-sm font-semibold text-gray-700">Tags <span className="font-normal text-gray-400">(comma separated)</span></span>
//               <input value={form.tags} onChange={set("tags")} placeholder="Game, Animation" className={`mt-1.5 ${input()}`} />
//             </label>
//             <label className="block">
//               <span className="text-sm font-semibold text-gray-700">Project link <span className="font-normal text-gray-400">(optional)</span></span>
//               <input value={form.link} onChange={set("link")} placeholder="https://..." className={`mt-1.5 ${input(errors.link)}`} />
//               {errors.link && <span className="text-xs text-red-500">{errors.link}</span>}
//             </label>
//           </div>
//         </div>

//         <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
//           <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
//           <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #49205E, #BC579E)" }}>
//             Post project
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// // ------------------------------ PAGE -----------------------------------------
// export default function CommunityPage() {
//   const [projects, setProjects] = useState(seedProjects);
//   const [liked, setLiked] = useState(() => new Set());
//   const [course, setCourse] = useState("All");
//   const [query, setQuery] = useState("");
//   const [sort, setSort] = useState("recent");
//   const [sharing, setSharing] = useState(false);
//   const [toast, setToast] = useState("");

//   const toggleLike = (id) => {
//     const isLiked = liked.has(id);
//     setLiked((s) => {
//       const n = new Set(s);
//       isLiked ? n.delete(id) : n.add(id);
//       return n;
//     });
//     setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p)));
//   };

//   const addProject = (p) => {
//     // TODO: send `p` to your backend here (POST /api/projects), then add the saved record to state.
//     setProjects((ps) => [p, ...ps]);
//     setCourse("All");
//     setQuery("");
//     setSort("recent");
//     setSharing(false);
//     setToast("Your project is live in the community!");
//   };

//   useEffect(() => {
//     if (!toast) return;
//     const t = setTimeout(() => setToast(""), 3500);
//     return () => clearTimeout(t);
//   }, [toast]);

//   const stats = useMemo(
//     () => ({
//       projects: projects.length,
//       students: new Set(projects.map((p) => p.user.toLowerCase())).size,
//       likes: projects.reduce((a, p) => a + p.likes, 0),
//     }),
//     [projects]
//   );

//   const featured = useMemo(() => [...projects].sort((a, b) => b.likes - a.likes)[0], [projects]);
//   const showFeatured = course === "All" && !query.trim() && featured && featured.likes > 0;

//   const list = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     let out = projects.filter(
//       (p) =>
//         (course === "All" || p.course === course) &&
//         (!q || [p.title, p.user, p.description, ...p.tags].some((t) => t.toLowerCase().includes(q)))
//     );
//     if (showFeatured) out = out.filter((p) => p.id !== featured.id);
//     if (sort === "liked") out = [...out].sort((a, b) => b.likes - a.likes);
//     return out;
//   }, [projects, course, query, sort, showFeatured, featured]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero */}
//       <header className="relative bg-gradient-to-br from-[#49205E] via-[#BC579E] to-[#49205E] overflow-hidden">
//         <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-2 border-dashed border-white/20" />
//         <div className="absolute right-16 top-24 w-48 h-48 rounded-full border border-dashed border-white/10" />
//         <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-[#c8e03a]/10 blur-2xl" />
//         <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-24">
//           <div className="flex items-center justify-between mb-12">
//             <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
//               Back to home
//             </Link>
//           </div>
//           <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
//             Built by students. <span className="text-[#c8e03a]">Shared with everyone.</span>
//           </h1>
//           <p className="text-white/80 text-lg max-w-xl mb-8">
//             Browse what Code Excellence students are creating, cheer them on with a like, and post your own project.
//           </p>
//           <button
//             onClick={() => setSharing(true)}
//             className="inline-flex items-center gap-2 bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" /></svg>
//             Share your project
//           </button>
//         </div>
//       </header>

//       {/* Stats */}
//       <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
//         <div className="grid grid-cols-3 gap-3 sm:gap-4">
//           {[
//             { v: stats.projects, l: "Projects shared", c: "bg-white text-gray-900" },
//             { v: stats.students, l: "Students posting", c: "bg-[#49205E] text-white" },
//             { v: stats.likes, l: "Likes given", c: "bg-[#c8e03a] text-gray-900" },
//           ].map((s) => (
//             <div key={s.l} className={`rounded-2xl p-4 sm:p-5 shadow-lg ${s.c}`}>
//               <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">{s.v}</div>
//               <div className="text-xs sm:text-sm opacity-80">{s.l}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <main className="max-w-6xl mx-auto px-6 py-12">
//         {/* Toolbar */}
//         <div className="sticky top-0 z-30 -mx-6 px-6 py-3 mb-8 bg-gray-50/95 backdrop-blur-sm">
//           <div className="flex flex-col lg:flex-row lg:items-center gap-3">
//             <div className="relative flex-1">
//               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search by project, username or tag"
//                 className="w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 py-2.5 text-sm outline-none focus:border-[#BC579E] focus:ring-2 focus:ring-[#BC579E]/30"
//               />
//             </div>
//             <select
//               value={sort}
//               onChange={(e) => setSort(e.target.value)}
//               aria-label="Sort projects"
//               className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#BC579E]"
//             >
//               <option value="recent">Newest first</option>
//               <option value="liked">Most liked</option>
//             </select>
//           </div>
//           <div className="flex gap-2 overflow-x-auto pt-3" style={{ scrollbarWidth: "none" }}>
//             {["All", ...COURSES].map((c) => (
//               <button
//                 key={c}
//                 onClick={() => setCourse(c)}
//                 aria-pressed={course === c}
//                 className={`flex-none text-sm font-semibold rounded-full px-4 py-1.5 border transition-all duration-200 ${
//                   course === c
//                     ? "bg-[#49205E] border-[#49205E] text-white shadow-md"
//                     : "bg-white border-gray-200 text-gray-600 hover:border-[#BC579E] hover:text-[#49205E]"
//                 }`}
//               >
//                 {c}
//               </button>
//             ))}
//           </div>
//         </div>

//         {showFeatured && <FeaturedCard p={featured} liked={liked.has(featured.id)} onLike={() => toggleLike(featured.id)} />}

//         {list.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {list.map((p) => (
//               <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} onLike={() => toggleLike(p.id)} />
//             ))}
//           </div>
//         ) : (
//           !showFeatured && (
//             <div className="text-center bg-white rounded-3xl border border-dashed border-gray-300 py-16 px-6">
//               <h3 className="text-xl font-bold text-gray-900 mb-2">No projects match your search</h3>
//               <p className="text-gray-500 mb-6">Try a different word, or clear the filters to see everything.</p>
//               <button
//                 onClick={() => { setQuery(""); setCourse("All"); }}
//                 className="px-5 py-2.5 rounded-lg text-sm font-bold text-white"
//                 style={{ background: "linear-gradient(135deg, #49205E, #BC579E)" }}
//               >
//                 Clear filters
//               </button>
//             </div>
//           )
//         )}

//         {/* CTA */}
//         <section className="mt-16 rounded-3xl bg-gradient-to-br from-[#49205E] via-[#BC579E] to-[#49205E] p-8 sm:p-12 text-center">
//           <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Made something cool?</h2>
//           <p className="text-white/80 mb-6 max-w-lg mx-auto">Post it here so classmates and teachers can see it, like it and get inspired.</p>
//           <button
//             onClick={() => setSharing(true)}
//             className="bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-7 py-3 rounded-xl shadow-lg transition-colors"
//           >
//             Share your project
//           </button>
//         </section>
//       </main>

//       {sharing && <ShareModal onClose={() => setSharing(false)} onSubmit={addProject} />}

//       {/* Toast */}
//       {toast && (
//         <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white text-sm font-medium rounded-full px-5 py-3 shadow-xl flex items-center gap-2">
//           <svg className="w-4 h-4 text-[#c8e03a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
//           {toast}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
// Save as: app/community/page.jsx   (replaces the earlier community page)
// This page is READ-ONLY. Students post projects from their own student login / dashboard;
// this page only displays what they have shared.
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ------------------------------ DATA -----------------------------------------
const COURSES = ["Scratch 3", "Python Basics", "Web Development", "App Development"];

const courseStyle = {
  "Scratch 3": { cover: "from-yellow-400 via-amber-400 to-orange-500", chip: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  "Python Basics": { cover: "from-sky-400 via-blue-500 to-indigo-600", chip: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
  "Web Development": { cover: "from-orange-400 via-rose-500 to-pink-600", chip: "bg-pink-100 text-pink-800", dot: "bg-pink-500" },
  "App Development": { cover: "from-emerald-400 via-teal-500 to-cyan-600", chip: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
};

const avatarColors = [
  "from-[#49205E] to-[#BC579E]",
  "from-sky-500 to-indigo-500",
  "from-orange-400 to-pink-500",
  "from-emerald-400 to-teal-600",
  "from-yellow-400 to-orange-500",
];

// Sample posts. Replace with real data from your backend (see the fetch in the page below).
// Expected fields: id, user, title, course, description, tags[], likes, time, link (optional), approved (optional)
const seedProjects = [
  { id: 1, user: "aarav_codes", title: "Catch the Stars", course: "Scratch 3", description: "A fast arcade game where you move a basket to catch falling stars. It speeds up every level and keeps your high score.", tags: ["Game", "Animation"], likes: 48, time: "2 days ago", link: "" },
  { id: 2, user: "diya.builds", title: "Weather Buddy", course: "Python Basics", description: "Type a city and get the temperature plus a simple tip on what to wear. Built with functions and a free weather API.", tags: ["API", "Beginner"], likes: 36, time: "3 days ago", link: "" },
  { id: 3, user: "rohan_dev", title: "My Portfolio Site", course: "Web Development", description: "A personal website with an about page, a project gallery and a contact form. It works well on phones too.", tags: ["HTML", "CSS", "JavaScript"], likes: 62, time: "5 days ago", link: "" },
  { id: 4, user: "ananya_k", title: "Study Planner", course: "App Development", description: "A mobile app to add homework, set reminders and tick tasks off. Includes a dark mode for late-night studying.", tags: ["Mobile", "Productivity"], likes: 41, time: "1 week ago", link: "" },
  { id: 5, user: "kabir_scratch", title: "Maze Runner", course: "Scratch 3", description: "Guide the cat through three mazes before the timer runs out. Every wall hit has its own sound effect.", tags: ["Game", "Sound"], likes: 27, time: "1 week ago", link: "" },
  { id: 6, user: "meera.py", title: "Quiz Master", course: "Python Basics", description: "A quiz game with a question bank, score tracking and a leaderboard saved to a file.", tags: ["Game", "Files"], likes: 33, time: "2 weeks ago", link: "" },
  { id: 7, user: "ishaan_web", title: "Recipe Finder", course: "Web Development", description: "Search recipes by ingredient, save favourites and print a shopping list.", tags: ["JavaScript", "Search"], likes: 29, time: "2 weeks ago", link: "" },
  { id: 8, user: "saanvi_apps", title: "Plant Pal", course: "App Development", description: "Keeps track of when your plants need water and sends a friendly reminder with a photo of each plant.", tags: ["Mobile", "Reminders"], likes: 22, time: "3 weeks ago", link: "" },
];

// ------------------------------ HELPERS --------------------------------------
const hash = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
const initials = (u) => u.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "S";

function Avatar({ user, size = "w-9 h-9 text-xs" }) {
  return (
    <span className={`flex-none rounded-full bg-gradient-to-br ${avatarColors[hash(user) % avatarColors.length]} text-white font-bold flex items-center justify-center ring-2 ring-white ${size}`}>
      {initials(user)}
    </span>
  );
}

function HeartIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-9-4.78-9-12.75C3 5.765 5.1 3.75 7.688 3.75c1.936 0 3.598 1.126 4.312 2.733.715-1.607 2.377-2.733 4.313-2.733C18.9 3.75 21 5.765 21 8.25 21 16.22 12 21 12 21z" />
    </svg>
  );
}

// Course-specific illustration so every card feels like what it is
function Art({ course }) {
  const w = "fill-white/30";
  const s = "fill-white/60";
  if (course === "Scratch 3")
    return (
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
        <rect x="200" y="30" width="130" height="34" rx="8" className={s} />
        <rect x="200" y="30" width="34" height="14" rx="4" className="fill-white/80" />
        <rect x="214" y="70" width="150" height="34" rx="8" className={w} />
        <rect x="228" y="110" width="110" height="34" rx="8" className={s} />
        <rect x="200" y="150" width="140" height="34" rx="8" className={w} />
        <path d="M70 40l9 22 24 2-18 16 6 24-21-13-21 13 6-24-18-16 24-2z" className="fill-white/80" />
        <circle cx="60" cy="150" r="22" className={w} />
        <circle cx="105" cy="165" r="10" className={s} />
      </svg>
    );
  if (course === "Python Basics")
    return (
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
        <rect x="150" y="26" width="220" height="148" rx="14" className="fill-black/25" />
        <circle cx="170" cy="44" r="5" className="fill-white/60" />
        <circle cx="186" cy="44" r="5" className="fill-white/40" />
        <circle cx="202" cy="44" r="5" className="fill-white/30" />
        <rect x="170" y="64" width="60" height="9" rx="4.5" className="fill-yellow-300/90" />
        <rect x="238" y="64" width="90" height="9" rx="4.5" className={s} />
        <rect x="190" y="84" width="110" height="9" rx="4.5" className={w} />
        <rect x="190" y="104" width="70" height="9" rx="4.5" className="fill-emerald-300/90" />
        <rect x="268" y="104" width="60" height="9" rx="4.5" className={s} />
        <rect x="170" y="124" width="90" height="9" rx="4.5" className="fill-yellow-300/90" />
        <rect x="190" y="144" width="130" height="9" rx="4.5" className={w} />
        <path d="M60 70c0-14 12-20 26-20s24 6 24 18v12H70c-10 0-18 8-18 18v6" fill="none" className="stroke-white/70" strokeWidth="10" strokeLinecap="round" />
        <path d="M110 150c0 14-12 20-26 20s-24-6-24-18v-12h40c10 0 18-8 18-18v-6" fill="none" className="stroke-white/40" strokeWidth="10" strokeLinecap="round" />
      </svg>
    );
  if (course === "Web Development")
    return (
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
        <rect x="120" y="24" width="250" height="152" rx="14" className="fill-white/85" />
        <path d="M120 38a14 14 0 0114-14h222a14 14 0 0114 14v14H120z" className="fill-black/20" />
        <circle cx="138" cy="38" r="4.5" className="fill-white/80" />
        <circle cx="153" cy="38" r="4.5" className="fill-white/60" />
        <circle cx="168" cy="38" r="4.5" className="fill-white/40" />
        <rect x="138" y="66" width="120" height="14" rx="7" className="fill-pink-500/70" />
        <rect x="138" y="88" width="190" height="8" rx="4" className="fill-gray-400/60" />
        <rect x="138" y="104" width="160" height="8" rx="4" className="fill-gray-300/80" />
        <rect x="138" y="126" width="70" height="36" rx="8" className="fill-orange-400/70" />
        <rect x="216" y="126" width="70" height="36" rx="8" className="fill-rose-400/60" />
        <rect x="294" y="126" width="58" height="36" rx="8" className="fill-pink-300/80" />
        <path d="M70 70l-30 30 30 30M95 130l20-60" fill="none" className="stroke-white/80" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <rect x="230" y="14" width="100" height="176" rx="18" className="fill-white/85" />
      <rect x="240" y="30" width="80" height="140" rx="10" className="fill-teal-100/70" />
      <rect x="248" y="40" width="64" height="24" rx="6" className="fill-emerald-500/60" />
      <rect x="248" y="70" width="64" height="18" rx="6" className="fill-teal-500/40" />
      <rect x="248" y="94" width="64" height="18" rx="6" className="fill-teal-500/40" />
      <circle cx="268" cy="146" r="9" className="fill-cyan-600/60" />
      <rect x="282" y="141" width="28" height="10" rx="5" className="fill-teal-500/40" />
      <rect x="110" y="40" width="80" height="14" rx="7" className={s} />
      <rect x="90" y="66" width="100" height="10" rx="5" className={w} />
      <circle cx="90" cy="130" r="30" className={w} />
      <circle cx="150" cy="150" r="16" className={s} />
    </svg>
  );
}

function Cover({ p, className = "h-40" }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${courseStyle[p.course].cover} ${className}`}>
      <Art course={p.course} />
      <span className="absolute left-4 top-4 text-xs font-semibold bg-white/90 text-gray-800 rounded-full px-3 py-1 shadow-sm">{p.course}</span>
    </div>
  );
}

// ------------------------------ CARDS ----------------------------------------
function ProjectCard({ p, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      aria-label={`Open ${p.title} by ${p.user}`}
      className="group cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-200/60 focus-visible:ring-2 focus-visible:ring-[#BC579E] outline-none"
    >
      <Cover p={p} />
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-[#49205E] transition-colors">{p.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{p.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.tags.map((t) => (
            <span key={t} className={`text-xs font-medium rounded-full px-2.5 py-1 ${courseStyle[p.course].chip}`}>{t}</span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar user={p.user} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">@{p.user}</div>
              <div className="text-xs text-gray-400">{p.time}</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-500 bg-pink-50 rounded-full px-3 py-1.5">
            <HeartIcon /> {p.likes}
          </span>
        </div>
      </div>
    </div>
  );
}

function Spotlight({ p, onOpen }) {
  return (
    <div className="relative rounded-[2rem] bg-gradient-to-br from-[#49205E] via-[#6b2d7a] to-[#BC579E] p-3 sm:p-4 mb-14 shadow-2xl shadow-purple-300/40">
      <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 items-stretch">
        <div className="rounded-3xl overflow-hidden min-h-[240px] relative">
          <Cover p={p} className="h-full min-h-[240px]" />
        </div>
        <div className="p-5 sm:p-8 lg:pl-2 text-white flex flex-col">
          <span className="self-start inline-flex items-center gap-1.5 text-xs font-bold bg-[#c8e03a] text-gray-900 rounded-full px-3 py-1 mb-5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" /></svg>
            Student spotlight
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">{p.title}</h3>
          <p className="text-white/80 leading-relaxed mb-6 max-w-lg">{p.description}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {p.tags.map((t) => <span key={t} className="text-xs font-medium rounded-full px-3 py-1 bg-white/15 border border-white/20">{t}</span>)}
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar user={p.user} size="w-12 h-12 text-sm" />
              <div>
                <div className="font-bold">@{p.user}</div>
                <div className="text-sm text-white/60 flex items-center gap-1.5"><HeartIcon className="w-3.5 h-3.5 text-pink-300" /> {p.likes} likes</div>
              </div>
            </div>
            <button onClick={onOpen} className="bg-white text-[#49205E] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#c8e03a] hover:text-gray-900 transition-colors">
              See project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------ DETAIL MODAL (read-only) ----------------------
function ProjectModal({ list, index, onClose, onChange }) {
  const p = list[index];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % list.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + list.length) % list.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, list.length, onClose, onChange]);

  const circle = "w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 transition-colors";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="absolute inset-0 bg-[#2a0f38]/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto">
        <div className="relative">
          <Cover p={p} className="h-52 sm:h-64" />
          <button onClick={onClose} aria-label="Close" className={`absolute right-4 top-4 ${circle}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {list.length > 1 && (
            <>
              <button onClick={() => onChange((index - 1 + list.length) % list.length)} aria-label="Previous project" className={`absolute left-4 top-1/2 -translate-y-1/2 ${circle}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => onChange((index + 1) % list.length)} aria-label="Next project" className={`absolute right-4 top-1/2 -translate-y-1/2 ${circle}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar user={p.user} size="w-12 h-12 text-sm" />
              <div className="min-w-0">
                <div className="font-bold text-gray-900 truncate">@{p.user}</div>
                <div className="text-sm text-gray-400">{p.time}</div>
              </div>
            </div>
            <span className="flex-none inline-flex items-center gap-1.5 text-sm font-semibold text-pink-500 bg-pink-50 rounded-full px-3 py-1.5">
              <HeartIcon /> {p.likes}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{p.title}</h2>
          <p className="text-gray-600 leading-relaxed mb-5">{p.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {p.tags.map((t) => <span key={t} className={`text-xs font-medium rounded-full px-2.5 py-1 ${courseStyle[p.course].chip}`}>{t}</span>)}
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {p.link ? (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #49205E, #BC579E)" }}>
                Open project
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H18m0 0v4.5M18 6l-8.25 8.25" /></svg>
              </a>
            ) : (
              <span className="text-sm text-gray-400">Shared by @{p.user} from their student login</span>
            )}
            <span className="text-xs text-gray-400 tabular-nums">{index + 1} of {list.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------ PAGE -----------------------------------------
export default function CommunityPage() {
  const router = useRouter();
  const [projects, setProjects] = useState(seedProjects);
  const [course, setCourse] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [openIndex, setOpenIndex] = useState(null);

  // Load projects that students shared from their logins.
  // Point this at your own endpoint; if it fails, the sample data above stays.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/community/projects")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) {
          setProjects(data.filter((p) => p.approved !== false)); // only show approved posts
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(
    () => ({
      projects: projects.length,
      students: new Set(projects.map((p) => p.user.toLowerCase())).size,
      likes: projects.reduce((a, p) => a + p.likes, 0),
    }),
    [projects]
  );

  const counts = useMemo(() => {
    const c = { All: projects.length };
    COURSES.forEach((k) => (c[k] = projects.filter((p) => p.course === k).length));
    return c;
  }, [projects]);

  const featured = useMemo(() => [...projects].sort((a, b) => b.likes - a.likes)[0], [projects]);
  const showFeatured = course === "All" && !query.trim() && !!featured;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = projects.filter(
      (p) =>
        (course === "All" || p.course === course) &&
        (!q || [p.title, p.user, p.description, ...p.tags].some((t) => t.toLowerCase().includes(q)))
    );
    if (showFeatured) out = out.filter((p) => p.id !== featured.id);
    if (sort === "liked") out = [...out].sort((a, b) => b.likes - a.likes);
    return out;
  }, [projects, course, query, sort, showFeatured, featured]);

  // The modal steps through whatever the visitor is currently looking at
  const modalList = useMemo(() => (showFeatured ? [featured, ...list] : list), [showFeatured, featured, list]);
  const openById = (id) => setOpenIndex(Math.max(0, modalList.findIndex((p) => p.id === id)));

  const floating = [
    { course: "Web Development", user: "rohan_dev", cls: "right-[4%] top-4 rotate-[6deg]" },
    { course: "Scratch 3", user: "aarav_codes", cls: "right-[24%] top-28 -rotate-[5deg]" },
    { course: "App Development", user: "ananya_k", cls: "right-[2%] top-[17rem] -rotate-[3deg]" },
  ];

  return (
    <div className="min-h-screen bg-[#faf7fc]">
      {/* Hero */}
      <header className="relative bg-gradient-to-br from-[#2f1340] via-[#49205E] to-[#BC579E] overflow-hidden">
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-[#BC579E]/30 blur-3xl" />
        <div className="absolute right-1/3 bottom-0 w-80 h-80 rounded-full bg-[#c8e03a]/10 blur-3xl" />
        <div className="absolute right-10 top-10 w-[460px] h-[460px] rounded-full border-2 border-dashed border-white/15 hidden lg:block" />

        {/* floating project previews */}
        <div className="hidden lg:block absolute inset-0 max-w-7xl mx-auto pointer-events-none" aria-hidden>
          {floating.map((f) => (
            <div key={f.user} className={`absolute w-60 rounded-2xl bg-white p-2 shadow-2xl ${f.cls}`}>
              <div className="relative rounded-xl overflow-hidden">
                <Cover p={{ course: f.course }} className="h-28" />
              </div>
              <div className="flex items-center gap-2 px-1.5 pt-2 pb-1">
                <Avatar user={f.user} size="w-6 h-6 text-[9px]" />
                <span className="text-xs font-semibold text-gray-700">@{f.user}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-28">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors mb-14">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to home
          </Link>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-[1.08] mb-5 max-w-2xl">
            Projects our students are proud of
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-9 leading-relaxed">
            Every project here was built by a Code Excellence student and shared from their own student login. Take a look, get inspired and see what you could build next.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Browse projects
            </button>
            <button
              onClick={() => router.push("/student_login")}
              className="border-2 border-white/40 hover:border-white text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Student login
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-3 rounded-3xl bg-white shadow-xl shadow-purple-200/50 divide-x divide-gray-100 overflow-hidden">
          {[
            { v: stats.projects, l: "Projects shared" },
            { v: stats.students, l: "Students posting" },
            { v: stats.likes, l: "Likes received" },
          ].map((s) => (
            <div key={s.l} className="py-5 sm:py-7 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#49205E] tabular-nums">{s.v}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <main id="gallery" className="max-w-7xl mx-auto px-6 pt-16 pb-20 scroll-mt-4">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 -mx-6 px-6 py-3 mb-8 bg-[#faf7fc]/95 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by project, username or tag"
                className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 py-3 text-sm outline-none focus:border-[#BC579E] focus:ring-2 focus:ring-[#BC579E]/30 shadow-sm"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort projects"
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#BC579E] shadow-sm"
            >
              <option value="recent">Newest first</option>
              <option value="liked">Most liked</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1" style={{ scrollbarWidth: "none" }}>
            {["All", ...COURSES].map((c) => (
              <button
                key={c}
                onClick={() => setCourse(c)}
                aria-pressed={course === c}
                className={`flex-none inline-flex items-center gap-2 text-sm font-semibold rounded-full pl-4 pr-3 py-2 border transition-all duration-200 ${
                  course === c
                    ? "bg-[#49205E] border-[#49205E] text-white shadow-lg shadow-purple-300/50"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#BC579E] hover:text-[#49205E]"
                }`}
              >
                {c !== "All" && <span className={`w-2 h-2 rounded-full ${courseStyle[c].dot}`} />}
                {c}
                <span className={`text-xs rounded-full px-2 py-0.5 ${course === c ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{counts[c]}</span>
              </button>
            ))}
          </div>
        </div>

        {showFeatured && <Spotlight p={featured} onOpen={() => openById(featured.id)} />}

        {list.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((p) => (
              <ProjectCard key={p.id} p={p} onOpen={() => openById(p.id)} />
            ))}
          </div>
        ) : (
          !showFeatured && (
            <div className="text-center bg-white rounded-3xl border border-dashed border-purple-200 py-16 px-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No projects match your search</h3>
              <p className="text-gray-500 mb-6">Try a different word, or clear the filters to see everything.</p>
              <button
                onClick={() => { setQuery(""); setCourse("All"); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #49205E, #BC579E)" }}
              >
                Clear filters
              </button>
            </div>
          )
        )}

        {/* How students share */}
        <section className="mt-20 rounded-[2rem] bg-white border border-purple-100 shadow-xl shadow-purple-100/60 overflow-hidden grid lg:grid-cols-5">
          <div className="lg:col-span-3 p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Want your project on this page?</h2>
            <p className="text-gray-500 mb-8 max-w-lg">Projects are shared from your student account, so only real Code Excellence students appear here.</p>
            <ol className="space-y-5">
              {[
                ["Log in to your student account", "Use the same login you use for your classes."],
                ["Share your project from your dashboard", "Add a title, a short description and the course it belongs to."],
                ["See it appear here", "Classmates, teachers and visitors can open it and like it."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex-none w-9 h-9 rounded-xl bg-gradient-to-br from-[#49205E] to-[#BC579E] text-white font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <div className="font-bold text-gray-900">{t}</div>
                    <div className="text-sm text-gray-500">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-2 bg-gradient-to-br from-[#49205E] via-[#7a3a86] to-[#BC579E] p-8 sm:p-12 flex flex-col justify-center items-start text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border-2 border-dashed border-white/20" />
            <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-[#c8e03a]/15 blur-xl" />
            <h3 className="relative text-2xl font-extrabold mb-2">Ready to share?</h3>
            <p className="relative text-white/75 mb-6">Log in and post your latest project.</p>
            <button
              onClick={() => router.push("/student_login")}
              className="relative bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Go to student login
            </button>
          </div>
        </section>
      </main>

      {openIndex !== null && modalList[openIndex] && (
        <ProjectModal list={modalList} index={openIndex} onClose={() => setOpenIndex(null)} onChange={setOpenIndex} />
      )}
    </div>
  );
}

