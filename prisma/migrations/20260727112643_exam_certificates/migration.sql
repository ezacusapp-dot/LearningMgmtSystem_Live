-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('LESSON', 'REVISION', 'QUIZ', 'FINAL_QUIZ');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'PDF', 'DOCUMENT', 'ASSIGNMENT', 'LINK');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('Days', 'Weeks', 'Months', 'Years');

-- CreateEnum
CREATE TYPE "RevisionContentType" AS ENUM ('VIDEO', 'PDF');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('Draft', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Easy', 'Medium', 'Difficult', 'Challenging');

-- CreateEnum
CREATE TYPE "BloomLevel" AS ENUM ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('Conceptual', 'Prediction', 'Debugging', 'ProblemSolving');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('text', 'image');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trial', 'expired');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('MOCK', 'FINAL');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('Active', 'Inactive', 'Draft', 'Archived');

-- CreateEnum
CREATE TYPE "ExamDifficulty" AS ENUM ('Easy', 'Medium', 'Difficult', 'Challenging');

-- CreateEnum
CREATE TYPE "ExamQuestionType" AS ENUM ('Conceptual', 'Prediction', 'Debugging', 'ProblemSolving');

-- CreateEnum
CREATE TYPE "ExamBloomLevel" AS ENUM ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create');

-- CreateEnum
CREATE TYPE "ExamInputMode" AS ENUM ('text', 'image', 'code');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('Issued', 'Revoked', 'Expired');

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "students" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "subscription" "SubscriptionStatus" NOT NULL DEFAULT 'trial',
    "performance" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SCHOOL_ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_duration_types" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "unit" "DurationUnit" NOT NULL DEFAULT 'Months',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_duration_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validity_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validity_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#49205E',
    "icon" TEXT,
    "categoryLogo" TEXT,
    "categoryBackground" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT,
    "durationTypeId" TEXT,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseCode" TEXT,
    "includeRanking" BOOLEAN NOT NULL DEFAULT true,
    "includeScore" BOOLEAN NOT NULL DEFAULT true,
    "primaryColor" TEXT NOT NULL DEFAULT '#2A1B5D',
    "accentColor" TEXT NOT NULL DEFAULT '#C21E9A',
    "fontFamily" TEXT NOT NULL DEFAULT 'Playfair Display',
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "signature2Url" TEXT,
    "backgroundUrl" TEXT,
    "sealEnabled" BOOLEAN NOT NULL DEFAULT true,
    "qrPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "organizationName" TEXT NOT NULL DEFAULT 'CODE EXCELLENCE EDUTECH',
    "signatory1Name" TEXT NOT NULL DEFAULT 'Raina Bafna',
    "signatory1Role" TEXT NOT NULL DEFAULT 'Founder',
    "signatory2Name" TEXT NOT NULL DEFAULT 'Madhavi Patil',
    "signatory2Role" TEXT NOT NULL DEFAULT 'Co-Founder',
    "templateVersion" INTEGER NOT NULL DEFAULT 1,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationTypeId" TEXT,
    "thumbnailUrl" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'Draft',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT,
    "categoryId" TEXT,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_grades" (
    "courseId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,

    CONSTRAINT "course_grades_pkey" PRIMARY KEY ("courseId","gradeId")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ModuleType" NOT NULL DEFAULT 'LESSON',
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "fileUrl" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "award_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "award_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisions" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_contents" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "contentType" "RevisionContentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revision_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "passingMarks" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "difficulty" "Difficulty",
    "bloomLevel" "BloomLevel",
    "questionType" "QuestionType",
    "codeSnippet" TEXT,
    "codeLanguage" TEXT,
    "explanation" TEXT,
    "inputMode" "InputMode" NOT NULL DEFAULT 'text',
    "questionImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "inputMode" TEXT DEFAULT 'text',
    "imageData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "studentEmail" TEXT,
    "studentMobile" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "parentMobile" TEXT NOT NULL,
    "parentEmail" TEXT,
    "standard" TEXT NOT NULL,
    "batch" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "schoolYear" TEXT NOT NULL,
    "address" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_course_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "student_course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_module_progress" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "moduleId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_module_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_lesson_progress" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "lessonId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_quiz_attempts" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "score" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "timeTaken" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_section_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_section_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_section_template_items" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "difficulty" "ExamDifficulty" NOT NULL,
    "questionType" "ExamQuestionType",
    "defaultMarks" INTEGER NOT NULL,
    "defaultQuestions" INTEGER NOT NULL,
    "timeLimit" INTEGER,

    CONSTRAINT "exam_section_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT,
    "examType" "ExamType" NOT NULL DEFAULT 'MOCK',
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "passingMarks" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'Draft',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "showAnswers" BOOLEAN NOT NULL DEFAULT false,
    "showExplanations" BOOLEAN NOT NULL DEFAULT false,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "requireProctoring" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sections" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "difficulty" "ExamDifficulty" NOT NULL,
    "questionType" "ExamQuestionType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "sectionId" TEXT,
    "question" TEXT NOT NULL,
    "inputMode" "ExamInputMode" NOT NULL DEFAULT 'text',
    "questionImage" TEXT,
    "codeSnippet" TEXT,
    "codeLanguage" TEXT,
    "explanation" TEXT,
    "explanationImage" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "difficulty" "ExamDifficulty",
    "bloomLevel" "ExamBloomLevel",
    "questionType" "ExamQuestionType",
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "inputMode" "ExamInputMode" NOT NULL DEFAULT 'text',
    "imageData" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT,
    "studentId" INTEGER,
    "score" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION,
    "isPassed" BOOLEAN NOT NULL,
    "timeTaken" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempt_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_section_scores" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "isPassed" BOOLEAN,
    "totalQuestions" INTEGER NOT NULL,
    "correctlyAnswered" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_section_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'Issued',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "qrCodeUrl" TEXT,
    "verificationUrl" TEXT,
    "pdfUrl" TEXT,
    "studentNameSnapshot" TEXT NOT NULL,
    "courseNameSnapshot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "examAttemptId" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_certificates" (
    "id" TEXT NOT NULL,
    "certificateName" VARCHAR(150) NOT NULL,
    "designation" VARCHAR(150) NOT NULL,
    "colorCode" VARCHAR(7) NOT NULL,
    "percentFrom" DOUBLE PRECISION NOT NULL,
    "percentTo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "certificateName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "studentNameSnapshot" TEXT NOT NULL,
    "examTitleSnapshot" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" INTEGER NOT NULL,
    "examId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "bandId" TEXT,

    CONSTRAINT "exam_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_adminEmail_key" ON "schools"("adminEmail");

-- CreateIndex
CREATE UNIQUE INDEX "course_levels_name_key" ON "course_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "course_duration_types_value_unit_key" ON "course_duration_types"("value", "unit");

-- CreateIndex
CREATE UNIQUE INDEX "validity_periods_name_key" ON "validity_periods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grades_name_key" ON "grades"("name");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_code_key" ON "course_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_templates_courseId_key" ON "certificate_templates"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "modules_courseId_idx" ON "modules"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "modules_courseId_order_key" ON "modules"("courseId", "order");

-- CreateIndex
CREATE INDEX "lessons_moduleId_idx" ON "lessons"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_moduleId_order_key" ON "lessons"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "award_categories_name_key" ON "award_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "revisions_moduleId_key" ON "revisions"("moduleId");

-- CreateIndex
CREATE INDEX "revision_contents_revisionId_idx" ON "revision_contents"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_moduleId_key" ON "quizzes"("moduleId");

-- CreateIndex
CREATE INDEX "questions_quizId_idx" ON "questions"("quizId");

-- CreateIndex
CREATE INDEX "options_questionId_idx" ON "options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "students_username_key" ON "students"("username");

-- CreateIndex
CREATE INDEX "student_course_enrollments_studentId_idx" ON "student_course_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "student_course_enrollments_courseId_idx" ON "student_course_enrollments"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "student_course_enrollments_studentId_courseId_key" ON "student_course_enrollments"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "student_module_progress_studentId_idx" ON "student_module_progress"("studentId");

-- CreateIndex
CREATE INDEX "student_module_progress_moduleId_idx" ON "student_module_progress"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "student_module_progress_studentId_moduleId_key" ON "student_module_progress"("studentId", "moduleId");

-- CreateIndex
CREATE INDEX "student_lesson_progress_studentId_idx" ON "student_lesson_progress"("studentId");

-- CreateIndex
CREATE INDEX "student_lesson_progress_lessonId_idx" ON "student_lesson_progress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "student_lesson_progress_studentId_lessonId_key" ON "student_lesson_progress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "student_quiz_attempts_studentId_idx" ON "student_quiz_attempts"("studentId");

-- CreateIndex
CREATE INDEX "student_quiz_attempts_quizId_idx" ON "student_quiz_attempts"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "student_quiz_attempts_studentId_quizId_key" ON "student_quiz_attempts"("studentId", "quizId");

-- CreateIndex
CREATE INDEX "student_quiz_answers_attemptId_idx" ON "student_quiz_answers"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_section_template_items_templateId_order_key" ON "exam_section_template_items"("templateId", "order");

-- CreateIndex
CREATE INDEX "exams_courseId_idx" ON "exams"("courseId");

-- CreateIndex
CREATE INDEX "exams_examType_idx" ON "exams"("examType");

-- CreateIndex
CREATE INDEX "exams_status_idx" ON "exams"("status");

-- CreateIndex
CREATE INDEX "exam_sections_examId_idx" ON "exam_sections"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_sections_examId_order_key" ON "exam_sections"("examId", "order");

-- CreateIndex
CREATE INDEX "exam_questions_examId_idx" ON "exam_questions"("examId");

-- CreateIndex
CREATE INDEX "exam_questions_sectionId_idx" ON "exam_questions"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_examId_order_key" ON "exam_questions"("examId", "order");

-- CreateIndex
CREATE INDEX "exam_options_questionId_idx" ON "exam_options"("questionId");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_idx" ON "exam_attempts"("examId");

-- CreateIndex
CREATE INDEX "exam_attempts_userId_idx" ON "exam_attempts"("userId");

-- CreateIndex
CREATE INDEX "exam_attempts_studentId_idx" ON "exam_attempts"("studentId");

-- CreateIndex
CREATE INDEX "exam_attempt_answers_attemptId_idx" ON "exam_attempt_answers"("attemptId");

-- CreateIndex
CREATE INDEX "exam_section_scores_attemptId_idx" ON "exam_section_scores"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_section_scores_attemptId_sectionId_key" ON "exam_section_scores"("attemptId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateNumber_key" ON "certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_examAttemptId_key" ON "certificates"("examAttemptId");

-- CreateIndex
CREATE INDEX "certificates_studentId_idx" ON "certificates"("studentId");

-- CreateIndex
CREATE INDEX "certificates_courseId_idx" ON "certificates"("courseId");

-- CreateIndex
CREATE INDEX "certificates_templateId_idx" ON "certificates"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_studentId_courseId_key" ON "certificates"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "achievement_certificates_percentFrom_percentTo_idx" ON "achievement_certificates"("percentFrom", "percentTo");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_certificates_certificateName_key" ON "achievement_certificates"("certificateName");

-- CreateIndex
CREATE UNIQUE INDEX "exam_certificates_certificateNumber_key" ON "exam_certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "exam_certificates_attemptId_key" ON "exam_certificates"("attemptId");

-- CreateIndex
CREATE INDEX "exam_certificates_studentId_idx" ON "exam_certificates"("studentId");

-- CreateIndex
CREATE INDEX "exam_certificates_examId_idx" ON "exam_certificates"("examId");

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "course_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_durationTypeId_fkey" FOREIGN KEY ("durationTypeId") REFERENCES "course_duration_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_durationTypeId_fkey" FOREIGN KEY ("durationTypeId") REFERENCES "course_duration_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "course_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "course_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_grades" ADD CONSTRAINT "course_grades_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_grades" ADD CONSTRAINT "course_grades_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_contents" ADD CONSTRAINT "revision_contents_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_enrollments" ADD CONSTRAINT "student_course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_enrollments" ADD CONSTRAINT "student_course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_lesson_progress" ADD CONSTRAINT "student_lesson_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_lesson_progress" ADD CONSTRAINT "student_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_lesson_progress" ADD CONSTRAINT "student_lesson_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "student_course_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_quiz_attempts" ADD CONSTRAINT "student_quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_quiz_attempts" ADD CONSTRAINT "student_quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_quiz_attempts" ADD CONSTRAINT "student_quiz_attempts_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "student_course_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_quiz_answers" ADD CONSTRAINT "student_quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "student_quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_quiz_answers" ADD CONSTRAINT "student_quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_quiz_answers" ADD CONSTRAINT "student_quiz_answers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_section_template_items" ADD CONSTRAINT "exam_section_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "exam_section_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "exam_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_options" ADD CONSTRAINT "exam_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "exam_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "exam_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_section_scores" ADD CONSTRAINT "exam_section_scores_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_section_scores" ADD CONSTRAINT "exam_section_scores_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "exam_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "certificate_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_examAttemptId_fkey" FOREIGN KEY ("examAttemptId") REFERENCES "exam_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_certificates" ADD CONSTRAINT "exam_certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_certificates" ADD CONSTRAINT "exam_certificates_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_certificates" ADD CONSTRAINT "exam_certificates_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_certificates" ADD CONSTRAINT "exam_certificates_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "achievement_certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
