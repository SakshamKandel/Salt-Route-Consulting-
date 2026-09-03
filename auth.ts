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

        if (!parsedCredentials.success) return null

        const { email, password } = parsedCredentials.data
        
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        })
        
        if (!user || !user.hashedPassword) return null
        
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED")
        }

        if (user.status !== "ACTIVE") {
          throw new Error("USER_SUSPENDED")
        }

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

        return null
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { status: true },
        })
        if (existing && existing.status !== "ACTIVE") {
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = normalizeRole(user.role)
        token.image = user.image
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = normalizeRole(token.role)
        session.user.image = (token.image as string | null) ?? null
      }
      return session
    },
  },
  debug: process.env.AUTH_DEBUG === "true",
})
