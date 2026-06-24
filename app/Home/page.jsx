"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ------------------------------ DATA -----------------------------------------
const features = [
  {
    icon: <svg className="w-7 h-7 text-[#c8e03a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    title: "AI-Powered Adaptive Learning",
    description: "Personalized learning paths based on student performance and learning style",
    highlight: false,
  },
  {
    icon: <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    title: "Multi-Tenant Architecture",
    description: "Secure isolated environments for schools with complete data privacy",
    highlight: false,
  },
  {
    icon: <svg className="w-7 h-7 text-[#c8e03a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    title: "Certified Programs",
    description: "Industry-recognized certificates with national ranking system",
    highlight: false,
  },
  {
    icon: <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    title: "Advanced Analytics",
    description: "Real-time insights and detailed progress tracking for teachers and students",
    highlight: false,
  },
  {
    icon: <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    title: "Expert Mentorship",
    description: "Access to experienced instructors and peer learning communities",
    highlight: false,
  },
  {
    icon: <svg className="w-7 h-7 text-[#c8e03a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    title: "Interactive Projects",
    description: "Hands-on coding projects and real-world application challenges",
    highlight: true,
  },
];

const courses = [
  {
    icon: <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.5} /><circle cx="12" cy="12" r="5" strokeWidth={1.5} /><circle cx="12" cy="12" r="1" strokeWidth={1.5} /></svg>,
    title: "Scratch 3", level: "Beginner", enrolled: "1,247",
  },
  {
    icon: <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
    title: "Python Basics", level: "Intermediate", enrolled: "856",
  },
  {
    icon: <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
    title: "Web Development", level: "Advanced", enrolled: "643",
  },
  {
    icon: <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" /></svg>,
    title: "App Development", level: "Professional", enrolled: "412",
  },
];

// ------------------------------ SMOOTH SCROLL --------------------------------
const smoothScroll = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

// ------------------------------ COMPONENTS -----------------------------------
function Logo() {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => smoothScroll("home")}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#49205E] to-[#BC579E] flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" /></svg>
      </div>
      <div>
        <div className="font-bold text-gray-900 text-base leading-tight">Code Excellence</div>
        <div className="text-xs text-purple-600">EdTech Platform</div>
      </div>
    </div>
  );
}

