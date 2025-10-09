import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">AI Career Coach</h1>
        <p className="text-xl mb-8">Your personal guide to success in the Australian tech market</p>
        <Link
          href="/login"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
