import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { status?: string }).status !== "approved") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const { id } = await params;
  const postId = parseInt(id, 10);
  const form = await req.formData();
  const stars = Math.min(5, Math.max(1, parseInt((form.get("stars") as string) || "0", 10)));
  const userId = parseInt((session.user as { id?: string }).id ?? "0", 10);
  await prisma.rating.upsert({
    where: { postId_userId: { postId, userId } },
    create: { postId, userId, stars },
    update: { stars },
  });
  return NextResponse.redirect(new URL(`/post/${postId}`, req.url));
}
