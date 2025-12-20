-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "language" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" VARCHAR(255);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);
