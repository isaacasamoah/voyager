import ChatInterface from '@/components/chat/ChatInterface'
import { getCommunityConfig } from '@/lib/communities'

export default function VoyagerLanding() {
  // Load server-side (this is a Server Component by default)
  const voyagerConfig = getCommunityConfig('voyager')!

  return <ChatInterface communityId="voyager" communityConfig={voyagerConfig} />
}
