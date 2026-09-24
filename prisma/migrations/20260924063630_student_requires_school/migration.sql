-- AlterTable
ALTER TABLE "students" ADD COLUMN     "schoolId" TEXT;

-- CreateIndex
CREATE INDEX "students_schoolId_idx" ON "students"("schoolId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
