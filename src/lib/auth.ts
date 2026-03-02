import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export type SessionUser = { id?: string; email?: string; name?: string; role?: string; agencyId?: string; agencyName?: string };

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (!prisma) {
          // Phase 1 fallback: accept demo credentials without DB
          if (
            credentials.email === "demo@estimaflow.fr" &&
            credentials.password === "password"
          ) {
            return {
              id: "demo-user",
              email: "demo@estimaflow.fr",
              name: "Admin Demo",
              role: "ADMIN",
              agencyId: "demo-agency",
              agencyName: "Agence Demo",
            };
          }
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { email: String(credentials.email) },
          include: { agency: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agencyId: user.agencyId,
          agencyName: user.agency.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.agencyId = (user as { agencyId?: string }).agencyId;
        token.agencyName = (user as { agencyName?: string }).agencyName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { agencyId?: string }).agencyId = token.agencyId as string;
        (session.user as { agencyName?: string }).agencyName = token.agencyName as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
});
