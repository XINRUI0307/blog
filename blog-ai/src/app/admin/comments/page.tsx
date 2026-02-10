import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    include: { post: { select: { id: true, title: true } }, user: { select: { username: true } } },
    orderBy: [{ reported: "desc" }, { createdAt: "desc" }],
  });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin - Comments</h1>
      <table className="w-full border border-slate-300">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="border p-2">ID</th>
            <th className="border p-2">Post</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Comment</th>
            <th className="border p-2">Reported</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.id}</td>
              <td className="border p-2"><Link href={"/post/" + c.postId}>{c.post.title}</Link></td>
              <td className="border p-2">{c.user.username}</td>
              <td className="border p-2">{c.body.slice(0, 50)}</td>
              <td className="border p-2">{c.reported ? "Yes" : "No"}</td>
              <td className="border p-2">
                {!c.removed && (
                  <form action={"/api/admin/comments/" + c.id + "/remove"} method="post">
                    <button type="submit" className="bg-amber-600 text-white px-2 py-1 rounded text-sm">Remove</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
