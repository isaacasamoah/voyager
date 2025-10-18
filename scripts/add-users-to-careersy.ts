import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update all users to be members of careersy
  const result = await prisma.user.updateMany({
    where: {
      communities: {
        equals: [],
      },
    },
    data: {
      communities: ['careersy'],
    },
  })

  console.log(`✓ Added ${result.count} users to careersy community`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
