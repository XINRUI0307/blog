import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Header() {
  const session = await getServerSession(authOptions);
  return (
    <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <Link href="/" className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight">Travel Blog</span>
            <span className="text-white/90 text-xs font-normal">Stories &amp; Places</span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link href="/" className="hover:underline underline-offset-2">Home</Link>
            <Link href="/search" className="hover:underline underline-offset-2">Search</Link>
            {session?.user ? (
              <>
                <Link href="/profile" className="hover:underline underline-offset-2">Profile</Link>
                {(session.user as { role?: string }).role === "contributor" ||
                (session.user as { role?: string }).role === "admin" ? (
                  <Link href="/my-posts" className="hover:underline underline-offset-2">My Posts</Link>
                ) : null}
                {(session.user as { role?: string }).role === "admin" ? (
                  <Link href="/admin" className="hover:underline underline-offset-2">Admin</Link>
                ) : null}
                <Link href="/api/auth/signout" className="opacity-90 hover:underline underline-offset-2">Logout</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline underline-offset-2">Login</Link>
                <Link href="/register" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
