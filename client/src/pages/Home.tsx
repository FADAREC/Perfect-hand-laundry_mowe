import { getActiveSections } from "../../../config/sections";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const sectionComponents: Record<string, React.ComponentType> = {
  'hero': Hero,
  'services': Services,
  'how-it-works': HowItWorks,
  'pricing': Pricing,
  'testimonials': Testimonials,
  'about': About,
  'faq': FAQ,
  'contact': Contact,
  'footer': Footer,
};

export default function Home() {
  const activeSections = getActiveSections();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {activeSections.map((section) => {
          const SectionComponent = sectionComponents[section.type];
          if (!SectionComponent) return null;
          return <SectionComponent key={section.id} />;
        })}
      </main>
    </div>
  );
}
