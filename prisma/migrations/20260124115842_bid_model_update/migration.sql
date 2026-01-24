/*
  Warnings:

  - You are about to drop the column `bidder` on the `Bid` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "bidder",
ADD COLUMN     "req_date" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
