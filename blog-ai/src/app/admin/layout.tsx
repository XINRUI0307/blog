import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") redirect("/");
  return (
    <div>
      <nav className="flex gap-4 mb-4">
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/posts">Posts</Link>
        <Link href="/admin/comments">Comments</Link>
        <Link href="/admin/sidebar">Sidebar</Link>
      </nav>
      {children}
    </div>
  );
}
