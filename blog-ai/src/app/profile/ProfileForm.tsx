"use client";

import { useState } from "react";

export function ProfileForm({ email, username, role }: { email: string; username: string; role: string }) {
  const [newEmail, setNewEmail] = useState(email);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail }) });
    setMsg(res.ok ? "Profile updated." : "Update failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      {msg && <p className="text-green-600 text-sm">{msg}</p>}
      <label className="text-stone-700 font-medium">Username</label>
      <input type="text" value={username} disabled className="w-full border border-stone-300 rounded-lg px-3 py-2 bg-stone-100 outline-none" />
      <label className="text-stone-700 font-medium">Email</label>
      <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none" />
      <label className="text-stone-700 font-medium">Role</label>
      <input type="text" value={role} disabled className="w-full border border-stone-300 rounded-lg px-3 py-2 bg-stone-100 outline-none" />
      <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg mt-2">Update</button>
    </form>
  );
}
