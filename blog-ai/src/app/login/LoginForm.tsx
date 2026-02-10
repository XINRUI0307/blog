"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <label className="text-stone-700 font-medium">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none"
      />
      <label className="text-stone-700 font-medium">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none"
      />
      <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg mt-2">Login</button>
    </form>
  );
}
