import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const resolveDefault = (mod) => (mod?.default ? mod.default : mod);

const handler = resolveDefault(NextAuth)({
  providers: [
    resolveDefault(GithubProvider)({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),
    resolveDefault(GoogleProvider)({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // When user signs in using a provider, exchange profile with backend to create/find user and get app JWT
      if (account && profile) {
        const email = profile.email || token.email || (profile.emails && profile.emails[0]?.value);
        const name = profile.name || profile.login || token.name;
        const avatar = profile.picture || profile.avatar_url || null;

        try {
          const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const res = await fetch(`${raw}/user/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, avatar }),
          });
          const data = await res.json();
          if (res.ok) {
            token.backendToken = data.token;
            token.user = data.user;
          } else {
            console.error("Backend OAuth error", data);
          }
        } catch (e) {
          console.error("JWT callback fetch error", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) session.user = token.user;
      session.token = token?.backendToken;
      return session;
    },
  },
  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };
