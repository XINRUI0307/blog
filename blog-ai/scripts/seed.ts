import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (admin) {
    console.log("Admin already exists.");
    return;
  }
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@localhost",
      passwordHash: hash,
      role: "admin",
      status: "approved",
      agreedTerms: true,
    },
  });
  await prisma.sidebarSetting.upsert({
    where: { key: "show_recent" },
    create: { key: "show_recent", value: "1" },
    update: {},
  });
  await prisma.sidebarSetting.upsert({
    where: { key: "show_search" },
    create: { key: "show_search", value: "1" },
    update: {},
  });
  console.log("Admin created: username=admin, password=admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
