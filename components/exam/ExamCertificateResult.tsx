// components/exam/ExamCertificateResult.tsx
"use client";

import { useEffect, useState } from "react";
import Certificate from "lib/achiement_certificate" // the colorCode-aware version

export default function ExamCertificateResult({
  examId,
  attemptId,
}: {
  examId: string;
  attemptId: string;
}) {
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/exams/${examId}/attempts/${attemptId}/certificate`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Certificate unavailable");
        if (!cancelled) setCert(json.data);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examId, attemptId]);

  if (loading) return <p>Generating your certificate…</p>;
  if (error) return <p className="text-sm text-slate-500">{error}</p>;
  if (!cert) return null;

  return (
    <Certificate
      studentName={cert.studentNameSnapshot}
      course={cert.examTitleSnapshot}
      dateConducted={new Date(cert.issuedAt).toLocaleDateString()}
      grade={cert.certificateName}
      colorCode={cert.colorCode}
    />
  );
}