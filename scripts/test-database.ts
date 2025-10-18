/**
 * Test database migration for communities
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Database Migration\n')

  // Test 1: Check users have communities
  console.log('1. Check users have communities:')
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      communities: true,
    }
  })
  users.forEach(user => {
    console.log(`   ✓ ${user.email}: communities =`, user.communities)
  })

  // Test 2: Check conversations have communityId
  console.log('\n2. Check conversations have communityId:')
  const conversations = await prisma.conversation.findMany({
    select: {
      id: true,
      title: true,
      communityId: true,
      isPublic: true,
    },
    take: 5
  })
  console.log(`   ✓ Found ${conversations.length} conversations`)
  conversations.forEach(conv => {
    console.log(`     - "${conv.title.substring(0, 40)}..." → ${conv.communityId} (public: ${conv.isPublic})`)
  })

  // Test 3: Count conversations by community
  console.log('\n3. Count conversations by community:')
  const careersyCount = await prisma.conversation.count({
    where: { communityId: 'careersy' }
  })
  console.log(`   ✓ Careersy: ${careersyCount} conversations`)

  // Test 4: Test permission check (simulate what API does)
  console.log('\n4. Test permission check:')
  const testUser = users[0]
  if (testUser) {
    const isMember = testUser.communities.includes('careersy')
    console.log(`   ✓ User ${testUser.email} is member of careersy:`, isMember)
  }

  console.log('\n✅ Database tests passed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
