const featured = {
  name: "Vikram Nair",
  role: "Property Manager · 8 PGs · Hyderabad",
  initials: "VN",
  quote:
    "I used to spend every Sunday evening chasing rent on WhatsApp. 8 properties, 40+ tenants, 40+ messages. Now I tap one button — ShiftProof does the rest. I get my Sundays back.",
  before: "40 WhatsApp calls / month",
  after: "1 tap. Done.",
};

const testimonials = [
  {
    name: "Ramesh Gupta",
    role: "PG Owner · 3 properties · Bangalore",
    initials: "RG",
    quote:
      "₹1.2L collected last month. Not one phone call. I check the dashboard for 5 minutes on Monday. That’s it.",
    metric: "₹1.2L / month",
  },
  {
    name: "Suresh Mehta",
    role: "PG Owner · 2 properties · Chennai",
    initials: "SM",
    quote:
      "Exported 12 months of payout reports in 30 seconds. Saved my CA’s ₹3,000 extra charge.",
    metric: "₹3,000 saved",
  },
  {
    name: "Priya Sharma",
    role: "Tenant · Pune",
    initials: "PS",
    quote:
      "Submitted a maintenance request at 9 PM. Fixed by 11 AM next day. My last PG took 3 weeks.",
    metric: "14 hrs vs 3 weeks",
  },
  {
    name: "Ananya Patel",
    role: "Tenant · Mumbai",
    initials: "AP",
    quote:
      "Found my PG in Andheri in 20 minutes. Filters worked. Price was real. Moved in 4 days later.",
    metric: "Moved in 4 days",
  },
  {
    name: "Kavitha Reddy",
    role: "Tenant · Bangalore",
    initials: "KR",
    quote:
      "Six maintenance requests in three months. Every one resolved in the app. Accountability, built in.",
    metric: "6 / 6 resolved",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 border-t border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-[color:var(--foreground)]">
            They stopped chasing rent.
            <br />
            <span className="text-[color:var(--accent-500)]">So can you.</span>
          </h2>
        </div>

        {/* Featured */}
        <div className="mb-6 rounded-3xl bg-white border border-[color:var(--line)] p-8 sm:p-12">
          <div className="grid lg:grid-cols-[auto_1fr] gap-10 items-center">
            {/* before / after */}
            <div className="flex lg:flex-col gap-3 lg:min-w-[220px]">
              <div className="flex-1 rounded-2xl bg-[color:var(--background)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)] mb-1.5">
                  Before
                </p>
                <p className="text-base font-medium text-[color:var(--foreground)]">{featured.before}</p>
              </div>
              <div className="flex-1 rounded-2xl bg-[color:var(--accent-100)] p-4 text-[color:var(--accent-700)]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--accent-700)]/60 mb-1.5">
                  After
                </p>
                <p className="text-base font-medium">{featured.after}</p>
              </div>
            </div>

            {/* quote */}
            <div>
              <p className="text-xl sm:text-2xl leading-relaxed text-[color:var(--foreground)] mb-6 serif">
                &ldquo;{featured.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[color:var(--accent-100)] flex items-center justify-center text-xs font-semibold text-[color:var(--accent-700)]">
                  {featured.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{featured.name}</p>
                  <p className="text-xs text-[color:var(--muted)]">{featured.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-3xl bg-white border border-[color:var(--line)] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[11px] font-medium text-[color:var(--accent-600)] bg-[color:var(--accent-100)] px-2.5 py-1 rounded-full">
                  {t.metric}
                </span>
              </div>
              <p className="flex-1 text-sm text-[color:var(--foreground)] leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[color:var(--line)]">
                <div className="h-8 w-8 rounded-full bg-[color:var(--accent-100)] flex items-center justify-center text-[10px] font-semibold text-[color:var(--accent-700)]">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[color:var(--foreground)]">{t.name}</p>
                  <p className="text-xs text-[color:var(--muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
