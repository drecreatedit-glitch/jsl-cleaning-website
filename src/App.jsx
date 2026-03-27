import { useEffect, useRef, useState, useCallback } from 'react';
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
import LegalModal from './components/LegalModal';
import CookieBanner from './components/CookieBanner';
import './styles/globals.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const lenisRef = useRef(null);
  const rafCallbackRef = useRef(null);
  const [legalModal, setLegalModal] = useState(null); // null | 'privacy' | 'terms'

  const openLegal  = useCallback((page) => setLegalModal(page), []);
  const closeLegal = useCallback(() => setLegalModal(null), []);

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

  // Global event bus for opening legal modals from anywhere
  // (CookieBanner's "Learn more", Footer links, etc.)
  useEffect(() => {
    const handler = (e) => openLegal(e.detail);
    window.addEventListener('jsl:open-legal', handler);
    return () => window.removeEventListener('jsl:open-legal', handler);
  }, [openLegal]);

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
      <Footer openLegal={openLegal} />
      <LegalModal page={legalModal} onClose={closeLegal} />
      <CookieBanner />
    </div>
  );
}
