import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getCommunityConfig } from '@/lib/communities'
import { prisma } from '@/lib/db'
import ChatInterface from '@/components/chat/ChatInterface'

interface CommunityPageProps {
  params: {
    communityId: string
  }
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const { communityId } = params

  // Check if community exists
  const communityConfig = getCommunityConfig(communityId)
  if (!communityConfig) {
    redirect('/')
  }

  // Check if user is a member of this community
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { communities: true }
  })

  if (!user?.communities.includes(communityId)) {
    // User not a member - redirect to Voyager landing with error message
    redirect(`/?error=not-a-member&community=${communityId}`)
  }

  return (
    <ChatInterface
      communityId={communityId}
      communityConfig={communityConfig}
    />
  )
}

// Generate static params for known communities (optional optimization)
export async function generateStaticParams() {
  // For now, just return empty array - we'll render dynamically
  // Later can return list of community IDs for static generation
  return []
}
