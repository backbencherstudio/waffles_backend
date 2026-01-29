/*
  Warnings:

  - The `project_duration` column on the `JOB` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "JOB" DROP COLUMN "project_duration",
ADD COLUMN     "project_duration" DOUBLE PRECISION;
