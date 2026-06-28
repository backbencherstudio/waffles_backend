-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "reviewId" TEXT;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(300),
    "communication_quality" INTEGER,
    "on_time_delivery" INTEGER,
    "value_for_money" INTEGER,
    "would_recommend" INTEGER,
    "user_id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
