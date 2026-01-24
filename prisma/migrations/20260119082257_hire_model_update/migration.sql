/*
  Warnings:

  - You are about to drop the `Hire` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hire" DROP CONSTRAINT "Hire_user_id_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_hire_id_fkey";

-- DropTable
DROP TABLE "Hire";

-- CreateTable
CREATE TABLE "hires" (
    "id" TEXT NOT NULL,
    "project_title" TEXT NOT NULL,
    "video_category" "VideoCategory" NOT NULL,
    "project_photo" TEXT,
    "video_duration" "ContentLength" NOT NULL,
    "description" TEXT NOT NULL,
    "project_budget" DOUBLE PRECISION NOT NULL,
    "project_duration" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "software_preference" "SoftwarePreference"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hires_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hires" ADD CONSTRAINT "hires_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_hire_id_fkey" FOREIGN KEY ("hire_id") REFERENCES "hires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
