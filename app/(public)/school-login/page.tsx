// app/(public)/school-login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

function SchoolLoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Use the correct API endpoint
      const res = await fetch("/api/schools/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Invalid email or password. Please try again.");
        return;
      }

      // Store school data in auth store
      login({
        token: json.token,
        id: json.school.id,
        name: json.school.adminName,
        email: json.school.adminEmail,
        role: json.role,
        //schoolData: json.school,
      });

      // Store in localStorage for persistence
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", json.school.adminEmail);
      localStorage.setItem("userRole", json.role);
      localStorage.setItem("userId", String(json.school.id));
      localStorage.setItem("userName", json.school.adminName);
     // localStorage.setItem("schoolData", JSON.stringify(json.school));
      localStorage.setItem("token", json.token);
      
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userRole", json.role);
      sessionStorage.setItem("userEmail", json.school.adminEmail);
      sessionStorage.setItem("userId", String(json.school.id));

      // ✅ Redirect to protected school route
      router.push("/school/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #f3e8ff 0%, #fdf4ff 50%, #ede9fe 100%)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 shadow-xl"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #f3e8ff, #ede9fe)",
              border: "1px solid #e9d5ff",
            }}
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 21V9l9-6 9 6v12"
                stroke="#9333ea"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 21V15h6v6"
                stroke="#9333ea"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">
              School Admin Login
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Access your school dashboard
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          School Management Portal
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm text-gray-700 outline-none transition-all"
              style={{
                background: "rgba(243,232,255,0.35)",
                border: "1.5px solid #e9d5ff",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#a855f7")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e9d5ff")}
              placeholder="admin@school.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-2xl text-sm text-gray-700 outline-none transition-all"
                style={{
                  background: "rgba(243,232,255,0.35)",
                  border: "1.5px solid #e9d5ff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#a855f7")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e9d5ff")}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mt-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)",
              boxShadow: "0 4px 20px rgba(147,51,234,0.4)",
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              "Login as School Admin"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-purple-100 text-center">
          <p className="text-xs text-gray-500">
            Secure access to your school management dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SchoolLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }
    >
      <SchoolLoginForm />
    </Suspense>
  );
}
