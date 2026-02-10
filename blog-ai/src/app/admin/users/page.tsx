import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin - Users</h1>
      <table className="w-full border border-slate-300">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="border p-2">ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">{u.status}</td>
              <td className="border p-2">
                {u.status === "pending" && (
                  <>
                    <form action={"/api/admin/users/" + u.id + "/approve"} method="post" className="inline mr-2">
                      <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded text-sm">Approve</button>
                    </form>
                    <form action={"/api/admin/users/" + u.id + "/reject"} method="post" className="inline">
                      <button type="submit" className="bg-red-600 text-white px-2 py-1 rounded text-sm">Reject</button>
                    </form>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
