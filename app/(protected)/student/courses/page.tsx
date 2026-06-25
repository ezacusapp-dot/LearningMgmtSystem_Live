// // app/(protected)/student/courses/page.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { 
//   BookOpen, 
//   Clock, 
//   GraduationCap, 
//   Search, 
//   Filter, 
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   Play,
//   Loader2
// } from "lucide-react";

// interface Course {
//   id: string;
//   title: string;
//   description: string;
//   thumbnail?: string;
//   totalLessons: number;
//   completedLessons?: number;
//   progress?: number;
//   status?: "Not Started" | "In Progress" | "Completed";
//   category?: {
//     id: string;
//     name: string;
//   };
//   level?: {
//     id: string;
//     name: string;
//   };
//   duration?: string;
// }

// interface PaginationData {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// export default function StudentCoursesPage() {
//   const router = useRouter();
  
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [studentName, setStudentName] = useState("");
//   const [pagination, setPagination] = useState<PaginationData>({
//     page: 1,
//     limit: 9,
//     total: 0,
//     totalPages: 0,
//   });

//   const filterOptions = [
//     { value: "all", label: "All Courses" },
//     { value: "in-progress", label: "In Progress" },
//     { value: "completed", label: "Completed" },
//     { value: "not-started", label: "Not Started" },
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const studentId = localStorage.getItem("studentId");
//     const name = localStorage.getItem("studentName");
    
//     console.log("Auth check - Token:", !!token, "StudentId:", studentId);
    
//     if (!token || !studentId) {
//       router.push("/student_login");
//       return;
//     }
    
//     setStudentName(name || "Student");
//   }, [router]);

//   const fetchCourses = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const studentId = localStorage.getItem("studentId");
//       const token = localStorage.getItem("token");
      
//       console.log("Fetching courses for studentId:", studentId);
      
//       if (!studentId || !token) {
//         throw new Error("Not authenticated");
//       }

//       // Build query parameters
//       const params = new URLSearchParams({
//         page: pagination.page.toString(),
//         limit: pagination.limit.toString(),
//       });
      
//       if (searchQuery) params.append("search", searchQuery);
//       if (selectedFilter !== "all") params.append("status", selectedFilter);

//       const apiUrl = `/api/students/${studentId}/courses?${params.toString()}`;
//       console.log("API URL:", apiUrl);

//       const response = await fetch(apiUrl, {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`,
//         },
//       });

//       console.log("Response status:", response.status);

//       // Handle unauthorized
//       if (response.status === 401) {
//         localStorage.clear();
//         router.push("/student_login");
//         return;
//       }

//       const result = await response.json();
//       console.log("API Response:", result);

//       if (!result.status) {
//         throw new Error(result.message || "Failed to fetch courses");
//       }

//       // Format courses
//       const formattedCourses = (result.data || []).map((course: any) => ({
//         ...course,
//         progress: course.progress || 0,
//         status: course.status || "Not Started",
//         duration: course.duration || `${Math.ceil((course.totalLessons || 1) / 2)} weeks`,
//       }));

//       setCourses(formattedCourses);
      
//       if (result.pagination) {
//         setPagination(result.pagination);
//       }
      
//     } catch (err) {
//       console.error("Error fetching courses:", err);
//       setError(err instanceof Error ? err.message : "Failed to load courses");
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, searchQuery, selectedFilter, router]);

//   // Fetch when dependencies change
//   useEffect(() => {
//     const studentId = localStorage.getItem("studentId");
//     if (studentId) {
//       fetchCourses();
//     }
//   }, [fetchCourses]);

//   // Debounced search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (localStorage.getItem("studentId")) {
//         setPagination(prev => ({ ...prev, page: 1 }));
//         fetchCourses();
//       }
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchQuery, selectedFilter]);

//   const handlePageChange = (newPage: number) => {
//     setPagination(prev => ({ ...prev, page: newPage }));
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   // const handleLogout = () => {
//   //   localStorage.clear();
//   //   sessionStorage.clear();
//   //   router.push("/student_login");
//   // };

//   const handleClearFilters = () => {
//     setSearchQuery("");
//     setSelectedFilter("all");
//   };

//   // Loading state
//   if (loading && courses.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
//           <p className="text-slate-400">Loading your courses...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
//         <div className="text-center max-w-md">
//           <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-slate-100 mb-2">Failed to Load Courses</h2>
//           <p className="text-slate-400 mb-6">{error}</p>
//           <button
//             onClick={fetchCourses}
//             className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       {/* Header */}
//       <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
//                 My Courses
//               </h1>
//               <p className="text-slate-400 text-sm mt-1">
//                 Welcome back, {studentName}! • {pagination.total} course{pagination.total !== 1 ? 's' : ''} available
//               </p>
//             </div>
// {/*             
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
//             >
//               <LogOut className="w-4 h-4" />
//               <span className="text-sm font-medium">Logout</span>
//             </button> */}
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Search and Filter */}
//         <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
//           <div className="relative flex-1 max-w-md">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//             <input
//               type="text"
//               placeholder="Search courses..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
//             />
//           </div>

