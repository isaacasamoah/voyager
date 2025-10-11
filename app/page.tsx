import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-careersy-cream flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl flex-1 flex flex-col justify-center">
        <h1 className="text-6xl font-lexend font-bold mb-6 text-careersy-black tracking-tight">
          Careersy Wingman
        </h1>
        <p className="text-xl mb-10 text-gray-700">
          Your AI-powered career wingman for the Australian tech market
        </p>
        <Link
          href="/login"
          className="inline-block bg-careersy-yellow text-careersy-black px-10 py-4 rounded-[30px] font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          Get Started
        </Link>
      </div>

      {/* Logo at bottom */}
      <div className="pb-8 flex justify-center opacity-60">
        <Image
          src="/careersy-logo.webp"
          alt="Careersy Wingman Logo"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
    </div>
  )
}
