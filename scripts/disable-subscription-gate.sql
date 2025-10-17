-- Temporarily disable subscription gate by giving all users fake subscriptions
-- This is for development/testing only

UPDATE "User"
SET
  "stripeSubscriptionId" = 'sub_dev_' || id,
  "stripeCurrentPeriodEnd" = NOW() + INTERVAL '1 year'
WHERE "stripeSubscriptionId" IS NULL;

-- Verify
SELECT
  id,
  email,
  "stripeSubscriptionId",
  "stripeCurrentPeriodEnd"
FROM "User";
