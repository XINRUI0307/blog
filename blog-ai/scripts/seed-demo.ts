import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";

const USERS = [
  { username: "reader1", email: "reader1@demo.local", role: "reader" as const, status: "approved" as const },
  { username: "reader2", email: "reader2@demo.local", role: "reader" as const, status: "approved" as const },
  { username: "author1", email: "author1@demo.local", role: "contributor" as const, status: "approved" as const },
  { username: "author2", email: "author2@demo.local", role: "contributor" as const, status: "approved" as const },
  { username: "pending1", email: "pending1@demo.local", role: "contributor" as const, status: "pending" as const },
];

const POSTS_RAW = [
  { author: "author1", title: "Three Days in Guilin", body: "Guilin and Yangshuo have stunning scenery. Li River bamboo raft and West Street night market are must-sees. Day 1: Elephant Trunk Hill, Two Rivers and Four Lakes. Day 2: Li River highlights. Day 3: Cycling along Yulong River.", location: "Guilin, Guangxi" },
  { author: "author1", title: "Ancient Xi'an and Its Food", body: "Xi'an city wall, Big Wild Goose Pagoda, and the Terracotta Army are must-sees. Muslim Quarter: roujiamo, liangpi, yangrou paomo—something different every day.", location: "Xi'an, Shaanxi" },
  { author: "author2", title: "West Lake and Lingyin Temple, Hangzhou", body: "Walk around West Lake's ten scenic spots, find peace at Lingyin Temple. Drink tea in Longjing Village, buy souvenirs on Hefang Street.", location: "Hangzhou, Zhejiang" },
  { author: "author2", title: "Chengdu: Pandas and Hotpot", body: "See giant pandas at the base, then explore Kuanzhai Alley and Jinli. Hotpot and skewers are the soul of the trip.", location: "Chengdu, Sichuan" },
];

const COMMENTS_RAW = [
  { postTitle: "Three Days in Guilin", username: "reader1", body: "The Li River bamboo raft was really worth it!" },
  { postTitle: "Three Days in Guilin", username: "reader2", body: "West Street gets very crowded at night; go earlier if you can." },
  { postTitle: "Ancient Xi'an and Its Food", username: "reader1", body: "I thought the roujiamo was delicious too." },
  { postTitle: "Ancient Xi'an and Its Food", username: "reader2", body: "I'd recommend getting a guide for the Terracotta Army." },
  { postTitle: "West Lake and Lingyin Temple, Hangzhou", username: "reader1", body: "Lingyin Temple has a very peaceful atmosphere." },
];

const RATINGS_RAW = [
  { postTitle: "Three Days in Guilin", username: "reader1", stars: 5 },
  { postTitle: "Three Days in Guilin", username: "reader2", stars: 4 },
  { postTitle: "Ancient Xi'an and Its Food", username: "reader1", stars: 5 },
  { postTitle: "Ancient Xi'an and Its Food", username: "reader2", stars: 4 },
  { postTitle: "West Lake and Lingyin Temple, Hangzhou", username: "reader1", stars: 5 },
  { postTitle: "West Lake and Lingyin Temple, Hangzhou", username: "reader2", stars: 4 },
  { postTitle: "Chengdu: Pandas and Hotpot", username: "reader1", stars: 5 },
];

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({
        data: {
          username: u.username,
          email: u.email,
          passwordHash: hash,
          role: u.role,
          status: u.status,
          agreedTerms: true,
        },
      });
    }
  }

  const author1 = await prisma.user.findUnique({ where: { username: "author1" } });
  const author2 = await prisma.user.findUnique({ where: { username: "author2" } });
  if (!author1 || !author2) {
    console.log("Authors not found. Run seed.ts first.");
    return;
  }

  const authorIds: Record<string, number> = { author1: author1.id, author2: author2.id };
  for (const p of POSTS_RAW) {
    const uid = authorIds[p.author];
    const existing = await prisma.post.findFirst({ where: { userId: uid, title: p.title } });
    if (!existing) {
      await prisma.post.create({
        data: {
          userId: uid,
          title: p.title,
          body: p.body,
          location: p.location,
        },
      });
    }
  }

  const posts = await prisma.post.findMany({ select: { id: true, title: true } });
  const postByTitle = Object.fromEntries(posts.map((r) => [r.title, r.id]));
  const reader1 = await prisma.user.findUnique({ where: { username: "reader1" } });
  const reader2 = await prisma.user.findUnique({ where: { username: "reader2" } });
  if (!reader1 || !reader2) return;
  const readerIds: Record<string, number> = { reader1: reader1.id, reader2: reader2.id };

  for (const c of COMMENTS_RAW) {
    const postId = postByTitle[c.postTitle];
    const userId = readerIds[c.username as keyof typeof readerIds];
    if (!postId || !userId) continue;
    const exists = await prisma.comment.findFirst({ where: { postId, userId, body: c.body } });
    if (!exists) {
      await prisma.comment.create({
        data: { postId, userId, body: c.body },
      });
    }
  }

  for (const r of RATINGS_RAW) {
    const postId = postByTitle[r.postTitle];
    const userId = readerIds[r.username as keyof typeof readerIds];
    if (!postId || !userId) continue;
    await prisma.rating.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId, stars: r.stars },
      update: { stars: r.stars },
    });
  }

  console.log("Demo data loaded. Accounts: admin/admin123, author1/author2/reader1/reader2/pending1 use password: demo123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
