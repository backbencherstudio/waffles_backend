-- AlterTable
ALTER TABLE "portfolios" ALTER COLUMN "project_type" DROP NOT NULL,
ALTER COLUMN "project_type" SET DATA TYPE TEXT;
