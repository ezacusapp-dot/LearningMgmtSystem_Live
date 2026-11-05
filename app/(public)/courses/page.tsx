'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, Filter, ChevronRight, CheckCircle2, Clock, BookOpen, Award, Target,
  Sparkles, TrendingUp, Trophy, Download, Play, Sun, Moon, Zap, Code, Laptop,
  Smartphone, Globe, Brain, Star, Palette, Rocket, Crown, Gem, ShoppingCart,
  X, Tag, PlayCircle, ClipboardCheck, RefreshCw, Loader2, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── API types (match GET /api/courses → courseInclude) ──────────────────────
type ApiModuleType = 'LESSON' | 'REVISION' | 'QUIZ' | 'FINAL_QUIZ';

interface ApiModule {
  id: string;
  title: string;
  type: ApiModuleType;
  order: number;
  isActive?: boolean;
}

interface ApiCourse {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  thumbnailUrl?: string | null;
  courseCategory?: { id: string; name: string } | null;
  courseLevel?: { id: string; name: string } | null;
  durationType?: { id: string; value: number | string; unit: string } | null;
  modules?: ApiModule[];
}

// ─── UI model ────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  duration: string;
  moduleCount: number;
  icon: React.ReactNode;
  color: string;
  modules: ApiModule[];
  price: number;         // dummy (API has no price yet)
  originalPrice: number; // dummy
}

const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ─── Visual helpers (UI only) ────────────────────────────────────────────────
const ICONS = [Palette, Target, Code, Laptop, Zap, Smartphone, Rocket, Globe, Gem, Brain];
const COLORS = [
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-yellow-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-violet-500 to-purple-500',
];

const levelBadge = (level: string) => {
  const l = level.toLowerCase();
  if (l.includes('beginner')) return 'bg-green-100 text-green-700';
  if (l.includes('intermediate')) return 'bg-blue-100 text-blue-700';
  if (l.includes('advanced')) return 'bg-purple-100 text-purple-700';
  return 'bg-orange-100 text-orange-700';
};

const STAGE_STYLE: Record<string, { Icon: any; color: string }> = {
  beginner: { Icon: Sparkles, color: 'text-[#22C55E]' },
  intermediate: { Icon: Rocket, color: 'text-[#3B82F6]' },
  advanced: { Icon: Zap, color: 'text-[#F59E0B]' },
  professional: { Icon: Crown, color: 'text-[#BC579E]' },
};
const STAGE_ORDER = ['beginner', 'intermediate', 'advanced', 'professional'];

const mapCourse = (c: ApiCourse, index: number): Course => {
  const Icon = ICONS[index % ICONS.length];
  const modules = [...(c.modules ?? [])].sort((a, b) => a.order - b.order);
  const price = 1999 + modules.length * 500;                  // dummy
  const originalPrice = Math.round((price * 1.4) / 100) * 100; // dummy
  return {
    id: c.id,
    title: c.title,
    category: c.courseCategory?.name ?? 'General',
    level: c.courseLevel?.name ?? 'Beginner',
    description: c.description?.trim() || 'No description available yet.',
    duration: c.durationType ? `${c.durationType.value} ${c.durationType.unit}` : 'Self-paced',
    moduleCount: modules.length,
    icon: <Icon className="w-12 h-12" strokeWidth={1.5} />,
    color: COLORS[index % COLORS.length],
    modules,
    price,
    originalPrice,
  };
};

// ─── Module type display (read-only, nothing playable) ───────────────────────
const typeMeta: Record<ApiModuleType, { label: string; Icon: any; badge: string }> = {
  LESSON: { label: 'Lesson', Icon: PlayCircle, badge: 'bg-blue-100 text-blue-700' },
  REVISION: { label: 'Revision', Icon: RefreshCw, badge: 'bg-green-100 text-green-700' },
  QUIZ: { label: 'Quiz', Icon: ClipboardCheck, badge: 'bg-orange-100 text-orange-700' },
  FINAL_QUIZ: { label: 'Final Quiz', Icon: Award, badge: 'bg-purple-100 text-purple-700' },
};

// ------------------------- COURSE DETAIL MODAL -------------------------
interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

