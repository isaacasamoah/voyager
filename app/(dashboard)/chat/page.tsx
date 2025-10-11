import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ChatInterface from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Subscription check temporarily disabled for demo
  // TODO: Re-enable after fixing webhook integration
  // const user = await prisma.user.findUnique({
  //   where: { id: session.user.id },
  //   select: {
  //     stripeSubscriptionId: true,
  //     stripeCurrentPeriodEnd: true,
  //   },
  // })

  // const hasActiveSubscription = !!user?.stripeSubscriptionId

  // if (!hasActiveSubscription) {
  //   redirect('/subscribe')
  // }

  return <ChatInterface />
}
