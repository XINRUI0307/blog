"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Post = { id: number; title: string; body: string; location: string | null; images: { id: number; filename: string }[] };

export function PostEditForm({ post }: { post?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [location, setLocation] = useState(post?.location ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("title", title);
    formData.set("body", body);
    formData.set("location", location);
    const url = post ? `/api/post/${post.id}/edit` : "/api/post/new";
    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error || "Failed.");
      return;
    }
    const data = (await res.json()) as { id: number };
    router.push(post ? `/post/${post.id}` : `/post/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xl">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <label>Title</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="border rounded px-2 py-1" />
      <label>Location</label>
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="border rounded px-2 py-1" />
      <label>Body</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={10} className="border rounded px-2 py-1" />
      <label>Images (optional)</label>
      <input type="file" name="images" multiple accept="image/*" className="border rounded px-2 py-1" />
      <button type="submit" className="bg-slate-700 text-white px-3 py-2 rounded mt-2">{post ? "Update" : "Create"}</button>
      <p><a href={post ? `/post/${post.id}` : "/my-posts"} className="text-blue-600 text-sm">Cancel</a></p>
    </form>
  );
}
