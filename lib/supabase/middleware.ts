import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const TWO_FA_COOKIE = 'cloudpix_2fa_verified'
const REMEMBER_COOKIE = 'cloudpix_remember_me'

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/api/images') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/api-key') ||
    pathname.startsWith('/api/profile')
  )
}

function isAuthPage(pathname: string) {
  return pathname === '/' || pathname.startsWith('/auth/login')
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_enabled')
      .eq('id', user.id)
      .single()

    const twoFactorEnabled = !!profile?.two_factor_enabled
    const twoFactorVerified = request.cookies.get(TWO_FA_COOKIE)?.value === user.id
    const rememberMe = request.cookies.get(REMEMBER_COOKIE)?.value === '1'

    if (twoFactorEnabled && isProtectedPath(request.nextUrl.pathname) && !twoFactorVerified) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Two-factor verification required' }, { status: 403 })
      }

      const url = request.nextUrl.clone()
      url.pathname = '/auth/2fa'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    if (isAuthPage(request.nextUrl.pathname) && rememberMe && (!twoFactorEnabled || twoFactorVerified)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
