/**
 * Migration script to add community support to existing data
 * Assigns all existing conversations and users to 'careersy' community
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting community migration...')

  // Update all existing conversations to belong to 'careersy'
  const conversationUpdate = await prisma.conversation.updateMany({
    where: {
      communityId: null,
    },
    data: {
      communityId: 'careersy',
    },
  })
  console.log(`✓ Updated ${conversationUpdate.count} conversations to careersy community`)

  // Update all existing users to be members of 'careersy'
  const users = await prisma.user.findMany()
  let userCount = 0
  for (const user of users) {
    if (!user.communities || user.communities.length === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          communities: ['careersy'],
        },
      })
      userCount++
    }
  }
  console.log(`✓ Updated ${userCount} users to careersy community`)

  console.log('Migration complete!')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
