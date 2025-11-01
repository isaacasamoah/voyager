-- CreateTable
CREATE TABLE "CartographerSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expertEmail" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topic" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "promptUpdates" JSONB NOT NULL,
    "ragEntries" JSONB NOT NULL,
    "finetuningExamples" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartographerSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartographerSession_sessionId_key" ON "CartographerSession"("sessionId");

-- CreateIndex
CREATE INDEX "CartographerSession_expertEmail_idx" ON "CartographerSession"("expertEmail");

-- CreateIndex
CREATE INDEX "CartographerSession_communityId_idx" ON "CartographerSession"("communityId");

-- CreateIndex
CREATE INDEX "CartographerSession_timestamp_idx" ON "CartographerSession"("timestamp");

-- CreateIndex
CREATE INDEX "CartographerSession_processed_idx" ON "CartographerSession"("processed");
