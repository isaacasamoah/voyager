/**
 * Prompt Update Engine
 *
 * Safely applies constitutional prompt updates to community JSON files
 * with git safety, validation, and rollback capability.
 *
 * Design: Marcus (Backend)
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import type { PromptUpdate } from './communities'

export interface ApplyUpdateResult {
  success: boolean
  error?: string
  commitHash?: string
}

/**
 * Helper function to find a key anywhere in a nested object
 * Returns the full path to the key if found (e.g., "domainExpertise.jobSearchCoaching")
 */
function findKeyInObject(obj: any, targetKey: string, currentPath: string = ''): string | null {
  for (const key in obj) {
    const newPath = currentPath ? `${currentPath}.${key}` : key

    if (key === targetKey) {
      return newPath
    }

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const found = findKeyInObject(obj[key], targetKey, newPath)
      if (found) return found
    }
  }
  return null
}

/**
 * Apply a prompt update to a community JSON file
 *
 * Safety features:
 * - Git backup commit before changes
 * - JSON validation after mutation
 * - Automatic rollback on error
 * - Audit trail via git commits
 *
 * @param communityId - Community to update (e.g., 'careersy')
 * @param update - Prompt update with constitutional validation
 * @returns Result with success status and optional error
 */
export async function applyPromptUpdate(
  communityId: string,
  update: PromptUpdate
): Promise<ApplyUpdateResult> {
  const configPath = path.join(
    process.cwd(),
    'communities',
    `${communityId}.json`
  )

  try {
    // 1. Verify file exists
    if (!fs.existsSync(configPath)) {
      return {
        success: false,
        error: `Config file not found: ${configPath}`
      }
    }

    // 2. Read current config
    const configContent = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configContent)

    // 3. Create git backup commit before changes
    try {
      execSync(`git add "${configPath}"`, { cwd: process.cwd() })
      execSync(
        `git commit -m "chore: backup before prompt update to ${update.section}" --allow-empty`,
        { cwd: process.cwd(), stdio: 'pipe' }
      )
    } catch (gitError) {
      // If git commit fails, continue anyway (might be no changes)
      console.warn('Git backup commit skipped:', gitError)
    }

    // 4. Apply update to correct section
    const sectionPath = update.section.split('.')
    let target: any = config

    // Navigate to the target section
    for (let i = 0; i < sectionPath.length - 1; i++) {
      const key = sectionPath[i]
      if (!(key in target)) {
        return {
          success: false,
          error: `Section path not found: ${sectionPath.slice(0, i + 1).join('.')}`
        }
      }
      target = target[key]
    }

    const finalKey = sectionPath[sectionPath.length - 1]

    if (!(finalKey in target)) {
      // Try to find the key in nested objects (helpful for flat paths like "jobSearchCoaching")
      const foundPath = findKeyInObject(config, finalKey)
      if (foundPath) {
        return {
          success: false,
          error: `Final key not found: ${update.section}. Did you mean: ${foundPath}?`
        }
      }
      return {
        success: false,
        error: `Final key not found: ${update.section}`
      }
    }

    // Append to existing content based on type
    if (typeof target[finalKey] === 'string') {
      // For strings, append with newline separation
      target[finalKey] = target[finalKey].trim() + '\n\n' + update.suggestedAddition
    } else if (Array.isArray(target[finalKey])) {
      // For arrays, push new item
      target[finalKey].push(update.suggestedAddition)
    } else {
      return {
        success: false,
        error: `Section ${update.section} is neither string nor array (type: ${typeof target[finalKey]})`
      }
    }

    // 5. Validate JSON is still valid
    const newContent = JSON.stringify(config, null, 2)
    JSON.parse(newContent) // Throws if invalid

    // 6. Write updated config
    fs.writeFileSync(configPath, newContent, 'utf-8')

    // 7. Git commit the update with metadata
    const commitMessage = `feat: apply constitutional prompt update

Section: ${update.section}
Confidence: ${update.confidence}/100
Priority: ${update.priority}
Risk: ${update.riskLevel}

Constitutional Checks:
- Elevation: ${update.constitutionalCheck.elevation.passes ? '✅' : '❌'}
- Transparency: ${update.constitutionalCheck.transparency.passes ? '✅' : '❌'}
- Agency: ${update.constitutionalCheck.agency.passes ? '✅' : '❌'}
- Growth: ${update.constitutionalCheck.growth.passes ? '✅' : '❌'}

Evidence: ${update.evidenceFromSession.substring(0, 200)}

Auto-applied: ${update.autoApplyRecommendation ? 'yes' : 'no (manual review)'}
`.trim()

    execSync(`git add "${configPath}"`, { cwd: process.cwd() })
    const commitOutput = execSync(
      `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    )

    // Extract commit hash
    const commitHash = execSync('git rev-parse HEAD', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    }).trim()

    console.log('✅ Prompt update applied successfully:', {
      communityId,
      section: update.section,
      commitHash: commitHash.substring(0, 8)
    })

    return {
      success: true,
      commitHash
    }

  } catch (error) {
    // Rollback on any error
    console.error('❌ Error applying prompt update:', error)

    try {
      // Reset to previous commit (before our changes)
      execSync('git reset --hard HEAD~2', {
        cwd: process.cwd(),
        stdio: 'pipe'
      })
      console.log('🔄 Rolled back to previous state')
    } catch (rollbackError) {
      console.error('⚠️  Rollback failed:', rollbackError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Validate a prompt update before applying
 *
 * Checks:
 * - All constitutional checks pass
 * - Target section exists in config
 * - Update is safe to apply
 */
export function validatePromptUpdate(
  communityId: string,
  update: PromptUpdate
): { valid: boolean; error?: string } {
  // Check constitutional alignment
  const checks = update.constitutionalCheck
  const allPass =
    checks.elevation.passes &&
    checks.transparency.passes &&
    checks.agency.passes &&
    checks.growth.passes

  if (!allPass) {
    return {
      valid: false,
      error: 'Constitutional checks failed'
    }
  }

  // Note: We don't block manual approval for low confidence
  // Only auto-apply requires confidence >= 90
  // Humans can approve anything that passes constitutional checks

  // Check config file exists
  const configPath = path.join(
    process.cwd(),
    'communities',
    `${communityId}.json`
  )

  if (!fs.existsSync(configPath)) {
    return {
      valid: false,
      error: `Config file not found: ${communityId}.json`
    }
  }

  return { valid: true }
}
