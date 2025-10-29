/**
 * Feature Flags
 *
 * Used for A/B testing and gradual rollouts of new features.
 */

export const FEATURE_FLAGS = {
  /**
   * Constitutional Layer
   *
   * When true: Prepends Voyager constitution to all prompts
   * When false: Uses standard mode prompts only
   *
   * Use for A/B testing the constitutional framework's impact
   * on user experience and alignment with principles.
   */
  USE_CONSTITUTIONAL_LAYER: true, // Enabled: Voyager constitutional framework active
} as const;
