"use client";

export function CommentForm({ postId }: { postId: number }) {
  return (
    <form action={`/api/post/${postId}/comment`} method="post" className="mt-4">
      <textarea name="body" rows={3} required placeholder="Add a comment…" className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:border-teal-600 outline-none resize-y" />
      <button type="submit" className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg text-sm">Submit</button>
    </form>
  );
}
