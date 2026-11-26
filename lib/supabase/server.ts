"use server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServer() {
  const store = await cookies()

  type CookieToSet = {
    name: string
    value: string
    options: Parameters<typeof store.set>[2]
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll()
        },

        setAll(list: CookieToSet[]) {
          try {
            list.forEach(({ name, value, options }) => {
              store.set(name, value, options)
            })
          } catch {
            // Cookie writes may be unavailable in Server Components.
            // Middleware should handle session refreshes.
          }
        },
      },
    }
  )
}
