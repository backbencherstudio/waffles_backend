/*
  Warnings:

  - The `project_duration` column on the `hires` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "hires" ALTER COLUMN "project_budget" DROP NOT NULL,
DROP COLUMN "project_duration",
ADD COLUMN     "project_duration" DOUBLE PRECISION,
ALTER COLUMN "total_amount" DROP NOT NULL;
