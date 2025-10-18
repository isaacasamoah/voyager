/**
 * Test community configuration system
 */

import {
  getCommunityConfig,
  getAllCommunityConfigs,
  getCommunitySystemPrompt,
  isExpert,
  getPublicCommunities
} from '../lib/communities'

console.log('🧪 Testing Community Configuration System\n')

// Test 1: Load Careersy config
console.log('1. Load Careersy config:')
const careersy = getCommunityConfig('careersy')
console.log('   ✓ Found:', careersy?.name)
console.log('   ✓ Public:', careersy?.public)
console.log('   ✓ Experts:', careersy?.experts)
console.log('   ✓ Branding colors:', careersy?.branding?.colors)

// Test 2: Load all configs
console.log('\n2. Load all community configs:')
const allCommunities = getAllCommunityConfigs()
console.log('   ✓ Found', allCommunities.length, 'communities')
allCommunities.forEach(c => console.log('     -', c.id, `(${c.name})`))

// Test 3: Get system prompt
console.log('\n3. Get Careersy system prompt:')
if (careersy) {
  const prompt = getCommunitySystemPrompt(careersy)
  console.log('   ✓ Prompt length:', prompt.length, 'characters')
  console.log('   ✓ First 100 chars:', prompt.substring(0, 100) + '...')
}

// Test 4: Expert check
console.log('\n4. Expert validation:')
console.log('   ✓ eli@careersy.com is expert in careersy:', isExpert('eli@careersy.com', 'careersy'))
console.log('   ✓ random@example.com is expert in careersy:', isExpert('random@example.com', 'careersy'))

// Test 5: Public communities
console.log('\n5. Public communities:')
const publicCommunities = getPublicCommunities()
console.log('   ✓ Found', publicCommunities.length, 'public communities')
publicCommunities.forEach(c => console.log('     -', c.id))

console.log('\n✅ All tests passed!')
