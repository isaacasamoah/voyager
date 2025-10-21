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

    // Demo phase: everyone goes to Voyager (discovery landing)
    router.push('/voyager')
  }, [isLoading, router])

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
