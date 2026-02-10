import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostEditForm } from "../[id]/PostEditForm";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "contributor" && role !== "admin") redirect("/");
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);
  const count = await prisma.post.count({ where: { userId: uid } });
  if (count >= 10) redirect("/my-posts");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New post</h1>
      <PostEditForm />
    </div>
  );
}
