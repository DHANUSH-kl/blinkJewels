import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { connectToDatabase } from "./mongoose";
import { User } from "@/models/User";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials: any) {
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error("No user found");
        if (!user.verified) throw new Error("Please verify your email");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        const isAdmin = user.email === process.env.ADMIN_EMAIL;
        if (isAdmin && user.role !== "admin") {
          user.role = "admin";
          await user.save();
        }

        return {
          id: user._id.toString(),
          _id: user._id.toString(), // 👈 include _id explicitly
          name: user.name,
          email: user.email,
          role: user.role || "user",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token._id = user._id; // 👈 keep _id for session
        token.email = user.email;
        token.role = user.role || "user";
      }

      if (token?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          if (dbUser.email === process.env.ADMIN_EMAIL && dbUser.role !== "admin") {
            dbUser.role = "admin";
            await dbUser.save();
          }

          token.id = dbUser._id.toString();
          token._id = dbUser._id.toString(); // 👈 set _id again
          token.role = dbUser.role || "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user._id = token._id as string; // 👈 now session.user._id is available
        session.user.role = token.role as string;
      }

      return session;
    },
  },
};
