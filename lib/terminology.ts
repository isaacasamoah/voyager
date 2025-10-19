/**
 * Voyage terminology helpers
 * Client-safe (no Node.js dependencies)
 */

export interface VoyageTerminology {
  voyage: string      // Default: "voyage" (previously "community")
  course: string      // Default: "course" (previously "conversation")
  log: string         // Default: "log" (previously "message")
  navigator: string   // Default: "navigator" (previously "expert")
}

export const DEFAULT_TERMINOLOGY: VoyageTerminology = {
  voyage: 'voyage',
  course: 'course',
  log: 'log',
  navigator: 'navigator',
}

export function getVoyageTerminology(config: { terminology?: Partial<VoyageTerminology> }): VoyageTerminology {
  return {
    ...DEFAULT_TERMINOLOGY,
    ...config.terminology,
  }
}
