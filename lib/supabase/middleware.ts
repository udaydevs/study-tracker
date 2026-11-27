import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { LOGIN_PATH } from "@/constants/common";
import { cookies } from 'next/headers'

export default async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const store = await cookies()
  type CookieToSet = {
    name: string
    value: string
    options: Parameters<typeof store.set>[2]
  }

  // Initialize Supabase server client with custom cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Re-create the response with updated cookies
          supabaseResponse = NextResponse.next({ request });

          list.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Fetch the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Redirect unauthenticated users to login, except for auth routes
  if (!user && !path.startsWith(LOGIN_PATH) && !path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Prevent authenticated users from accessing the login page
  if (user && path.startsWith(LOGIN_PATH)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}