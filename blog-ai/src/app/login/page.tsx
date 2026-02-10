import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 max-w-md">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Login</h1>
      <LoginForm />
      <p className="mt-6 text-stone-600">
        <a href="/register" className="text-teal-600 hover:underline">Register</a>
      </p>
    </div>
  );
}
