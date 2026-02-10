import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));
  const role = (session.user as { role?: string }).role;
  const userId = parseInt((session.user as { id?: string }).id ?? "0", 10);
  const { id } = await params;
  const postId = parseInt(id, 10);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== userId && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.redirect(new URL(role === "admin" ? "/admin/posts" : "/my-posts", req.url));
}
