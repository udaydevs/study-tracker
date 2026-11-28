
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { Manrope, IBM_Plex_Mono } from "next/font/google"
import TimerProvider from "@/components/TimerProvider"
import { ThemeProvider } from "@/components/theme-provider"

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
})

export const metadata = {
  title: "Study Tracker",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className={sans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TimerProvider>
            {children}
            <Analytics />
          </TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
