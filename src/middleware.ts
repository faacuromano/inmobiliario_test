import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')

    if (authHeader) {
      const authValue = authHeader.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      // In a real app, use secure comparison and stronger credentials logic
      if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASSWORD) {
        return NextResponse.next()
      }
    }

    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
