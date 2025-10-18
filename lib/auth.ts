import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import { logAuth, logError } from "./logger"
import { getAllCommunityConfigs, isExpert } from "./communities"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email'
        }
      },
      issuer: 'https://www.linkedin.com/oauth',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      logAuth('signIn callback', {
        userId: user.id,
        email: user.email,
        provider: account?.provider
      })

      // Auto-join user to public communities and expert communities
      if (user.email) {
        const allCommunities = getAllCommunityConfigs()
        const userCommunities: string[] = []

        for (const community of allCommunities) {
          // Add to public communities
          if (community.public && !community.inviteOnly) {
            userCommunities.push(community.id)
          }

          // Auto-add experts to their communities
          if (isExpert(user.email, community.id)) {
            if (!userCommunities.includes(community.id)) {
              userCommunities.push(community.id)
            }
          }
        }

        // Update user's communities if needed
        if (userCommunities.length > 0) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { communities: true }
          })

          const currentCommunities = dbUser?.communities || []
          const communitySet = new Set([...currentCommunities, ...userCommunities])
          const newCommunities = Array.from(communitySet)

          if (newCommunities.length > currentCommunities.length) {
            await prisma.user.update({
              where: { id: user.id },
              data: { communities: newCommunities }
            })
            logAuth('Auto-joined communities', {
              userId: user.id,
              communities: newCommunities
            })
          }
        }
      }

      return true
    },
    session: async ({ session, user }) => {
      logAuth('session callback', {
        sessionUserId: session?.user?.email,
        dbUserId: user.id,
        hasSession: !!session
      })
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  events: {
    signIn: async ({ user, account }) => {
      logAuth('signIn event', {
        userId: user.id,
        email: user.email,
        provider: account?.provider
      })
    },
    signOut: async ({ session }) => {
      logAuth('signOut event', {
        email: session?.user?.email
      })
    },
    createUser: async ({ user }) => {
      logAuth('createUser event', {
        userId: user.id,
        email: user.email
      })
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'database',
  },
}
