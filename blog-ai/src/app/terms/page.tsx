import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-4">Terms of Use</h1>
      <p className="text-stone-600">By using this travel blog you agree to the following terms.</p>
      <ul className="list-disc pl-6 my-4 space-y-2 text-stone-600">
        <li>You will not post offensive or illegal content.</li>
        <li>You are responsible for your own content and comments.</li>
        <li>Photos must not exceed 10MB or 1200×800 pixels.</li>
        <li>Contributors may have up to 10 blog entries; older posts may be removed after 18 months.</li>
      </ul>
      <p><Link href="/" className="text-teal-600 hover:underline">Back to home</Link></p>
    </div>
  );
}
