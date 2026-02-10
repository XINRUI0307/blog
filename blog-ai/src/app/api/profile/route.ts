import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);
  const body = await req.json();
  const email = (body.email as string)?.trim();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  await prisma.user.update({ where: { id: uid }, data: { email } });
  return NextResponse.json({ ok: true });
}
