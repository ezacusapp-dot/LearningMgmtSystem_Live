// lib/student-session.ts
"use client";

import { useEffect, useState } from "react";

export interface StudentSession {
  userId: string;
  name: string;
  courseId?: string;
  studentEmail?: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  id?: number;
}

// Get session from localStorage
export function getStudentSession(): StudentSession | null {
  if (typeof window !== "undefined") {
    const studentData = localStorage.getItem("studentData");
    if (studentData) {
      try {
        const data = JSON.parse(studentData);
        return {
          userId: data.id?.toString() || data.userId || "unknown",
          name: data.firstName 
            ? `${data.firstName} ${data.lastName || ''}`.trim()
            : data.username || "Student",
          studentEmail: data.studentEmail,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || "STUDENT",
          id: data.id,
          courseId: data.courseId || undefined,
        };
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Your hook - returns actual student data
export function useStudentSession(): StudentSession {
  const [session, setSession] = useState<StudentSession>({
    userId: "loading...",
    name: "Loading...",
    courseId: undefined,
  });

  useEffect(() => {
    const stored = getStudentSession();
    if (stored) {
      setSession(stored);
    } else {
      // Fallback when no session exists
      setSession({
        userId: "guest",
        name: "Guest",
        courseId: undefined,
      });
    }
  }, []);

  return session;
}

// Optional: Listen for storage changes (if you log in/out in different tabs)
export function useStudentSessionSync() {
  const [session, setSession] = useState<StudentSession | null>(() => getStudentSession());

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "studentData") {
        setSession(getStudentSession());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return session;
}