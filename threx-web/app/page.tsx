import Cursor from '../components/landing/Cursor';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import Ticker from '../components/landing/Ticker';
import Problem from '../components/landing/Problem';
import Pillars from '../components/landing/Pillars';
import HowItWorks from '../components/landing/HowItWorks';
import Reputation from '../components/landing/Reputation';
import Manifesto from '../components/landing/Manifesto';
import Stats from '../components/landing/Stats';
import Pricing from '../components/landing/Pricing';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import RevealObserver from '../components/landing/RevealObserver';

export default function LandingPage() {
  return (
    <>
      <Cursor />
      <LandingNav />
      <Hero />
      <Ticker />
      <Problem />
      <Pillars />
      <HowItWorks />
      <Reputation />
      <Manifesto />
      <Stats />
      <Pricing />
      <CTA />
      <Footer />
      <RevealObserver />
    </>
  );
}
