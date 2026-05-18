// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  BarChart3,
  GraduationCap,
  Calendar
} from 'lucide-react';

// --- Types ---
interface Batch {
  id: string;
  name: string;
  grade: string;
  stage: string;
  description: string;
  studentCount: number;
  avgProgress: number;
  avgScore: number;
  passRate: number;
  isActive: boolean;
  createdAt: string;
}

// --- Mock Data ---
const initialBatches: Batch[] = [
  {
    id: '1',
    name: 'Batch A - Python Beginners',
    grade: 'Grade 9',
    stage: 'Beginner',
    description: 'Introduction to Python programming fundamentals',
    studentCount: 45,
    avgProgress: 68,
    avgScore: 82,
    passRate: 87,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Batch B - Advanced React',
    grade: 'Grade 11',
    stage: 'Advanced',
    description: 'Advanced React concepts and performance optimization',
    studentCount: 38,
    avgProgress: 85,
    avgScore: 92,
    passRate: 95,
    isActive: true,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Batch C - Data Science',
    grade: 'Grade 10',
    stage: 'Intermediate',
    description: 'Data analysis, visualization, and machine learning basics',
    studentCount: 22,
    avgProgress: 75,
    avgScore: 78,
    passRate: 82,
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Weekend Batch - Full Stack',
    grade: 'Mixed',
    stage: 'Intermediate',
    description: 'Comprehensive full-stack web development',
    studentCount: 29,
    avgProgress: 72,
    avgScore: 75,
    passRate: 79,
    isActive: true,
    createdAt: '2024-02-10',
  },
];

