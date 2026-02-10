"use client";

export function RateForm({ postId, currentStars }: { postId: number; currentStars?: number }) {
  const val = currentStars ?? 3;
  return (
    <form action={`/api/post/${postId}/rate`} method="post" className="inline ml-2">
      <label className="mr-2 text-stone-600 text-sm">Your rating:</label>
      <select name="stars" defaultValue={String(val)} className="border border-stone-300 rounded-lg py-1.5 px-2 text-sm w-16 inline-block focus:border-teal-600 outline-none">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm py-1.5 px-3 ml-2 rounded-lg">Rate</button>
    </form>
  );
}