//           <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
//             <Filter className="w-4 h-4 text-slate-500" />
//             {filterOptions.map((option) => (
//               <button
//                 key={option.value}
//                 onClick={() => setSelectedFilter(option.value)}
//                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
//                   selectedFilter === option.value
//                     ? "bg-emerald-500 text-white"
//                     : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700"
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Courses Grid */}
//         {courses.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
//               <BookOpen className="w-12 h-12 text-slate-600" />
//             </div>
//             <h3 className="text-xl font-semibold text-slate-200 mb-2">
//               No courses found
//             </h3>
//             <p className="text-slate-400">
//               {searchQuery || selectedFilter !== "all" 
//                 ? "Try adjusting your search or filter criteria"
//                 : "No courses are available for your grade level yet"}
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {courses.map((course) => (
//                 <CourseCard key={course.id} course={course} />
//               ))}
//             </div>

//             {/* Pagination */}
//             {pagination.totalPages > 1 && (
//               <div className="flex justify-center items-center gap-2 mt-8">
//                 <button
//                   onClick={() => handlePageChange(pagination.page - 1)}
//                   disabled={pagination.page === 1}
//                   className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50"
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 <span className="px-4 py-2 text-slate-400">
//                   Page {pagination.page} of {pagination.totalPages}
//                 </span>
//                 <button
//                   onClick={() => handlePageChange(pagination.page + 1)}
//                   disabled={pagination.page === pagination.totalPages}
//                   className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50"
//                 >
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

// // Course Card Component
// function CourseCard({ course }: { course: Course }) {
//   const progress = course.progress || 0;
//     const router = useRouter();
  
//   return (
//     <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-xl">
//       <div className="relative h-48 overflow-hidden">
//         {course.thumbnail ? (
//           <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
//         ) : (
//           <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
//             <GraduationCap className="w-16 h-16 text-emerald-500/30" />
//           </div>
//         )}
        
//         {course.category && (
//           <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500/90 rounded-lg text-xs font-medium text-white">
//             {course.category.name}
//           </span>
//         )}
//       </div>

//       <div className="p-5">
//         <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-1">
//           {course.title}
//         </h3>
        
//         <p className="text-sm text-slate-400 mb-4 line-clamp-2">
//           {course.description || "No description available"}
//         </p>

//         <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
//           <div className="flex items-center gap-1">
//             <BookOpen className="w-3.5 h-3.5" />
//             <span>{course.totalLessons || 0} lessons</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Clock className="w-3.5 h-3.5" />
//             <span>{course.duration}</span>
//           </div>
//         </div>

//         <div className="mb-4">
//           <div className="flex justify-between text-xs mb-1.5">
//             <span className="text-slate-400">Progress</span>
//             <span className="text-emerald-400 font-medium">{progress}%</span>
//           </div>
//           <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
//             <div 
//               className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>

//        <button
//       onClick={() => router.push(`/student/courses/${course.id}`)} // ✅ was /courses/${course.id}
//       className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg transition-all"
//     >
//       <Play className="w-4 h-4" />
//       {progress === 0 ? "Start Course" : progress === 100 ? "Review" : "Continue"}
//     </button>
//       </div>
//     </div>
//   );
// }
// app/(protected)/student/courses/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  BarChart2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  totalLessons: number;
  completedLessons?: number;
  progress?: number;
  status?: "Not Started" | "In Progress" | "Completed";
  category?: { id: string; name: string };
  level?: { id: string; name: string };
  duration?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Progress":
      "bg-green-950 text-green-400 border border-green-800",
    Completed:
      "bg-[#27500a] text-[#c0dd97] border border-[#639922]",
    "Not Started":
      "bg-slate-800 text-slate-400 border border-slate-600",
  };
  return (
    <span
      className={`text-[11px] font-semibold px-3 py-0.5 rounded-full ${
        styles[status] ?? styles["Not Started"]
      }`}
    >
      {status}
    </span>
  );
}

// ─── Book placeholder icon ─────────────────────────────────────────────────────
function BookPlaceholder() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" className="opacity-20">
      <path
        d="M8 8h13a5 5 0 0 1 5 5v26a5 5 0 0 0-5-5H8V8Z"
        stroke="white"
        strokeWidth="2.5"
      />
      <path
        d="M40 8H27a5 5 0 0 0-5 5v26a5 5 0 0 1 5-5h13V8Z"
        stroke="white"
        strokeWidth="2.5"
      />
    </svg>
  );
}

