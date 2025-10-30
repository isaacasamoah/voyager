-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "curateMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publishedPostId" TEXT,
ADD COLUMN "contentType" TEXT NOT NULL DEFAULT 'message';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "isPost" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Conversation_publishedPostId_idx" ON "Conversation"("publishedPostId");
