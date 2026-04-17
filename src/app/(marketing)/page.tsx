import Hero from "@/components/Hero";
import OwnerFeatures from "@/components/OwnerFeatures";
import TenantFeatures from "@/components/TenantFeatures";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <main>
      <Hero />
      <OwnerFeatures />
      <HowItWorks />
      <TenantFeatures />
      <Testimonials />
      <Pricing />
      <FAQ />
    </main>
  );
}
