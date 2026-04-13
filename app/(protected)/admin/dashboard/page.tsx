"use client";

export default function DashboardPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                    <span className="text-2xl">👋</span>
                </div>
                <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Admin
                    </span>
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                    Your dashboard is ready. Start managing your LMS.
                </p>
            </div>
        </div>
    );
}
