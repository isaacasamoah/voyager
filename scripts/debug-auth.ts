import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugAuth() {
  console.log('\n🔍 Auth Debugging Info\n')

  // Check environment variables
  console.log('📝 Environment Variables:')
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ NOT SET'}`)
  console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ NOT SET'}`)
  console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET'}`)
  console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`)
  console.log('')

  // Check users
  const userCount = await prisma.user.count()
  console.log(`👥 Total Users: ${userCount}`)

  // Check sessions
  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: { email: true }
      }
    },
    take: 5,
    orderBy: { expires: 'desc' }
  })

  console.log(`\n🔐 Recent Sessions: ${sessions.length}`)
  sessions.forEach(session => {
    const isExpired = new Date(session.expires) < new Date()
    console.log(`  - ${session.user.email}: ${isExpired ? '❌ EXPIRED' : '✅ VALID'} (expires: ${session.expires})`)
  })

  // Check accounts
  const accounts = await prisma.account.findMany({
    include: {
      user: {
        select: { email: true }
      }
    }
  })

  console.log(`\n🔗 OAuth Accounts: ${accounts.length}`)
  accounts.forEach(account => {
    console.log(`  - ${account.user.email}: ${account.provider}`)
  })

  await prisma.$disconnect()
}

debugAuth()
