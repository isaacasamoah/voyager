import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Communities are now managed via JSON configs in /communities/*.json
  // This seed script just ensures all users are members of the careersy community

  // Get all users and add them to careersy community
  const users = await prisma.user.findMany()

  for (const user of users) {
    if (!user.communities || !user.communities.includes('careersy')) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          communities: {
            push: 'careersy'
          }
        },
      })
      console.log(`✅ Added user ${user.email} to careersy community`)
    } else {
      console.log(`ℹ️  User ${user.email} already in careersy community`)
    }
  }

  // All conversations now default to 'careersy' via schema default
  console.log('ℹ️  All conversations automatically assigned to careersy via schema default')

  console.log('✅ Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
