import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPublicCommunities } from '@/lib/communities'
import Link from 'next/link'

export default async function VoyagerLanding() {
  const session = await getServerSession(authOptions)
  const publicCommunities = getPublicCommunities()

  // If logged in, show their communities
  // If not logged in, show public communities to join

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header - matches wireframe */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Placeholder for future hamburger menu */}
            <div className="w-6 h-6"></div>
          </div>

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Main content - centered like wireframe */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center space-y-12">
          {/* Large VOYAGER wordmark */}
          <div>
            <h1 className="text-7xl font-bold tracking-wider text-gray-900 mb-4">
              VOYAGER
            </h1>
            <div className="w-64 h-px bg-gray-300 mx-auto"></div>
          </div>

          {/* Tagline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Co-learning AI communities where experts guide, AI accelerates, and knowledge compounds.
          </p>

          {/* Communities */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Explore Communities</h2>

            <div className="grid gap-4 max-w-2xl mx-auto">
              {publicCommunities.map(community => (
                <Link
                  key={community.id}
                  href={session ? `/${community.id}` : '/login'}
                  className="group p-6 border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all text-left"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                    {community.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {community.description}
                  </p>
                </Link>
              ))}
            </div>

            {!session && (
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-gray-200 py-6 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>Voyager - Where expertise meets AI</p>
        </div>
      </footer>
    </div>
  )
}
