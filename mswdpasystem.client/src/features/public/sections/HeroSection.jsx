import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import Button from '../../../shared/components/ui/Button';
import { LogoMark } from '../../../shared/components/ui/Logo';
import { HeroStagger, StaggerItem } from '../../../shared/motion';
import { officeInfo } from '../content/siteContent';

export default function HeroSection() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // Parallax on the seal watermark only — the text never drifts, so nothing
  // the user is reading moves under them.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const sealY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white"
    >
      {/* Eight-ray sun watermark — the signature mark of the seal */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { y: sealY }}
        className="absolute -right-24 -top-24 opacity-[0.07] pointer-events-none select-none"
      >
        <LogoMark size={560} />
      </motion.div>

      <HeroStagger className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <StaggerItem
          as="p"
          className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gold-400"
        >
          Republic of the Philippines · Province of La Union · Municipality of Caba
        </StaggerItem>

        <StaggerItem
          as="h1"
          id="hero-heading"
          className="mt-4 max-w-3xl text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight"
        >
          Serbisyong may <span className="text-gold-400">malasakit</span> para sa bawat pamilyang Cabeño.
        </StaggerItem>

        <StaggerItem
          as="p"
          className="mt-5 max-w-2xl text-base sm:text-lg text-primary-200 leading-relaxed"
        >
          The Municipal Social Welfare and Development Office brings social pension, family
          assistance, and crisis support closer to you — with transparent records, faster
          verification, and services you can track online.
        </StaggerItem>

        <StaggerItem className="mt-8 flex flex-wrap items-center gap-3">
          <Button as={Link} to="/register" variant="warning" size="lg">
            Create a Citizen Account
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <Button
            as={Link}
            to="/login"
            size="lg"
            className="bg-white/10 text-white border border-white/25 hover:bg-white/20"
          >
            Sign In
          </Button>
        </StaggerItem>

        <StaggerItem className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-primary-200">
          <p>{officeInfo.hours}</p>
          <p className="inline-flex items-center gap-1.5">
            <Phone size={14} className="text-gold-400" aria-hidden="true" />
            Emergency? Dial <span className="font-bold text-white">911</span>
          </p>
        </StaggerItem>
      </HeroStagger>
    </section>
  );
}
