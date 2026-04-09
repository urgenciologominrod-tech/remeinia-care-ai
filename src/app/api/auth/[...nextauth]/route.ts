export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import NextAuth from "next-auth";

const handler = async (...args: any[]) => {
  const { authOptions } = await import("@/lib/auth");
  const nextAuthHandler = NextAuth(authOptions);
  return nextAuthHandler(...args);
};

export { handler as GET, handler as POST };