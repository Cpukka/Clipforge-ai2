import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      email: string
      name: string
    }
  }

  interface User {
    accessToken?: string
    email?: string | null
    name?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    email?: string
    name?: string
  }
}