import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const form = await req.formData();
  const showRecent = form.get("show_recent") ? "1" : "0";
  const showSearch = form.get("show_search") ? "1" : "0";
  await prisma.sidebarSetting.upsert({
    where: { key: "show_recent" },
    create: { key: "show_recent", value: showRecent },
    update: { value: showRecent },
  });
  await prisma.sidebarSetting.upsert({
    where: { key: "show_search" },
    create: { key: "show_search", value: showSearch },
    update: { value: showSearch },
  });
  return NextResponse.redirect(new URL("/admin/sidebar", req.url));
}
