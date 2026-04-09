// Testimonials — rewritten with Steve Jobs principle:
// "Real customers. Real numbers. No fluff."
// Lead with the most quantified story. Every quote has a concrete outcome.

const featured = {
  name: "Vikram Nair",
  role: "Property Manager · 8 PGs · Hyderabad",
  initials: "VN",
  color: "bg-indigo-600",
  quote:
    "I used to spend every Sunday evening on the phone chasing rent. 8 properties, 40+ tenants, 40+ WhatsApp messages. Now I tap one button — ShiftProof sends all the reminders. I get my Sundays back. That alone is worth 10× the subscription price.",
  metric: "10+ hrs/week saved",
  before: "40 WhatsApp calls/month",
  after: "1 tap. Done.",
};

const testimonials = [
  {
    name: "Ramesh Gupta",
    role: "PG Owner · 3 properties · Bangalore",
    initials: "RG",
    color: "bg-violet-600",
    stars: 5,
    quote:
      "₹1.2L collected last month without a single phone call. I check the dashboard for 5 minutes every Monday. That's it. My accountant gets a PDF export. Tenants get instant receipts. Everything just works.",
    metric: "₹1.2L collected monthly",
  },
  {
    name: "Priya Sharma",
    role: "Tenant · Pune",
    initials: "PS",
    color: "bg-orange-500",
    stars: 5,
    quote:
      "I submitted a maintenance request at 9 PM — the tap was leaking. By 11 AM the next day it was fixed and I got a notification. My previous PG took 3 weeks and 12 WhatsApp messages for the same thing.",
    metric: "14 hrs to fix vs 3 weeks before",
  },
  {
    name: "Suresh Mehta",
    role: "PG Owner · 2 properties · Chennai",
    initials: "SM",
    color: "bg-teal-600",
    stars: 5,
    quote:
      "My CA used to charge ₹3,000 extra every March to sort through my Excel mess. This year I exported 12 months of payout reports in 30 seconds. Saved the ₹3k and 2 hours of back-and-forth.",
    metric: "₹3,000 CA fee eliminated",
  },
  {
    name: "Ananya Patel",
    role: "Tenant · Mumbai",
    initials: "AP",
    color: "bg-pink-500",
    stars: 5,
    quote:
      "Found my PG in Andheri in 20 minutes. I could see actual availability, not '2 rooms left' marketing spin. Filters worked. Price was real. I moved in 4 days after discovering ShiftProof.",
    metric: "Moved in within 4 days",
  },
  {
    name: "Kavitha Reddy",
    role: "Tenant · Bangalore",
    initials: "KR",
    color: "bg-rose-500",
    stars: 5,
    quote:
      "I raised 6 maintenance requests in 3 months. Every single one was resolved and closed in the app. My owner stopped ignoring me — the app makes it impossible to. Accountability built in.",
    metric: "6/6 requests resolved",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f97316" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Section header — specific authority, not vague warmth */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">
            Real results. Real owners.
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            2,500+ owners already switched
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            From WhatsApp chaos to one dashboard. Here&apos;s what they said.
          </p>
        </div>

        {/* Featured testimonial — biggest, most specific, leads the section */}
        <div className="mb-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-violet-900 to-violet-800 p-8 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Decorative quote mark */}
          <div className="absolute top-6 right-8 text-white/10 text-[120px] font-serif leading-none select-none pointer-events-none">&ldquo;</div>

          <div className="relative grid lg:grid-cols-3 gap-8 items-center">
            {/* Before / After metrics */}
            <div className="flex lg:flex-col gap-4 lg:gap-6">
              <div className="flex-1 bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Before</p>
                <p className="text-lg font-bold text-rose-300">{featured.before}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">After</p>
                <p className="text-lg font-bold text-emerald-300">{featured.after}</p>
              </div>
            </div>

            {/* Quote */}
            <div className="lg:col-span-2">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-lg sm:text-xl text-white leading-relaxed font-medium mb-6">
                &ldquo;{featured.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-full ${featured.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                  {featured.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{featured.name}</p>
                  <p className="text-xs text-violet-300">{featured.role}</p>
                </div>
                <span className="ml-auto bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full hidden sm:block">
                  ✓ {featured.metric}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial grid — all with specific outcomes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:shadow-md hover:border-violet-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <StarRating count={t.stars} />
                <span className="text-[11px] font-bold bg-violet-50 text-violet-600 border border-violet-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {t.metric}
                </span>
              </div>
              <p className="flex-1 text-sm text-slate-600 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof footnote */}
        <p className="mt-10 text-center text-sm text-slate-400">
          Joined by <span className="font-semibold text-slate-600">2,500+ property owners</span> across Bangalore, Pune, Hyderabad, Mumbai, Delhi &amp; Chennai
        </p>
      </div>
    </section>
  );
}