function CourseDetailModal({ course, isOpen, onClose, isDarkMode }: CourseDetailModalProps) {
  const cardBg = isDarkMode ? 'bg-[#2a1635]' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-purple-500/20' : 'border-purple-200';

  return (
    <AnimatePresence>
      {isOpen && course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className={`${cardBg} w-full max-w-2xl max-h-[90vh] rounded-2xl border-2 ${borderColor} overflow-hidden shadow-2xl flex flex-col`}
          >
            <div className={`bg-gradient-to-r ${course.color} p-5 sm:p-6 text-white relative`}>
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mb-3">{course.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold">{course.title}</h3>
              <p className="text-sm text-white/80">
                {course.category} · {course.level}
              </p>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto">
              <p className={`text-sm sm:text-base ${textSecondary} mb-4`}>{course.description}</p>

              <div className="flex gap-6 mb-6">
                <div className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                  <Clock className="w-4 h-4 text-[#BC579E]" />
                  {course.duration}
                </div>
                <div className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                  <BookOpen className="w-4 h-4 text-[#BC579E]" />
                  {course.moduleCount} modules
                </div>
              </div>

              <h4 className={`font-bold ${textPrimary} mb-3`}>Course modules</h4>

              {course.modules.length === 0 ? (
                <p className={`text-sm ${textSecondary}`}>Modules will be added soon.</p>
              ) : (
                // Display only — rows are not clickable and nothing plays
                <ul className="space-y-2">
                  {course.modules.map((m, i) => {
                    const meta = typeMeta[m.type] ?? typeMeta.LESSON;
                    const { label, Icon, badge } = meta;
                    return (
                      <li
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${borderColor} ${
                          isDarkMode ? 'bg-[#1a0b1f]' : 'bg-purple-50/50'
                        } select-none`}
                      >
                        <span className={`text-xs font-bold w-5 text-center ${textSecondary}`}>{i + 1}</span>
                        <Icon className="w-4 h-4 text-[#BC579E] flex-shrink-0" />
                        <span className={`flex-1 text-sm font-semibold ${textPrimary}`}>{m.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CoursesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [justPurchased, setJustPurchased] = useState(false);

  // ─── Fetch from /api/courses ───────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/courses?status=Published&limit=100', {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok || json.status === false) {
          throw new Error(json.message || 'Failed to load courses');
        }
        setCourses((json.data as ApiCourse[]).map(mapCourse));
      } catch (err: any) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  // Levels come from the data, so filter pills + journey always match the API
  const levels = useMemo(() => {
    const unique = Array.from(new Set(courses.map((c) => c.level)));
    return unique.sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a.toLowerCase());
      const ib = STAGE_ORDER.indexOf(b.toLowerCase());
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [courses]);

  const bgClass = isDarkMode ? 'bg-[#1a0b1f]' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20';
  const cardBg = isDarkMode ? 'bg-[#2a1635]' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-purple-500/20' : 'border-purple-200';

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q);
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const discountPercent = (c: Course) => Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100);

  const openCheckout = (course: Course) => {
    setJustPurchased(false);
    setCheckoutCourse(course);
  };
  const closeCheckout = () => {
    setCheckoutCourse(null);
    setJustPurchased(false);
  };
  const confirmPurchase = () => {
    if (!checkoutCourse) return;
    setPurchased((prev) => (prev.includes(checkoutCourse.id) ? prev : [...prev, checkoutCourse.id]));
    setJustPurchased(true);
  };

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40 backdrop-blur-lg bg-opacity-90`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#BC579E' }} strokeWidth={1.5} />
              <div>
                <h1 className={`text-base sm:text-xl font-bold ${textPrimary}`}>Courses</h1>
                <p className={`text-xs ${textSecondary} font-medium`}>Code Excellence</p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
              className={`p-2 sm:p-3 rounded-xl ${cardBg} border-2 ${borderColor} hover:border-[#BC579E] hover:shadow-lg transition-all shadow-md`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#D9E254]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#49205E]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#49205E] via-[#BC579E] to-[#49205E] opacity-95"></div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-white text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight"
              >
                Structured Coding Curriculum for Every Stage
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8"
              >
                From Scratch to Advanced Web & App Development – Adaptive, Certified & Ranked.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#D9E254] text-[#49205E] font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2">
                  Explore Learning Paths
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Take Entry Mock Test
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-96 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 left-10 w-20 h-20 bg-[#D9E254] rounded-2xl rotate-12 flex items-center justify-center shadow-2xl"
                >
                  <Rocket className="w-10 h-10 text-[#49205E]" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute top-20 right-20 w-24 h-24 bg-white rounded-2xl -rotate-12 flex items-center justify-center shadow-2xl"
                >
                  <Laptop className="w-12 h-12 text-[#49205E]" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl rotate-6 flex items-center justify-center shadow-2xl"
                >
                  <Trophy className="w-14 h-14 text-white" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-64 h-64 border-4 border-dashed border-white/20 rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filters */}
        <section className="mb-8 sm:mb-12">
          <div className={`${cardBg} rounded-2xl p-4 sm:p-6 border ${borderColor}`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border-2 ${borderColor} rounded-xl focus:border-[#BC579E] focus:outline-none ${cardBg} ${textPrimary}`}
                />
              </div>
              <Filter className={`w-5 h-5 ${textSecondary} hidden sm:block`} />
            </div>

            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {['all', ...levels].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all ${
                    selectedLevel === level
                      ? 'bg-gradient-to-r from-[#49205E] to-[#BC579E] text-white'
                      : `${cardBg} border ${borderColor} ${textSecondary} hover:border-[#BC579E]`
                  }`}
                >
                  {level === 'all' ? 'All Levels' : level}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All Courses */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2`}>All Courses</h2>
              <p className={`text-sm sm:text-base ${textSecondary}`}>
                {loading ? 'Loading courses…' : `Choose from ${filteredCourses.length} courses across all levels`}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`${cardBg} rounded-2xl border-2 ${borderColor} overflow-hidden animate-pulse`}>
                  <div className="h-32 bg-purple-200/40" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-1/3 rounded bg-purple-200/40" />
                    <div className="h-3 w-full rounded bg-purple-200/40" />
                    <div className="h-3 w-2/3 rounded bg-purple-200/40" />
                    <div className="h-10 w-full rounded-xl bg-purple-200/40 mt-6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className={`${cardBg} rounded-2xl border-2 ${borderColor} p-8 text-center`}>
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
              <p className={`font-semibold ${textPrimary} mb-1`}>Couldn&apos;t load courses</p>
              <p className={`text-sm ${textSecondary} mb-4`}>{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#49205E] to-[#BC579E] text-white inline-flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCourses.map((course, index) => {
                const isPurchased = purchased.includes(course.id);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${cardBg} rounded-2xl border-2 ${borderColor} overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col`}
                  >
                    <div className={`bg-gradient-to-r ${course.color} p-4 sm:p-6 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative">
                        <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{course.icon}</div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1">{course.title}</h3>
                        <p className="text-xs sm:text-sm text-white/80">{course.category}</p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${levelBadge(course.level)}`}>
                          {course.level}
                        </span>
                      </div>

                      <p className={`text-xs sm:text-sm ${textSecondary} mb-3 sm:mb-4 line-clamp-2`}>{course.description}</p>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${textSecondary}`}>
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#BC579E]" />
                          <span>{course.duration}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${textSecondary}`}>
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-[#BC579E]" />
                          <span>{course.moduleCount} modules</span>
                        </div>
                      </div>

                      <div className={`flex items-end justify-between mb-3 sm:mb-4 pt-3 sm:pt-4 border-t ${borderColor} mt-auto`}>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>{formatPrice(course.price)}</span>
                            <span className={`text-sm line-through ${textSecondary} opacity-70`}>
                              {formatPrice(course.originalPrice)}
                            </span>
                          </div>
                          <p className={`text-xs ${textSecondary} mt-0.5`}>One-time payment · Lifetime access</p>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#D9E254] text-[#49205E] text-xs font-bold whitespace-nowrap">
                          <Tag className="w-3 h-3" />
                          {discountPercent(course)}% OFF
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <button
                          onClick={() => setSelectedCourse(course.id)}
                          className="py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all bg-purple-100 text-[#49205E] hover:bg-purple-200"
                        >
                          View Details
                        </button>
                        {isPurchased ? (
                          <button
                            disabled
                            className="py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base bg-green-100 text-green-700 flex items-center justify-center gap-1.5 cursor-default"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Enrolled
                          </button>
                        ) : (
                          <button
                            onClick={() => openCheckout(course)}
                            className="py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all bg-gradient-to-r from-[#49205E] to-[#BC579E] text-white hover:shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredCourses.length === 0 && (
            <p className={`text-center py-12 ${textSecondary}`}>
              {courses.length === 0
                ? 'No courses are available yet.'
                : 'No courses match your search. Try a different keyword or level.'}
            </p>
          )}
        </section>

        <CourseDetailModal
          course={courses.find((c) => c.id === selectedCourse) || null}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          isDarkMode={isDarkMode}
        />

        {/* Learning Journey (built from API levels) */}
        {!loading && !error && levels.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2 sm:mb-3`}>Your Learning Journey</h2>
              <p className={`text-base sm:text-lg ${textSecondary} px-4`}>
                Progress through structured stages designed for your success
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-4 sm:p-6 lg:p-8 border ${borderColor}`}>
              <div className="relative">
                <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 via-purple-500 to-orange-500 opacity-20 hidden lg:block"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
                  {levels.map((level, index) => {
                    const style = STAGE_STYLE[level.toLowerCase()] ?? { Icon: Star, color: 'text-[#BC579E]' };
                    const StageIcon = style.Icon;
                    return (
                      <motion.div
                        key={level}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <div className="flex flex-col items-center mb-4 sm:mb-6">
                          <div className="text-center">
                            <div className="flex justify-center mb-2 sm:mb-3">
                              <StageIcon className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${style.color}`} strokeWidth={1.5} />
                            </div>
                            <p className={`font-bold text-base sm:text-lg ${textPrimary}`}>{level}</p>
                          </div>
                          {index < levels.length - 1 && (
                            <ChevronRight className="absolute -right-3 top-12 w-6 h-6 text-gray-400 hidden lg:block" />
                          )}
                        </div>

                        <div className="space-y-2">
                          {courses
                            .filter((c) => c.level === level)
                            .map((course) => (
                              <div
                                key={course.id}
                                className={`p-3 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-[#1a0b1f]' : 'bg-purple-50/50'} hover:border-[#BC579E] transition-all cursor-pointer`}
                                onClick={() => setSelectedCourse(course.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg sm:text-xl [&_svg]:w-6 [&_svg]:h-6">{course.icon}</span>
                                  <p className={`text-xs font-semibold ${textPrimary} line-clamp-2`}>{course.title}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-[#BC579E]">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#BC579E' }} strokeWidth={1.5} />
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">AI-Powered Adaptive Learning Path</h4>
                    <p className="text-sm text-gray-600">
                      Take our entry assessment and let AI recommend the perfect starting point and progression for you
                    </p>
                  </div>
                  <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#49205E] to-[#BC579E] text-white font-bold text-sm sm:text-base rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
                    Get My Path
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Certification */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2 sm:mb-3`}>Certification & Recognition</h2>
            <p className={`text-base sm:text-lg ${textSecondary} px-4`}>Earn recognized certificates and compete on leaderboards</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className={`${cardBg} rounded-2xl p-6 sm:p-8 border-4 border-[#D9E254]`}>
              <div className="text-center mb-6">
                <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#BC579E' }} strokeWidth={1.5} />
                <h3 className={`text-xl sm:text-2xl font-bold ${textPrimary} mb-2`}>Course Completion Certificate</h3>
                <p className={`text-sm ${textSecondary}`}>Official certification recognized globally</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 sm:p-8 border-2 border-purple-200 mb-6">
                <div className="text-center">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" style={{ color: '#D9E254' }} strokeWidth={1.5} />
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Code Excellence</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">This is to certify that</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#BC579E] mb-3 sm:mb-4">[Student Name]</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">has successfully completed</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">[Course Title]</p>
                  <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#D9E254] rounded-xl">
                    <p className="text-xs sm:text-sm font-semibold text-[#49205E]">Final Score</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#49205E]">85%</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-2 sm:py-3 bg-purple-100 text-[#49205E] font-bold text-sm sm:text-base rounded-xl hover:bg-purple-200 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Preview Sample Certificate
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: CheckCircle2, grad: 'from-blue-500 to-cyan-500', title: 'Intermediate Tests', text: 'Progressive assessments after each module to ensure understanding and unlock next stages' },
                { icon: Trophy, grad: 'from-purple-500 to-pink-500', title: 'Final Certification Exam', text: 'Comprehensive exam testing all course concepts with 70% passing requirement' },
                { icon: Star, grad: 'from-orange-500 to-red-500', title: 'Multi-Level Rankings', text: 'Compete on school, state, and regional leaderboards with real-time rankings' },
                { icon: Award, grad: 'from-green-500 to-emerald-500', title: 'Digital Certificates', text: 'Download verifiable certificates with unique IDs and share on social platforms' },
                { icon: TrendingUp, grad: 'from-[#49205E] to-[#BC579E]', title: 'Leaderboard Recognition', text: 'Top performers get featured badges, special recognition, and rewards' },
              ].map(({ icon: Icon, grad, title, text }) => (
                <div key={title} className={`${cardBg} rounded-xl p-4 sm:p-6 border ${borderColor}`}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm sm:text-base ${textPrimary} mb-1 sm:mb-2`}>{title}</h4>
                      <p className={`text-xs sm:text-sm ${textSecondary}`}>{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="bg-gradient-to-r from-[#49205E] via-[#BC579E] to-[#49205E] rounded-2xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4 sm:mb-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </motion.div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Not Sure Where to Start?</h2>
              <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Let our AI analyze your skills and recommend the perfect learning path tailored just for you
              </p>

              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#D9E254] text-[#49205E] font-bold text-sm sm:text-base rounded-xl hover:shadow-2xl transition-all inline-flex items-center gap-2 mb-6 sm:mb-8">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                Take Entry Mock Test
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {[
                  { icon: CheckCircle2, title: 'Quick Assessment', text: '5-10 minute test to gauge your current level' },
                  { icon: Sparkles, title: 'AI Analysis', text: 'Smart algorithm suggests optimal path with 90%+ accuracy' },
                  { icon: Target, title: 'Personalized Plan', text: 'Get custom curriculum designed for your success' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" />
                    <h4 className="font-bold text-sm sm:text-base mb-2">{title}</h4>
                    <p className="text-xs sm:text-sm text-purple-100">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dummy checkout modal */}
      <AnimatePresence>
        {checkoutCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeCheckout}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={`${cardBg} w-full max-w-md rounded-2xl border-2 ${borderColor} overflow-hidden shadow-2xl`}
            >
              <div className={`bg-gradient-to-r ${checkoutCourse.color} p-5 text-white relative`}>
                <button
                  onClick={closeCheckout}
                  aria-label="Close"
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-white/80 mb-1">{justPurchased ? 'Purchase complete' : 'Checkout'}</p>
                <h3 className="text-xl font-bold">{checkoutCourse.title}</h3>
              </div>

              {justPurchased ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-green-500" strokeWidth={1.5} />
                  <h4 className={`text-lg font-bold ${textPrimary} mb-1`}>You&apos;re enrolled!</h4>
                  <p className={`text-sm ${textSecondary} mb-5`}>This was a demo purchase. No payment was taken.</p>
                  <button
                    onClick={closeCheckout}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#49205E] to-[#BC579E] text-white hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className={`space-y-2 text-sm ${textSecondary} mb-4`}>
                    <div className="flex justify-between">
                      <span>Course price</span>
                      <span className="line-through">{formatPrice(checkoutCourse.originalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount ({discountPercent(checkoutCourse)}%)</span>
                      <span>− {formatPrice(checkoutCourse.originalPrice - checkoutCourse.price)}</span>
                    </div>
                    <div className={`flex justify-between pt-3 border-t ${borderColor} text-base font-bold ${textPrimary}`}>
                      <span>Total</span>
                      <span>{formatPrice(checkoutCourse.price)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={closeCheckout}
                      className="py-3 rounded-xl font-bold bg-purple-100 text-[#49205E] hover:bg-purple-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPurchase}
                      className="py-3 rounded-xl font-bold bg-[#D9E254] text-[#49205E] hover:shadow-lg transition-all"
                    >
                      Pay {formatPrice(checkoutCourse.price)}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}