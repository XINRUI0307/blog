import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_POSTS = 10;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { status?: string }).status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "contributor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);
  const count = await prisma.post.count({ where: { userId: uid } });
  if (count >= MAX_POSTS) {
    return NextResponse.json({ error: "Max posts reached" }, { status: 400 });
  }

  const form = await req.formData();
  const title = (form.get("title") as string)?.trim();
  const body = (form.get("body") as string)?.trim();
  const location = (form.get("location") as string)?.trim() || null;
  if (!title || !body) return NextResponse.json({ error: "Title and body required" }, { status: 400 });

  const post = await prisma.post.create({
    data: { userId: uid, title, body, location },
  });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const files = form.getAll("images") as File[];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (f && f.size > 0) {
      const buf = Buffer.from(await f.arrayBuffer());
      if (buf.length > 10 * 1024 * 1024) continue;
      const name = `${post.id}_${i}_${f.name}`;
      const filepath = path.join(uploadsDir, name);
      await writeFile(filepath, buf);
      await prisma.postImage.create({
        data: { postId: post.id, filename: f.name, filepath: name },
      });
    }
  }

  return NextResponse.json({ id: post.id });
}
