"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const NAV_LINKS = ["Home", "Courses", "About", "Contact Us"];

const FEATURES = [
  { icon: "🚀", title: "AI-Powered Learning",    desc: "Adaptive AI engine personalises every student's journey in real time.",  grad: "linear-gradient(135deg,#f97316,#ef4444)" },
  { icon: "📊", title: "Real-Time Assessments",  desc: "Live quizzes, code graders, and instant feedback loops.",               grad: "linear-gradient(135deg,#7c3aed,#d946ef)" },
  { icon: "🏆", title: "Certification Programs", desc: "Industry-recognised certificates that stand out on any résumé.",        grad: "linear-gradient(135deg,#a3e635,#10b981)" },
  { icon: "🏫", title: "Multi-Tenant Platform",  desc: "White-label ready. Deploy for your school, college, or institution.",   grad: "linear-gradient(135deg,#38bdf8,#3b82f6)" },
];

const COURSES = [
  { title: "Python Mastery",         level: "Beginner → Pro", students: 1240, accent: "#facc15" },
  { title: "Web Dev Bootcamp",       level: "Intermediate",   students: 870,  accent: "#38bdf8" },
  { title: "Data Structures & Algo", level: "Advanced",       students: 640,  accent: "#f87171" },
  { title: "Machine Learning",       level: "Advanced",       students: 510,  accent: "#a3e635" },
];

