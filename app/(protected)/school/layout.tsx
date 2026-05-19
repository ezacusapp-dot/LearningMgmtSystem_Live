
// "use client";

// import { useRouter, usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useAuthStore } from "@/store/authStore";
// import SchoolSidebar from "@/components/dashboard/SchoolSidebar";
// import SchoolHeader from "@/components/dashboard/SchoolHeder";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const router   = useRouter();

//   const [collapsed,   setCollapsed]   = useState(false);
//   const [activeLabel, setActiveLabel] = useState("");

//   const role        = useAuthStore((s) => s.role);
//   const hasHydrated = useAuthStore((s) => s.hasHydrated);

//   // ── Sync active label with pathname ──────────────────────
//   useEffect(() => {
//     if (pathname === "/admin/dashboard") {
//       setActiveLabel("Dashboard");
//     } else if (pathname === "/admin/dashboard/master/award-category") {
//       setActiveLabel("Award Categories");
//     } else if (pathname === "/dashboard/settings") {
//       setActiveLabel("Settings");
//     } else {
//       setActiveLabel("");
//     }
//   }, [pathname]);

//   // ── Auth guard ───────────────────────────────────────────
//   useEffect(() => {
//     if (!hasHydrated) return;
//     if (!role) {
//       router.replace("/login");
//       return;
//     }
//     if (role !== "SUPER_ADMIN") {
//       router.replace("/");
//     }
//   }, [role, hasHydrated, router]);

//   if (!hasHydrated || role !== "SUPER_ADMIN") return null;

//   return (
//     /*
//      * ROOT: h-screen + overflow-hidden
//      * Locks the entire layout to the viewport.
//      * Nothing here can scroll — only <main> inside scrolls.
//      */
//     <div className="h-screen overflow-hidden flex bg-[#080812] text-white relative">

//       {/* ── Decorative background blobs (fixed, pointer-events-none) ── */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
//         <div className="absolute top-20 left-[260px] w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
//       </div>

//       {/* ── Sidebar ─────────────────────────────────────────
//            flex-shrink-0 is set inside Sidebar itself.
//            It is always full height because it uses h-screen.
//       ─────────────────────────────────────────────────────── */}
//       <SchoolSidebar
//         collapsed={collapsed}
//         onToggle={() => setCollapsed(!collapsed)}
//         activeLabel={activeLabel}
//         onNavChange={setActiveLabel}
//       />

//       {/* ── Main column ─────────────────────────────────────
//            flex-1   → takes all remaining horizontal space
//            min-w-0  → prevents flex children from overflowing
//            flex flex-col → stacks Header + main vertically
//            h-screen overflow-hidden → bounds column to viewport
//       ─────────────────────────────────────────────────────── */}
//       <div className="relative z-10 flex flex-col flex-1 min-w-0 h-screen overflow-hidden">

//         {/* Header: flex-shrink-0 inside Header prevents it from shrinking */}
//         <SchoolHeader
//           collapsed={collapsed}
//           onToggle={() => setCollapsed(!collapsed)}
//           pageTitle={activeLabel}
//         />

//         {/* Main content: flex-1 fills remaining height, overflow-y-auto scrolls */}
//         <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
//           {children}
//         </main>

//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import SchoolSidebar from "@/components/dashboard/SchoolSidebar";
import SchoolHeader from "@/components/dashboard/SchoolHeder";

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const role = useAuthStore((s) => s.user?.role);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // ── Sync active label with pathname ──────────────────────
  useEffect(() => {
    if (pathname === "/school") {
      setActiveLabel("Dashboard");
    } else if (pathname === "/school/students") {
      setActiveLabel("Students");
    } else if (pathname === "/school/teachers") {
      setActiveLabel("Teachers");
    } else if (pathname === "/school/classes") {
      setActiveLabel("Classes");
    } else if (pathname === "/school/attendance") {
      setActiveLabel("Attendance");
    } else if (pathname === "/school/exams") {
      setActiveLabel("Exams");
    } else if (pathname === "/school/fees") {
      setActiveLabel("Fees");
    } else if (pathname === "/school/schedule") {
      setActiveLabel("Schedule");
    } else if (pathname === "/school/settings") {
      setActiveLabel("Settings");
    } else {
      setActiveLabel("Dashboard");
    }
  }, [pathname]);

  // ── Auth guard for school route ───────────────────────────
  useEffect(() => {
    // Check session storage for auth
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") || localStorage.getItem("isLoggedIn");
    const userRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole");

    console.log("School Layout - Checking auth:", { isLoggedIn, userRole, hasHydrated, role });

    if (!hasHydrated) return;

    if (!isLoggedIn || userRole !== "SCHOOL_ADMIN") {
      console.log("Not authenticated, redirecting to schoolLogin");
      router.replace("/school-login");
    } else {
      // Also sync role to store if needed
      if (!role && userRole) {
        useAuthStore.getState().login({
          token: "school-demo-token",
          name: "School Admin",
          email: sessionStorage.getItem("userEmail") || "",
          role: userRole,
        });
      }
      setIsLoading(false);
    }
  }, [router, hasHydrated, role]);

  if (isLoading || !hasHydrated) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Loading school dashboard...</p>
        </div>
      </div>
    );
  }

 

  return (
    /*
     * ROOT: h-screen + overflow-hidden
     * Locks the entire layout to the viewport.
     * Nothing here can scroll — only <main> inside scrolls.
     */
    <div className="h-screen overflow-hidden flex bg-[#080812] text-white relative">

      {/* ── Decorative background blobs (fixed, pointer-events-none) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-[260px] w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* ── Sidebar ─────────────────────────────────────────
           flex-shrink-0 is set inside Sidebar itself.
           It is always full height because it uses h-screen.
      ─────────────────────────────────────────────────────── */}

      
      <SchoolSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeLabel={activeLabel}
        onNavChange={setActiveLabel}
      />

      {/* ── Main column ─────────────────────────────────────
           flex-1   → takes all remaining horizontal space
           min-w-0  → prevents flex children from overflowing
           flex flex-col → stacks Header + main vertically
           h-screen overflow-hidden → bounds column to viewport
      ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-screen overflow-hidden">

        {/* Header: flex-shrink-0 inside Header prevents it from shrinking */}
        <SchoolHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          pageTitle={activeLabel}
        />

        {/* Main content: flex-1 fills remaining height, overflow-y-auto scrolls */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </main>

      </div>
    </div>
  );
}