import { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { db } from "./db";

// extend the types to include role
declare module "next-auth" {
  interface User {
    role?: "user" | "admin";
  }

  interface Session {
    user: {
      id: string;
      role?: "user" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "user" | "admin";
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        return isLoggedIn && auth?.user?.role === "admin";
      } else if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return true;
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
            isAdmin: z.boolean().optional(),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password, isAdmin } = parsedCredentials.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()));

        if (!user) return null;

        // If isAdmin flag is set, verify user role is admin
        if (isAdmin && user.role !== "admin") return null;

        //check if password is correct
        const passwordsMatch = await bcrypt.compare(
          password,
          user.password || ""
        );

        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
};
