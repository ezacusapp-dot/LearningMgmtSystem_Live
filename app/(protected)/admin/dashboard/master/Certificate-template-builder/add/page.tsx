"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CertificateTemplateBuilder, CertificateType } from "./Certificatetemplatebuilder";

export default function CertificateTemplateBuilderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (template: Partial<CertificateType>) => {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/certificate-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to save certificate template");
      }

      router.push("/admin/dashboard/master/Certificate-template-builder");
    } catch (error) {
      console.error("Save certificate template error:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save certificate template"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      {saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-red-500/90 text-white text-sm shadow-lg">
          {saveError}
        </div>
      )}
      {/*
        Note: `courses` is intentionally NOT passed as a prop here — the
        builder loads them itself from GET /api/courses. Pass a `courses`
        prop only if you want to short-circuit that fetch (e.g. courses
        already loaded by a parent route/layout).
      */}
      <CertificateTemplateBuilder
        isDarkMode
        onSave={handleSave}
        onCancel={handleCancel}
      />
      {saving && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
          <div className="px-6 py-4 rounded-lg bg-[#141A26] border border-white/10 text-white text-sm">
            Saving template…
          </div>
        </div>
      )}
    </>
  );
}
