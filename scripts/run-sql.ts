import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  const sql = readFileSync(join(__dirname, 'drop-community-fk.sql'), 'utf-8')
  const statements = sql.split(';').filter(s => s.trim())

  for (const statement of statements) {
    console.log('Running:', statement.trim().substring(0, 80) + '...')
    await prisma.$executeRawUnsafe(statement)
  }

  console.log('✓ SQL executed successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
