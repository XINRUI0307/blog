"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"reader" | "contributor">("reader");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agree) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <label className="text-stone-700 font-medium">Username</label>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none" />
      <label className="text-stone-700 font-medium">Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none" />
      <label className="text-stone-700 font-medium">Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none" />
      <label className="text-stone-700 font-medium">I want to</label>
      <select value={role} onChange={(e) => setRole(e.target.value as "reader" | "contributor")} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none">
        <option value="reader">Read and comment only (Reader)</option>
        <option value="contributor">Write blog posts (Contributor)</option>
      </select>
      <label className="flex items-center gap-2 text-stone-600">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded border-stone-300" />
        I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Terms</a> and <a href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</a>.
      </label>
      <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg mt-2">Register</button>
    </form>
  );
}
