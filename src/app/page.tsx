import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OwnerFeatures from "@/components/OwnerFeatures";
import TenantFeatures from "@/components/TenantFeatures";
import HowItWorks from "@/components/HowItWorks";
import KeyFeatures from "@/components/KeyFeatures";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <OwnerFeatures />
        <TenantFeatures />
        <HowItWorks />
        <KeyFeatures />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
