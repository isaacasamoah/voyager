import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import { logAuth, logError } from "./logger"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
