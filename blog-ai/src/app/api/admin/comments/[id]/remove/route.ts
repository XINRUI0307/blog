import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin")
    return NextResponse.redirect(new URL("/", req.url));
  const { id } = await ctx.params;
  await prisma.comment.update({
    where: { id: parseInt(id, 10) },
    data: { removed: true },
  });
  return NextResponse.redirect(new URL("/admin/comments", req.url));
}
