import Link from "next/link";
import { ArrowLeft, Check, LayoutDashboard } from "lucide-react";
import SignupForm from "./SignupForm";

export const metadata = {
  title: "Start free trial — ShiftProof",
  description: "14 days free. No credit card. Cancel anytime.",
};

const VALID_PLANS = ["solo", "growth", "enterprise"] as const;
type Plan = (typeof VALID_PLANS)[number];

function resolvePlan(raw: string | undefined): Plan {
  return (VALID_PLANS as readonly string[]).includes(raw ?? "") ? (raw as Plan) : "growth";
}

const PLAN_LABEL: Record<Plan, string> = {
  solo: "Solo",
  growth: "Growth",
  enterprise: "Enterprise",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: rawPlan } = await searchParams;
  const plan = resolvePlan(rawPlan);

  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] flex flex-col">
      <header className="mx-auto w-full max-w-3xl px-5 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </Link>
      </header>

      <section className="flex-1 mx-auto w-full max-w-xl px-5 pb-16">
        <h1 className="text-4xl sm:text-5xl leading-[1.05] text-[color:var(--foreground)]">
          Start your 14 days.
        </h1>
        <p className="mt-4 text-base text-[color:var(--muted)] leading-relaxed">
          Enter your number. We&rsquo;ll WhatsApp the download link and
          get you set up in under 3 minutes.
        </p>

        <SignupForm plan={plan} planLabel={PLAN_LABEL[plan]} />

        <ul className="mt-10 space-y-3">
          {[
            "No credit card.",
            "Free forever for tenants.",
            "Export your data and walk away anytime.",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3 text-sm text-[color:var(--foreground)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent-100)]">
                <Check size={12} strokeWidth={3} className="text-[color:var(--accent-600)]" />
              </span>
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-8 border-t border-[color:var(--line)]">
          <p className="text-sm text-[color:var(--muted)]">
            Want to access the web dashboard instead?{" "}
            <Link
              href="/auth/register"
              className="text-[color:var(--accent-600)] font-medium hover:underline inline-flex items-center gap-1"
            >
              <LayoutDashboard size={13} />
              Create a web account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
