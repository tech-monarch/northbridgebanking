import { useAOS } from '@/hooks/useAOS';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Security from './components/Security';
import WhyUs from './components/WhyUs';
import Academy from './components/Academy';
import UrgencyBanner from './components/UrgencyBanner';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import ActivityToast from './components/ActivityToast';

export default function LandingPage() {
  useAOS();

  return (
    <div style={{ width: '100%' }}>
      <Navbar />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <Security />
      <WhyUs />
      <Academy />
      <UrgencyBanner />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      {/* Activity toasts — rendered outside the scroll flow, fixed position */}
      <ActivityToast />
    </div>
  );
}
