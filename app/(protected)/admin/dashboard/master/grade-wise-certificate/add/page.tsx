// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { X, ArrowLeft } from "lucide-react";

// /**
//  * AchievementCertificateCreate Page
//  * ------------------------------------------------------------------
//  * Standalone page for creating a new achievement certificate.
//  * Accessible via /achievement-certificate/new
//  * ------------------------------------------------------------------
//  */

// export default function AchievementCertificateCreate() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     certificateName: "",
//     designation: "",
//     colorCode: "#3C0061",
//     percentFrom: "",
//     percentTo: "",
//   });
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const validate = () => {
//     // Check required fields
//     if (!form.certificateName.trim()) return "Certificate name is required.";
//     if (!form.designation.trim()) return "Designation is required.";
//     if (!/^#[0-9A-Fa-f]{6}$/.test(form.colorCode))
//       return "Color code must be a valid hex value, e.g. #3C0061.";
    
//     // Check percentage fields
//     const from = Number(form.percentFrom);
//     const to = Number(form.percentTo);
    
//     if (form.percentFrom === "" || form.percentTo === "" || Number.isNaN(from) || Number.isNaN(to))
//       return "Percentage from/to are required.";
    
//     // Check range bounds
//     if (from < 0 || from > 100) return "\"From\" percentage must be between 0 and 100.";
//     if (to < 0 || to > 100) return "\"To\" percentage must be between 0 and 100.";
    
//     // Check that from is less than to
//     if (from >= to) return "\"From\" percentage must be less than \"To\" percentage.";
    
//     // Check that they are not equal
//     if (from === to) return "\"From\" and \"To\" percentages cannot be equal.";
    
//     return "";
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const err = validate();
//     if (err) {
//       setError(err);
//       return;
//     }

//     setIsSubmitting(true);
//     setError("");

//     const payload = {
//       certificateName: form.certificateName.trim(),
//       designation: form.designation.trim(),
//       colorCode: form.colorCode,
//       percentFrom: Number(form.percentFrom),
//       percentTo: Number(form.percentTo),
//     };

//     try {
//       // TODO: Replace with actual API call
//       // const response = await fetch('/api/achievement-certificate', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(payload),
//       // });
//       // if (!response.ok) throw new Error('Failed to create achievement certificate');

//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setSuccess(true);
//       // Navigate back to master list after brief delay
//       setTimeout(() => {
//         router.push('/achievement-certificate');
//         router.refresh();
//       }, 1500);
//     } catch (error) {
//       setError("Failed to create achievement certificate. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     router.back();
//   };

//   // Real-time validation for percentage fields
//   const handlePercentageChange = (field: 'percentFrom' | 'percentTo', value: string) => {
//     setForm((f) => ({ ...f, [field]: value }));
    
//     // Clear error when user starts typing
//     if (error) setError("");
    
//     // Real-time validation feedback
//     const from = Number(field === 'percentFrom' ? value : form.percentFrom);
//     const to = Number(field === 'percentTo' ? value : form.percentTo);
    
//     if (from >= 0 && to >= 0 && from > 0 && to > 0) {
//       if (from >= to) {
//         setError("\"From\" percentage must be less than \"To\" percentage.");
//       } else {
//         setError("");
//       }
//     }
//   };

//   return (
//     <div className="acc-page">
//       <div className="acc-container">
//         {/* ── Header ── */}
//         <div className="acc-header">
//           <div className="acc-header-left">
//             <button onClick={handleCancel} className="acc-btn-back" aria-label="Go back">
//               <ArrowLeft className="acc-icon" />
//             </button>
//             <div>
//               <h1 className="acc-title">Create Achievement Certificate</h1>
//               <p className="acc-subtitle">
//                 Add a new achievement certificate configuration.
//               </p>
//             </div>
//           </div>
//           <button onClick={handleCancel} className="acc-btn-close">
//             <X className="acc-icon" />
//           </button>
//         </div>

//         {/* ── Success Message ── */}
//         {success && (
//           <div className="acc-success">
//             <div>
//               <h3>Achievement Certificate Created!</h3>
//               <p>Redirecting to master list...</p>
//             </div>
//           </div>
//         )}

//         {/* ── Form ── */}
//         {!success && (
//           <form onSubmit={handleSubmit} className="acc-form">
//             <div className="acc-form-body">
//               {/* Certificate Name */}
//               <div className="acc-field">
//                 <label className="acc-label">
//                   Certificate Name <span className="acc-req">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.certificateName}
//                   onChange={(e) => setForm((f) => ({ ...f, certificateName: e.target.value }))}
//                   placeholder="e.g. Excellence in Mathematics, Science Achievement"
//                   className={`acc-input ${error && !form.certificateName.trim() ? 'acc-input-error' : ''}`}
//                   disabled={isSubmitting}
//                   autoFocus
//                 />
//                 <p className="acc-hint">The name displayed on the achievement certificate</p>
//               </div>

//               {/* Designation */}
//               <div className="acc-field">
//                 <label className="acc-label">
//                   Designation <span className="acc-req">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.designation}
//                   onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
//                   placeholder="e.g. Gold Medalist, Distinction, Honours"
//                   className={`acc-input ${error && !form.designation.trim() ? 'acc-input-error' : ''}`}
//                   disabled={isSubmitting}
//                 />
//                 <p className="acc-hint">The achievement level or classification</p>
//               </div>

//               {/* Color Code */}
//               <div className="acc-field">
//                 <label className="acc-label">
//                   Color Code <span className="acc-req">*</span>
//                 </label>
//                 <div className="acc-color-input-group">
//                   <input
//                     type="color"
//                     value={form.colorCode}
//                     onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))}
//                     className="acc-color-picker"
//                     disabled={isSubmitting}
//                   />
//                   <input
//                     type="text"
//                     value={form.colorCode}
//                     onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))}
//                     placeholder="#3C0061"
//                     className={`acc-input acc-input-flex ${error && !/^#[0-9A-Fa-f]{6}$/.test(form.colorCode) ? 'acc-input-error' : ''}`}
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <p className="acc-hint">Hex color code for certificate styling</p>
//               </div>

//               {/* Percentage Range */}
//               <div className="acc-field-row-2">
//                 <div className="acc-field">
//                   <label className="acc-label">
//                     % From <span className="acc-req">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={100}
//                     value={form.percentFrom}
//                     onChange={(e) => handlePercentageChange('percentFrom', e.target.value)}
//                     placeholder="0"
//                     className={`acc-input ${error && (form.percentFrom === "" || Number(form.percentFrom) >= Number(form.percentTo)) ? 'acc-input-error' : ''}`}
//                     disabled={isSubmitting}
//                   />
//                   <p className="acc-hint">Minimum percentage (0-100)</p>
//                 </div>
//                 <div className="acc-field">
//                   <label className="acc-label">
//                     % To <span className="acc-req">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={100}
//                     value={form.percentTo}
//                     onChange={(e) => handlePercentageChange('percentTo', e.target.value)}
//                     placeholder="100"
//                     className={`acc-input ${error && (form.percentTo === "" || Number(form.percentTo) <= Number(form.percentFrom)) ? 'acc-input-error' : ''}`}
//                     disabled={isSubmitting}
//                   />
//                   <p className="acc-hint">Maximum percentage (0-100)</p>
//                 </div>
//               </div>

//               {/* Validation Rules Info */}
//               <div className="acc-validation-info">
//                 <div className="acc-validation-item">
//                   <span className="acc-validation-dot"></span>
//                   <span>From percentage must be less than To percentage</span>
//                 </div>
//                 <div className="acc-validation-item">
//                   <span className="acc-validation-dot"></span>
//                   <span>Both values must be between 0 and 100</span>
//                 </div>
//                 <div className="acc-validation-item">
//                   <span className="acc-validation-dot"></span>
//                   <span>Values cannot be equal</span>
//                 </div>
//               </div>

//               {error && <div className="acc-error">{error}</div>}
//             </div>

//             {/* ── Actions ── */}
//             <div className="acc-form-footer">
//               <button
//                 type="button"
//                 className="acc-btn-cancel"
//                 onClick={handleCancel}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="acc-btn-save"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <span className="acc-spinner"></span>
//                     Creating...
//                   </>
//                 ) : (
//                   "Create Achievement Certificate"
//                 )}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>

//       {/* ── Styles ── */}
//       <style>{styles}</style>
//     </div>
//   );
// }

// /* ──────────────────────────────────────────────
//    Styles - Dark Theme
// ────────────────────────────────────────────── */

// const styles = `
//   /* ── Layout ── */
//   .acc-page {
//     min-height: 100vh;
//     background: #0f1117;
//     color: #e2e8f0;
//     font-family: 'DM Sans', 'Segoe UI', sans-serif;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 2rem;
//   }

//   .acc-container {
//     width: 100%;
//     max-width: 600px;
//     background: #161b27;
//     border: 1px solid #2d3448;
//     border-radius: 14px;
//     overflow: hidden;
//     animation: acc-slideUp 0.2s ease;
//   }

//   @keyframes acc-slideUp {
//     from { opacity: 0; transform: translateY(16px); }
//     to { opacity: 1; transform: translateY(0); }
//   }

//   /* ── Header ── */
//   .acc-header {
//     display: flex;
//     align-items: flex-start;
//     justify-content: space-between;
//     padding: 1.4rem 1.5rem;
//     border-bottom: 1px solid #2d3448;
//   }

//   .acc-header-left {
//     display: flex;
//     align-items: flex-start;
//     gap: 12px;
//     flex: 1;
//   }

//   .acc-btn-back {
//     background: transparent;
//     border: none;
//     color: #64748b;
//     cursor: pointer;
//     padding: 4px;
//     border-radius: 5px;
//     transition: color 0.12s, background 0.12s;
//     margin-top: 2px;
//     flex-shrink: 0;
//   }

//   .acc-btn-back .acc-icon {
//     width: 20px;
//     height: 20px;
//   }

//   .acc-btn-back:hover {
//     color: #e2e8f0;
//     background: #2d3448;
//   }

//   .acc-title {
//     font-size: 1.25rem;
//     font-weight: 600;
//     color: #f1f5f9;
//     margin: 0 0 4px;
//   }

//   .acc-subtitle {
//     font-size: 0.85rem;
//     color: #64748b;
//     margin: 0;
//   }

//   .acc-btn-close {
//     background: transparent;
//     border: none;
//     color: #64748b;
//     cursor: pointer;
//     padding: 4px;
//     border-radius: 5px;
//     transition: color 0.12s, background 0.12s;
//     flex-shrink: 0;
//   }

//   .acc-btn-close .acc-icon {
//     width: 20px;
//     height: 20px;
//   }

//   .acc-btn-close:hover {
//     color: #e2e8f0;
//     background: #2d3448;
//   }

//   /* ── Success Message ── */
//   .acc-success {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     padding: 2rem 1.5rem;
//     background: #0d1f0a;
//     border-bottom: 1px solid #2d5a1d;
//   }

//   .acc-success h3 {
//     margin: 0 0 4px;
//     color: #c0dd97;
//     font-weight: 500;
//   }

//   .acc-success p {
//     margin: 0;
//     color: #64748b;
//     font-size: 0.85rem;
//   }

//   /* ── Form ── */
//   .acc-form {
//     display: flex;
//     flex-direction: column;
//   }

//   .acc-form-body {
//     padding: 1.5rem;
//   }

//   .acc-field {
//     margin-bottom: 1.25rem;
//   }

//   .acc-field:last-child {
//     margin-bottom: 0;
//   }

//   .acc-field-row-2 {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//     margin-bottom: 0.5rem;
//   }

//   .acc-field-row-2 .acc-field {
//     margin-bottom: 0;
//   }

//   .acc-label {
//     display: block;
//     font-size: 0.82rem;
//     font-weight: 500;
//     color: #94a3b8;
//     margin-bottom: 6px;
//   }

//   .acc-req {
//     color: #f87171;
//   }

//   .acc-input {
//     width: 100%;
//     padding: 0.6rem 0.85rem;
//     background: #1a2030;
//     border: 1px solid #2d3448;
//     border-radius: 8px;
//     color: #e2e8f0;
//     font-size: 0.875rem;
//     outline: none;
//     transition: border-color 0.15s;
//     box-sizing: border-box;
//   }

//   .acc-input::placeholder {
//     color: #475569;
//   }

//   .acc-input:focus {
//     border-color: #639922;
//   }

//   .acc-input-error {
//     border-color: #f87171 !important;
//   }

//   .acc-input-error:focus {
//     border-color: #f87171 !important;
//     box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
//   }

//   .acc-input:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .acc-input-flex {
//     flex: 1;
//   }

//   .acc-color-input-group {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//   }

//   .acc-color-picker {
//     width: 44px;
//     height: 44px;
//     padding: 2px;
//     border: 1px solid #2d3448;
//     border-radius: 8px;
//     background: #1a2030;
//     cursor: pointer;
//     flex-shrink: 0;
//   }

//   .acc-color-picker:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .acc-color-picker::-webkit-color-swatch-wrapper {
//     padding: 0;
//   }

//   .acc-color-picker::-webkit-color-swatch {
//     border: none;
//     border-radius: 6px;
//   }

//   .acc-hint {
//     font-size: 0.75rem;
//     color: #475569;
//     margin: 4px 0 0;
//   }

//   /* ── Validation Info ── */
//   .acc-validation-info {
//     margin: 0.5rem 0 1rem;
//     padding: 0.75rem;
//     background: #1a2030;
//     border: 1px solid #2d3448;
//     border-radius: 8px;
//   }

//   .acc-validation-item {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     font-size: 0.75rem;
//     color: #94a3b8;
//     padding: 2px 0;
//   }

//   .acc-validation-dot {
//     display: inline-block;
//     width: 4px;
//     height: 4px;
//     background: #639922;
//     border-radius: 50%;
//     flex-shrink: 0;
//   }

//   .acc-error {
//     color: #f87171;
//     font-size: 0.85rem;
//     padding: 0.75rem;
//     background: #2a0d0d;
//     border: 1px solid #7f1d1d;
//     border-radius: 8px;
//     margin-top: 0.5rem;
//   }

//   /* ── Form Footer ── */
//   .acc-form-footer {
//     display: flex;
//     justify-content: flex-end;
//     gap: 10px;
//     padding: 1rem 1.5rem;
//     border-top: 1px solid #2d3448;
//     background: #1a2030;
//   }

//   .acc-btn-cancel {
//     padding: 0.55rem 1.2rem;
//     background: transparent;
//     border: 1px solid #2d3448;
//     border-radius: 8px;
//     color: #94a3b8;
//     font-size: 0.875rem;
//     cursor: pointer;
//     transition: background 0.12s, color 0.12s;
//   }

//   .acc-btn-cancel:hover:not(:disabled) {
//     background: #1e2230;
//     color: #e2e8f0;
//   }

//   .acc-btn-cancel:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .acc-btn-save {
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     padding: 0.55rem 1.6rem;
//     background: #3b6d11;
//     border: 1px solid #639922;
//     border-radius: 8px;
//     color: #c0dd97;
//     font-size: 0.875rem;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background 0.12s, opacity 0.12s;
//   }

//   .acc-btn-save:hover:not(:disabled) {
//     background: #27500a;
//   }

//   .acc-btn-save:disabled {
//     opacity: 0.7;
//     cursor: not-allowed;
//   }

//   .acc-spinner {
//     display: inline-block;
//     width: 16px;
//     height: 16px;
//     border: 2px solid #c0dd97;
//     border-top-color: transparent;
//     border-radius: 50%;
//     animation: acc-spin 0.6s linear infinite;
//   }

//   @keyframes acc-spin {
//     to { transform: rotate(360deg); }
//   }

//   /* ── Responsive ── */
//   @media (max-width: 768px) {
//     .acc-page {
//       padding: 1rem;
//     }

//     .acc-container {
//       max-width: 100%;
//     }

//     .acc-header {
//       padding: 1rem;
//     }

//     .acc-title {
//       font-size: 1.1rem;
//     }

//     .acc-subtitle {
//       font-size: 0.8rem;
//     }

//     .acc-form-body {
//       padding: 1rem;
//     }

//     .acc-field-row-2 {
//       grid-template-columns: 1fr;
//       gap: 0;
//     }

//     .acc-form-footer {
//       flex-direction: column-reverse;
//     }

//     .acc-btn-cancel,
//     .acc-btn-save {
//       width: 100%;
//       justify-content: center;
//     }
//   }

//   @media (max-width: 480px) {
//     .acc-page {
//       padding: 0.5rem;
//     }

//     .acc-header {
//       padding: 0.75rem;
//     }

//     .acc-form-body {
//       padding: 0.75rem;
//     }

//     .acc-field {
//       margin-bottom: 1rem;
//     }

//     .acc-input {
//       font-size: 0.8rem;
//       padding: 0.5rem 0.7rem;
//     }

//     .acc-color-picker {
//       width: 38px;
//       height: 38px;
//     }

//     .acc-validation-info {
//       padding: 0.5rem;
//     }

//     .acc-validation-item {
//       font-size: 0.7rem;
//     }
//   }
// `;
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";

/**
 * AchievementCertificateCreate Page
 * ------------------------------------------------------------------
 * Standalone page for creating a new achievement certificate.
 * Accessible via /achievement-certificate/new
 * ------------------------------------------------------------------
 */

export default function AchievementCertificateCreate() {
  const router = useRouter();
  const [form, setForm] = useState({
    certificateName: "",
    designation: "",
    colorCode: "#3C0061",
    percentFrom: "",
    percentTo: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      const response = await fetch('/api/achievement-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!body.success) {
        // Surfaces server-side checks the client can't do on its own:
        // duplicate certificateName (DUPLICATE_NAME) and an overlapping
        // percentage range against existing bands (RANGE_OVERLAP).
        throw new Error(body.error?.message || 'Failed to create achievement certificate');
      }

      setSuccess(true);
      // Navigate back to master list after brief delay
      setTimeout(() => {
        router.push('/admin/dashboard/master/grade-wise-certificate');
        router.refresh();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create achievement certificate. Please try again.");
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

  return (
    <div className="acc-page">
      <div className="acc-container">
        {/* ── Header ── */}
        <div className="acc-header">
          <div className="acc-header-left">
            <button onClick={handleCancel} className="acc-btn-back" aria-label="Go back">
              <ArrowLeft className="acc-icon" />
            </button>
            <div>
              <h1 className="acc-title">Create Achievement Certificate</h1>
              <p className="acc-subtitle">
                Add a new achievement certificate configuration.
              </p>
            </div>
          </div>
          <button onClick={handleCancel} className="acc-btn-close">
            <X className="acc-icon" />
          </button>
        </div>

        {/* ── Success Message ── */}
        {success && (
          <div className="acc-success">
            <div>
              <h3>Achievement Certificate Created!</h3>
              <p>Redirecting to master list...</p>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        {!success && (
          <form onSubmit={handleSubmit} className="acc-form">
            <div className="acc-form-body">
              {/* Certificate Name */}
              <div className="acc-field">
                <label className="acc-label">
                  Certificate Name <span className="acc-req">*</span>
                </label>
                <input
                  type="text"
                  value={form.certificateName}
                  onChange={(e) => setForm((f) => ({ ...f, certificateName: e.target.value }))}
                  placeholder="e.g. Excellence in Mathematics, Science Achievement"
                  className={`acc-input ${error && !form.certificateName.trim() ? 'acc-input-error' : ''}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="acc-hint">The name displayed on the achievement certificate</p>
              </div>

              {/* Designation */}
              <div className="acc-field">
                <label className="acc-label">
                  Designation <span className="acc-req">*</span>
                </label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="e.g. Gold Medalist, Distinction, Honours"
                  className={`acc-input ${error && !form.designation.trim() ? 'acc-input-error' : ''}`}
                  disabled={isSubmitting}
                />
                <p className="acc-hint">The achievement level or classification</p>
              </div>

              {/* Color Code */}
              <div className="acc-field">
                <label className="acc-label">
                  Color Code <span className="acc-req">*</span>
                </label>
                <div className="acc-color-input-group">
                  <input
                    type="color"
                    value={form.colorCode}
                    onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))}
                    className="acc-color-picker"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={form.colorCode}
                    onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))}
                    placeholder="#3C0061"
                    className={`acc-input acc-input-flex ${error && !/^#[0-9A-Fa-f]{6}$/.test(form.colorCode) ? 'acc-input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="acc-hint">Hex color code for certificate styling</p>
              </div>

              {/* Percentage Range */}
              <div className="acc-field-row-2">
                <div className="acc-field">
                  <label className="acc-label">
                    % From <span className="acc-req">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={form.percentFrom}
                    onChange={(e) => handlePercentageChange('percentFrom', e.target.value)}
                    placeholder="0"
                    className={`acc-input ${error && (form.percentFrom === "" || Number(form.percentFrom) >= Number(form.percentTo)) ? 'acc-input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  <p className="acc-hint">Minimum percentage (0-100, decimals allowed e.g. 60.5)</p>
                </div>
                <div className="acc-field">
                  <label className="acc-label">
                    % To <span className="acc-req">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={form.percentTo}
                    onChange={(e) => handlePercentageChange('percentTo', e.target.value)}
                    placeholder="100"
                    className={`acc-input ${error && (form.percentTo === "" || Number(form.percentTo) <= Number(form.percentFrom)) ? 'acc-input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  <p className="acc-hint">Maximum percentage (0-100, decimals allowed e.g. 89.75)</p>
                </div>
              </div>

              {/* Validation Rules Info */}
              <div className="acc-validation-info">
                <div className="acc-validation-item">
                  <span className="acc-validation-dot"></span>
                  <span>From percentage must be less than To percentage</span>
                </div>
                <div className="acc-validation-item">
                  <span className="acc-validation-dot"></span>
                  <span>Both values must be between 0 and 100 (decimals allowed)</span>
                </div>
                <div className="acc-validation-item">
                  <span className="acc-validation-dot"></span>
                  <span>Values cannot be equal</span>
                </div>
                <div className="acc-validation-item">
                  <span className="acc-validation-dot"></span>
                  <span>Certificate name and percentage range must not already exist</span>
                </div>
              </div>

              {error && <div className="acc-error">{error}</div>}
            </div>

            {/* ── Actions ── */}
            <div className="acc-form-footer">
              <button
                type="button"
                className="acc-btn-cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="acc-btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="acc-spinner"></span>
                    Creating...
                  </>
                ) : (
                  "Create Achievement Certificate"
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
  .acc-page {
    min-height: 100vh;
    background: #0f1117;
    color: #e2e8f0;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .acc-container {
    width: 100%;
    max-width: 600px;
    background: #161b27;
    border: 1px solid #2d3448;
    border-radius: 14px;
    overflow: hidden;
    animation: acc-slideUp 0.2s ease;
  }

  @keyframes acc-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Header ── */
  .acc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.4rem 1.5rem;
    border-bottom: 1px solid #2d3448;
  }

  .acc-header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .acc-btn-back {
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

  .acc-btn-back .acc-icon {
    width: 20px;
    height: 20px;
  }

  .acc-btn-back:hover {
    color: #e2e8f0;
    background: #2d3448;
  }

  .acc-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 4px;
  }

  .acc-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
  }

  .acc-btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s, background 0.12s;
    flex-shrink: 0;
  }

  .acc-btn-close .acc-icon {
    width: 20px;
    height: 20px;
  }

  .acc-btn-close:hover {
    color: #e2e8f0;
    background: #2d3448;
  }

  /* ── Success Message ── */
  .acc-success {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 2rem 1.5rem;
    background: #0d1f0a;
    border-bottom: 1px solid #2d5a1d;
  }

  .acc-success h3 {
    margin: 0 0 4px;
    color: #c0dd97;
    font-weight: 500;
  }

  .acc-success p {
    margin: 0;
    color: #64748b;
    font-size: 0.85rem;
  }

  /* ── Form ── */
  .acc-form {
    display: flex;
    flex-direction: column;
  }

  .acc-form-body {
    padding: 1.5rem;
  }

  .acc-field {
    margin-bottom: 1.25rem;
  }

  .acc-field:last-child {
    margin-bottom: 0;
  }

  .acc-field-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 0.5rem;
  }

  .acc-field-row-2 .acc-field {
    margin-bottom: 0;
  }

  .acc-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .acc-req {
    color: #f87171;
  }

  .acc-input {
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

  .acc-input::placeholder {
    color: #475569;
  }

  .acc-input:focus {
    border-color: #639922;
  }

  .acc-input-error {
    border-color: #f87171 !important;
  }

  .acc-input-error:focus {
    border-color: #f87171 !important;
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
  }

  .acc-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .acc-input-flex {
    flex: 1;
  }

  .acc-color-input-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .acc-color-picker {
    width: 44px;
    height: 44px;
    padding: 2px;
    border: 1px solid #2d3448;
    border-radius: 8px;
    background: #1a2030;
    cursor: pointer;
    flex-shrink: 0;
  }

  .acc-color-picker:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .acc-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .acc-color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }

  .acc-hint {
    font-size: 0.75rem;
    color: #475569;
    margin: 4px 0 0;
  }

  /* ── Validation Info ── */
  .acc-validation-info {
    margin: 0.5rem 0 1rem;
    padding: 0.75rem;
    background: #1a2030;
    border: 1px solid #2d3448;
    border-radius: 8px;
  }

  .acc-validation-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #94a3b8;
    padding: 2px 0;
  }

  .acc-validation-dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #639922;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .acc-error {
    color: #f87171;
    font-size: 0.85rem;
    padding: 0.75rem;
    background: #2a0d0d;
    border: 1px solid #7f1d1d;
    border-radius: 8px;
    margin-top: 0.5rem;
  }

  /* ── Form Footer ── */
  .acc-form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem 1.5rem;
    border-top: 1px solid #2d3448;
    background: #1a2030;
  }

  .acc-btn-cancel {
    padding: 0.55rem 1.2rem;
    background: transparent;
    border: 1px solid #2d3448;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }

  .acc-btn-cancel:hover:not(:disabled) {
    background: #1e2230;
    color: #e2e8f0;
  }

  .acc-btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .acc-btn-save {
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

  .acc-btn-save:hover:not(:disabled) {
    background: #27500a;
  }

  .acc-btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .acc-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #c0dd97;
    border-top-color: transparent;
    border-radius: 50%;
    animation: acc-spin 0.6s linear infinite;
  }

  @keyframes acc-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .acc-page {
      padding: 1rem;
    }

    .acc-container {
      max-width: 100%;
    }

    .acc-header {
      padding: 1rem;
    }

    .acc-title {
      font-size: 1.1rem;
    }

    .acc-subtitle {
      font-size: 0.8rem;
    }

    .acc-form-body {
      padding: 1rem;
    }

    .acc-field-row-2 {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .acc-form-footer {
      flex-direction: column-reverse;
    }

    .acc-btn-cancel,
    .acc-btn-save {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .acc-page {
      padding: 0.5rem;
    }

    .acc-header {
      padding: 0.75rem;
    }

    .acc-form-body {
      padding: 0.75rem;
    }

    .acc-field {
      margin-bottom: 1rem;
    }

    .acc-input {
      font-size: 0.8rem;
      padding: 0.5rem 0.7rem;
    }

    .acc-color-picker {
      width: 38px;
      height: 38px;
    }

    .acc-validation-info {
      padding: 0.5rem;
    }

    .acc-validation-item {
      font-size: 0.7rem;
    }
  }
`;
