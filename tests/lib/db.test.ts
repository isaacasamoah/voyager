import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'

/**
 * Database Tests: Prisma Client
 *
 * Verifies database connection and schema:
 * - Prisma client initialization
 * - Model availability
 * - Community schema
 */

describe('Database Client', () => {
  it('should initialize Prisma client', () => {
    expect(prisma).toBeDefined()
  })

  it('should have User model', () => {
    expect(prisma.user).toBeDefined()
  })

  it('should have Conversation model', () => {
    expect(prisma.conversation).toBeDefined()
  })

  it('should have Message model', () => {
    expect(prisma.message).toBeDefined()
  })

  it('should have Community model (new)', () => {
    expect(prisma.community).toBeDefined()
  })

  it('should have CommunityMember model (new)', () => {
    expect(prisma.communityMember).toBeDefined()
  })

  it('should have Vote model (new)', () => {
    expect(prisma.vote).toBeDefined()
  })

  it('should have Validation model (new)', () => {
    expect(prisma.validation).toBeDefined()
  })

  it('should have TrainingData model (new)', () => {
    expect(prisma.trainingData).toBeDefined()
  })
})