// --- Helper Functions ---
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- Main Component ---
export default function SchoolAdminDashboard() {
  // State
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    stage: '',
    description: '',
    studentCount: 0,
    avgProgress: 0,
    avgScore: 0,
    passRate: 0,
    isActive: true,
  });

  const itemsPerPage = 5;

  // Derived data
  const totalBatches = batches.length;
  const totalStudents = batches.reduce((sum, b) => sum + b.studentCount, 0);
  const avgProgressOverall = Math.round(batches.reduce((sum, b) => sum + b.avgProgress, 0) / totalBatches);
  const avgPassRateOverall = Math.round(batches.reduce((sum, b) => sum + b.passRate, 0) / totalBatches);

  // Filter batches based on search
  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.stage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Modal handlers
  const openCreateModal = () => {
    setEditingBatch(null);
    setFormData({
      name: '',
      grade: '',
      stage: '',
      description: '',
      studentCount: 0,
      avgProgress: 0,
      avgScore: 0,
      passRate: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      grade: batch.grade,
      stage: batch.stage,
      description: batch.description,
      studentCount: batch.studentCount,
      avgProgress: batch.avgProgress,
      avgScore: batch.avgScore,
      passRate: batch.passRate,
      isActive: batch.isActive,
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (batch: Batch) => {
    setDeletingBatch(batch);
    setIsDeleteModalOpen(true);
  };

  const handleSaveBatch = () => {
    if (!formData.name || !formData.grade || !formData.stage) return;

    if (editingBatch) {
      // Update existing batch
      setBatches(prev =>
        prev.map(batch =>
          batch.id === editingBatch.id
            ? {
                ...batch,
                ...formData,
              }
            : batch
        )
      );
    } else {
      // Create new batch
      const newBatch: Batch = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setBatches(prev => [...prev, newBatch]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBatch = () => {
    if (deletingBatch) {
      setBatches(prev => prev.filter(batch => batch.id !== deletingBatch.id));
      setIsDeleteModalOpen(false);
      setDeletingBatch(null);
    }
  };

  const handleToggleStatus = (batchId: string) => {
    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? { ...batch, isActive: !batch.isActive }
          : batch
      )
    );
  };

  // Performance data for chart
  const performanceData = batches.map(batch => ({
    name: batch.name.split(' - ')[0],
    progress: batch.avgProgress,
    passRate: batch.passRate,
    students: batch.studentCount,
  }));

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0] font-sans">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#f1f5f9] tracking-tight">Lincoln High School</h1>
            <p className="text-sm text-[#64748b] mt-0.5">School Admin Dashboard</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b6d11] text-[#c0dd97] border border-[#639922] rounded-lg text-sm font-medium hover:bg-[#27500a] transition-all active:scale-95"
          >
            <Plus size={16} />
            Create Batch
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Total Batches</p>
                <p className="text-3xl font-bold text-[#f1f5f9] mt-1">{totalBatches}</p>
              </div>
              <div className="w-10 h-10 bg-[#1e2a40] rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-[#7dd3fc]" />
              </div>
            </div>
          </div>
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Total Students</p>
                <p className="text-3xl font-bold text-[#f1f5f9] mt-1">{totalStudents}</p>
              </div>
              <div className="w-10 h-10 bg-[#1e2a40] rounded-lg flex items-center justify-center">
                <Users size={20} className="text-[#7dd3fc]" />
              </div>
            </div>
          </div>
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Avg Progress</p>
                <p className="text-3xl font-bold text-[#f1f5f9] mt-1">{avgProgressOverall}%</p>
              </div>
              <div className="w-10 h-10 bg-[#1e2a40] rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-[#4ade80]" />
              </div>
            </div>
          </div>
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Avg Pass Rate</p>
                <p className="text-3xl font-bold text-[#f1f5f9] mt-1">{avgPassRateOverall}%</p>
              </div>
              <div className="w-10 h-10 bg-[#1e2a40] rounded-lg flex items-center justify-center">
                <Award size={20} className="text-[#fbbf24]" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-5 mb-8">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Batch Performance Comparison</h2>
          <div className="space-y-4">
            {performanceData.map((batch, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8]">{batch.name}</span>
                  <span className="text-[#cbd5e1]">{batch.progress}%</span>
                </div>
                <div className="w-full bg-[#1e2230] rounded-full h-2">
                  <div
                    className="bg-[#3b6d11] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${batch.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-[#2d3448]">
            <span className="text-xs text-[#475569]">Progress Rate</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#3b6d11] rounded-full"></div>
                <span className="text-xs text-[#64748b]">Current Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Batch List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#1e2230] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#639922] transition-colors"
            />
          </div>
          <div className="text-xs text-[#475569]">
            {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {/* Batch Cards (Mobile) / Table (Desktop) */}
        <div className="block lg:hidden space-y-4">
          {paginatedBatches.length === 0 ? (
            <div className="bg-[#161b27] border border-[#2d3448] rounded-xl p-8 text-center">
              <p className="text-[#475569]">No batches found</p>
            </div>
          ) : (
            paginatedBatches.map((batch) => (
              <div key={batch.id} className="bg-[#161b27] border border-[#2d3448] rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[#e2e8f0]">{batch.name}</h3>
                    <p className="text-xs text-[#64748b] mt-0.5">{batch.grade} · {batch.stage}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${batch.isActive ? 'bg-[#0f2d1a] text-[#4ade80] border border-[#166534]' : 'bg-[#2a1a1a] text-[#f87171] border border-[#7f1d1d]'}`}>
                    {batch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-[#94a3b8] line-clamp-2 mb-3">{batch.description || 'No description'}</p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div><span className="text-[#64748b]">Students:</span> <span className="text-[#e2e8f0]">{batch.studentCount}</span></div>
                  <div><span className="text-[#64748b]">Progress:</span> <span className="text-[#e2e8f0]">{batch.avgProgress}%</span></div>
                  <div><span className="text-[#64748b]">Score:</span> <span className="text-[#e2e8f0]">{batch.avgScore}%</span></div>
                  <div><span className="text-[#64748b]">Pass Rate:</span> <span className="text-[#e2e8f0]">{batch.passRate}%</span></div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#2d3448]">
                  <button
                    onClick={() => handleToggleStatus(batch.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${batch.isActive ? 'bg-[#2a1a1a] text-[#f87171] border border-[#7f1d1d] hover:bg-[#3a1a1a]' : 'bg-[#0f2d1a] text-[#4ade80] border border-[#166534] hover:bg-[#0a3a1a]'}`}
                  >
                    {batch.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(batch)}
                    className="p-1.5 rounded-lg text-[#60a5fa] hover:bg-[#0c253d] border border-transparent hover:border-[#1e4a72] transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(batch)}
                    className="p-1.5 rounded-lg text-[#f87171] hover:bg-[#2a0d0d] border border-transparent hover:border-[#7f1d1d] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-[#161b27] border border-[#2d3448] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3448] bg-[#1a2030]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Batch Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Grade / Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Pass Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#64748b] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#475569]">
                    No batches found
                  </td>
                </tr>
              ) : (
                paginatedBatches.map((batch, idx) => (
                  <tr key={batch.id} className="border-b border-[#1f2537] hover:bg-[#1c2235] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#475569]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-[#e2e8f0]">{batch.name}</div>
                        <div className="text-xs text-[#64748b] truncate max-w-[200px]">{batch.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#cbd5e1]">{batch.grade}<br/><span className="text-xs text-[#64748b]">{batch.stage}</span></td>
                    <td className="px-4 py-3 text-sm text-[#cbd5e1]">{batch.studentCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#cbd5e1]">{batch.avgProgress}%</span>
                        <div className="w-16 bg-[#1e2230] rounded-full h-1.5">
                          <div className="bg-[#3b6d11] h-1.5 rounded-full" style={{ width: `${batch.avgProgress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#cbd5e1]">{batch.avgScore}%</td>
                    <td className="px-4 py-3 text-sm text-[#cbd5e1]">{batch.passRate}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${batch.isActive ? 'bg-[#0f2d1a] text-[#4ade80] border border-[#166534]' : 'bg-[#2a1a1a] text-[#f87171] border border-[#7f1d1d]'}`}>
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(batch.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${batch.isActive ? 'text-[#f87171] hover:bg-[#2a0d0d]' : 'text-[#4ade80] hover:bg-[#0f2d1a]'}`}
                          title={batch.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {batch.isActive ? 'Off' : 'On'}
                        </button>
                        <button
                          onClick={() => openEditModal(batch)}
                          className="p-1.5 rounded-lg text-[#60a5fa] hover:bg-[#0c253d] transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(batch)}
                          className="p-1.5 rounded-lg text-[#f87171] hover:bg-[#2a0d0d] transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#1e2230] border border-[#2d3448] rounded-lg text-sm text-[#94a3b8] disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#1c2235] hover:enabled:text-[#e2e8f0] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${currentPage === page ? 'bg-[#27500a] border border-[#3b6d11] text-[#c0dd97] font-medium' : 'bg-[#1e2230] border border-[#2d3448] text-[#94a3b8] hover:bg-[#1c2235] hover:text-[#e2e8f0]'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-[#1e2230] border border-[#2d3448] rounded-lg text-sm text-[#94a3b8] disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#1c2235] hover:enabled:text-[#e2e8f0] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3448]">
              <h2 className="text-lg font-semibold text-[#f1f5f9]">{editingBatch ? 'Edit Batch' : 'Create New Batch'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#2d3448] p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1">Batch Name <span className="text-[#f87171]">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Batch A - Python Beginners"
                  className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#639922] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Grade <span className="text-[#f87171]">*</span></label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] focus:outline-none focus:border-[#639922] transition-colors"
                  >
                    <option value="">Select grade...</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Stage <span className="text-[#f87171]">*</span></label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] focus:outline-none focus:border-[#639922] transition-colors"
                  >
                    <option value="">Select stage...</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Batch description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#639922] transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Student Count</label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] focus:outline-none focus:border-[#639922] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Avg Progress (%)</label>
                  <input
                    type="number"
                    value={formData.avgProgress}
                    onChange={(e) => setFormData(prev => ({ ...prev, avgProgress: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] focus:outline-none focus:border-[#639922] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Avg Score (%)</label>
                  <input
                    type="number"
                    value={formData.avgScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, avgScore: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] focus:outline-none focus:border-[#639922] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Pass Rate (%)</label>
                  <input
                    type="number"
                    value={formData.passRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, passRate: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#1a2030] border border-[#2d3448] rounded-lg text-sm text-[#e2e8f0] focus:outline-none focus:border-[#639922] transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-[#94a3b8]">Active Status</span>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative w-11 h-5 rounded-full transition-colors ${formData.isActive ? 'bg-[#3b6d11]' : 'bg-[#2d3448]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#2d3448]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-transparent border border-[#2d3448] rounded-lg text-sm text-[#94a3b8] hover:bg-[#1e2230] hover:text-[#e2e8f0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBatch}
                disabled={!formData.name || !formData.grade || !formData.stage}
                className="px-4 py-1.5 bg-[#3b6d11] border border-[#639922] rounded-lg text-sm font-medium text-[#c0dd97] disabled:opacity-45 disabled:cursor-not-allowed hover:enabled:bg-[#27500a] transition-colors"
              >
                {editingBatch ? 'Save Changes' : 'Create Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingBatch && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl w-full max-w-sm mx-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3448]">
              <h2 className="text-lg font-semibold text-[#f1f5f9]">Delete Batch</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#2d3448] p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-[#2a1a1a] rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} className="text-[#f87171]" />
                </div>
                <div>
                  <p className="text-sm text-[#94a3b8]">
                    Are you sure you want to delete <strong className="text-[#e2e8f0]">{deletingBatch.name}</strong>?
                  </p>
                  <p className="text-xs text-[#64748b] mt-2">This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#2d3448]">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-1.5 bg-transparent border border-[#2d3448] rounded-lg text-sm text-[#94a3b8] hover:bg-[#1e2230] hover:text-[#e2e8f0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatch}
                className="px-4 py-1.5 bg-[#7f1d1d] border border-[#991b1b] rounded-lg text-sm font-medium text-[#fca5a5] hover:bg-[#6b1a1a] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}