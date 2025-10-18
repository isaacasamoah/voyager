import { TutorialStep } from './TutorialOverlay'

export const TUTORIAL_STEPS: TutorialStep[] = [
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
    targetSelector: 'input[type="text"][placeholder="|"]',
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
    position: 'right',
  },
  {
    id: 'new-conversation',
    title: 'Start New Chat',
    description: 'This button starts a fresh conversation. In private mode, it clears your current chat. In public mode, you can give it a custom title.',
    targetSelector: 'button:has(svg path[d*="M12 4v16m8-8H4"])',
    position: 'bottom',
  },
  {
    id: 'search',
    title: 'Search Conversations',
    description: 'The search icon helps you find past conversations. In public mode, you can search community discussions too.',
    targetSelector: 'button:has(svg path[d*="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"])',
    position: 'bottom',
  },
  {
    id: 'collaborate-toggle',
    title: 'Collaborate Mode',
    description: 'This toggle lets you share conversations publicly with the Careersy community for peer feedback.',
    targetSelector: 'button:has(span[class*="rounded-full"][class*="bg-"])',
    position: 'left',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🚀',
    description: 'Start chatting to level up your ANZ tech career. All features are now available to explore.',
    position: 'center',
  },
]
