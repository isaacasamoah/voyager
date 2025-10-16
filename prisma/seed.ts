import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Careersy Career Coaching community
  const community = await prisma.community.upsert({
    where: { slug: 'careersy-career-coaching' },
    update: {},
    create: {
      name: 'Careersy Career Coaching',
      slug: 'careersy-career-coaching',
      description: 'A community for tech professionals in Australia to share career advice, interview tips, and industry insights.',
    },
  })

  console.log(`✅ Created community: ${community.name} (${community.id})`)

  // Get all users and add them to the community as members
  const users = await prisma.user.findMany()

  for (const user of users) {
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: user.id,
        },
      },
    })

    if (!existingMember) {
      await prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: user.id,
          role: 'member',
        },
      })
      console.log(`✅ Added user ${user.email} to community`)
    }
  }

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
