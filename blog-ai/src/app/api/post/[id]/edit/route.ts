import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);
  const role = (session.user as { role?: string }).role;
  const { id } = await params;
  const postId = parseInt(id, 10);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || (post.userId !== uid && role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const title = (form.get("title") as string)?.trim();
  const body = (form.get("body") as string)?.trim();
  const location = (form.get("location") as string)?.trim() || null;
  if (!title || !body) return NextResponse.json({ error: "Title and body required" }, { status: 400 });

  await prisma.post.update({
    where: { id: postId },
    data: { title, body, location },
  });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const files = form.getAll("images") as File[];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (f && f.size > 0) {
      const buf = Buffer.from(await f.arrayBuffer());
      if (buf.length > 10 * 1024 * 1024) continue;
      const name = `${postId}_${Date.now()}_${i}_${f.name}`;
      const filepath = path.join(uploadsDir, name);
      await writeFile(filepath, buf);
      await prisma.postImage.create({
        data: { postId, filename: f.name, filepath: name },
      });
    }
  }

  return NextResponse.json({ id: postId });
}
