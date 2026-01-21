/*
  Warnings:

  - You are about to drop the column `creator_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `participant_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the `_AttachmentToJOB` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AttachmentToJOB" DROP CONSTRAINT "_AttachmentToJOB_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttachmentToJOB" DROP CONSTRAINT "_AttachmentToJOB_B_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_attachment_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "creator_id",
DROP COLUMN "participant_id";

-- DropTable
DROP TABLE "_AttachmentToJOB";

-- DropTable
DROP TABLE "attachments";

-- DropTable
DROP TABLE "messages";

-- DropEnum
DROP TYPE "MessageStatus";

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "conversation_id" TEXT,
    "user_id" TEXT,
    "role" TEXT DEFAULT 'participant',
    "joined_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_conversation_id_user_id_key" ON "participants"("conversation_id", "user_id");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
