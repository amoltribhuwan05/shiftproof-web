import { Building2, UserPlus, IndianRupee, BedDouble, FileSpreadsheet, Wrench } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "All your PGs. One screen.",
    desc: "Add unlimited properties. Switch between them instantly.",
  },
  {
    icon: UserPlus,
    title: "Onboard tenants in 2 minutes.",
    desc: "Send a WhatsApp link. They upload ID and sign digitally.",
  },
  {
    icon: IndianRupee,
    title: "Rent. Automated.",
    desc: "Set due dates once. ShiftProof chases — you don't.",
  },
  {
    icon: BedDouble,
    title: "Every bed, accounted for.",
    desc: "See what's occupied, vacant, or reserved across properties.",
  },
  {
    icon: FileSpreadsheet,
    title: "Tax-ready reports.",
    desc: "Export a clean CSV for your CA. Any date range, 10 seconds.",
  },
  {
    icon: Wrench,
    title: "Maintenance, tracked.",
    desc: "Tenants raise issues. You close them. Full audit trail.",
  },
];

export default function OwnerFeatures() {
  return (
    <section id="features" className="py-20 sm:py-28 border-t border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        <div className="mx-auto max-w-2xl text-center mb-14 sm:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] mb-6">
            For owners
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-[color:var(--foreground)]">
            Everything you did by hand.
            <br />
            <span className="text-[color:var(--accent-500)]">Done for you.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--line)] rounded-3xl overflow-hidden border border-[color:var(--line)]">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group bg-[color:var(--background)] p-8 transition-colors hover:bg-white"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--accent-100)] text-[color:var(--accent-600)] group-hover:bg-[color:var(--accent-200)] group-hover:text-[color:var(--accent-700)] transition-colors">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-1.5 leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
