// app/(protected)/student/certificates/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Download,
  Eye,
  Loader2,
  GraduationCap,
  X,
} from "lucide-react";
import Certificate from "lib/achiement_certificate"; // the colorCode-aware version
import type { UnifiedCertificate } from "@/types/certificate";

// ─── Ribbon icon ────────────────────────────────────────────────────────────
function RibbonIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="opacity-90">
      <circle cx="24" cy="17" r="11" stroke="white" strokeWidth="2.5" />
      <path
        d="M17 26.5 13 41l11-6 11 6-4-14.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M19 17l3.5 3.5L29 13.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Certificate Card ───────────────────────────────────────────────────────
function CertificateCard({
  cert,
  onPreview,
}: {
  cert: UnifiedCertificate;
  onPreview: (c: UnifiedCertificate) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const isExam = cert.kind === "exam";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (cert.downloadUrl) {
        // Already-rendered course certificate — just open it.
        window.open(cert.downloadUrl, "_blank");
      } else {
        // Exam certificates (and course certs on first download) are
        // generated on demand — reuse the preview modal's download button,
        // which drives the actual Certificate component's PDF flow.
        onPreview(cert);
      }
    } finally {
      setDownloading(false);
    }
  };

  // Course certs keep the static green theme; exam certs use the band's
  // own colorCode so different grade bands look visibly different.
  const headerStyle = isExam
    ? {
        background: `linear-gradient(135deg, #161b27, ${cert.colorCode}22, ${cert.colorCode})`,
      }
    : undefined;
  const badgeStyle = isExam
    ? { color: cert.colorCode, borderColor: cert.colorCode, background: `${cert.colorCode}18` }
    : undefined;
  const accentStyle = isExam ? { color: cert.colorCode } : undefined;

  return (
    <div
      className={`group bg-[#161b27] border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
        isExam
          ? "border-[#2d3448] hover:shadow-lg"
          : "border-[#2d3448] hover:border-[#3b6d11] hover:shadow-[0_4px_24px_rgba(59,109,17,0.15)]"
      }`}
    >
      {/* Header / badge area */}
      <div
        className={`relative h-40 flex flex-col items-start justify-center px-5 ${
          isExam ? "" : "bg-gradient-to-br from-[#161b27] via-[#1c2818] to-[#3b6d11]"
        }`}
        style={headerStyle}
      >
        <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/5" />
        <div
          className="absolute right-6 bottom-4"
          style={isExam ? { color: cert.colorCode } : { color: "#639922" }}
        >
          <RibbonIcon />
        </div>

        <span
          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full mb-3 border ${
            isExam ? "" : "text-[#c0dd97] bg-[#173404]/70 border-[#3b6d11]"
          }`}
          style={badgeStyle}
        >
          {isExam ? "Certificate of Achievement" : "Certificate of Completion"}
        </span>
        <h2 className="text-lg font-semibold text-slate-100 leading-snug max-w-[75%]">
          {cert.title}
        </h2>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-4">
          <p className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <GraduationCap className="w-3 h-3" />
            {isExam ? "Grade Band" : "Final Grade"}
          </p>
          <p className="text-sm font-semibold" style={isExam ? accentStyle : { color: "#c0dd97" }}>
            {cert.grade}
            {typeof cert.percentage === "number" ? ` · ${cert.percentage.toFixed(1)}%` : ""}
          </p>
        </div>

        {cert.instructor && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-0.5">Instructor</p>
            <p className="text-sm font-medium text-slate-200">{cert.instructor}</p>
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={isExam ? { backgroundColor: cert.colorCode, borderColor: cert.colorCode } : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 active:scale-95 disabled:opacity-50 ${
              isExam
                ? "text-white hover:opacity-90 border"
                : "bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97]"
            }`}
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Download
          </button>
          <button
            className="p-2.5 rounded-xl bg-[#1e2230] border border-[#2d3448] text-slate-400 hover:text-[#c0dd97] transition-colors"
            style={isExam ? undefined : {}}
            title="Preview"
            onClick={() => onPreview(cert)}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview / live-render modal ────────────────────────────────────────────
function CertificatePreviewModal({
  cert,
  onClose,
}: {
  cert: UnifiedCertificate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-slate-300 hover:text-white flex items-center gap-1 text-sm"
        >
          <X className="w-4 h-4" /> Close
        </button>
        <Certificate
          studentName={cert.studentName}
          course={cert.title}
          dateConducted={new Date(cert.issueDate).toLocaleDateString()}
          grade={cert.grade}
          colorCode={cert.colorCode ?? "#3a1650"}
          showDownloadButton={true}
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<UnifiedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<UnifiedCertificate | null>(null);
  const [studentName] = useState("Student");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseRes, examRes] = await Promise.all([
          fetch("/api/students/certificate"),
          fetch("/api/students/exam-certificates"),
        ]);

        const [courseJson, examJson] = await Promise.all([
          courseRes.json(),
          examRes.json(),
        ]);

        if (!courseRes.ok) throw new Error(courseJson?.message || "Failed to load course certificates");
        if (!examRes.ok) throw new Error(examJson?.message || "Failed to load exam certificates");

        const merged: UnifiedCertificate[] = [
          ...(courseJson.data ?? []),
          ...(examJson.data ?? []),
        ].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

        if (!cancelled) setCertificates(merged);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load certificates");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownloadAll = () => {
    certificates.forEach((c) => c.downloadUrl && window.open(c.downloadUrl, "_blank"));
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans">
      <div className="px-6 sm:px-10 pt-8 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="flex items-center gap-2 text-[1.6rem] font-semibold text-slate-100 tracking-tight mb-1">
              <Award className="w-6 h-6 text-[#639922]" />
              My Certificates
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, {studentName}! &nbsp;•&nbsp; Download and share your achievements
            </p>
          </div>

          {certificates.some((c) => c.downloadUrl) && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] text-sm font-semibold transition-colors duration-150 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </button>
          )}
        </div>
      </div>

      <main className="px-6 sm:px-10 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#639922]" />
            <p className="text-sm text-slate-500">Loading your certificates…</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#1e2230] flex items-center justify-center">
              <Award className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No certificates yet</h3>
            <p className="text-sm text-slate-500">
              Complete a course or exam to earn your first certificate
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <CertificateCard
                key={`${cert.kind}-${cert.id}`}
                cert={cert}
                onPreview={setPreviewCert}
              />
            ))}
          </div>
        )}
      </main>

      {previewCert && (
        <CertificatePreviewModal cert={previewCert} onClose={() => setPreviewCert(null)} />
      )}
    </div>
  );
}