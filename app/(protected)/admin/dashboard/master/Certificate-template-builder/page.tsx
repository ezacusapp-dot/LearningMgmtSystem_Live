"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Award,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CertificateTemplateRow {
  id: string;
  name: string;
  course?: { id: string; title: string } | null;
  templateVersion: number;
  isDraft: boolean;
}

export default function CertificateTemplatePage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<CertificateTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/certificate-templates");
      if (!response.ok) {
        throw new Error("Failed to load certificate templates");
      }
      const result = await response.json();
      setTemplates(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      console.error("Load certificate templates error:", err);
      setError("Could not load certificate templates.");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate template? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/certificate-templates/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete template");
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete certificate template error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = templates.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Certificate Templates
          </h1>

          <p className="text-slate-400 mt-1">
            Manage certificate templates
          </p>
        </div>

        <button
          onClick={() =>
            router.push("/admin/dashboard/master/Certificate-template-builder/add")
          }
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:scale-105 duration-200"
        >
          <Plus size={18} />
          Add Template
        </button>
      </div>

      {/* Search */}

      <div className="bg-[#141A26] border border-white/10 rounded-xl p-4 mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search template..."
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          {error}
          <button onClick={loadTemplates} className="underline hover:text-red-200">
            Retry
          </button>
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141A26]">

        <table className="w-full">

          <thead className="bg-[#111827] text-slate-300">

            <tr>

              <th className="text-left p-4">Template Name</th>

              <th className="text-left p-4">Course</th>

              <th className="text-left p-4">Version</th>

              <th className="text-left p-4">Status</th>

              <th className="text-center p-4">Actions</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400">
                  Loading templates…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-slate-400"
                >
                  <Award
                    className="mx-auto mb-3"
                    size={40}
                  />

                  No Certificate Templates Found
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-4 text-white font-medium">
                    {item.name}
                  </td>

                  <td className="p-4 text-slate-300">
                    {item.course?.title || "—"}
                  </td>

                  <td className="p-4 text-slate-300">
                    v{item.templateVersion}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        !item.isDraft
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {item.isDraft ? "Draft" : "Active"}
                    </span>
                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-3">

                      <button className="text-cyan-400 hover:text-cyan-300">
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/master/Certificate-template-builder/edit/${item.id}`
                          )
                        }
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-40"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}
