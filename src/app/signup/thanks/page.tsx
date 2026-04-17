import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

export const metadata = {
  title: "We'll WhatsApp you shortly — ShiftProof",
  description: "Setup link on the way.",
};

function maskPhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return null;
  return `\u2022\u2022\u2022\u2022\u2022\u2022 ${digits.slice(-4)}`;
}

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; plan?: string }>;
}) {
  const { phone } = await searchParams;
  const masked = maskPhone(phone);

  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] flex flex-col">
      <header className="mx-auto w-full max-w-3xl px-5 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to home
        </Link>
      </header>

      <section className="flex-1 mx-auto w-full max-w-xl px-5 pb-16 flex flex-col justify-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--accent-100)]">
          <Check size={26} strokeWidth={2.5} className="text-[color:var(--accent-600)]" />
        </div>

        <h1 className="text-4xl sm:text-5xl leading-[1.05] text-[color:var(--foreground)]">
          We&rsquo;ll WhatsApp you shortly.
        </h1>

        <p className="mt-5 text-base text-[color:var(--muted)] leading-relaxed">
          {masked ? (
            <>
              Sending setup link to{" "}
              <span className="font-semibold text-[color:var(--foreground)]">
                +91 {masked}
              </span>
              . Usually arrives in under a minute.
            </>
          ) : (
            "Your setup link is on the way. Usually arrives in under a minute."
          )}
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent-600)] hover:text-[color:var(--accent-700)] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
