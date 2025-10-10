import type { Metadata } from 'next'
import { Inter, Lexend_Deca } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const lexend = Lexend_Deca({ subsets: ['latin'], variable: '--font-lexend' })

export const metadata: Metadata = {
  title: 'Careersy Wingman - Australian Tech Career Coach',
  description: 'Your AI-powered career wingman for the Australian tech industry',
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
