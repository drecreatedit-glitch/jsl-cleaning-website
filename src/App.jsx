import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import ServicesScroll from './components/ServicesScroll';
import Pricing from './components/Pricing';
import HowItWorks from './components/HowItWorks';
import QuoteForm from './components/QuoteForm';
import Testimonials from './components/Testimonials';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';
import ScrollProgressBar from './components/ScrollProgressBar';
import CustomCursor from './components/CustomCursor';
import './styles/globals.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const lenisRef = useRef(null);
  const rafCallbackRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Named RAF callback so we can cleanly remove it on unmount
    const onTick = (time) => lenis.raf(time * 1000);
    rafCallbackRef.current = onTick;

    // Connect Lenis to GSAP ticker
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(rafCallbackRef.current);
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <ScrollProgressBar />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Stats />
        <ServicesScroll />
        <Pricing />
        <HowItWorks />
        <QuoteForm />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
