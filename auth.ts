import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { authConfig } from '@/auth.config'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { loginSchema } from '@/lib/validations'
import GoogleProvider from 'next-auth/providers/google'

type AppRole = "ADMIN" | "OWNER" | "GUEST"

function normalizeRole(role: unknown): AppRole {
  return role === "ADMIN" || role === "OWNER" || role === "GUEST" ? role : "GUEST"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  // 10.10 — Secure cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
          })
          
          if (!user || !user.hashedPassword) return null
          
          if (user.status !== "ACTIVE") {
            throw new Error("USER_SUSPENDED")
          }

          // Check if user is suspended (no emailVerified + manually flagged)
          // You can extend this with a `status` field if needed

          const passwordsMatch = await compare(password, user.hashedPassword)

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            }
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      console.log("Sign in attempt:", { email: user.email, provider: account?.provider })
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = normalizeRole(token.role)
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = normalizeRole(user.role)
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === "development",
})