const STATS = [
  { value: "2,430+", label: "Active Learners" },
  { value: "120+",   label: "Courses" },
  { value: "98%",    label: "Satisfaction Rate" },
  { value: "50+",    label: "Expert Mentors" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Software Engineer, Infosys", av: "PS", text: "Code Excellence completely transformed how I approach problem-solving. Got placed in 3 months!" },
  { name: "Arjun Mehta",  role: "Full-Stack Developer",       av: "AM", text: "The AI adaptive learning is insane — it knew exactly where I was struggling before I did." },
  { name: "Sneha Patel",  role: "Data Analyst, TCS",          av: "SP", text: "Best EdTech platform in India. Real projects, real mentors, real results." },
];

const TEAM = [
  { name: "Ravi Kumar",    role: "Founder & CEO",        av: "RK", grad: "linear-gradient(135deg,#7c3aed,#a855f7)" },
  { name: "Ananya Singh",  role: "Head of Curriculum",   av: "AS", grad: "linear-gradient(135deg,#f97316,#ef4444)" },
  { name: "Dev Patel",     role: "Lead AI Engineer",     av: "DP", grad: "linear-gradient(135deg,#38bdf8,#3b82f6)" },
  { name: "Meera Joshi",   role: "Student Success Lead", av: "MJ", grad: "linear-gradient(135deg,#a3e635,#10b981)" },
];

const VALUES = [
  { icon: "💡", title: "Innovation First",   desc: "We build technology that adapts to every learner, not the other way around." },
  { icon: "🤝", title: "Student-Centred",    desc: "Every decision we make starts with one question: does this help the student?" },
  { icon: "🌏", title: "Built for India",    desc: "Designed for Indian curricula, regional needs, and every type of institution." },
  { icon: "🔒", title: "Trust & Integrity",  desc: "Transparent pricing, honest certifications, and zero compromises on quality." },
];

/* ─────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────── */
const C = {
  purple:      "#7c3aed",
  purpleLight: "#a855f7",
  purpleDeep:  "#4c1d95",
  lime:        "#a3e635",
  limeDark:    "#65a30d",
  dark:        "#1e0a2e",
  darker:      "#150826",
  card:        "rgba(255,255,255,0.04)",
  cardBorder:  "rgba(255,255,255,0.08)",
  muted:       "#94a3b8",
};

const cardStyle = {
  background: C.card,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  padding: "1.5rem",
  transition: "transform .2s, box-shadow .2s",
};

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");

  // Refs for all sections
  const homeRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const coursesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const footerRef = useRef(null);

  const handleFormChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) return;
    setFormStatus("sending");
    setTimeout(() => {
      setFormStatus("sent");
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  // FORCED smooth scroll function with window.scrollTo
  const scrollToSection = (sectionName) => {
    setActiveNav(sectionName);
    setMenuOpen(false);
    
    let element;
    let offset = 80; // navbar height offset
    
    switch (sectionName) {
      case "Home":
        element = homeRef.current;
        offset = 0;
        break;
      case "Courses":
        element = coursesRef.current;
        break;
      case "About":
        element = aboutRef.current;
        break;
      case "Contact Us":
        element = contactRef.current;
        break;
      default:
        element = homeRef.current;
        offset = 0;
    }
    
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Update active nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { name: "Home", ref: homeRef },
        { name: "Courses", ref: coursesRef },
        { name: "About", ref: aboutRef },
        { name: "Contact Us", ref: contactRef },
      ];

      let currentActive = "Home";
      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentActive = section.name;
            break;
          }
        }
      }
      setActiveNav(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Sora','Segoe UI',sans-serif", overflowX: "hidden" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 2.5rem",
        background: "rgba(30,10,46,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => scrollToSection("Home")}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>🎓</div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>Code Excellence</p>
            <p style={{ color: C.lime, fontSize: "0.72rem", lineHeight: 1.2 }}>EdTech Platform</p>
          </div>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: "flex", gap: "2rem" }} className="desktop-nav">
          {NAV_LINKS.map((l) => (
            <button key={l} onClick={() => scrollToSection(l)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: 500,
              color: activeNav === l ? C.lime : "#d8b4fe",
              borderBottom: activeNav === l ? `2px solid ${C.lime}` : "2px solid transparent",
              paddingBottom: 2, transition: "color .15s",
              fontFamily: "inherit",
            }}>{l}</button>
          ))}
        </div>

        {/* Login buttons (Desktop) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="desktop-nav">
          <button
            onClick={() => handleNavigation("/student_login")}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#e9d5ff";
            }}
            style={{
              padding: "8px 20px", borderRadius: 9,
              fontSize: "0.875rem", fontWeight: 600,
              background: "rgba(255,255,255,0.08)",
              color: "#e9d5ff",
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: "pointer", fontFamily: "inherit",
              transition: "background .15s, color .15s",
            }}
          >
            Student Login
          </button>

          <button
            onClick={() => handleNavigation("/school-login")}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(135deg,#6d28d9,#7c3aed)";
              e.currentTarget.style.boxShadow = "0 0 28px rgba(124,58,237,0.65)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "linear-gradient(135deg,#7c3aed,#9333ea)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.45)";
            }}
            style={{
              padding: "8px 20px", borderRadius: 9,
              fontSize: "0.875rem", fontWeight: 700,
              background: "linear-gradient(135deg,#7c3aed,#9333ea)",
              color: "#fff", border: "none",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 0 20px rgba(124,58,237,0.45)",
              transition: "background .15s, box-shadow .15s",
            }}
          >
            School Login
          </button>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-burger"
          style={{ background: "none", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", display: "none" }}
        >☰</button>
      </nav>

      {/* ══ MOBILE MENU ══════════════════════════════════════ */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: C.dark, paddingTop: 80, paddingLeft: 28,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {NAV_LINKS.map((l) => (
            <button key={l} onClick={() => scrollToSection(l)} style={{
              background: "none", border: "none", textAlign: "left",
              fontSize: "1.1rem", fontWeight: 600, color: "#e9d5ff",
              padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", fontFamily: "inherit",
            }}>{l}</button>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, paddingRight: 28 }}>
            <button
              onClick={() => { handleNavigation("/student_login"); setMenuOpen(false); }}
              style={{
                padding: "12px 24px", borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                color: "#e9d5ff",
                border: "1px solid rgba(255,255,255,0.25)",
                fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                fontFamily: "inherit",
              }}
            >Student Login</button>

            <button
              onClick={() => { handleNavigation("/school-login"); setMenuOpen(false); }}
              style={{
                padding: "12px 24px", borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#9333ea)", color: "#fff",
                border: "none", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 0 20px rgba(124,58,237,0.45)",
              }}
            >School Login</button>
          </div>
        </div>
      )}

      {/* ══ HOME SECTION ════════════════════════════════════════ */}
      <div ref={homeRef}>
        <section style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#2d0a4e 0%,#6b21a8 50%,#9333ea 100%)",
          display: "flex", alignItems: "center",
          paddingTop: 80, position: "relative", overflow: "hidden",
        }}>
          {/* Decorative rings */}
          <div style={{ position: "absolute", top: "22%", right: 50, width: 300, height: 300, borderRadius: "50%", border: `2px dashed ${C.lime}`, opacity: 0.18, pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", top: "32%", right: 130, width: 200, height: 200, borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.12)", pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(163,230,53,0.12),transparent)", pointerEvents: "none" }}></div>

          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "4rem 2.5rem",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem",
            alignItems: "center", width: "100%",
          }} className="hero-grid">

            {/* Text */}
            <div style={{ animation: "fadeUp .7s ease both" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 999, marginBottom: 24,
                background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.3)",
                color: C.lime, fontSize: "0.78rem", fontWeight: 600,
              }}>🇮🇳 India's #1 Coding EdTech Platform</div>

              <h1 style={{ fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.4rem" }}>
                Transform Students<br />
                Into <span style={{ color: C.lime }}>Coding</span><br />
                <span style={{ color: C.lime }}>Champions</span>
              </h1>

              <p style={{ fontSize: "1.05rem", color: "#d8b4fe", maxWidth: 480, lineHeight: 1.7, marginBottom: "2rem" }}>
                India's most advanced multi-tenant EdTech platform with AI-powered
                adaptive learning, real-time assessments, and certification programs.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleNavigation("/student_login")}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  style={{
                    padding: "13px 30px", borderRadius: 12, fontWeight: 700, fontSize: "0.95rem",
                    background: "linear-gradient(135deg,#a3e635,#65a30d)",
                    color: "#1a1a1a", border: "none", cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 6px 28px rgba(163,230,53,0.45)",
                    transition: "transform .15s",
                  }}
                >Get Started Free →</button>

                <button
                  onClick={() => handleNavigation("/school-login")}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                  style={{
                    padding: "13px 30px", borderRadius: 12, fontWeight: 600, fontSize: "0.95rem",
                    background: "rgba(255,255,255,0.07)",
                    color: "#e9d5ff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "background .15s, border-color .15s",
                  }}
                >School Portal</button>
              </div>
            </div>

            {/* Floating cards */}
            <div style={{ position: "relative", height: 380 }} className="hero-cards">
              <div style={{ position: "absolute", top: 30, left: 60, width: 90, height: 90, borderRadius: 20, background: "linear-gradient(135deg,#f97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 8px 30px rgba(239,68,68,0.35)", animation: "float1 4s ease-in-out infinite" }}>🚀</div>
              <div style={{ position: "absolute", top: 50, right: 40, width: 78, height: 78, borderRadius: 16, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 8px 28px rgba(163,230,53,0.4)", animation: "float2 5s ease-in-out infinite" }}>🏆</div>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 240, padding: "1.2rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, backdropFilter: "blur(12px)", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
                <p style={{ color: C.lime, fontSize: "0.7rem", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Today's Progress</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 10 }}>Python Mastery</p>
                <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.15)", marginBottom: 6 }}>
                  <div style={{ height: 7, borderRadius: 999, width: "72%", background: "linear-gradient(90deg,#a3e635,#65a30d)" }}></div>
                </div>
                <p style={{ color: "#c4b5fd", fontSize: "0.75rem" }}>72% complete · 3 modules left</p>
              </div>
              <div style={{ position: "absolute", bottom: 40, left: 20, padding: "8px 18px", borderRadius: 999, background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "0.8rem", boxShadow: "0 4px 16px rgba(99,102,241,0.4)", animation: "float1 6s ease-in-out infinite reverse" }}>🎓 Certified</div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ STATS ═══════════════════════════════════════════ */}
      <div ref={statsRef}>
        <section style={{ background: C.dark, padding: "3.5rem 2.5rem" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", textAlign: "center" }} className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: "2.4rem", fontWeight: 800, color: C.lime }}>{s.value}</p>
                <p style={{ fontSize: "0.85rem", color: C.purpleLight, marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ══ FEATURES ════════════════════════════════════════ */}
      <div ref={featuresRef}>
        <section style={{ background: C.darker, padding: "5rem 2.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Why Code Excellence</p>
            <h2 style={{ textAlign: "center", color: "#fff", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 800, marginBottom: "3rem" }}>
              Everything you need to <span style={{ color: C.lime }}>Excel</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }} className="features-grid">
              {FEATURES.map((f) => (
                <div key={f.title} style={{ ...cardStyle }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: "1rem" }}>{f.icon}</div>
                  <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: 8, fontSize: "0.95rem" }}>{f.title}</h3>
                  <p style={{ color: C.muted, fontSize: "0.83rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ COURSES SECTION ══════════════════════════════════════════ */}
      <div ref={coursesRef}>
        <section style={{ background: C.dark, padding: "5rem 2.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Popular Courses</p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem" }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800 }}>
                Start your journey <span style={{ color: C.purpleLight }}>today</span>
              </h2>
              <button style={{ background: "none", border: "none", color: C.lime, fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }} className="courses-grid">
              {COURSES.map((c) => (
                <div key={c.title} style={{ ...cardStyle, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: "0.9rem" }}>{c.title.charAt(0)}</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", marginBottom: 8 }}>{c.title}</h4>
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(163,230,53,0.12)", color: C.lime, fontSize: "0.72rem", fontWeight: 600, marginBottom: 12 }}>{c.level}</span>
                  <p style={{ color: "#64748b", fontSize: "0.78rem" }}>👥 {c.students.toLocaleString()} students</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ TESTIMONIALS ════════════════════════════════════ */}
      <div ref={testimonialsRef}>
        <section style={{ background: C.darker, padding: "5rem 2.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Testimonials</p>
            <h2 style={{ textAlign: "center", color: "#fff", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, marginBottom: "3rem" }}>
              What our students <span style={{ color: C.lime }}>say</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }} className="testimonials-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} style={cardStyle}>
                  <p style={{ color: "#d8b4fe", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", color: "#fff" }}>{t.av}</div>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>{t.name}</p>
                      <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ CTA BANNER ══════════════════════════════════════ */}
      <div ref={ctaRef}>
        <section style={{ background: "linear-gradient(135deg,#4c1d95,#7c3aed,#9333ea)", padding: "5rem 2.5rem", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to become a <span style={{ color: C.lime }}>Champion?</span>
          </h2>
          <p style={{ color: "#e9d5ff", fontSize: "1.05rem", marginBottom: "2rem" }}>
            Join 2,430+ students already learning with Code Excellence.
          </p>
          <button
            onClick={() => handleNavigation("/student_login")}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            style={{ padding: "15px 38px", borderRadius: 13, fontWeight: 700, fontSize: "1rem", background: "linear-gradient(135deg,#a3e635,#65a30d)", color: "#1a1a1a", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 32px rgba(163,230,53,0.5)", transition: "transform .15s" }}
          >Get Started for Free →</button>
        </section>
      </div>

      {/* ══ ABOUT SECTION ════════════════════════════════════════ */}
      <div ref={aboutRef}>
        <section style={{ background: C.dark, padding: "5rem 2.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>About Us</p>
            <h2 style={{ textAlign: "center", color: "#fff", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 800, marginBottom: "1rem" }}>
              We're on a mission to make <span style={{ color: C.lime }}>every student</span> a coder
            </h2>
            <p style={{ textAlign: "center", color: C.muted, fontSize: "1rem", lineHeight: 1.8, maxWidth: 640, margin: "0 auto 3.5rem" }}>
              Code Excellence was founded in 2022 with a simple belief — world-class coding education should be accessible to every student in India, from metro cities to tier-3 towns.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "3.5rem" }} className="about-mv-grid">
              <div style={{ ...cardStyle, borderLeft: `3px solid ${C.lime}`, padding: "2rem" }}>
                <p style={{ color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🎯 Our Mission</p>
                <p style={{ color: "#e2e8f0", fontSize: "1rem", lineHeight: 1.8 }}>
                  To empower every student with practical coding skills through AI-driven personalised learning — making placements, certifications, and real-world projects accessible to all.
                </p>
              </div>
              <div style={{ ...cardStyle, borderLeft: `3px solid ${C.purpleLight}`, padding: "2rem" }}>
                <p style={{ color: C.purpleLight, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>🔭 Our Vision</p>
                <p style={{ color: "#e2e8f0", fontSize: "1rem", lineHeight: 1.8 }}>
                  To become India's most trusted multi-tenant EdTech platform — partnering with 10,000+ schools and colleges to produce the next generation of tech innovators.
                </p>
              </div>
            </div>

            <p style={{ textAlign: "center", color: C.muted, fontSize: "0.78rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: "1.5rem" }}>What We Stand For</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem", marginBottom: "3.5rem" }} className="values-grid">
              {VALUES.map((v) => (
                <div key={v.title} style={{ ...cardStyle, textAlign: "center" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: 8 }}>{v.title}</h4>
                  <p style={{ color: C.muted, fontSize: "0.8rem", lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>

            <p style={{ textAlign: "center", color: C.muted, fontSize: "0.78rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: "1.5rem" }}>Meet The Team</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }} className="team-grid">
              {TEAM.map((m) => (
                <div key={m.name} style={{ ...cardStyle, textAlign: "center", padding: "2rem 1.25rem" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: m.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", color: "#fff", margin: "0 auto 1rem" }}>{m.av}</div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>{m.name}</p>
                  <p style={{ color: C.muted, fontSize: "0.78rem" }}>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ CONTACT SECTION ══════════════════════════════════════════ */}
      <div ref={contactRef}>
        <section style={{ background: C.darker, padding: "5rem 2.5rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Contact Us</p>
            <h2 style={{ textAlign: "center", color: "#fff", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
              We'd love to <span style={{ color: C.lime }}>hear from you</span>
            </h2>
            <p style={{ textAlign: "center", color: C.muted, fontSize: "0.95rem", marginBottom: "3rem" }}>
              Whether you're a student, school, or just curious — drop us a message.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "2.5rem", alignItems: "start" }} className="contact-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { icon: "📧", label: "Email Us",    value: "info@codeexcellence.com" },
                  { icon: "📞", label: "Call Us",     value: "+91 98765 43210" },
                  { icon: "📍", label: "Our Office",  value: "Bengaluru, Karnataka, India" },
                  { icon: "🕐", label: "Working Hours", value: "Mon – Sat, 9 AM – 6 PM IST" },
                ].map((item) => (
                  <div key={item.label} style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: 14, padding: "1.25rem" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <p style={{ color: C.lime, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{item.label}</p>
                      <p style={{ color: "#e2e8f0", fontSize: "0.88rem" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle, padding: "2rem" }}>
                {formStatus === "sent" ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                    <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}>Message Sent!</h3>
                    <p style={{ color: C.muted, fontSize: "0.9rem", marginBottom: 20 }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                    <button
                      onClick={() => setFormStatus("idle")}
                      style={{ padding: "10px 24px", borderRadius: 9, background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.3)", color: C.lime, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
                    >Send Another →</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                    <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>Send us a message</h3>
                    <div>
                      <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>YOUR NAME</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g. Arjun Mehta"
                        style={{
                          width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
                          transition: "border-color .15s",
                        }}
                        onFocus={e => e.target.style.borderColor = C.lime}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>EMAIL ADDRESS</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="e.g. arjun@email.com"
                        style={{
                          width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
                          transition: "border-color .15s",
                        }}
                        onFocus={e => e.target.style.borderColor = C.lime}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>MESSAGE</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleFormChange}
                        placeholder="Tell us how we can help..."
                        rows={5}
                        style={{
                          width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
                          resize: "vertical", transition: "border-color .15s",
                        }}
                        onFocus={e => e.target.style.borderColor = C.lime}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      />
                    </div>
                    <button
                      onClick={handleFormSubmit}
                      disabled={formStatus === "sending"}
                      onMouseEnter={e => { if (formStatus !== "sending") e.currentTarget.style.transform = "scale(1.02)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                      style={{
                        padding: "13px", borderRadius: 11, fontWeight: 700, fontSize: "0.95rem",
                        background: formStatus === "sending"
                          ? "rgba(163,230,53,0.4)"
                          : "linear-gradient(135deg,#a3e635,#65a30d)",
                        color: "#1a1a1a", border: "none", cursor: formStatus === "sending" ? "not-allowed" : "pointer",
                        fontFamily: "inherit", transition: "transform .15s",
                        boxShadow: "0 4px 20px rgba(163,230,53,0.3)",
                      }}
                    >
                      {formStatus === "sending" ? "Sending…" : "Send Message →"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <div ref={footerRef}>
        <footer style={{ background: "#f5f0ff", padding: "3.5rem 2.5rem 2rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "2.5rem" }} className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }} onClick={() => scrollToSection("Home")}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1e0a2e", fontSize: "0.95rem" }}>Code Excellence</p>
                  <p style={{ color: C.purple, fontSize: "0.72rem" }}>EdTech Platform</p>
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.6 }}>Empowering students with cutting-edge coding education</p>
            </div>

            <div>
              <h4 style={{ color: "#1e0a2e", fontWeight: 700, marginBottom: 16, fontSize: "0.9rem" }}>Quick Links</h4>
              {["Home", "Courses", "About", "Contact Us"].map((l) => (
                <p key={l} style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 10, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.purple}
                  onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                  onClick={() => scrollToSection(l)}
                >{l}</p>
              ))}
            </div>

            <div>
              <h4 style={{ color: "#1e0a2e", fontWeight: 700, marginBottom: 16, fontSize: "0.9rem" }}>Resources</h4>
              {["Documentation", "Help Center", "Community", "Blog"].map((l) => (
                <p key={l} style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 10, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.purple}
                  onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                >{l}</p>
              ))}
            </div>

            <div>
              <h4 style={{ color: "#1e0a2e", fontWeight: 700, marginBottom: 16, fontSize: "0.9rem" }}>Contact</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 6 }}>info@codeexcellence.com</p>
              <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 16 }}>+91 98765 43210</p>
              <div style={{ display: "flex", gap: 10 }}>
                {["f", "𝕏", "in", "📷"].map((icon) => (
                  <div key={icon} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "opacity .15s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >{icon}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: "2.5rem auto 0", paddingTop: "1.5rem", borderTop: "1px solid #e9d5ff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>© 2025 Code Excellence. All rights reserved.</p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Service"].map((l) => (
                <span key={l} style={{ color: "#94a3b8", fontSize: "0.78rem", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.purple}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >{l}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* ══ ANIMATIONS & RESPONSIVE CSS ══════════════════════ */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          scroll-behavior: smooth;
          overflow-x: hidden;
        }
        
        @media (max-width: 1024px) {
          .features-grid, .courses-grid { grid-template-columns: repeat(2,1fr) !important; }
          .values-grid, .team-grid      { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav   { display: none !important; }
          .mobile-burger { display: block !important; }
          .hero-grid     { grid-template-columns: 1fr !important; }
          .hero-cards    { display: none !important; }
          .stats-grid    { grid-template-columns: repeat(2,1fr) !important; }
          .features-grid, .courses-grid, .testimonials-grid { grid-template-columns: 1fr !important; }
          .footer-grid   { grid-template-columns: 1fr 1fr !important; }
          .about-mv-grid { grid-template-columns: 1fr !important; }
          .values-grid, .team-grid { grid-template-columns: repeat(2,1fr) !important; }
          .contact-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .values-grid, .team-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}