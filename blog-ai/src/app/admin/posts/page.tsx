import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin - Posts</h1>
      <table className="w-full border border-slate-300">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="border p-2">ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Author</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2"><Link href={"/post/" + p.id}>{p.title}</Link></td>
              <td className="border p-2">{p.user.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
