const testimonials = [
  {
    name: "Ramesh Gupta",
    role: "PG Owner, Bangalore",
    initials: "RG",
    color: "bg-violet-600",
    stars: 5,
    quote:
      "ShiftProof has completely transformed how I manage my 3 PGs. Rent collection used to be a nightmare — now I just check the dashboard every morning. My tenants love it too.",
  },
  {
    name: "Priya Sharma",
    role: "Tenant, Pune",
    initials: "PS",
    color: "bg-orange-500",
    stars: 5,
    quote:
      "I can pay rent, check announcements, and even raise maintenance issues all from one app. No more WhatsApp chaos with the owner. ShiftProof just works.",
  },
  {
    name: "Vikram Nair",
    role: "Property Manager, Hyderabad",
    initials: "VN",
    color: "bg-indigo-600",
    stars: 5,
    quote:
      "Managing 8 properties across Hyderabad was overwhelming. With ShiftProof's multi-property dashboard and export reports, I save 10+ hours every month.",
  },
  {
    name: "Ananya Patel",
    role: "Tenant, Mumbai",
    initials: "AP",
    color: "bg-pink-500",
    stars: 5,
    quote:
      "Finding a verified PG near my office was so easy on ShiftProof. The filters actually work and I could see real occupancy. Moved in within a week!",
  },
  {
    name: "Suresh Mehta",
    role: "PG Owner, Chennai",
    initials: "SM",
    color: "bg-teal-600",
    stars: 5,
    quote:
      "The payout export feature alone is worth it for me. My CA is happy, I'm happy, and my tenants get digital receipts instantly. Brilliant product.",
  },
  {
    name: "Kavitha Reddy",
    role: "Tenant, Bangalore",
    initials: "KR",
    color: "bg-rose-500",
    stars: 5,
    quote:
      "My maintenance requests used to get ignored on WhatsApp. With ShiftProof they're tracked and I get notified when fixed. The owner is also more accountable now.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f97316" stroke="none">
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
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Loved by owners and tenants alike
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            Thousands of happy users across India manage their rentals with ShiftProof.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-7 hover:shadow-md transition-shadow"
            >
              <StarRating count={t.stars} />
              <p className="mt-4 flex-1 text-sm text-slate-600 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
