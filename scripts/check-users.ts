import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      createdAt: true,
    },
  })

  console.log('📊 Users in database:\n')
  users.forEach(user => {
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Stripe Sub ID: ${user.stripeSubscriptionId || 'NONE ❌'}`)
    console.log(`Period End: ${user.stripeCurrentPeriodEnd || 'NONE ❌'}`)
    console.log(`Has Active Sub: ${!!user.stripeSubscriptionId ? '✅ YES' : '❌ NO'}`)
    console.log(`Created: ${user.createdAt}`)
    console.log('---')
  })

  await prisma.$disconnect()
}

checkUsers()
