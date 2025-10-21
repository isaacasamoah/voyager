import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getCommunityConfig, getFullBranding } from '@/lib/communities'
import { prisma } from '@/lib/db'
import ChatInterface from '@/components/chat/ChatInterface'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface CommunityPageProps {
  params: {
    communityId: string
  }
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { communityId } = params

  // Check if community exists (do this FIRST before any auth checks)
  const communityConfig = getCommunityConfig(communityId)
  if (!communityConfig) {
    redirect('/')
  }
  const fullBranding = getFullBranding(communityConfig.branding)

  // Get session
  const session = await getServerSession(authOptions)

  // Check auth requirements based on community config
  if (communityConfig.requiresAuth && !session) {
    redirect('/login')
  }

  // Check community membership (only if authenticated)
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { communities: true }
    })

    if (!user?.communities.includes(communityId)) {
      // User not a member - redirect to Voyager landing with error message
      redirect(`/?error=not-a-member&community=${communityId}`)
    }
  }

  return (
    <ChatInterface
      communityId={communityId}
      communityConfig={communityConfig}
      fullBranding={fullBranding}
    />
  )
}
