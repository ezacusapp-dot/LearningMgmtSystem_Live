/*
  Warnings:

  - A unique constraint covering the columns `[userId,quizId]` on the table `user_quiz_attempts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_course_enrollments" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_lesson_progress" ADD COLUMN     "enrollmentId" TEXT;

-- AlterTable
ALTER TABLE "user_quiz_attempts" ADD COLUMN     "enrollmentId" TEXT;

-- DropEnum
DROP TYPE "CourseStatusEnum";

-- CreateIndex
CREATE UNIQUE INDEX "user_quiz_attempts_userId_quizId_key" ON "user_quiz_attempts"("userId", "quizId");

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "user_course_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_attempts" ADD CONSTRAINT "user_quiz_attempts_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "user_course_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
