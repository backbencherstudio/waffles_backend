/*
  Warnings:

  - Added the required column `user_id` to the `extension_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "extension_requests" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "delivery_id" TEXT,
ADD COLUMN     "job_id" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "JOB"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_requests" ADD CONSTRAINT "extension_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
