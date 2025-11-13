# Database Migration Workflow

**Last Updated:** Nov 9, 2025
**Purpose:** Prevent migration disasters. Follow this exactly.

---

## Overview: How Our Database Setup Works

### Three Separate Databases (Neon)

```
┌─────────────────────────────────────────────────────────────┐
│ LOCAL (dev machine)                                         │
│ - Your own Neon branch OR local Postgres                   │
│ - Full control, safe to break                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PREVIEW (Vercel branch deployments)                         │
│ - Each git branch gets its own Neon database branch         │
│ - Created automatically by Vercel                           │
│ - Safe to experiment                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION (live users)                                     │
│ - Main Neon database                                        │
│ - Connected to main/production Vercel deployment           │
│ - NEVER experiment here                                     │
└─────────────────────────────────────────────────────────────┘
```

### What Migrations Track

Every time you run a migration, Prisma records it in `_prisma_migrations` table:
- Migration name (timestamp + description)
- When it started
- When it finished
- If it failed

**Critical:** Once a migration is marked as "applied", Prisma skips it. If marked as "failed", Prisma refuses to run ANY new migrations until you fix it.

---

## The Golden Rules

### ✅ ALWAYS DO THIS

1. **Make schema changes in `prisma/schema.prisma` first**
   - Never manually edit the database
   - Schema is source of truth

2. **Use `prisma migrate dev` in local development**
   - Creates migration files
   - Applies them to your local database
   - Commits the migration files to git

3. **Test migrations in preview environments before production**
   - Push to a branch
   - Let Vercel create a preview deployment
   - Verify migration succeeded in preview
   - Test the feature works

4. **Let Vercel handle production migrations automatically**
   - When you merge to main/production branch
   - Vercel runs `prisma migrate deploy` during build
   - This applies pending migrations

### ❌ NEVER DO THIS

1. **NEVER use `prisma db push` in production**
   - It bypasses migrations entirely
   - Creates tables without migration records
   - Causes the exact problem we just fixed
   - Only use in local dev for rapid prototyping

2. **NEVER manually run SQL in production without a migration**
   - If you CREATE TABLE manually, Prisma doesn't know about it
   - Future migrations will fail trying to create that table

3. **NEVER commit schema changes without migration files**
   - If `prisma/schema.prisma` changes, must have matching migration
   - Git should always have: schema change + migration file together

4. **NEVER ignore failed migrations**
   - If Vercel build fails with migration error, stop everything
   - Fix it immediately before pushing more code
   - Failed migrations block ALL future migrations

---

## Step-by-Step Workflows

### Workflow 1: Adding a New Table/Column (Local → Preview → Production)

**Step 1: Local Development**

```bash
# 1. Edit schema
vim prisma/schema.prisma

# 2. Create migration (gives it a name and timestamp)
npx prisma migrate dev --name add_user_preferences

# This does 3 things:
# - Creates prisma/migrations/YYYYMMDDHHMMSS_add_user_preferences/migration.sql
# - Applies the migration to your local database
# - Regenerates Prisma Client

# 3. Test locally
npm run dev
# Verify feature works

# 4. Commit everything together
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add user preferences table"
```

**Step 2: Preview Environment**

```bash
# 1. Push to feature branch
git push origin feature/user-preferences

# 2. Vercel automatically:
# - Creates preview deployment
# - Creates Neon database branch
# - Runs: npm install (which runs postinstall)
# - postinstall runs: prisma generate && prisma migrate deploy
# - Migration applies to preview database

# 3. Test in preview
# Visit preview URL, verify feature works

# 4. Check Vercel build logs
# Make sure you see: "1 migration applied successfully"
```

**Step 3: Production**

```bash
# 1. Merge to main/develop (whatever deploys to production)
git checkout main
git merge feature/user-preferences
git push origin main

# 2. Vercel production deployment automatically:
# - Runs postinstall
# - Applies migration to production database
# - Deploys new code

# 3. Verify in production
# Check logs, test feature
```

### Workflow 2: Recovery - Failed Migration in Production

**Symptoms:**
- Vercel build fails with: "P3009: migrate found failed migrations"
- OR: "P3018: migration failed to apply" (table already exists, etc.)

**Recovery Steps:**

