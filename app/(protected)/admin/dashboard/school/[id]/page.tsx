"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Edit, Building, User, Mail, Phone, MapPin, Home,
  GraduationCap, BarChart2, CreditCard, Calendar, CheckCircle2, XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface School {
  id: string;
  name: string;
  adminName?: string;
  adminEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  state?: string;
  students?: number;
  studentsCount?: number;
  performance?: number;
  subscription?: "active" | "trial" | "expired";
  active?: boolean;
  status?: "Active" | "Inactive";
  createdAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUB_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  active:  { bg: "rgba(99,153,34,0.12)",  border: "rgba(99,153,34,0.35)",  text: "#c0dd97", dot: "#639922" },
  trial:   { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  text: "#fcd34d", dot: "#f59e0b" },
  expired: { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",   text: "#fca5a5", dot: "#ef4444" },
};

const AVATAR_PALETTE = [
  { bg: "#1e293b", fg: "#a78bfa" },
  { bg: "#064e3b", fg: "#6ee7b7" },
  { bg: "#4c0519", fg: "#f9a8d4" },
  { bg: "#0c4a6e", fg: "#93c5fd" },
  { bg: "#451a03", fg: "#fcd34d" },
  { bg: "#2e1065", fg: "#c4b5fd" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function perfColor(p: number): string {
  if (p >= 85) return "#34d399";
  if (p >= 70) return "#fbbf24";
  return "#f87171";
}

function avatarFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchoolViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [school,  setSchool]  = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (id) fetchSchool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSchool = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/schools/${id}`);
      const json = await res.json();
      if (json.status || json.success) {
        setSchool(json.data ?? null);
      } else {
        setError(json.message || "School not found");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load school");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sv-page">
        <div className="sv-loading">
          <div className="sv-sk-header" />
          <div className="sv-sk-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="sv-sk-card" />)}
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="sv-page">
        <div className="sv-error">
          <XCircle size={40} color="#f87171" />
          <p className="sv-error-title">{error || "School not found"}</p>
          <button className="sv-btn-outline" onClick={() => router.push("/admin/dashboard/schools")}>
            <ArrowLeft size={14} /> Back to Schools
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  const avatar = avatarFor(school.id);
  const sub    = SUB_STYLES[school.subscription ?? "expired"];
  const pc     = perfColor(school.performance ?? 0);
  const studentCount = school.students ?? school.studentsCount ?? 0;

  return (
    <div className="sv-page">

      {/* Top bar */}
      <div className="sv-topbar">
        <button className="sv-back" onClick={() => router.push("/admin/dashboard/school")}>
          <ArrowLeft size={15} /> Back to Schools
        </button>
        {/* <button className="sv-btn-edit" onClick={() => router.push(`/admin/dashboard/schools?edit=${school.id}`)}>
          <Edit size={14} /> Edit School
        </button> */}
      </div>

      {/* Header card */}
      <div className="sv-header-card">
        <div className="sv-header-left">
          <div className="sv-avatar" style={{ background: avatar.bg, color: avatar.fg }}>
            {initials(school.name)}
          </div>
          <div>
            <h1 className="sv-name">{school.name}</h1>
            <div className="sv-badges">
              <span className="sv-sub-badge" style={{ background: sub.bg, borderColor: sub.border, color: sub.text }}>
                <span className="sv-sub-dot" style={{ background: sub.dot }} />
                {(school.subscription ?? "expired").toUpperCase()}
              </span>
              <span className={`sv-status ${school.active ? "active" : "inactive"}`}>
                {school.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {school.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        <div className="sv-perf-block">
          <div className="sv-perf-ring">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#2d3448" strokeWidth="7" />
              <circle
                cx="36" cy="36" r="30" fill="none" stroke={pc} strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - (school.performance ?? 0) / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
            </svg>
            <span className="sv-perf-ring-val" style={{ color: pc }}>{school.performance ?? 0}%</span>
          </div>
          <span className="sv-perf-label">Performance</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="sv-grid">

        <div className="sv-card">
          <h3 className="sv-card-title"><User size={14} /> Admin Contact</h3>
          <div className="sv-row"><span className="sv-row-label"><User size={13} />Name</span><span className="sv-row-val">{school.adminName || "—"}</span></div>
          <div className="sv-row"><span className="sv-row-label"><Mail size={13} />Email</span><span className="sv-row-val">{school.adminEmail || "—"}</span></div>
          <div className="sv-row"><span className="sv-row-label"><Phone size={13} />Phone</span><span className="sv-row-val">{school.phone || "—"}</span></div>
        </div>

        <div className="sv-card">
          <h3 className="sv-card-title"><MapPin size={14} /> Location</h3>
          <div className="sv-row"><span className="sv-row-label"><Home size={13} />Address</span><span className="sv-row-val">{school.address || "—"}</span></div>
          <div className="sv-row"><span className="sv-row-label"><MapPin size={13} />Region</span><span className="sv-row-val">{school.region || "—"}</span></div>
          <div className="sv-row"><span className="sv-row-label"><MapPin size={13} />State</span><span className="sv-row-val">{school.state || school.city || "—"}</span></div>
        </div>

        <div className="sv-card">
          <h3 className="sv-card-title"><BarChart2 size={14} /> Stats</h3>
          <div className="sv-row"><span className="sv-row-label"><GraduationCap size={13} />Students</span><span className="sv-row-val">{studentCount.toLocaleString()}</span></div>
          <div className="sv-row"><span className="sv-row-label"><CreditCard size={13} />Subscription</span><span className="sv-row-val" style={{ color: sub.text }}>{(school.subscription ?? "expired").toUpperCase()}</span></div>
          <div className="sv-row"><span className="sv-row-label"><Calendar size={13} />Joined</span><span className="sv-row-val">{formatDate(school.createdAt)}</span></div>
        </div>

      </div>

      <style>{styles}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  .sv-page {
    padding: 2rem 2.5rem; min-height: 100vh;
    background: #0f1117; color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }
  .sv-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .sv-back { display: inline-flex; align-items: center; gap: 7px; background: transparent; border: 1px solid #2d3448; color: #94a3b8; padding: 0.5rem 1rem; border-radius: 9px; font-size: 0.83rem; font-weight: 500; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .sv-back:hover { background: #1e2230; color: #e2e8f0; }
  .sv-btn-edit { display: inline-flex; align-items: center; gap: 7px; padding: 0.5rem 1.1rem; background: #3b6d11; border: 1px solid #639922; border-radius: 9px; color: #c0dd97; font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; }
  .sv-btn-edit:hover { background: #27500a; box-shadow: 0 0 0 3px rgba(99,153,34,0.18); }

  .sv-header-card { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .sv-header-left { display: flex; align-items: center; gap: 16px; }
  .sv-avatar { width: 58px; height: 58px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; flex-shrink: 0; }
  .sv-name { font-size: 1.3rem; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; letter-spacing: -0.3px; }
  .sv-badges { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .sv-sub-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; border: 1px solid; }
  .sv-sub-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .sv-status { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; font-weight: 500; }
  .sv-status.active { color: #c0dd97; }
  .sv-status.inactive { color: #64748b; }

  .sv-perf-block { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sv-perf-ring { position: relative; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; }
  .sv-perf-ring-val { position: absolute; font-size: 0.95rem; font-weight: 700; }
  .sv-perf-label { font-size: 0.72rem; color: #64748b; font-weight: 500; }

  .sv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .sv-card { background: #161b27; border: 1px solid #2d3448; border-radius: 14px; padding: 1.2rem 1.3rem; }
  .sv-card-title { display: flex; align-items: center; gap: 7px; font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem; }
  .sv-card-title svg { color: #639922; }
  .sv-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 0.55rem 0; border-bottom: 1px solid rgba(45,52,72,0.5); }
  .sv-row:last-child { border-bottom: none; padding-bottom: 0; }
  .sv-row-label { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #64748b; font-weight: 500; flex-shrink: 0; }
  .sv-row-label svg { color: #475569; }
  .sv-row-val { font-size: 0.84rem; color: #e2e8f0; font-weight: 600; text-align: right; word-break: break-word; }

  .sv-error { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 5rem 1rem; text-align: center; }
  .sv-error-title { font-size: 0.95rem; color: #94a3b8; margin: 0; }
  .sv-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 0.5rem 1.1rem; background: transparent; border: 1px solid #2d3448; border-radius: 8px; color: #94a3b8; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: background 0.12s, color 0.12s; }
  .sv-btn-outline:hover { background: #1e2230; color: #e2e8f0; }

  .sv-loading { display: flex; flex-direction: column; gap: 1.5rem; }
  .sv-sk-header { height: 120px; background: #161b27; border: 1px solid #2d3448; border-radius: 14px; animation: sv-pulse 1.5s ease-in-out infinite; }
  .sv-sk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .sv-sk-card { height: 160px; background: #161b27; border: 1px solid #2d3448; border-radius: 14px; animation: sv-pulse 1.5s ease-in-out infinite; }
  @keyframes sv-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

  @media (max-width: 900px) {
    .sv-page { padding: 1.25rem 1rem; }
    .sv-grid { grid-template-columns: 1fr; }
    .sv-sk-grid { grid-template-columns: 1fr; }
  }
`;
