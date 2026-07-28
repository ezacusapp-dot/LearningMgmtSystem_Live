"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import Certificate from "lib/achiement_certificate";

/**
 * View Certificate Page — /grade-wise-certificate/view/[id]
 * ------------------------------------------------------------------
 * Reached by clicking the Eye icon on a row in CertificateGradeMaster.
 * Fetches that grade band from GET /api/achievement-certificate/:id
 * and renders the actual <Certificate /> template using its data:
 *   - studentName is left blank ("") — this is a grade-band preview,
 *     not a real issued certificate.
 *   - grade is set to the record's certificateName (e.g. "Arambh")
 *     instead of a raw score like "A+".
 * ------------------------------------------------------------------
 */
export default function ViewCertificatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [master, setMaster] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchMaster = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/achievement-certificate/${id}`);
        const body = await response.json();

        if (!body.success) {
          throw new Error(body.error?.message || "Grade band not found.");
        }

        setMaster(body.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load grade band.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaster();
  }, [id]);

  if (isLoading) {
    return (
      <div className="vcp-page">
        <div className="vcp-notfound">
          <p>Loading certificate…</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error || !master) {
    return (
      <div className="vcp-page">
        <div className="vcp-notfound">
          <p>{error || "Grade band not found."}</p>
          <button className="vcp-btn-back" onClick={() => router.back()}>
            <ArrowLeft className="vcp-icon" />
            Back
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="vcp-page">
      <div className="vcp-header">
        <button className="vcp-btn-back" onClick={() => router.back()}>
          <ArrowLeft className="vcp-icon" />
          Back
        </button>
        <div className="vcp-heading">
          <Award className="vcp-icon" style={{ color: master.colorCode }} />
          <h1 className="vcp-title">
            {master.certificateName}{" "}
            <span className="vcp-subtitle">
              ({master.percentFrom}%–{master.percentTo}%)
            </span>
          </h1>
        </div>
      </div>

      <div className="vcp-certificate-wrap">
        <Certificate
          studentName="student Name"
          grade={master.certificateName}
          colorCode={master.colorCode} 
          showDownloadButton={false}
        />
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .vcp-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }
  .vcp-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  .vcp-btn-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .vcp-btn-back:hover {
    background: #1e2230;
    color: #e2e8f0;
  }
  .vcp-heading {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vcp-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .vcp-subtitle {
    color: #64748b;
    font-weight: 400;
    font-size: 1rem;
  }
  .vcp-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  .vcp-certificate-wrap {
    display: flex;
    justify-content: center;
  }
  .vcp-notfound {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    .vcp-page {
      padding: 1rem;
    }
  }
`;
