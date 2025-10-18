import { TutorialStep } from './TutorialOverlay'

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Careersy Wingman! 👋',
    description: 'Your AI career coach for the ANZ tech market. Quick tour of the key features.',
    position: 'center',
    action: 'view',
  },
  {
    id: 'send-message',
    title: 'Chat Interface',
    description: 'Ask about resume reviews, interview prep, salary negotiation, or job search strategies.',
    targetSelector: 'input[type="text"][placeholder="|"]',
    position: 'top',
    action: 'view',
  },
  {
    id: 'add-context',
    title: 'Add Context',
    description: 'Upload your resume, job descriptions, LinkedIn profile, or other career materials for personalized advice.',
    targetSelector: 'button[type="button"]:has(svg path[d*="M12 4v16m8-8H4"]):first-of-type',
    position: 'top',
    action: 'view',
  },
  {
    id: 'chat-history',
    title: 'Chat History',
    description: 'Access all your past conversations from the sidebar menu.',
    targetSelector: 'button:has(svg path[d*="M4 6h16M4 12h16M4 18h16"])',
    position: 'right',
    action: 'view',
  },
  {
    id: 'collaborate-toggle',
    title: 'Collaborate Mode',
    description: 'Share conversations publicly with the Careersy community for peer feedback.',
    targetSelector: 'button:has(span[class*="rounded-full"][class*="bg-"])',
    position: 'left',
    action: 'view',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🚀',
    description: 'Start chatting to level up your ANZ tech career.',
    position: 'center',
    action: 'view',
  },
]
