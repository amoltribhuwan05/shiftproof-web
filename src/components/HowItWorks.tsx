import { Home, Users, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Home,
    title: "Add your property.",
    desc: "Name, city, number of beds. Takes 3 minutes.",
  },
  {
    number: "02",
    icon: Users,
    title: "Invite your tenants.",
    desc: "Send a WhatsApp link. They self-onboard.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Rent runs itself.",
    desc: "Automatic reminders. Real-time tracking. Done.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white border-y border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        <div className="mx-auto max-w-2xl text-center mb-14 sm:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] mb-6">
            How it works
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-[color:var(--foreground)]">
            Up and running
            <br />
            <span className="text-[color:var(--accent-500)]">in an afternoon.</span>
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-10 md:gap-8">
          {/* thin connecting line on desktop */}
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-[color:var(--line)]" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--accent-100)] ring-1 ring-[color:var(--accent-500)]/30 text-[color:var(--accent-600)] mb-6">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div className="text-xs font-medium text-[color:var(--muted)] mb-2 tracking-widest">
                  STEP {step.number}
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-2">
                  {step.title}
                </h3>
                <p className="text-base text-[color:var(--muted)] leading-relaxed max-w-xs md:max-w-none">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
