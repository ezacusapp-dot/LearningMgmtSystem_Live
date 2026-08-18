


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, X, Award } from "lucide-react";

/**
 * CertificateGradeMaster
 * ------------------------------------------------------------------
 * Admin master screen for configuring certificate grade bands.
 * Each row defines: Certificate/Grade Name, Designation, Color Code,
 * and the Percentage range (From - To) that band applies to.
 *
 * - "Add New" (top right) navigates to /certificate-grade/new
 * - Each row has View (navigates to view page with full certificate),
 *   Edit (navigates to /certificate-grade/edit/[id]), and Delete actions.
 * ------------------------------------------------------------------
 */

export default function CertificateGradeMaster() {
  const router = useRouter();
  const [masters, setMasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch masters from the API (GET) ──
  useEffect(() => {
    const fetchMasters = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch('/api/achievement-certificate');
        const body = await response.json();

        if (!body.success) {
          throw new Error(body.error?.message || 'Failed to load grade bands.');
        }

        setMasters(body.data.data);
      } catch (error) {
        console.error('Failed to fetch grade bands:', error);
        setLoadError('Failed to load grade bands. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasters();
  }, []);

  // ── Navigation Handlers ──
  const handleAddNew = () => {
    router.push('./grade-wise-certificate/add');
  };

  const handleEdit = (row) => {
    router.push(`./grade-wise-certificate/edit/${row.id}`);
  };

  // ── View Handler - Navigate to view page ──
  const handleView = (row) => {
    router.push(`./grade-wise-certificate/view/${row.id}`);
  };

  // ── Delete Handler (DELETE) ──
  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/achievement-certificate/${id}`, {
        method: 'DELETE',
      });
      const body = await response.json();

      if (!body.success) {
        throw new Error(body.error?.message || 'Failed to delete grade band.');
      }

      setMasters((prev) => prev.filter((m) => m.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete grade band:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="cgm-page">
      {/* ── Header ── */}
      <div className="cgm-header">
        <div>
          <h1 className="cgm-title">Certificate Grade Master</h1>
          <p className="cgm-subtitle">
            Configure designation, color, and percentage bands used to generate certificates.
          </p>
        </div>
        <button onClick={handleAddNew} className="cgm-btn-add">
          <Plus className="cgm-btn-icon" />
          Add New
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="cgm-toolbar">
        <div className="cgm-count">
          {masters.length} {masters.length === 1 ? "band" : "bands"} configured
        </div>
      </div>

      {/* ── Table ── */}
      <div className="cgm-table-wrap">
        <table className="cgm-table">
          <thead>
            <tr>
              <th className="cgm-th cgm-th-no">#</th>
              <th className="cgm-th">Certificate Name</th>
              <th className="cgm-th">Designation</th>
              <th className="cgm-th">Color Code</th>
              <th className="cgm-th cgm-th-center">% From</th>
              <th className="cgm-th cgm-th-center">% To</th>
              <th className="cgm-th cgm-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="cgm-empty">
                  <p>Loading grade bands...</p>
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={7} className="cgm-empty">
                  <div className="cgm-empty-icon">⚠️</div>
                  <p>{loadError}</p>
                </td>
              </tr>
            ) : masters.length === 0 ? (
              <tr>
                <td colSpan={7} className="cgm-empty">
                  <div className="cgm-empty-icon">📋</div>
                  <p>No grade bands yet. Click "Add New" to create one.</p>
                </td>
              </tr>
            ) : (
              masters
                .slice()
                .sort((a, b) => a.percentFrom - b.percentFrom)
                .map((row, idx) => (
                  <tr key={row.id} className="cgm-tr">
                    <td className="cgm-td cgm-td-no">{idx + 1}</td>
                    <td className="cgm-td cgm-td-name">{row.certificateName}</td>
                    <td className="cgm-td">{row.designation}</td>
                    <td className="cgm-td">
                      <div className="cgm-color-cell">
                        <span
                          className="cgm-color-swatch"
                          style={{ backgroundColor: row.colorCode }}
                        />
                        <span className="cgm-color-hex">{row.colorCode}</span>
                      </div>
                    </td>
                    <td className="cgm-td cgm-td-center">{row.percentFrom}%</td>
                    <td className="cgm-td cgm-td-center">{row.percentTo}%</td>
                    <td className="cgm-td cgm-td-actions">
                      <button
                        onClick={() => handleView(row)}
                        title="View certificate"
                        className="cgm-icon-btn view"
                      >
                        <Eye className="cgm-icon-svg" />
                      </button>
                      <button
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        className="cgm-icon-btn edit"
                      >
                        <Pencil className="cgm-icon-svg" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(row.id)}
                        title="Delete"
                        className="cgm-icon-btn delete"
                      >
                        <Trash2 className="cgm-icon-svg" />
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="cgm-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="cgm-modal cgm-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cgm-modal-header">
              <h2 className="cgm-modal-title">Confirm Delete</h2>
              <button 
                className="cgm-modal-close" 
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
              >
                <X className="cgm-icon-svg" />
              </button>
            </div>
            <div className="cgm-modal-body cgm-modal-body-delete">
              <div className="cgm-delete-icon">⚠️</div>
              <p className="cgm-delete-text">
                Are you sure you want to delete this grade band?
                <br />
                <span className="cgm-delete-subtext">This action cannot be undone.</span>
              </p>
            </div>
            <div className="cgm-modal-footer">
              <button 
                type="button" 
                className="cgm-btn-cancel" 
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cgm-btn-delete"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="cgm-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
  .cgm-page {
    padding: 2rem 2.5rem;
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }

  /* ── Header ── */
  .cgm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .cgm-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .cgm-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  /* ── Add Button ── */
  .cgm-btn-add {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.55rem 1.1rem;
    background: #3b6d11;
    color: #c0dd97;
    border: 1px solid #639922;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .cgm-btn-add:hover { background: #27500a; }
  .cgm-btn-add:active { transform: scale(0.97); }
  .cgm-btn-icon {
    width: 16px;
    height: 16px;
  }

  /* ── Toolbar ── */
  .cgm-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 1.25rem;
  }
  .cgm-count {
    font-size: 0.8rem;
    color: #475569;
  }

  /* ── Table ── */
  .cgm-table-wrap {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 12px;
    overflow: hidden;
  }
  .cgm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .cgm-th {
    padding: 0.85rem 1.1rem;
    text-align: left;
    font-size: 0.78rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    border-bottom: 1px solid #2d3448;
    background: #1a2030;
    white-space: nowrap;
  }
  .cgm-th-no { width: 56px; }
  .cgm-th-center { text-align: center; }

  .cgm-tr { transition: background 0.12s; }
  .cgm-tr:hover { background: #1c2235; }
  .cgm-tr:not(:last-child) td { border-bottom: 1px solid #1f2537; }

  .cgm-td {
    padding: 0.85rem 1.1rem;
    color: #cbd5e1;
    vertical-align: middle;
  }
  .cgm-td-no { color: #475569; font-size: 0.8rem; }
  .cgm-td-name { font-weight: 500; color: #e2e8f0; }
  .cgm-td-center { text-align: center; }
  .cgm-td-actions { text-align: center; }

  /* ── Color Cell ── */
  .cgm-color-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cgm-color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #2d3448;
    flex-shrink: 0;
  }
  .cgm-color-hex {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* ── Action Icons ── */
  .cgm-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    margin: 0 2px;
  }
  .cgm-icon-btn .cgm-icon-svg {
    width: 15px;
    height: 15px;
  }
  .cgm-icon-btn.view { color: #60a5fa; }
  .cgm-icon-btn.view:hover {
    background: #0c253d;
    border-color: #1e4a72;
    color: #93c5fd;
  }
  .cgm-icon-btn.edit { color: #fbbf24; }
  .cgm-icon-btn.edit:hover {
    background: #2d2810;
    border-color: #7c5c1d;
    color: #fcd34d;
  }
  .cgm-icon-btn.delete { color: #f87171; }
  .cgm-icon-btn.delete:hover {
    background: #2a0d0d;
    border-color: #7f1d1d;
    color: #fca5a5;
  }
  .cgm-icon-btn:active { transform: scale(0.9); }

  /* ── Empty State ── */
  .cgm-empty {
    padding: 3.5rem 1rem;
    text-align: center;
    color: #475569;
  }
  .cgm-empty .cgm-empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .cgm-empty p {
    margin: 0;
    font-size: 0.875rem;
  }

  /* ── Modal Overlay ── */
  .cgm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(3px);
    animation: cgm-fadeIn 0.15s ease;
  }
  @keyframes cgm-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .cgm-modal {
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    width: 100%;
    max-width: 460px;
    margin: 1rem;
    animation: cgm-slideUp 0.2s ease;
  }
  .cgm-modal-sm { max-width: 400px; }
  .cgm-modal-lg { max-width: 700px; }
  
  @keyframes cgm-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cgm-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid #2d3448;
  }
  .cgm-modal-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .cgm-modal-title .cgm-icon-svg {
    width: 18px;
    height: 18px;
  }
  .flex.items-center.gap-2 {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cgm-modal-close {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
  }
  .cgm-modal-close:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cgm-modal-close .cgm-icon-svg {
    width: 18px;
    height: 18px;
  }
  .cgm-modal-close:hover:not(:disabled) {
    color: #e2e8f0;
    background: #2d3448;
  }

  .cgm-modal-body {
    padding: 1.4rem;
  }
  .cgm-modal-body-preview {
    padding: 1.4rem;
    display: flex;
    justify-content: center;
  }
  .cgm-modal-body-delete {
    padding: 2rem 1.4rem;
    text-align: center;
  }
  
  .cgm-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.4rem;
    border-top: 1px solid #2d3448;
  }

  /* ── Delete Confirmation ── */
  .cgm-delete-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }
  .cgm-delete-text {
    color: #e2e8f0;
    font-size: 0.95rem;
    margin: 0;
  }
  .cgm-delete-subtext {
    color: #64748b;
    font-size: 0.8rem;
  }

  .cgm-btn-delete {
    padding: 0.5rem 1.4rem;
    background: #7f1d1d;
    border: 1px solid #b91c1c;
    border-radius: 8px;
    color: #fca5a5;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .cgm-btn-delete:hover:not(:disabled) {
    background: #991b1b;
  }
  .cgm-btn-delete:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .cgm-btn-cancel {
    padding: 0.5rem 1.1rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .cgm-btn-cancel:hover:not(:disabled) {
    background: #1e2230;
    color: #e2e8f0;
  }
  .cgm-btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cgm-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: cgm-spin 0.6s linear infinite;
  }

  @keyframes cgm-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .cgm-page {
      padding: 1rem;
    }
    .cgm-header {
      flex-direction: column;
      gap: 1rem;
    }
    .cgm-title {
      font-size: 1.25rem;
    }
    .cgm-table-wrap {
      overflow-x: auto;
    }
    .cgm-modal {
      max-width: 95%;
      margin: 0.5rem;
    }
    .cgm-modal-lg {
      max-width: 95%;
    }
  }

  @media (max-width: 480px) {
    .cgm-page {
      padding: 0.75rem;
    }
    .cgm-btn-add {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }
    .cgm-th,
    .cgm-td {
      padding: 0.6rem 0.7rem;
      font-size: 0.75rem;
    }
    .cgm-color-hex {
      font-size: 0.65rem;
    }
    .cgm-modal-body {
      padding: 1rem;
    }
  }
`;
