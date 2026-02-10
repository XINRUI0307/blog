import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 max-w-md">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Register</h1>
      <RegisterForm />
      <p className="mt-6 text-stone-600">
        <Link href="/login" className="text-teal-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}
