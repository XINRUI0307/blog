import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as { status?: string }).status === "approved") redirect("/");
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 max-w-md">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-4">Account pending</h1>
      <p className="text-stone-600">Your account is waiting for admin approval.</p>
      <p className="mt-6"><Link href="/api/auth/signout" className="text-teal-600 hover:underline">Logout</Link></p>
    </div>
  );
}
