import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminSidebarPage() {
  const list = await prisma.sidebarSetting.findMany();
  const sidebar = Object.fromEntries(list.map((s) => [s.key, s.value]));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin - Sidebar</h1>
      <p>Show recent: {sidebar.show_recent}, Show search: {sidebar.show_search}</p>
      <p><Link href="/admin" className="text-blue-600">Back to admin</Link></p>
    </div>
  );
}
