import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const uid = parseInt((session.user as { id?: string }).id ?? "0", 10);
  if ((session.user as { status?: string }).status !== "approved") redirect("/pending");
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { username: true, email: true, role: true },
  });
  if (!user) redirect("/");
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Profile</h1>
      <ProfileForm email={user.email} username={user.username} role={user.role} />
    </div>
  );
}
