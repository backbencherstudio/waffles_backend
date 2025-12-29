/*
  Warnings:

  - You are about to drop the column `degree` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `end_year` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `field_of_study` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `institution` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `start_year` on the `educations` table. All the data in the column will be lost.
  - The `skill_name` column on the `skills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `certifications` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `course_name` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passing_year` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `portfolios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_user_id_fkey";

-- AlterTable
ALTER TABLE "educations" DROP COLUMN "degree",
DROP COLUMN "description",
DROP COLUMN "end_year",
DROP COLUMN "field_of_study",
DROP COLUMN "institution",
DROP COLUMN "start_year",
ADD COLUMN     "course_name" TEXT NOT NULL,
ADD COLUMN     "passing_year" INTEGER NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN     "project_type" TEXT[],
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "skill_name",
ADD COLUMN     "skill_name" TEXT[];

-- DropTable
DROP TABLE "certifications";

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
