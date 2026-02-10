import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

const PROJECT_ROOT = path.resolve(__dirname, "..");
const UPLOAD_DIR = path.join(PROJECT_ROOT, "public", "uploads");
const SOURCES = ["travel1.jpg", "travel2.jpg", "travel3.jpg", "travel4.jpg"];

async function main() {
  for (const s of SOURCES) {
    if (!existsSync(path.join(UPLOAD_DIR, s))) {
      console.log(`Missing ${s} in public/uploads/. Copy travel1-4.jpg there first.`);
      return;
    }
  }
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const posts = await prisma.post.findMany({ select: { id: true }, orderBy: { id: "asc" } });
  if (posts.length === 0) {
    console.log("No posts found. Run seed-demo.ts first.");
    return;
  }
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const srcName = SOURCES[i % SOURCES.length];
    const srcPath = path.join(UPLOAD_DIR, srcName);
    const filename = `${post.id}_1_travel.jpg`;
    const destPath = path.join(UPLOAD_DIR, filename);
    copyFileSync(srcPath, destPath);
    await prisma.postImage.deleteMany({ where: { postId: post.id } });
    await prisma.postImage.create({
      data: { postId: post.id, filename, filepath: filename },
    });
  }
  console.log(`Attached different images to ${posts.length} post(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
