-- Add approval tracking fields to CartographerSession
ALTER TABLE "CartographerSession"
  ADD COLUMN "appliedUpdates" INTEGER[] DEFAULT '{}',
  ADD COLUMN "rejectedUpdates" INTEGER[] DEFAULT '{}',
  ADD COLUMN "appliedAt" TIMESTAMP,
  ADD COLUMN "appliedBy" TEXT;
