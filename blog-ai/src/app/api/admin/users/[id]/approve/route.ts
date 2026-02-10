import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX = 10;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin")
    return NextResponse.redirect(new URL("/", req.url));
  const n = await prisma.user.count({ where: { status: "approved" } });
  if (n >= MAX) return NextResponse.redirect(new URL("/admin/users", req.url));
  const { id } = await ctx.params;
  await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: { status: "approved" },
  });
  return NextResponse.redirect(new URL("/admin/users", req.url));
}
