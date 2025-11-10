import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * One-time cleanup script to remove failed migration record
 *
 * This fixes the P3009 error where Prisma refuses to run new migrations
 * because it found a failed migration in the _prisma_migrations table.
 *
 * Usage: GET /api/migrate/cleanup?key=YOUR_SECRET
 *
 * After running once, this endpoint should be deleted for security.
 */
export async function GET(req: NextRequest) {
  try {
    // Security check
    const secretKey = req.nextUrl.searchParams.get('key')
    const validKey = process.env.MIGRATION_SECRET_KEY || 'voyager-migrate-2025'

    if (secretKey !== validKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide correct migration key.' },
        { status: 401 }
      )
    }

    console.log('🧹 Cleaning up failed migration records...')

    // Delete the failed migration record
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM _prisma_migrations
      WHERE migration_name = '20251109212703_add_context_anchors_and_output_artifacts'
      AND finished_at IS NULL;
    `)

    console.log(`✅ Deleted ${result} failed migration record(s)`)

    // Also check for the renamed migration just in case
    const result2 = await prisma.$executeRawUnsafe(`
      DELETE FROM _prisma_migrations
      WHERE migration_name = '20251109214217_add_context_anchors_and_output_artifacts'
      AND finished_at IS NULL;
    `)

    console.log(`✅ Deleted ${result2} additional failed migration record(s)`)

    return NextResponse.json({
      success: true,
      message: 'Failed migration records cleaned up',
      deletedCount: result + result2,
      nextSteps: [
        '1. Trigger a new Vercel deployment (git push or manual redeploy)',
        '2. Migrations should now run successfully',
        '3. Delete this cleanup endpoint for security: app/api/migrate/cleanup/route.ts'
      ]
    })

  } catch (error) {
    console.error('❌ Cleanup failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })

  } finally {
    await prisma.$disconnect()
  }
}