```bash
# Step 1: Identify the problem
# - Check Vercel build logs
# - Note the migration name that failed
# - Understand WHY it failed (table exists? syntax error?)

# Step 2: Create cleanup script (like we just did)
# Create: app/api/migrate/cleanup/route.ts
# This script deletes the failed migration record from _prisma_migrations

# Step 3: Temporarily disable migrations
# Edit package.json:
"postinstall": "prisma generate"  // Remove "&& prisma migrate deploy"

# Commit and push - deployment will succeed

# Step 4: Run cleanup script
# Visit: /api/migrate/cleanup?key=YOUR_SECRET
# This deletes the failed migration record

# Step 5: Fix the actual migration issue
# - If table exists: Make migration idempotent (CREATE TABLE IF NOT EXISTS)
# - If syntax error: Fix the SQL
# - If wrong approach: Delete migration, create new one

# Step 6: Re-enable migrations
# Edit package.json:
"postinstall": "prisma generate && prisma migrate deploy"

# Commit and push - migration should succeed now

# Step 7: Delete cleanup script
rm -rf app/api/migrate/cleanup
git add -A && git commit -m "chore: remove cleanup script"
```

---

## Common Scenarios

### Scenario: "I need to quickly prototype - can I skip migrations?"

**Local dev only:**
```bash
# Yes, use db push for rapid iteration
npx prisma db push

# BUT: Before committing, create proper migration:
npx prisma migrate dev --name your_changes
```

**Preview/Production:**
- NO. Always use migrations.

### Scenario: "I need to modify an existing migration"

**If NOT yet in production:**
```bash
# Delete the migration file
rm -rf prisma/migrations/TIMESTAMP_migration_name

# Reset your local database
npx prisma migrate reset

# Recreate the migration
npx prisma migrate dev --name migration_name
```

**If ALREADY in production:**
- DON'T modify it
- Create a NEW migration with the changes
- Migrations are immutable once applied

### Scenario: "Production database is out of sync with schema"

**Prevention is key:**
1. Always check Vercel build logs
2. If migration fails, fix immediately
3. Don't push more code until migrations work

**If it happens:**
- Use the recovery workflow above
- Consider: Does the migration need to be idempotent?
- Consider: Did someone manually modify production database?

---

## Checklist Before Every Push

```
□ Schema changes are in prisma/schema.prisma
□ Migration files exist in prisma/migrations/
□ Migration tested locally (npx prisma migrate dev ran successfully)
□ Code tested with new schema
□ No direct database modifications
□ Committed schema + migrations together
```

---

## Neon-Specific Notes

### Branch Databases
- Vercel automatically creates Neon branches for preview deployments
- Each branch is isolated - safe to experiment
- Production database is the main branch

### Connection Strings
- `DATABASE_URL` - for migrations and queries
- `DIRECT_URL` - for connection pooling (not needed for small scale)

### Checking Current Database
```bash
# In Vercel logs, look for:
"Applying migration `20251109_migration_name`"

# In Neon dashboard:
# - See all branches
# - Check which branch is connected to which deployment
```

---

## Emergency Contacts

**If migrations are broken and blocking deployment:**

1. Check this guide first (Recovery workflow)
2. Check Vercel build logs for exact error
3. Check Neon dashboard for database state
4. If stuck: Create one-time cleanup script (see Recovery Steps)

**Never:**
- Manually delete migrations from git without fixing database
- Force push to remove migrations (database will still have them)
- Ignore the error and keep pushing code

---

## Why This Matters

**What we just experienced:**
1. Tables were created in production (probably via `db push` or manual SQL)
2. We tried to create migrations for existing tables
3. Migration failed (table already exists)
4. Prisma marked migration as failed in `_prisma_migrations` table
5. All future migrations blocked until we cleaned up the failed record

**Prevention:**
- Follow this workflow exactly
- Migrations are source of truth
- Never modify database without migrations
- Test in preview before production

---

## Summary: The Happy Path

```bash
# 1. Edit schema
vim prisma/schema.prisma

# 2. Create migration locally
npx prisma migrate dev --name descriptive_name

# 3. Test locally
npm run dev

# 4. Commit
git add prisma/
git commit -m "feat(db): add awesome feature"

# 5. Push to feature branch
git push origin feature/awesome

# 6. Test in Vercel preview
# Check build logs: ✅ Migrations applied successfully

# 7. Merge to main
# Vercel production deploy: ✅ Migrations applied successfully

# 8. Celebrate 🎉
```

Follow this. Every time. No exceptions.
