import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Building, User, Mail, Phone, MapPin, Home, GraduationCap, BarChart2, CreditCard } from 'lucide-react';

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'add' | 'edit';
  formData: {
    name: string;
    adminName: string;
    adminEmail: string;
    phone: string;
    address: string;
    region: string;
    state: string;
    students: number;
    active: boolean;
    subscription: 'active' | 'trial' | 'expired';
    performance: number;
  };
  setFormData: (data: any) => void;
}

export function SchoolFormModal({
  isOpen,
  onClose,
  onSave,
  mode,
  formData,
  setFormData,
}: SchoolFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="sf-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="sf-modal"
          >
            {/* ── Header ── */}
            <div className="sf-header">
              <div className="sf-header-left">
                <div className="sf-header-icon">
                  <Building size={20} />
                </div>
                <div>
                  <h2 className="sf-title">
                    {mode === 'add' ? 'Add New School' : 'Edit School'}
                  </h2>
                  <p className="sf-subtitle">
                    {mode === 'add' ? 'Create a new school profile' : 'Update school information'}
                  </p>
                </div>
              </div>
              <button className="sf-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="sf-body">

              {/* School Name */}
              <div className="sf-field">
                <label className="sf-label">
                  <Building size={13} />
                  School Name <span className="sf-req">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter school name"
                  className="sf-input"
                />
              </div>

              {/* Admin Row */}
              <div className="sf-row-2">
                <div className="sf-field">
                  <label className="sf-label">
                    <User size={13} />
                    Admin Name <span className="sf-req">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Enter admin name"
                    className="sf-input"
                  />
                </div>
                <div className="sf-field">
                  <label className="sf-label">
                    <Mail size={13} />
                    Admin Email <span className="sf-req">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@school.edu"
                    className="sf-input"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="sf-field">
                <label className="sf-label">
                  <Phone size={13} />
                  Phone Number <span className="sf-req">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9999999999"
                  className="sf-input"
                />
              </div>

              {/* Address */}
              <div className="sf-field">
                <label className="sf-label">
                  <Home size={13} />
                  School Address <span className="sf-req">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={3}
                  className="sf-textarea"
                />
              </div>

              {/* Region + State */}
              <div className="sf-row-2">
                <div className="sf-field">
                  <label className="sf-label">
                    <MapPin size={13} />
                    Region <span className="sf-req">*</span>
                  </label>
                  <div className="sf-select-wrap">
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="sf-select"
                    >
                      {['North', 'South', 'East', 'West', 'Central'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <span className="sf-select-arrow">▾</span>
                  </div>
                </div>
                <div className="sf-field">
                  <label className="sf-label">
                    <MapPin size={13} />
                    State <span className="sf-req">*</span>
                  </label>
                  <div className="sf-select-wrap">
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="sf-select"
                    >
                      {['Maharshtra', 'Goa', 'Delhi', 'Punjab', 'Gujrat', 'Madh_Pradesh'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="sf-select-arrow">▾</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="sf-row-3">
                <div className="sf-field">
                  <label className="sf-label">
                    <GraduationCap size={13} />
                    Students
                  </label>
                  <input
                    type="number"
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="sf-input"
                  />
                </div>
                <div className="sf-field">
                  <label className="sf-label">
                    <CreditCard size={13} />
                    Subscription
                  </label>
                  <div className="sf-select-wrap">
                    <select
                      value={formData.subscription}
                      onChange={(e) => setFormData({ ...formData, subscription: e.target.value as any })}
                      className="sf-select"
                    >
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                    <span className="sf-select-arrow">▾</span>
                  </div>
                </div>
                <div className="sf-field">
                  <label className="sf-label">
                    <BarChart2 size={13} />
                    Performance (%)
                  </label>
                  <input
                    type="number"
                    value={formData.performance}
                    onChange={(e) => setFormData({ ...formData, performance: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="sf-input"
                  />
                </div>
              </div>

              {/* Performance Preview */}
              {formData.performance > 0 && (
                <div className="sf-perf-preview">
                  <div className="sf-perf-bar-bg">
                    <motion.div
                      className="sf-perf-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(formData.performance, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{
                        background: formData.performance >= 85
                          ? 'linear-gradient(90deg, #3b6d1199, #639922)'
                          : formData.performance >= 70
                          ? 'linear-gradient(90deg, #92400e99, #f59e0b)'
                          : 'linear-gradient(90deg, #7f1d1d99, #ef4444)',
                      }}
                    />
                  </div>
                  <span
                    className="sf-perf-label"
                    style={{
                      color: formData.performance >= 85 ? '#c0dd97'
                        : formData.performance >= 70 ? '#fcd34d' : '#fca5a5',
                    }}
                  >
                    {formData.performance}%
                  </span>
                </div>
              )}

              {/* Active Toggle */}
              <label className="sf-toggle-row">
                <div
                  className={`sf-toggle ${formData.active ? 'on' : ''}`}
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                >
                  <motion.div
                    className="sf-toggle-thumb"
                    animate={{ x: formData.active ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
                <span className="sf-toggle-label">
                  School is <strong>{formData.active ? 'Active' : 'Inactive'}</strong>
                </span>
                {formData.active && <span className="sf-active-dot" />}
              </label>
            </div>

            {/* ── Footer ── */}
            <div className="sf-footer">
              <button className="sf-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <motion.button
                className="sf-btn-save"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
              >
                <Save size={15} />
                {mode === 'add' ? 'Add School' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>

          <style>{`
            .sf-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.72);
              backdrop-filter: blur(4px);
              z-index: 50;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
            }

            .sf-modal {
              background: #161b27;
              border: 1px solid #2d3448;
              border-radius: 16px;
              width: 100%;
              max-width: 680px;
              max-height: 90vh;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,153,34,0.08);
            }

            .sf-modal::-webkit-scrollbar { width: 5px; }
            .sf-modal::-webkit-scrollbar-track { background: transparent; }
            .sf-modal::-webkit-scrollbar-thumb { background: #2d3448; border-radius: 4px; }

            /* Header */
            .sf-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1.3rem 1.5rem;
              border-bottom: 1px solid #1e2535;
              background: #131720;
              border-radius: 16px 16px 0 0;
              flex-shrink: 0;
            }
            .sf-header-left {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .sf-header-icon {
              width: 42px;
              height: 42px;
              border-radius: 10px;
              background: rgba(99,153,34,0.12);
              border: 1px solid rgba(99,153,34,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #c0dd97;
              flex-shrink: 0;
            }
            .sf-title {
              font-size: 1.05rem;
              font-weight: 700;
              color: #f1f5f9;
              margin: 0 0 2px;
              letter-spacing: -0.2px;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
            }
            .sf-subtitle {
              font-size: 0.76rem;
              color: #475569;
              margin: 0;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
            }
            .sf-close {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              border: 1px solid #2d3448;
              background: transparent;
              color: #64748b;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background 0.12s, color 0.12s, border-color 0.12s;
            }
            .sf-close:hover {
              background: #1e2535;
              color: #e2e8f0;
              border-color: #3d4860;
            }

            /* Body */
            .sf-body {
              padding: 1.4rem 1.5rem;
              display: flex;
              flex-direction: column;
              gap: 1.1rem;
            }

            /* Field */
            .sf-field {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .sf-label {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.775rem;
              font-weight: 600;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
            }
            .sf-label svg { color: #639922; }
            .sf-req { color: #f87171; }

            /* Inputs */
            .sf-input,
            .sf-textarea,
            .sf-select {
              width: 100%;
              padding: 0.65rem 0.9rem;
              background: #0f1117;
              border: 1px solid #2d3448;
              border-radius: 9px;
              color: #e2e8f0;
              font-size: 0.875rem;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
              outline: none;
              transition: border-color 0.15s, box-shadow 0.15s;
              box-sizing: border-box;
            }
            .sf-input::placeholder,
            .sf-textarea::placeholder { color: #3a4460; }
            .sf-input:focus,
            .sf-textarea:focus,
            .sf-select:focus {
              border-color: #639922;
              box-shadow: 0 0 0 3px rgba(99,153,34,0.12);
            }
            .sf-textarea {
              resize: none;
              line-height: 1.5;
            }

            /* Select */
            .sf-select-wrap {
              position: relative;
            }
            .sf-select {
              appearance: none;
              padding-right: 2.2rem;
              cursor: pointer;
            }
            .sf-select-arrow {
              position: absolute;
              right: 12px;
              top: 50%;
              transform: translateY(-50%);
              color: #475569;
              pointer-events: none;
              font-size: 0.7rem;
            }
            .sf-select option {
              background: #161b27;
            }

            /* Grid rows */
            .sf-row-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
            }
            .sf-row-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 1rem;
            }

            /* Performance preview bar */
            .sf-perf-preview {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 0.5rem 0.75rem;
              background: #0f1117;
              border: 1px solid #1e2535;
              border-radius: 8px;
            }
            .sf-perf-bar-bg {
              flex: 1;
              height: 6px;
              background: #2d3448;
              border-radius: 3px;
              overflow: hidden;
            }
            .sf-perf-bar-fill {
              height: 100%;
              border-radius: 3px;
            }
            .sf-perf-label {
              font-size: 0.75rem;
              font-weight: 700;
              min-width: 32px;
              text-align: right;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
            }

            /* Toggle */
            .sf-toggle-row {
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              user-select: none;
            }
            .sf-toggle {
              width: 44px;
              height: 24px;
              border-radius: 12px;
              background: #2d3448;
              border: 1px solid #3d4860;
              position: relative;
              cursor: pointer;
              flex-shrink: 0;
              transition: background 0.2s, border-color 0.2s;
            }
            .sf-toggle.on {
              background: rgba(99,153,34,0.25);
              border-color: rgba(99,153,34,0.5);
            }
            .sf-toggle-thumb {
              position: absolute;
              top: 3px;
              width: 16px;
              height: 16px;
              border-radius: 8px;
              background: #64748b;
            }
            .sf-toggle.on .sf-toggle-thumb {
              background: #c0dd97;
            }
            .sf-toggle-label {
              font-size: 0.855rem;
              color: #94a3b8;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
            }
            .sf-toggle-label strong { color: #e2e8f0; }
            .sf-active-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #639922;
              box-shadow: 0 0 6px rgba(99,153,34,0.6);
              flex-shrink: 0;
            }

            /* Footer */
            .sf-footer {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 10px;
              padding: 1rem 1.5rem;
              border-top: 1px solid #1e2535;
              background: #131720;
              border-radius: 0 0 16px 16px;
              flex-shrink: 0;
            }
            .sf-btn-cancel {
              padding: 0.55rem 1.2rem;
              background: transparent;
              border: 1px solid #2d3448;
              border-radius: 9px;
              color: #94a3b8;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
              transition: background 0.12s, color 0.12s;
            }
            .sf-btn-cancel:hover {
              background: #1e2535;
              color: #e2e8f0;
            }
            .sf-btn-save {
              display: inline-flex;
              align-items: center;
              gap: 7px;
              padding: 0.58rem 1.3rem;
              background: #3b6d11;
              border: 1px solid #639922;
              border-radius: 9px;
              color: #c0dd97;
              font-size: 0.875rem;
              font-weight: 600;
              cursor: pointer;
              font-family: 'DM Sans', 'Segoe UI', sans-serif;
              transition: background 0.15s, box-shadow 0.15s;
              box-shadow: 0 0 0 0 rgba(99,153,34,0);
            }
            .sf-btn-save:hover {
              background: #27500a;
              box-shadow: 0 0 0 3px rgba(99,153,34,0.18);
            }

            @media (max-width: 560px) {
              .sf-row-2, .sf-row-3 { grid-template-columns: 1fr; }
              .sf-body { padding: 1.1rem; }
              .sf-header, .sf-footer { padding-left: 1.1rem; padding-right: 1.1rem; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