// ─── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const progress = course.progress ?? 0;

  const ctaLabel =
    course.status === "Completed"
      ? "Review"
      : course.status === "Not Started"
      ? "Start"
      : "Continue";

  const progressColor =
    progress === 100 ? "bg-[#639922]" : "bg-[#3b6d11]";

  return (
    <div
      className="group bg-[#161b27] border border-[#2d3448] hover:border-[#3b6d11] hover:shadow-[0_4px_24px_rgba(59,109,17,0.15)] rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-[#161b27] via-[#161b27] to-[#3b6d11] flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <BookPlaceholder />
        )}

        {/* Category pill */}
        {course.category && (
          <span className="absolute top-2.5 left-2.5 text-[11px] font-medium text-[#c0dd97] bg-[#173404]/70 border border-[#3b6d11] px-2.5 py-0.5 rounded-full">
            {course.category.name}
          </span>
        )}

        {/* Status badge */}
        <span className="absolute top-2.5 right-2.5">
          <StatusBadge status={course.status ?? "Not Started"} />
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-[0.95rem] font-semibold text-slate-100 leading-snug mb-0.5 line-clamp-1">
          {course.title}
        </h2>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {course.description || "No description available"}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>
              {course.completedLessons ?? 0}/{course.totalLessons ?? 0} Lessons
            </span>
            <span className="text-slate-400 font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#2d3448] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Duration & Level */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration ?? "—"}
          </span>
          <span className="text-[#2d3448]">•</span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />
            {course.level?.name ?? "—"}
          </span>
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={() => router.push(`/student/courses/${course.id}`)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] text-sm font-semibold transition-colors duration-150 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-[#c0dd97]" />
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [studentName, setStudentName] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  const FILTER_OPTIONS = [
    { value: "all", label: "All Courses" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "not-started", label: "Not Started" },
  ];

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const studentId = localStorage.getItem("studentId");
    const name = localStorage.getItem("studentName");
    if (!token || !studentId) {
      router.push("/student_login");
      return;
    }
    setStudentName(name || "Student");
  }, [router]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const studentId = localStorage.getItem("studentId");
      const token = localStorage.getItem("token");
      if (!studentId || !token) throw new Error("Not authenticated");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (selectedFilter !== "all") params.append("status", selectedFilter);

      const response = await fetch(
        `/api/students/${studentId}/courses?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        router.push("/student_login");
        return;
      }

      const result = await response.json();
      if (!result.status) throw new Error(result.message || "Failed to fetch courses");

      const formattedCourses = (result.data || []).map((course: any) => ({
        ...course,
        progress: course.progress || 0,
        status: course.status || "Not Started",
        duration:
          course.duration || `${Math.ceil((course.totalLessons || 1) / 2)} weeks`,
      }));

      setCourses(formattedCourses);
      if (result.pagination) setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, selectedFilter, router]);

  useEffect(() => {
    if (localStorage.getItem("studentId")) fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorage.getItem("studentId")) {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchCourses();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilter]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Loading ──
  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#639922] animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your courses...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Failed to Load Courses</h2>
          <p className="text-slate-500 text-sm mb-5">{error}</p>
          <button
            onClick={fetchCourses}
            className="px-5 py-2 bg-[#3b6d11] hover:bg-[#27500a] border border-[#639922] text-[#c0dd97] rounded-xl text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Main ──
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans">
      {/* Header */}
      <div className="px-6 sm:px-10 pt-8 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Title */}
          <div>
            <h1 className="text-[1.6rem] font-semibold text-slate-100 tracking-tight mb-1">
              My Courses
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, {studentName}!&nbsp;•&nbsp;
              {pagination.total} course{pagination.total !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-52 bg-[#1e2230] border border-[#2d3448] rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-[#639922] transition-colors"
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-[#1e2230] border border-[#2d3448] rounded-lg text-sm text-slate-200 outline-none focus:border-[#639922] transition-colors cursor-pointer"
              >
                {FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="px-6 sm:px-10 pb-12">
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#1e2230] flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No courses found</h3>
            <p className="text-sm text-slate-500">
              {searchQuery || selectedFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No courses are available for your grade level yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-[#1e2230] border border-[#2d3448] text-slate-400 hover:border-[#639922] hover:text-[#c0dd97] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-[#1e2230] border border-[#2d3448] text-slate-400 hover:border-[#639922] hover:text-[#c0dd97] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


