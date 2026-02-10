import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as { status?: string }).status !== "approved") redirect("/pending");
  const posts = await prisma.post.findMany({
    where: { user: { status: "approved" } },
    include: {
      user: { select: { username: true } },
      images: { take: 1, orderBy: { id: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const sidebarList = await prisma.sidebarSetting.findMany();
  const sidebar = Object.fromEntries(sidebarList.map((s) => [s.key, s.value]));

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Recent posts</h1>
        {posts.length === 0 ? (
          <p className="text-stone-500">No posts yet.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-stone-200">
                <Link href={`/post/${post.id}`} className="block">
                  {post.images[0] && (
                    <div className="aspect-video w-full bg-stone-200 relative overflow-hidden">
                      <img
                        src={`/uploads/${post.images[0].filepath}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="font-display text-xl font-semibold text-stone-800 hover:text-teal-600 transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-stone-500">
                      {post.location && (
                        <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                          {post.location}
                        </span>
                      )}
                      <span>{post.createdAt.toISOString().slice(0, 10)}</span>
                      <span>· {post.user.username}</span>
                    </div>
                    <p className="mt-3 text-stone-600 leading-relaxed line-clamp-2">
                      {post.body.slice(0, 180)}
                      {post.body.length > 180 ? "…" : ""}
                    </p>
                    <span className="inline-block mt-3 text-teal-600 font-medium text-sm hover:underline">
                      Read more →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {sidebar.show_search === "1" && (
        <aside className="w-72 shrink-0">
          <div className="bg-white rounded-xl shadow-md border border-stone-200 p-4 sticky top-4">
            <h3 className="font-display font-semibold text-stone-800 mb-3">Search</h3>
            <form action="/search" method="get" className="flex flex-col gap-2">
              <input
                type="text"
                name="q"
                placeholder="Keyword"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:border-teal-600 outline-none"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:border-teal-600 outline-none"
              />
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg text-sm w-full">Search</button>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}
