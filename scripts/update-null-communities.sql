-- Update all NULL communityId values to 'careersy'
UPDATE "Conversation" SET "communityId" = 'careersy' WHERE "communityId" IS NULL;

-- Update all users to have careersy in their communities array (if not already)
UPDATE "User" SET "communities" = ARRAY['careersy'] WHERE "communities" = '{}' OR "communities" IS NULL;
