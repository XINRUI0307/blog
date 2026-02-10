import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-4">Privacy Policy</h1>
      <p className="text-stone-600">We store your username, email, and password (hashed). We use this to manage your account and to show your name with your posts and comments.</p>
      <p className="mt-2 text-stone-600">We do not sell your data. We may use your email to contact you about your account or site updates.</p>
      <p className="mt-6"><Link href="/" className="text-teal-600 hover:underline">Back to home</Link></p>
    </div>
  );
}