function Navbar() {
  const router = useRouter();
  const [learners, setLearners] = useState(2440);
  useEffect(() => {
    const i = setInterval(() => setLearners(p => p + Math.floor(Math.random() * 5) - 2), 3000);
    return () => clearInterval(i);
  }, []);
  const navItems = [
    { name: "Home", id: "home" },
    { name: "Courses", id: "courses" },
    { name: "Features", id: "features" },
    { name: "Contact Us", id: "contact" }
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div onClick={() => smoothScroll("home")} className="cursor-pointer"><Logo /></div>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => <button key={item.name} onClick={() => smoothScroll(item.id)} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{item.name}</button>)}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="font-bold text-gray-900 text-xs">{learners.toLocaleString()}</span>
            <span className="text-gray-500 text-[10px]">Learning Now</span>
          </div>
          <button onClick={() => router.push("/student_login")} className="px-3 py-1.5 rounded-lg font-medium text-white text-sm transition-all duration-200 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #49205E, #BC579E)", boxShadow: "0 0 15px rgba(73,32,94,0.3)" }}>Student Login</button>
          <button onClick={() => router.push("/school-login")} className="px-3 py-1.5 rounded-lg font-medium text-white text-sm transition-all duration-200 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #49205E, #BC579E)", boxShadow: "0 0 15px rgba(73,32,94,0.3)" }}>School Login</button>
          <button className="px-3 py-1.5 rounded-lg font-medium text-white text-sm transition-all duration-200 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #49205E, #BC579E)", boxShadow: "0 0 15px rgba(73,32,94,0.3)" }}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-[#49205E] via-[#BC579E] to-[#49205E] overflow-visible pt-20">
      <div className="absolute inset-0 opacity-40"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-500/50 to-transparent blur-3xl"></div></div>
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 border-dashed border-white/20"></div>
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-dashed border-white/10"></div>
      <div className="absolute right-[28%] top-[28%] w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-2xl rotate-[-8deg] hover:rotate-0 transition-transform duration-500"><svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.819m2.562-5.84a14.927 14.927 0 00-2.561 6.176m0 0a6 6 0 11-5.971-5.97" /></svg></div>
      <div className="absolute right-[8%] top-[32%] w-28 h-28 rounded-2xl bg-[#c8e03a] flex items-center justify-center shadow-2xl rotate-[8deg] hover:rotate-0 transition-transform duration-500"><svg className="w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11a4 4 0 01-8 0V5h8v6zM6 5H4a2 2 0 00-2 2v1a4 4 0 004 4h.172M18 5h2a2 2 0 012 2v1a4 4 0 01-4 4h-.172M12 15v4m0 0H9m3 0h3" /></svg></div>
      <div className="absolute right-[26%] bottom-[8%] rounded-2xl bg-white/90 p-5 shadow-2xl rotate-[-5deg] hover:rotate-0 transition-transform duration-500 flex items-center justify-center"><svg className="w-14 h-14 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-extrabold text-white leading-tight mb-6">Transform Students<br />Into <span className="text-[#c8e03a]">Coding</span><br /><span className="text-[#c8e03a]">Champions</span></h1>
          <p className="text-white/80 text-lg mb-10 max-w-xl leading-relaxed">India's most advanced multi-tenant EdTech platform with AI-powered adaptive learning, real-time assessments, and certification programs.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-lg">Start Learning Free<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></button>
            <button onClick={() => smoothScroll("courses")} className="border-2 border-white/50 hover:border-white text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors backdrop-blur-sm">Explore Courses</button>
          </div>
          {/* Stats Section - from your latest image */}
          {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">3,847</div>
              <div className="text-white/70 text-sm">Active Students</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">24</div>
              <div className="text-white/70 text-sm">Partner Schools</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-white">1,256</div>
              <div className="text-white/70 text-sm">Certificates Issued</div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16"><h2 className="text-4xl font-extrabold text-gray-900 mb-4">Why Choose Code Excellence?</h2><p className="text-gray-500 text-lg">Comprehensive learning ecosystem designed for success</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`bg-white rounded-2xl p-8 shadow-sm border transition-all duration-200 hover:shadow-md ${f.highlight ? "border-pink-400 ring-1 ring-pink-400" : "border-gray-100"}`}>
              <div className="mb-5">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningPaths() {
  const scrollContainer = useRef(null);
  const scrollLeft = () => scrollContainer.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => scrollContainer.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <section id="courses" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div><h2 className="text-3xl font-extrabold text-gray-900 mb-2">Structured Learning Paths</h2><p className="text-gray-500 text-base">From Scratch to Professional Development</p></div>
          <button onClick={() => smoothScroll("courses")} className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">View All Courses<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></button>
        </div>
        <div className="relative group">
          <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-purple-50"><svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <div ref={scrollContainer} className="flex overflow-x-auto gap-5 pb-4 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
            {courses.map((c, i) => (
              <div key={i} className="flex-none w-72 bg-purple-50/70 border border-purple-100 rounded-2xl p-7 hover:shadow-md transition-all duration-200 cursor-pointer group/card">
                <div className="mb-6 group-hover/card:scale-110 transition-transform duration-200">{c.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{c.level}</p>
                <div className="flex items-center gap-2 text-purple-600 text-sm font-medium"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{c.enrolled} enrolled</div>
              </div>
            ))}
          </div>
          <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-purple-50"><svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">← Drag or use the buttons to see more courses →</p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-28 bg-gradient-to-br from-[#49205E] via-[#BC579E] to-[#49205E] overflow-visible">
      <div className="absolute inset-0"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/20 blur-3xl"></div></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-8"><svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.819m2.562-5.84a14.927 14.927 0 00-2.561 6.176m0 0a6 6 0 11-5.971-5.97" /></svg></div>
        <h2 className="text-5xl font-extrabold text-white mb-5">Ready to Transform Education?</h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">Join thousands of students and schools already learning with Code Excellence</p>
        <button className="inline-flex items-center gap-2 bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-8 py-3 rounded-xl text-base transition-colors shadow-xl">Get Started Today</button>
      </div>
    </section>
  );
}

function Footer() {
  const links = [{ name: "Home", id: "home" }, { name: "Courses", id: "courses" }, { name: "Features", id: "features" }, { name: "Contact Us", id: "contact" }];
  return (
    <footer id="contact" className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div><div className="mb-4 cursor-pointer" onClick={() => smoothScroll("home")}><Logo /></div><p className="text-gray-500 text-sm leading-relaxed">Empowering students with cutting-edge coding education</p></div>
          <div><h4 className="font-bold text-gray-900 mb-5">Quick Links</h4><ul className="space-y-3">{links.map(link => <li key={link.name}><button onClick={() => smoothScroll(link.id)} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">{link.name}</button></li>)}</ul></div>
          <div><h4 className="font-bold text-gray-900 mb-5">Resources</h4><ul className="space-y-3">{["Documentation","Help Center","Community","Blog"].map(l => <li key={l}><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">{l}</a></li>)}</ul></div>
          <div><h4 className="font-bold text-gray-900 mb-5">Contact</h4><p className="text-gray-500 text-sm mb-1">info@codeexcellence.com</p><p className="text-gray-500 text-sm mb-5">+91 98765 43210</p><div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-full bg-purple-800 hover:bg-purple-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg></a>
            <a href="#" className="w-9 h-9 rounded-full bg-purple-800 hover:bg-purple-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg></a>
            <a href="#" className="w-9 h-9 rounded-full bg-purple-800 hover:bg-purple-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg></a>
            <a href="#" className="w-9 h-9 rounded-full bg-purple-800 hover:bg-purple-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} /><path strokeWidth={2} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2} /></svg></a>
          </div></div>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-200 text-center"><p className="text-gray-400 text-sm">© 2024 Code Excellence. All rights reserved.</p></div>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-purple-700 text-white shadow-lg hover:bg-purple-800 transition-all duration-300 hover:scale-110">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
    </button>
  );
}

// ------------------------------ PAGE -----------------------------------------
export default function Home() {
  return (
    <div style={{ overflow: 'visible' }}>
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <LearningPaths />
        <CTA />
        <Footer />
        <div className="h-32 bg-transparent"></div>
      </div>
      <BackToTop />
    </div>
  );
}