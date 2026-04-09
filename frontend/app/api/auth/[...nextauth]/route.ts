import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === "development") {
            console.log("❌ Missing credentials")
          }
          return null
        }

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL
          
          if (!apiUrl && process.env.NODE_ENV === "development") {
            console.error("❌ NEXT_PUBLIC_API_URL is not set")
          }
          
          const response = await axios.post(
            `${apiUrl}/api/auth/login`,
            new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              timeout: 15000,
            }
          )

          if (response.data && response.data.access_token) {
            return {
              id: credentials.email,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              accessToken: response.data.access_token,
            }
          }
          
          return null
        } catch (error: any) {
          // Only log errors in development
          if (process.env.NODE_ENV === "development") {
            console.error("Auth error:", error.message)
            if (error.response) {
              console.error("Status:", error.response.status)
              console.error("Data:", error.response.data)
            }
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        // Handle null/undefined values safely
        token.email = user.email ?? undefined
        token.name = user.name ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = {
        email: token.email ?? "",
        name: token.name ?? "",
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Only enable debug in development
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }