-- Drop foreign key constraint to Community table (we're using JSON configs now)
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_communityId_fkey";

-- Drop Community and CommunityMember tables
DROP TABLE IF EXISTS "CommunityMember" CASCADE;
DROP TABLE IF EXISTS "Community" CASCADE;

-- Update NULL communityId values
UPDATE "Conversation" SET "communityId" = 'careersy' WHERE "communityId" IS NULL;

-- Update users with empty communities array
UPDATE "User" SET "communities" = ARRAY['careersy'] WHERE "communities" = '{}' OR "communities" IS NULL;
