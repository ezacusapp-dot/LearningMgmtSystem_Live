"use client";

import { useState, useEffect } from "react";

// Types
interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  thumbnailUrl: string | null;
  courseCategory: { id: string; name: string } | null;
  courseLevel: { id: string; name: string } | null;
  validityPeriod: { id: string; name: string } | null;
  modules: Array<{
    id: string;
    title: string;
    type: string;
    order: number;
    isActive: boolean;
  }>;
}

interface CoursesResponse {
  status: boolean;
  data: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch courses (only published)
  const fetchCourses = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12");
      params.append("status", "Published"); // Only show published courses
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/courses?${params.toString()}`);
      const data: CoursesResponse = await response.json();
      
      if (data.status) {
        setCourses(data.data);
        setTotalPages(data.meta.totalPages);
        setTotalCourses(data.meta.total);
        setCurrentPage(data.meta.page);
      } else {
        setError("Failed to fetch courses");
      }
    } catch (err) {
      setError("An error occurred while fetching courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="bg-[#161b27] border-b border-[#2a1a50] px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Courses </h1>
        {/* <p className="text-gray-400 text-sm mt-1">Browse our published courses</p> */}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Search */}
        <div className="bg-[#161b27] max-w-2xl p-4 mb-6 border border-[#2a1a50]">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-lg px-4 py-2 text-gray-100 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#3b6d11] hover:bg-[#2f560d] text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-gray-400">
            Found {totalCourses} published course{totalCourses !== 1 ? 's' : ''}
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-[#161b27] rounded-xl border border-[#2a1a50] p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Published Courses Found</h3>
            <p className="text-gray-500">No courses are currently available</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#161b27] rounded-xl border border-[#2a1a50] overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 group"
                >
                  {/* Course Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-purple-900/50 to-pink-900/50 relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="w-12 h-12 text-purple-500/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                        Published
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {course.description || "No description available"}
                    </p>

                    {/* Course Metadata */}
                    <div className="space-y-1.5 mb-4">
                      {course.courseCategory && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                          </svg>
                          <span>{course.courseCategory.name}</span>
                        </div>
                      )}
                      {course.courseLevel && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{course.courseLevel.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{course.modules.length} Module{course.modules.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                  <button
  onClick={() => handleViewDetails(course)}
  className="w-full bg-[#3b6d11] hover:bg-[#2f560d] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
>
  View Details
</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-[#161b27] border border-[#2a1a50] rounded-lg text-gray-400 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white"
                            : "bg-[#161b27] border border-[#2a1a50] text-gray-400 hover:text-white hover:border-purple-500"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-[#161b27] border border-[#2a1a50] rounded-lg text-gray-400 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Course Details */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-[#161b27] rounded-xl border border-[#2a1a50] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#2a1a50]">
              <h2 className="text-2xl font-bold text-white">Course Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Thumbnail */}
              {selectedCourse.thumbnailUrl && (
                <div className="mb-6">
                  <img
                    src={selectedCourse.thumbnailUrl}
                    alt={selectedCourse.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white-400 mb-1">Title</label>
                <h3 className="text-xl font-bold text-white">{selectedCourse.title}</h3>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white-400 mb-1">Description</label>
                <p className="text-gray-300 leading-relaxed">
                  {selectedCourse.description || "No description available"}
                </p>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white-400 mb-1">Category</label>
                <p className="text-gray-300">
                  {selectedCourse.courseCategory?.name || "No category assigned"}
                </p>
              </div>

              {/* Level */}
              {selectedCourse.courseLevel && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white-400 mb-1">Level</label>
                  <p className="text-gray-300">{selectedCourse.courseLevel.name}</p>
                </div>
              )}

              {/* Validity Period */}
              {selectedCourse.validityPeriod && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white-400 mb-1">Validity Period</label>
                  <p className="text-gray-300">{selectedCourse.validityPeriod.name}</p>
                </div>
              )}

              {/* Modules Count */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white-400 mb-1">Total Modules</label>
                <p className="text-gray-300">{selectedCourse.modules.length} modules</p>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white-400 mb-1">Status</label>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                  {selectedCourse.status}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#2a1a50]">
              <button
                onClick={closeModal}
                className="w-full bg-[#3b6d11] hover:bg-[#2f560d] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}