import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          console.log(`🔐 Attempting login for: ${credentials.email}`)
          
         const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
  new URLSearchParams({
    username: credentials.email,
    password: credentials.password,
  }),
  {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 10000,
  }
)

          if (response.data && response.data.access_token) {
            console.log("✅ Login successful, token received")
            return {
              id: credentials.email,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              accessToken: response.data.access_token,
            }
          }
          
          console.log("❌ No token in response")
          return null
        } catch (error: any) {
          console.error("❌ Auth error:", error.message)
          if (error.response) {
            console.error("   Status:", error.response.status)
            console.error("   Data:", error.response.data)
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
})

export { handler as GET, handler as POST }