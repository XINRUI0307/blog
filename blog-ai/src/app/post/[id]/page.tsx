import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentForm } from "./CommentForm";
import { RateForm } from "./RateForm";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (Number.isNaN(postId)) notFound();

  const post = await prisma.post.findFirst({
    where: { id: postId, user: { status: "approved" } },
    include: {
      user: { select: { username: true, id: true } },
      images: true,
      comments: { where: { removed: false }, include: { user: { select: { username: true } } }, orderBy: { createdAt: "asc" } },
      ratings: true,
    },
  });
  if (!post) notFound();

  const avgStars =
    post.ratings.length > 0
      ? Math.round((post.ratings.reduce((s, r) => s + r.stars, 0) / post.ratings.length) * 10) / 10
      : 0;
  const session = await getServerSession(authOptions);
  const userId = session?.user ? parseInt((session.user as { id?: string }).id ?? "0", 10) : 0;
  const userRating = post.ratings.find((r) => r.userId === userId);

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden border border-stone-200">
      {post.images[0] && (
        <div className="aspect-video w-full bg-stone-200 relative overflow-hidden">
          <img
            src={`/uploads/${post.images[0].filepath}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold text-stone-800">{post.title}</h1>
        <p className="text-stone-500 text-sm mt-2">
          By {post.user.username}
          {post.location && (
            <>
              {" · "}
              <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
                {post.location}
              </span>
            </>
          )}
          {" · "}
          {post.createdAt.toISOString().slice(0, 10)}
        </p>
        {post.images.length > 1 && (
          <div className="flex flex-wrap gap-2 my-4">
            {post.images.slice(1).map((img) => (
              <img
                key={img.id}
                src={`/uploads/${img.filepath}`}
                alt=""
                className="rounded-lg max-h-48 object-cover"
              />
            ))}
          </div>
        )}
        <div className="whitespace-pre-wrap my-6 text-stone-700 leading-relaxed">{post.body}</div>
        <div className="flex flex-wrap items-center gap-3 py-4 border-y border-stone-200">
          <span className="text-stone-600 text-sm">
            Average: <strong className="text-amber-600">{avgStars}</strong> stars ({post.ratings.length} ratings)
          </span>
          {session?.user && (session.user as { status?: string }).status === "approved" && (
            <RateForm postId={post.id} currentStars={userRating?.stars} />
          )}
        </div>
        {(session?.user as { role?: string })?.role === "admin" ||
        (session?.user as { id?: string })?.id === String(post.user.id) ? (
          <p className="text-sm mt-4">
            <Link href={`/post/${post.id}/edit`} className="text-teal-600 hover:underline mr-3">Edit</Link>
            <form action={`/api/post/${post.id}/delete`} method="post" className="inline">
              <button type="submit" className="text-red-600 hover:underline">Delete</button>
            </form>
          </p>
        ) : null}
      </div>
      <section className="px-6 md:px-8 pb-8">
        <h2 className="font-display text-xl font-semibold text-stone-800 mb-4">Comments</h2>
        <div className="space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="bg-stone-50 rounded-lg p-4 border border-stone-100">
              <p className="font-medium text-sm text-stone-700">
                {c.user.username} · {c.createdAt.toISOString().slice(0, 10)}
              </p>
              <p className="text-stone-600 mt-1">{c.body}</p>
              {session?.user && (
                <form action={`/api/comment/${c.id}/report`} method="post" className="mt-2">
                  <button type="submit" className="text-xs text-amber-600 hover:underline">Report</button>
                </form>
              )}
            </div>
          ))}
        </div>
        {session?.user && (session.user as { status?: string }).status === "approved" ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="mt-4 text-stone-500">
            <Link href="/login" className="text-teal-600 hover:underline">Login</Link> to comment.
          </p>
        )}
      </section>
    </article>
  );
}
