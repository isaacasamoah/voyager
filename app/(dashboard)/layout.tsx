import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { logAuth } from '@/lib/logger'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  logAuth('DashboardLayout check', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    path: 'dashboard'
  })

  if (!session) {
    logAuth('DashboardLayout redirect - no session')
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
