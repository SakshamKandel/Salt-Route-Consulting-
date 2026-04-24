import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdminPanel = nextUrl.pathname.startsWith('/admin')
      const isOnOwnerPanel = nextUrl.pathname.startsWith('/owner')
      const isOnAccount = nextUrl.pathname.startsWith('/account')

      if (isOnAdminPanel) {
        if (isLoggedIn && auth.user.role === 'ADMIN') return true
        return false // Redirect unauthenticated or non-admin users to login page
      }

      if (isOnOwnerPanel) {
        if (isLoggedIn && (auth.user.role === 'OWNER' || auth.user.role === 'ADMIN')) return true
        return false
      }

      if (isOnAccount) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
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
