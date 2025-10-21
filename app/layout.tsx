import type { Metadata } from 'next'
import { Inter, Lexend_Deca } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const lexend = Lexend_Deca({ subsets: ['latin'], variable: '--font-lexend' })

export const metadata: Metadata = {
  title: 'Voyager - AI Co-Learning Communities',
  description: 'A co-learning AI ecosystem where you connect, learn, and collaborate on what you\'re passionate about',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lexend.variable} font-sans`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
