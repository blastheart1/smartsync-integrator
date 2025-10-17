import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const validUser = process.env.ADMIN_USER;
        const validPass = process.env.ADMIN_PASS;
        if (!validUser || !validPass) throw new Error("Server misconfigured");
        const isValid = await bcrypt.compare(credentials.password, await bcrypt.hash(validPass, 10));
        if (credentials.username === validUser && isValid) {
          return { id: "1", name: validUser };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
