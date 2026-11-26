import './globals.css'
import { Manrope, IBM_Plex_Mono } from 'next/font/google'
import TimerProvider from '@/components/TimerProvider'

const sans = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' })

export const metadata = { title: 'Study Tracker' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body><TimerProvider>{children}</TimerProvider></body>
    </html>
  )
}
