import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { logAuth } from '@/lib/logger'
import ChatInterface from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  logAuth('ChatPage access', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  })

  if (!session) {
    logAuth('ChatPage redirect to login - no session')
    redirect('/login')
  }

  return <ChatInterface />
}
