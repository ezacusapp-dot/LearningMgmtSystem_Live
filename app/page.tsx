"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
console.log("TOKEN:", token);
    if (!token) {
      router.replace("/login");
    } else {
      router.replace("/admin/dashboard");
    }
  }, [token, hasHydrated, router]);

  return null;
}

// export default function Home() {
//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Welcome to Admin Panel 🚀</h1>

//       <a href="/course-categories">
//         Go to Course Categories
//       </a>
//     </div>
//   );
// }