'use client';

import { useEffect, useRef, useState, ReactNode, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Users, ShieldCheck, Handshake, Home, Sparkles, ArrowDown } from 'lucide-react';

const CALL_NUMBER = '+917888548215';
const WHATSAPP_NUMBER = '918264757806';
const SALES_NUMBER = '+918264757806';
const SITE_VISIT_NUMBER = '+919814014708';

const SOCIAL_LINKS = {
  instagram: '#',
  facebook: '#',
  youtube: '#',
  linkedin: '#',
  googleBusiness: '#',
};

const FOUNDERS = [
  { name: 'Manmeet Singh', role: 'Founder and Real Estate Consultant' },
  { name: 'Armeet Singh', role: 'Founder and Real Estate Consultant' },
  { name: 'Viraj Singh', role: 'Founder and Real Estate Consultant' },
  { name: 'Vansh', role: 'Co-Founder and Property Consultant' },
];

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Reveal({ children, className = '', delayMs = 0 }: { children: ReactNode; className?: string; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delayMs);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={"transition-all duration-700 ease-out " + (visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0") + " " + className}
    >
      {children}
    </div>
  );
}

function GlowButton({ href, external, className, children }: { href: string; external?: boolean; className: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--x', (e.clientX - rect.left) + 'px');
    node.style.setProperty('--y', (e.clientY - rect.top) + 'px');
  }

  return (
    
     <a ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseMove={handleMouseMove}
      className={"group relative overflow-hidden " + className}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(120px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.18), transparent 70%)',
        }}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </a>
  );
}

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = "perspective(600px) rotateY(" + (px * 8) + "deg) rotateX(" + (py * -8) + "deg) translateY(-2px)";
  }

  function handleMouseLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={"transition-transform duration-200 ease-out will-change-transform " + className}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            Signature Estates
          </Link>
          <GlowButton
            href={"https://wa.me/" + WHATSAPP_NUMBER}
            external
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <MessageCircle size={15} /> WhatsApp Us
          </GlowButton>
        </div>
      </header>

      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/auth-showcase.png"
            alt="Signature Estates"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <Reveal>
              <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                <Sparkles size={13} /> About Signature Estates
              </span>
            </Reveal>
            <Reveal delayMs={100}>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                More Than
                <br />
                Property.
                <br />
                <span className="text-white/70">We Build Relationships.</span>
              </h1>
            </Reveal>
            <Reveal delayMs={200} className="mt-8 flex flex-wrap items-center gap-3">
              <GlowButton
                href={"tel:" + CALL_NUMBER}
                className="rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Phone size={15} /> {CALL_NUMBER}
              </GlowButton>
              <GlowButton
                href={"https://wa.me/" + WHATSAPP_NUMBER}
                external
                className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </GlowButton>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/60">
          <ArrowDown size={20} />
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-24 dark:border-neutral-800">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
          <Reveal>
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              Our Story
            </span>
            <p className="text-xl leading-relaxed tracking-tight text-neutral-800 dark:text-neutral-100">
              Our journey began by helping people in our local market make better property
              decisions.
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
              By combining local market knowledge with a personal approach, we have built our
              business around understanding each client&apos;s requirements, not just presenting
              them with listings.
            </p>
          </Reveal>
          <Reveal delayMs={100}>
            <TiltCard className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <Home className="mb-4 text-neutral-400 dark:text-neutral-500" size={28} />
              <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                Every client relationship starts with listening, to what you actually need, not
                what is easiest to sell. That is the difference between a transaction and a
                relationship.
              </p>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: MapPin, label: 'Local Market Expertise' },
            { icon: Handshake, label: 'Personal Assistance' },
            { icon: Users, label: 'End-to-End Support' },
            { icon: ShieldCheck, label: 'Verified Property Information' },
          ].map((item, i) => (
            <Reveal key={item.label} delayMs={i * 80}>
              <TiltCard className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
                <item.icon className="text-neutral-400 dark:text-neutral-500" size={24} />
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{item.label}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-24 dark:border-neutral-800">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              Who We Are
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Meet the Founders
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {FOUNDERS.map((founder, i) => (
              <Reveal key={founder.name} delayMs={i * 80}>
                <TiltCard className="rounded-xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-base font-semibold text-white dark:bg-white dark:text-neutral-900">
                    {founder.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{founder.name}</p>
                  <p className="mt-1 text-xs leading-snug text-neutral-500 dark:text-neutral-400">{founder.role}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              Talk to Us
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Reach the Right Team, Directly
            </h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal>
              <ContactCard label="Sales and Enquiries" number={SALES_NUMBER} whatsapp={SALES_NUMBER.replace('+', '')} />
            </Reveal>
            <Reveal delayMs={80}>
              <ContactCard label="Site Visits and Assistance" number={SITE_VISIT_NUMBER} whatsapp={SITE_VISIT_NUMBER.replace('+', '')} />
            </Reveal>
          </div>

          <Reveal className="mt-12 flex justify-center gap-4">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-all hover:-translate-y-0.5 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
              <InstagramIcon />
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-all hover:-translate-y-0.5 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
              <FacebookIcon />
            </a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-all hover:-translate-y-0.5 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
              <LinkedinIcon />
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-8 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
        {new Date().getFullYear()} Signature Estates. More than property, we build relationships.
      </footer>
    </div>
  );
}

function ContactCard({ label, number, whatsapp }: { label: string; number: string; whatsapp: string }) {
  return (
    <TiltCard className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mb-5 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">{number}</p>
      <div className="flex gap-2">
        <a href={"tel:" + number} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800">
          <Phone size={13} /> Call
        </a>
        <GlowButton
          href={"https://wa.me/" + whatsapp}
          external
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <MessageCircle size={13} /> WhatsApp
        </GlowButton>
      </div>
    </TiltCard>
  );
}
