import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Travel Blog — Stories & Places",
  description: "Share and discover travel stories, photos and tips.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-800 antialiased" style={{ backgroundColor: "#fafaf9" }}>
        <Providers>
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-stone-200 bg-white/60 mt-12 py-6">
            <div className="max-w-4xl mx-auto px-4 text-center text-stone-500 text-sm">
              <a href="/terms" className="hover:text-teal-600 mr-3">Terms</a>
              <a href="/privacy" className="hover:text-teal-600">Privacy</a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
