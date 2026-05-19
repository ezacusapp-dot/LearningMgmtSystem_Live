"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  GraduationCap,
  BarChart2,
  CreditCard,
} from "lucide-react";

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: "add" | "edit";
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
    subscription: "active" | "trial" | "expired";
    performance: number;
  };
  setFormData: (data: any) => void;
}

export default function SchoolFormModal({
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-700/20 text-lime-400">
                  <Building size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === "add" ? "Add New School" : "Edit School"}
                  </h2>

                  <p className="text-sm text-slate-400">
                    {mode === "add"
                      ? "Create a new school profile"
                      : "Update school information"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              {/* School Name */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Building size={14} />
                  School Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter school name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                />
              </div>

              {/* Admin Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <User size={14} />
                    Admin Name
                  </label>

                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminName: e.target.value,
                      })
                    }
                    placeholder="Admin name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Mail size={14} />
                    Admin Email
                  </label>

                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminEmail: e.target.value,
                      })
                    }
                    placeholder="admin@school.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Phone size={14} />
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91 9999999999"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Home size={14} />
                  Address
                </label>

                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  placeholder="School address"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                />
              </div>

              {/* Region + State */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <MapPin size={14} />
                    Region
                  </label>

                  <select
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        region: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  >
                    <option>North</option>
                    <option>South</option>
                    <option>East</option>
                    <option>West</option>
                    <option>Central</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <MapPin size={14} />
                    State
                  </label>

                  <select
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        state: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  >
                    <option>Maharashtra</option>
                    <option>Goa</option>
                    <option>Delhi</option>
                    <option>Punjab</option>
                    <option>Gujarat</option>
                    <option>Madhya Pradesh</option>
                  </select>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <GraduationCap size={14} />
                    Students
                  </label>

                  <input
                    type="number"
                    value={formData.students}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        students: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <CreditCard size={14} />
                    Subscription
                  </label>

                  <select
                    value={formData.subscription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscription: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <BarChart2 size={14} />
                    Performance
                  </label>

                  <input
                    type="number"
                    value={formData.performance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        performance: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      active: !formData.active,
                    })
                  }
                  className={`relative h-7 w-14 rounded-full transition ${
                    formData.active ? "bg-lime-600" : "bg-slate-700"
                  }`}
                >
                  <motion.div
                    animate={{
                      x: formData.active ? 28 : 3,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute top-1 h-5 w-5 rounded-full bg-white"
                  />
                </button>

                <span className="text-sm text-slate-300">
                  School is{" "}
                  <strong>
                    {formData.active ? "Active" : "Inactive"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-5 py-2 text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onSave}
                className="flex items-center gap-2 rounded-xl bg-lime-700 px-5 py-2 font-medium text-white transition hover:bg-lime-600"
              >
                <Save size={16} />
                {mode === "add" ? "Add School" : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}