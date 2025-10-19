import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRaw<Array<{tablename: string}>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `
  console.log('Tables in database:')
  result.forEach(row => console.log(`  - ${row.tablename}`))

  await prisma.$disconnect()
}

main().catch(console.error)
