'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoading = status === 'loading'

  useEffect(() => {
    // Don't redirect while loading auth state
    if (isLoading) return

    if (session) {
      // Logged in - redirect to their default community or last visited
      // For now, default to Careersy for authenticated users
      router.push('/careersy')
    } else {
      // Not logged in - redirect to Voyager (public discovery)
      router.push('/voyager')
    }
  }, [session, isLoading, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
