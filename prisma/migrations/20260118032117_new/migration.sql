/*
  Warnings:

  - You are about to alter the column `language` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JOB` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AttachmentToJOB` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_user_id_fkey";

-- DropForeignKey
ALTER TABLE "JOB" DROP CONSTRAINT "JOB_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_AttachmentToJOB" DROP CONSTRAINT "_AttachmentToJOB_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttachmentToJOB" DROP CONSTRAINT "_AttachmentToJOB_B_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "language" DROP NOT NULL,
ALTER COLUMN "language" DROP DEFAULT,
ALTER COLUMN "language" SET DATA TYPE VARCHAR(100);

-- DropTable
DROP TABLE "Bid";

-- DropTable
DROP TABLE "JOB";

-- DropTable
DROP TABLE "_AttachmentToJOB";

-- DropEnum
DROP TYPE "ContentLength";

-- DropEnum
DROP TYPE "JobCategory";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "Platform";
