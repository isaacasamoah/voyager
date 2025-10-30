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

  /**
   * Careersy A/B Test Mode
   *
   * 'basic': ChatGPT + domain expertise only (what Eli originally asked for)
   * 'full': Claude + constitutional framework + cartographer mode (full Voyager)
   *
   * Tests whether Voyager features add value over simple GPT wrapper
   *
   * Default: 'full' - Experts get complete Voyager experience (including Cartographer)
   * Users can toggle to 'basic' via UI if they want to compare
   */
  CAREERSY_MODE: 'full' as 'basic' | 'full',
} as const;
