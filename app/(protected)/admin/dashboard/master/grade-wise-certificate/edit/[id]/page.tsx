"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, ArrowLeft, Save } from "lucide-react";

/**
 * AchievementCertificateEdit Page
 * ------------------------------------------------------------------
 * Standalone page for editing an existing achievement certificate.
 * Accessible via /achievement-certificate/edit/[id]
 * ------------------------------------------------------------------
 */

export default function AchievementCertificateEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState({
    certificateName: "",
    designation: "",
    colorCode: "#3C0061",
    percentFrom: "",
    percentTo: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Load existing data
  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const response = await fetch(`/api/achievement-certificate/${id}`);
        const body = await response.json();

        if (!body.success) {
          setError(body.error?.message || "Achievement certificate not found");
          setIsLoading(false);
          return;
        }

        const data = body.data;

        setForm({
          certificateName: data.certificateName,
          designation: data.designation,
          colorCode: data.colorCode,
          percentFrom: data.percentFrom.toString(),
          percentTo: data.percentTo.toString(),
        });
        setIsLoading(false);
      } catch (error) {
        setError("Failed to load achievement certificate data");
        setIsLoading(false);
      }
    };

    if (id) {
      loadCertificate();
    }
  }, [id]);

  const validate = () => {
    // Check required fields
    if (!form.certificateName.trim()) return "Certificate name is required.";
    if (!form.designation.trim()) return "Designation is required.";
    if (!/^#[0-9A-Fa-f]{6}$/.test(form.colorCode))
      return "Color code must be a valid hex value, e.g. #3C0061.";

    // Check percentage fields (floats allowed, e.g. 60.5)
    const from = Number(form.percentFrom);
    const to = Number(form.percentTo);

    if (form.percentFrom === "" || form.percentTo === "" || Number.isNaN(from) || Number.isNaN(to))
      return "Percentage from/to are required.";

    // Check range bounds — must be between 0 and 100
    if (from < 0 || from > 100) return "\"From\" percentage must be between 0 and 100.";
    if (to < 0 || to > 100) return "\"To\" percentage must be between 0 and 100.";

    // Check that from is less than to
    if (from >= to) return "\"From\" percentage must be less than \"To\" percentage.";

    // Check that they are not equal
    if (from === to) return "\"From\" and \"To\" percentages cannot be equal.";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      certificateName: form.certificateName.trim(),
      designation: form.designation.trim(),
      colorCode: form.colorCode,
      percentFrom: Number(form.percentFrom),
      percentTo: Number(form.percentTo),
    };

    try {
      const response = await fetch(`/api/achievement-certificate/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!body.success) {
        // Surfaces server-side checks the client can't do on its own:
        // duplicate certificateName (DUPLICATE_NAME) and an overlapping
        // percentage range against existing bands (RANGE_OVERLAP).
        throw new Error(body.error?.message || 'Failed to update achievement certificate');
      }

      setSuccess(true);
      // Navigate back to master list after brief delay
      setTimeout(() => {
        router.push('/admin/dashboard/master/grade-wise-certificate');
        router.refresh();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update achievement certificate. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Real-time validation for percentage fields
  const handlePercentageChange = (field: 'percentFrom' | 'percentTo', value: string) => {
    setForm((f) => ({ ...f, [field]: value }));

    // Clear error when user starts typing
    if (error) setError("");

    // Real-time validation feedback
    const from = Number(field === 'percentFrom' ? value : form.percentFrom);
    const to = Number(field === 'percentTo' ? value : form.percentTo);

    if (from >= 0 && to >= 0 && from > 0 && to > 0) {
      if (from >= to) {
        setError("\"From\" percentage must be less than \"To\" percentage.");
      } else {
        setError("");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="ace-page">
        <div className="ace-container">
          <div className="ace-loading">
            <div className="ace-spinner-large"></div>
            <p>Loading achievement certificate data...</p>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="ace-page">
        <div className="ace-container">
          <div className="ace-error-state">
            <div className="ace-error-icon">⚠️</div>
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <button onClick={handleCancel} className="ace-btn-cancel">
              Go Back
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="ace-page">
      <div className="ace-container">
        {/* ── Header ── */}
        <div className="ace-header">
          <div className="ace-header-left">
            <button onClick={handleCancel} className="ace-btn-back" aria-label="Go back">
              <ArrowLeft className="ace-icon" />
            </button>
            <div>
              <h1 className="ace-title">Edit Achievement Certificate</h1>
              <p className="ace-subtitle">
                Update the achievement certificate configuration.
              </p>
            </div>
          </div>
          <button onClick={handleCancel} className="ace-btn-close">
            <X className="ace-icon" />
          </button>
        </div>

        {/* ── Success Message ── */}
        {success && (
          <div className="ace-success">
            <Save className="ace-success-icon" />
            <div>
              <h3>Achievement Certificate Updated!</h3>
              <p>Redirecting to master list...</p>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        {!success && (
          <form onSubmit={handleSubmit} className="ace-form">
            <div className="ace-form-body">
              {/* Certificate Name */}
              <div className="ace-field">
                <label className="ace-label">
                  Certificate Name <span className="ace-req">*</span>
                </label>
                <input
                  type="text"
                  value={form.certificateName}
                  onChange={(e) => setForm((f) => ({ ...f, certificateName: e.target.value }))}
                  placeholder="e.g. Excellence in Mathematics, Science Achievement"
                  className={`ace-input ${error && !form.certificateName.trim() ? 'ace-input-error' : ''}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="ace-hint">The name displayed on the achievement certificate</p>
              </div>

              {/* Designation */}
              <div className="ace-field">
                <label className="ace-label">
                  Designation <span className="ace-req">*</span>
                </label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="e.g. Gold Medalist, Distinction, Honours"
                  className={`ace-input ${error && !form.designation.trim() ? 'ace-input-error' : ''}`}
                  disabled={isSubmitting}
                />
                <p className="ace-hint">The achievement level or classification</p>
              </div>

              {/* Color Code */}
              <div className="ace-field">
                <label className="ace-label">
                  Color Code <span className="ace-req">*</span>
                </label>
                <div className="ace-color-input-group">
                  <input
                    type="color"
                    value={form.colorCode}
                    onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))}
                    className="ace-color-picker"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={form.colorCode}
                    onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))}
                    placeholder="#3C0061"
                    className={`ace-input ace-input-flex ${error && !/^#[0-9A-Fa-f]{6}$/.test(form.colorCode) ? 'ace-input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="ace-hint">Hex color code for certificate styling</p>
              </div>

              {/* Percentage Range */}
              <div className="ace-field-row-2">
                <div className="ace-field">
                  <label className="ace-label">
                    % From <span className="ace-req">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={form.percentFrom}
                    onChange={(e) => handlePercentageChange('percentFrom', e.target.value)}
                    placeholder="0"
                    className={`ace-input ${error && (form.percentFrom === "" || Number(form.percentFrom) >= Number(form.percentTo)) ? 'ace-input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  <p className="ace-hint">Minimum percentage (0-100, decimals allowed e.g. 60.5)</p>
                </div>
                <div className="ace-field">
                  <label className="ace-label">
                    % To <span className="ace-req">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={form.percentTo}
                    onChange={(e) => handlePercentageChange('percentTo', e.target.value)}
                    placeholder="100"
                    className={`ace-input ${error && (form.percentTo === "" || Number(form.percentTo) <= Number(form.percentFrom)) ? 'ace-input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  <p className="ace-hint">Maximum percentage (0-100, decimals allowed e.g. 89.75)</p>
                </div>
              </div>

              {/* Validation Rules Info */}
              <div className="ace-validation-info">
                <div className="ace-validation-item">
                  <span className="ace-validation-dot"></span>
                  <span>From percentage must be less than To percentage</span>
                </div>
                <div className="ace-validation-item">
                  <span className="ace-validation-dot"></span>
                  <span>Both values must be between 0 and 100 (decimals allowed)</span>
                </div>
                <div className="ace-validation-item">
                  <span className="ace-validation-dot"></span>
                  <span>Values cannot be equal</span>
                </div>
                <div className="ace-validation-item">
                  <span className="ace-validation-dot"></span>
                  <span>Certificate name and percentage range must not collide with another entry</span>
                </div>
              </div>

              {error && <div className="ace-error">{error}</div>}
            </div>

            {/* ── Actions ── */}
            <div className="ace-form-footer">
              <button
                type="button"
                className="ace-btn-cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ace-btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="ace-spinner"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Styles ── */}
      <style>{styles}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Styles - Dark Theme
────────────────────────────────────────────── */

const styles = `
  /* ── Layout ── */
  .ace-page {
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .ace-container {
    width: 100%;
    max-width: 600px;
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    overflow: hidden;
    animation: ace-slideUp 0.2s ease;
  }

  @keyframes ace-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Loading State ── */
  .ace-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .ace-spinner-large {
    width: 40px;
    height: 40px;
    border: 3px solid #2d3448;
    border-top-color: #639922;
    border-radius: 50%;
    animation: ace-spin 0.8s linear infinite;
  }

  .ace-loading p {
    color: #64748b;
    margin: 0;
  }

  /* ── Error State ── */
  .ace-error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 0.5rem;
    text-align: center;
  }

  .ace-error-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .ace-error-state h2 {
    color: #f1f5f9;
    margin: 0;
  }

  .ace-error-state p {
    color: #64748b;
    margin: 0 0 1rem;
  }

  /* ── Header ── */
  .ace-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.4rem 1.5rem;
    border-bottom: 1px solid #2d3448;
  }

  .ace-header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .ace-btn-back {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .ace-btn-back .ace-icon {
    width: 20px;
    height: 20px;
  }

  .ace-btn-back:hover {
    color: #e2e8f0;
    background: #2d3448;
  }

  .ace-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
  }

  .ace-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  .ace-btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
    flex-shrink: 0;
  }

  .ace-btn-close .ace-icon {
    width: 20px;
    height: 20px;
  }

  .ace-btn-close:hover {
    color: #e2e8f0;
    background: #2d3448;
  }

  /* ── Success Message ── */
  .ace-success {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 2rem 1.5rem;
    background: #0d1f0a;
    border-bottom: 1px solid #2d5a1d;
  }

  .ace-success-icon {
    width: 32px;
    height: 32px;
    color: #3b6d11;
    flex-shrink: 0;
  }

  .ace-success h3 {
    margin: 0 0 4px;
    color: #c0dd97;
    font-weight: 500;
  }

  .ace-success p {
    margin: 0;
    color: #64748b;
    font-size: 0.85rem;
  }

  /* ── Form ── */
  .ace-form {
    display: flex;
    flex-direction: column;
  }

  .ace-form-body {
    padding: 1.5rem;
  }

  .ace-field {
    margin-bottom: 1.25rem;
  }

  .ace-field:last-child {
    margin-bottom: 0;
  }

  .ace-field-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 0.5rem;
  }

  .ace-field-row-2 .ace-field {
    margin-bottom: 0;
  }

  .ace-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .ace-req {
    color: #f87171;
  }

  .ace-input {
    width: 100%;
    padding: 0.6rem 0.85rem;
    background: #1a2030;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .ace-input::placeholder {
    color: #475569;
  }

  .ace-input:focus {
    border-color: #639922;
  }

  .ace-input-error {
    border-color: #f87171 !important;
  }

  .ace-input-error:focus {
    border-color: #f87171 !important;
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
  }

  .ace-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .ace-input-flex {
    flex: 1;
  }

  .ace-color-input-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ace-color-picker {
    width: 44px;
    height: 44px;
    padding: 2px;
    border: 1px solid #2d3448;
    border-radius: 8px;
    background: #1a2030;
    cursor: pointer;
    flex-shrink: 0;
  }

  .ace-color-picker:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .ace-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .ace-color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }

  .ace-hint {
    font-size: 0.75rem;
    color: #475569;
    margin: 4px 0 0;
  }

  /* ── Validation Info ── */
  .ace-validation-info {
    margin: 0.5rem 0 1rem;
    padding: 0.75rem;
    background: #1a2030;
    border: 1px solid #2d3448;
    border-radius: 8px;
  }

  .ace-validation-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #94a3b8;
    padding: 2px 0;
  }

  .ace-validation-dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #639922;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ace-error {
    color: #f87171;
    font-size: 0.85rem;
    padding: 0.75rem;
    background: #2a0d0d;
    border: 1px solid #7f1d1d;
    border-radius: 8px;
    margin-top: 0.5rem;
  }

  /* ── Form Footer ── */
  .ace-form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.5rem;
    border-top: 1px solid #2d3448;
    background: #1a2030;
  }

  .ace-btn-cancel {
    padding: 0.55rem 1.2rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }

  .ace-btn-cancel:hover:not(:disabled) {
    background: #1e2230;
    color: #e2e8f0;
  }

  .ace-btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .ace-btn-save {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0.55rem 1.6rem;
    background: #3b6d11;
    border: 1px solid #639922;
    border-radius: 8px;
    color: #c0dd97;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s, opacity 0.12s;
  }

  .ace-btn-save:hover:not(:disabled) {
    background: #27500a;
  }

  .ace-btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .ace-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #c0dd97;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ace-spin 0.6s linear infinite;
  }

  @keyframes ace-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .ace-page {
      padding: 1rem;
    }

    .ace-container {
      max-width: 100%;
    }

    .ace-header {
      padding: 1rem;
    }

    .ace-title {
      font-size: 1.1rem;
    }

    .ace-subtitle {
      font-size: 0.8rem;
    }

    .ace-form-body {
      padding: 1rem;
    }

    .ace-field-row-2 {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .ace-form-footer {
      flex-direction: column-reverse;
    }

    .ace-btn-cancel,
    .ace-btn-save {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .ace-page {
      padding: 0.5rem;
    }

    .ace-header {
      padding: 0.75rem;
    }

    .ace-form-body {
      padding: 0.75rem;
    }

    .ace-field {
      margin-bottom: 1rem;
    }

    .ace-input {
      font-size: 0.8rem;
      padding: 0.5rem 0.7rem;
    }

    .ace-color-picker {
      width: 38px;
      height: 38px;
    }

    .ace-validation-info {
      padding: 0.5rem;
    }

    .ace-validation-item {
      font-size: 0.7rem;
    }
  }
`;
