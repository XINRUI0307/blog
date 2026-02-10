import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "contributor" && role !== "admin") redirect("/");
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);

  const posts = await prisma.post.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, location: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">My posts</h1>
      <Link href="/post/new" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg inline-block mb-6">New post</Link>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link href={`/post/${p.id}`} className="font-medium text-stone-800 hover:text-teal-600">{p.title}</Link>
              {p.location && <span className="text-stone-500 text-sm ml-2">({p.location})</span>}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-stone-500">{p.createdAt.toISOString().slice(0, 10)}</span>
              <Link href={`/post/${p.id}/edit`} className="text-teal-600 hover:underline">Edit</Link>
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="text-stone-500">No posts yet.</li>}
      </ul>
    </div>
  );
}
