// app/(protected)/student/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CoursePlayer from "./CoursePlayer"; // we'll put CoursePlayer in same folder

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/student_login");
      return;
    }
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/courses/${courseId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.status) throw new Error(json.message || "Failed to load course");

      setCourseData(transformCourse(json.data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0f1117] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/student/courses")}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <CoursePlayer
      courseData={courseData}
      onClose={() => router.push("/student/courses")}
    />
  );
}

// ── Transform raw API data → CoursePlayer shape ──────────────────────────────

function transformCourse(raw: any) {
  // Count total lessons across all LESSON modules
  const totalLessons = raw.modules
    ?.filter((m: any) => m.type === "LESSON")
    .reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) ?? 0;

  const sections = raw.modules?.map((mod: any, idx: number) => {
    const items = buildItems(mod);
    return {
      id:       idx + 1,
      moduleId: mod.id,
      title:    mod.title,
      type:     mod.type,
      lessons:  items.length,
      duration: estimateDuration(items.length),
      completed: false,
      open:     idx === 0, // open first section by default
      items,
    };
  }) ?? [];

  // Auto-open first section and mark first lesson as active
  if (sections[0]?.items[0]) {
    sections[0].items[0].active = true;
  }

  return {
    id:               raw.id,
    title:            raw.title,
    description:      raw.description ?? "",
    author:           raw.createdBy ?? "Instructor",
    authorTitle:      raw.courseLevel?.name ?? "",
    authorStudents:   "",
    totalLessons,
    completedLessons: 0,
    duration:         raw.validityPeriod?.name ?? "Self-paced",
    progress:         0,
    thumbnail:        raw.thumbnailUrl ?? null,
    category:         raw.courseCategory?.name ?? "",
    sections,
  };
}

function buildItems(mod: any) {
  // LESSON module → map each lesson
  if (mod.type === "LESSON") {
    return (mod.lessons ?? []).map((lesson: any, i: number) => ({
      id:        lesson.id,
      title:     lesson.title,
      duration:  "—",
      type:      lesson.contentType === "VIDEO" ? "video"
               : lesson.contentType === "PDF"   ? "doc"
               : "doc",
      fileUrl:   lesson.fileUrl ?? null,
      completed: false,
      active:    false,
    }));
  }

  // REVISION module → treat revision contents as items
  if (mod.type === "REVISION") {
    const contents = mod.revision?.contents ?? [];
    if (contents.length === 0) {
      return [{
        id:       `rev-${mod.id}`,
        title:    mod.title,
        duration: "—",
        type:     "doc",
        fileUrl:  null,
        completed: false,
        active:   false,
      }];
    }
    return contents.map((c: any, i: number) => ({
      id:        c.id,
      title:     `${mod.title} ${i + 1}`,
      duration:  "—",
      type:      c.contentType === "VIDEO" ? "video" : "doc",
      fileUrl:   c.fileUrl ?? null,
      completed: false,
      active:    false,
    }));
  }

  // QUIZ / FINAL_QUIZ module → single quiz item
  if (mod.type === "QUIZ" || mod.type === "FINAL_QUIZ") {
    return [{
      id:           `quiz-${mod.id}`,
      title:        mod.title,
      duration:     `${mod.quiz?.totalMarks ?? 0} marks`,
      type:         "quiz" as const,
      quizId:       mod.quiz?.id ?? null,
      questions:    mod.quiz?.questions ?? [],
      passingMarks: mod.quiz?.passingMarks ?? 0,
      totalMarks:   mod.quiz?.totalMarks ?? 0,
      completed:    false,
      active:       false,
    }];
  }

  return [];
}

function estimateDuration(lessonCount: number) {
  const mins = lessonCount * 20;
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`;
}