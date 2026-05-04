import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-20 lg:py-32 w-full">
        <div className="max-w-md w-full text-center fade-up">
          <p className="text-[color:var(--accent-500)] font-semibold tracking-wider uppercase text-xs mb-5">
            404 Error
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl leading-none font-serif text-[color:var(--foreground)] tracking-tight mb-6">
            Page not found
          </h1>
          <p className="text-base sm:text-lg text-[color:var(--muted)] mb-8 leading-relaxed">
            We couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
          </p>

          <div className="bg-white border border-[color:var(--line)] rounded-3xl p-5 shadow-sm max-w-sm w-full mx-auto mb-10 flex flex-col gap-4 text-sm transform -rotate-1 hover:rotate-0 transition-all duration-300">
            {/* Incoming Message (Broker) */}
            <div className="flex flex-col items-start w-full">
              <span className="text-[10px] text-slate-400 font-semibold mb-1 ml-1 tracking-wider uppercase">Local Broker</span>
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] relative shadow-sm">
                Sir, premium PG hai. Fully furnished. Bas 2 mins walking distance from main road! 🚶‍♂️🏢
              </div>
            </div>

            {/* Outgoing Message (Me) */}
            <div className="flex flex-col items-end w-full">
              <span className="text-[10px] text-slate-400 font-semibold mb-1 mr-1 tracking-wider uppercase">Me (1 hour later)</span>
              <div className="bg-[color:var(--accent-500)] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] relative shadow-sm">
                Bhai main pichle 1 ghante se ghoom raha hoon. Ye kaunsa jungle hai? 😭 Pura page hi 404 ho gaya!
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white px-6 py-3.5 text-sm font-medium text-[color:var(--foreground)] hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Back to home
            </Link>
            <Link
              href="/find-pg"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-6 py-3.5 text-sm font-semibold text-white transition-colors"
            >
              <Search size={16} strokeWidth={2.5} />
              Find a PG
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
