import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostEditForm } from "../PostEditForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);
  const role = (session.user as { role?: string }).role;
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (Number.isNaN(postId)) notFound();
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { images: true } });
  if (!post || (post.userId !== uid && role !== "admin")) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit post</h1>
      <PostEditForm post={post} />
    </div>
  );
}
