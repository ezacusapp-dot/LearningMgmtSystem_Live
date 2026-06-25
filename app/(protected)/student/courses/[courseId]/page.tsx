"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CoursePlayer from "./CoursePlayer";
import ExamPlayer, { type ExamData } from "./ExamPlayer";

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mockExam, setMockExam] = useState<ExamData | null>(null);
  const [showExam, setShowExam] = useState(false);

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

      const [courseRes, examRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/courses/${courseId}/exam`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const courseJson = await courseRes.json();
      if (!courseJson.status) throw new Error(courseJson.message || "Failed to load course");

      console.log("Raw course data:", courseJson.data); // Debug log
      setCourseData(transformCourse(courseJson.data));

      if (examRes.ok) {
        const examJson = await examRes.json();
        if (examJson.status && examJson.data) {
          setMockExam(examJson.data as ExamData);
        }
      }
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

  if (showExam && mockExam) {
    return (
      <ExamPlayer
        exam={mockExam}
        courseId={courseId}
        onClose={() => setShowExam(false)}
      />
    );
  }

  return (
    <CoursePlayer
      courseData={courseData}
      mockExam={mockExam ?? undefined}
      onStartExam={() => setShowExam(true)}
      onClose={() => router.push("/student/courses")}
    />
  );
}

function transformCourse(raw: any) {
  console.log("Transforming course:", raw); // Debug log
  
  const totalLessons = raw.modules
    ?.filter((m: any) => m.type === "LESSON")
    .reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) ?? 0;

  const sections = raw.modules?.map((mod: any, idx: number) => {
    const items = buildItems(mod);
    console.log(`Module ${mod.title} (${mod.type}) has ${items.length} items:`, items); // Debug log
    
    return {
      id:        idx + 1,
      moduleId:  mod.id,
      title:     mod.title,
      type:      mod.type,
      lessons:   items.length,
      duration:  estimateDuration(items.length),
      completed: false,
      open:      idx === 0,
      items,
    };
  }) ?? [];

  if (sections[0]?.items[0]) {
    sections[0].items[0].active = true;
  }

  return {
    id:               raw.id,
    title:            raw.title,
    description:      raw.description ?? "",
    author:           raw.createdBy ?? "Instructor",
    authorTitle:      raw.courseLevel?.name ?? "",
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
  // Handle LESSON type
  if (mod.type === "LESSON") {
    return (mod.lessons ?? []).map((lesson: any) => ({
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

  // Handle REVISION type
  if (mod.type === "REVISION") {
    const contents = mod.revision?.contents ?? [];
    if (contents.length === 0) {
      return [{
        id:        `rev-${mod.id}`,
        title:     mod.title,
        duration:  "—",
        type:      "doc",
        fileUrl:   null,
        completed: false,
        active:    false,
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

  // Handle QUIZ and FINAL_QUIZ types
  if (mod.type === "QUIZ" || mod.type === "FINAL_QUIZ") {
    // Check if quiz data exists
    const quizData = mod.quiz;
    if (!quizData) {
      console.warn(`Quiz module ${mod.title} has no quiz data`);
      return [{
        id:           `quiz-${mod.id}`,
        title:        mod.title,
        duration:     "0 marks",
        type:         "quiz" as const,
        quizId:       null,
        questions:    [],
        passingMarks: 0,
        totalMarks:   0,
        completed:    false,
        active:       false,
      }];
    }

    // Create quiz item with proper data
    return [{
      id:           `quiz-${mod.id}`,
      title:        mod.title,
      duration:     `${quizData.totalMarks ?? 0} marks`,
      type:         "quiz" as const,
      quizId:       quizData.id ?? null,
      questions:    quizData.questions ?? [],
      passingMarks: quizData.passingMarks ?? 0,
      totalMarks:   quizData.totalMarks ?? 0,
      completed:    false,
      active:       false,
    }];
  }

  // Default fallback
  console.warn(`Unknown module type: ${mod.type}`);
  return [];
}

function estimateDuration(lessonCount: number) {
  const mins = lessonCount * 20;
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`;
}