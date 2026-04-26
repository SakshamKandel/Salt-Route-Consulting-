import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // Redirect authenticated users away from auth pages to their dashboard
      if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        const role = auth.user.role as string
        const dest =
          role === 'ADMIN' ? '/admin/dashboard' :
          role === 'OWNER' ? '/owner/dashboard' :
          '/account'
        return Response.redirect(new URL(dest, nextUrl))
      }

      const isOnAdminPanel = pathname.startsWith('/admin')
      const isOnOwnerPanel = pathname.startsWith('/owner')
      const isOnAccount = pathname.startsWith('/account')

      if (isOnAdminPanel) {
        if (isLoggedIn && auth.user.role === 'ADMIN') return true
        return false
      }

      if (isOnOwnerPanel) {
        if (isLoggedIn && (auth.user.role === 'OWNER' || auth.user.role === 'ADMIN')) return true
        return false
      }

      if (isOnAccount) {
        if (isLoggedIn) return true
        return false
      }

      return true
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN' | 'OWNER' | 'GUEST'
      }
      return session
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig
