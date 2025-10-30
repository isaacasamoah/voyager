import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Migration API Endpoint
 *
 * SECURITY: This should only be accessible in development or with proper auth
 * For production, run migrations via Vercel build process or manually
 *
 * Usage: Visit /api/migrate in your browser to run pending migrations
 */
export async function GET(req: NextRequest) {
  try {
    // Security check: Only allow in development or with secret key
    const isDev = process.env.NODE_ENV === 'development'
    const secretKey = req.nextUrl.searchParams.get('key')
    const validKey = process.env.MIGRATION_SECRET_KEY || 'voyager-migrate-2025'

    if (!isDev && secretKey !== validKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide correct migration key.' },
        { status: 401 }
      )
    }

    console.log('🔄 Running database migrations...')

    // Run Prisma migrate deploy
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy')

    console.log('✅ Migration output:', stdout)
    if (stderr) console.warn('⚠️ Migration warnings:', stderr)

    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
      output: stdout,
      warnings: stderr || null
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : String(error),
      hint: 'Check that DATABASE_URL is set correctly in environment variables'
    }, { status: 500 })
  }
}
