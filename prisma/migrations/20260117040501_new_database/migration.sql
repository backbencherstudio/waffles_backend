-- CreateEnum
CREATE TYPE "ContentLength" AS ENUM ('1-5', '5-10', '10-15', '15-20', '20-30', '30-40', '40-50', '50-60', '60-120', '120+');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('LONG_FORM_VIDEO', 'SHORTS_REELS_TIKTOKS', 'THUMBNAILS', 'ADS_UGC', 'PODCASTS', 'WEDDINGS_EVENTS', 'COLOR_AUDIO', 'CAPTIONS_SUBTITLES');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'FACEBOOK', 'X', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'SNAPCHATS', 'PINTEREST', 'VIMEO', 'TWITCH', 'THREADS', 'OTHER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCEL');

-- CreateTable
CREATE TABLE "JOB" (
    "id" TEXT NOT NULL,
    "job_title" TEXT,
    "job_description" TEXT,
    "content_length" "ContentLength" NOT NULL,
    "project_budget" DOUBLE PRECISION,
    "job_category" "JobCategory" NOT NULL,
    "project_duration" TEXT,
    "platform" "Platform" NOT NULL,
    "skill" TEXT,
    "reference" TEXT,
    "total_payment" DOUBLE PRECISION,
    "fileId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "JOB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "bidder" TEXT,
    "amount" DOUBLE PRECISION,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttachmentToJOB" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AttachmentToJOB_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AttachmentToJOB_B_index" ON "_AttachmentToJOB"("B");

-- AddForeignKey
ALTER TABLE "JOB" ADD CONSTRAINT "JOB_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JOB"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToJOB" ADD CONSTRAINT "_AttachmentToJOB_A_fkey" FOREIGN KEY ("A") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToJOB" ADD CONSTRAINT "_AttachmentToJOB_B_fkey" FOREIGN KEY ("B") REFERENCES "JOB"("id") ON DELETE CASCADE ON UPDATE CASCADE;
