/*
  Warnings:

  - The `req_date` column on the `Bid` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "req_date",
ADD COLUMN     "req_date" DOUBLE PRECISION;
