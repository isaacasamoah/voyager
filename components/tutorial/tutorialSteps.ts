import { TutorialStep } from './TutorialOverlay'

export const CAREERSY_TUTORIAL: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Careersy Wingman! 👋',
    description: 'Your AI career coach for the ANZ tech market. Here\'s a quick tour - you\'ll be able to try everything after.',
    position: 'center',
  },
  {
    id: 'send-message',
    title: 'Chat Interface',
    description: 'This is where you\'ll ask about resume reviews, interview prep, salary negotiation, and job search strategies.',
    targetSelector: 'input[type="text"][placeholder="What\'s your next career move?"]',
    position: 'top',
  },
  {
    id: 'add-context',
    title: 'Add Context',
    description: 'This button lets you upload your resume, job descriptions, LinkedIn profile, or other career materials for personalized advice.',
    targetSelector: 'button[type="button"]:has(svg path[d*="M12 4v16m8-8H4"]):first-of-type',
    position: 'top',
  },
  {
    id: 'chat-history',
    title: 'Chat History',
    description: 'The hamburger menu shows all your past conversations.',
    targetSelector: 'button:has(svg path[d*="M4 6h16M4 12h16M4 18h16"])',
    position: 'bottom',
  },
  {
    id: 'collaborate-toggle',
    title: 'Collaborate Mode',
    description: 'Toggle this to share conversations publicly with the Careersy community for peer feedback or Eli\'s personal touch.',
    targetSelector: 'button:has(span[class*="rounded-full"][class*="bg-"])',
    position: 'bottom',
  },
  {
    id: 'search',
    title: 'Search Community',
    description: 'When in Collaborate mode, search existing community conversations first - your question might already be answered!',
    targetSelector: 'button:has(svg path[d*="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"])',
    position: 'bottom',
  },
  {
    id: 'new-conversation',
    title: 'Start New Public Thread',
    description: 'If you don\'t find what you need, use this to create a new public conversation with a custom title.',
    targetSelector: 'button:has(svg path[d*="M12 4v16m8-8H4"])',
    position: 'bottom',
  },
  {
    id: 'replay-tutorial',
    title: 'Replay Tutorial',
    description: 'You can replay this tutorial anytime by clicking this icon.',
    targetSelector: 'button[title="Replay tutorial"]',
    position: 'bottom',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🚀',
    description: 'Start chatting to level up your ANZ tech career. All features are now available to explore.',
    position: 'center',
  },
]

export const VOYAGER_TUTORIAL: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Voyager! 🗺️',
    description: 'A co-learning AI ecosystem where you connect, learn, and collaborate on what you\'re passionate about. Each community has an AI co-pilot who learns from community interactions and elevates every contribution.',
    position: 'center',
  },
  {
    id: 'ask-navigator',
    title: 'Ask the Navigator',
    description: 'Not sure which community is right for you? Ask me! I can help you discover the perfect community based on your needs.',
    targetSelector: 'input[type="text"]',
    position: 'top',
  },
  {
    id: 'communities-sidebar',
    title: 'Browse Communities',
    description: 'Click the menu to see available communities. Each one has its own personality, expertise, and purpose. Click any community to dive in!',
    targetSelector: 'button:has(svg path[d*="M4 6h16M4 12h16M4 18h16"])',
    position: 'bottom',
  },
  {
    id: 'replay-tutorial',
    title: 'Replay Tutorial',
    description: 'You can replay this tutorial anytime by clicking this icon.',
    targetSelector: 'button[title="Replay tutorial"]',
    position: 'bottom',
  },
  {
    id: 'ready',
    title: 'Start Exploring! 🚀',
    description: 'Click any community in the sidebar to begin your journey. Each one is a unique AI experience waiting for you.',
    position: 'center',
  },
]

// Backwards compatibility - default to Careersy
export const TUTORIAL_STEPS = CAREERSY_TUTORIAL

/**
 * Get tutorial steps for a specific community
 * @param communityId - The community identifier (e.g., 'careersy', 'voyager')
 * @returns Tutorial steps for the community, or empty array if no tutorial configured
 */
export function getTutorialSteps(communityId: string): TutorialStep[] {
  switch (communityId) {
    case 'careersy':
      return CAREERSY_TUTORIAL
    case 'voyager':
      return VOYAGER_TUTORIAL
    default:
      return [] // No tutorial for other communities (yet!)
  }
}
