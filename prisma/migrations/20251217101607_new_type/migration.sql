/*
  Warnings:

  - You are about to drop the column `asd` on the `users` table. All the data in the column will be lost.
  - The `type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'CLIENT', 'EDITOR');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "asd",
DROP COLUMN "type",
ADD COLUMN     "type" "UserType" DEFAULT 'CLIENT';
