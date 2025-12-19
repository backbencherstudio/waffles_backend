/*
  Warnings:

  - You are about to drop the column `verifyed_at` on the `ucodes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ucodes" DROP COLUMN "verifyed_at",
ADD COLUMN     "verified_at" TIMESTAMP(3);
