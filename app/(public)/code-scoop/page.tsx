/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Baloo_2, Nunito } from 'next/font/google';
import {
  Newspaper,
  Hammer,
  Puzzle,
  Terminal,
  BookOpenCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  Truck,
  Mail,
  ShieldCheck,
  Hourglass,
  ArrowDown,
  Users,
  CalendarDays,
  Rocket,
  CalendarClock,
  LayoutDashboard,
  BellRing,
  Circle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const display = Baloo_2({ subsets: ['latin'], weight: ['600', '700', '800'] });
const body = Nunito({ subsets: ['latin'], weight: ['400', '600', '700'] });

// Brand colours taken from the Code Scoop logo
const INK = '#1A1A26';
const ORANGE = '#E8711F';
const GOLD = '#F2A91E';

// ─── Content ─────────────────────────────────────────────────────────────────
type EditionId = 'learn' | 'discover' | 'create' | 'innovate';

interface Edition {
  id: EditionId;
  name: string;
  grades: string;
  bg: string;
  fg: string;
  tagline: string;
  hasCodeCorner: boolean;
}

const EDITIONS: Edition[] = [
  { id: 'learn', name: 'Learn', grades: 'Grades 1–2', bg: GOLD, fg: INK, tagline: 'First steps with computers, shapes, patterns and play.', hasCodeCorner: false },
  { id: 'discover', name: 'Discover', grades: 'Grades 3–4', bg: ORANGE, fg: '#FFFFFF', tagline: 'Find out how technology works, one curious question at a time.', hasCodeCorner: true },
  { id: 'create', name: 'Create', grades: 'Grades 5–6', bg: '#C4431B', fg: '#FFFFFF', tagline: 'Turn ideas into games, stories and small coding projects.', hasCodeCorner: true },
  { id: 'innovate', name: 'Innovate', grades: 'Grades 7–8', bg: INK, fg: '#FFFFFF', tagline: 'Go deeper into AI, digital safety and the tech shaping tomorrow.', hasCodeCorner: true },
];

const SECTIONS = [
  { key: 'news', Icon: Newspaper, title: 'Tech News & Discoveries', text: 'Real-world stories and fascinating facts from the world of technology.' },
  { key: 'build', Icon: Hammer, title: 'Build It! Activities', text: 'Hands-on challenges that help children make something themselves.' },
  { key: 'brain', Icon: Puzzle, title: 'Brain Bytes & Puzzles', text: 'Puzzles and quizzes that build logical thinking.' },
  { key: 'code', Icon: Terminal, title: 'Code Corner', text: 'Short coding exercises to try out. Included from Grade 3 and above.', codeOnly: true },
];

const USPS = [
  { Icon: Users, title: 'Age-appropriate editions', text: 'Four editions written for Grades 1–2, 3–4, 5–6 and 7–8.' },
  { Icon: CalendarDays, title: 'Fresh monthly themes', text: 'A new technology theme arrives every month.' },
  { Icon: Rocket, title: 'Learning beyond the classroom', text: 'Technology education that goes past screens and textbooks.' },
  { Icon: Newspaper, title: 'Tech News & Discoveries', text: 'Real-world discoveries and fascinating facts.' },
  { Icon: Hammer, title: 'Build It! Activities', text: 'Creative, hands-on challenges to make something.' },
  { Icon: Puzzle, title: 'Brain Bytes & Puzzles', text: 'Puzzles and quizzes that build logical thinking.' },
  { Icon: Terminal, title: 'Code Corner', text: 'Coding practice for grades 3 and above.' },
];

const FEATURES = [
  { Icon: CreditCard, title: 'Secure payment gateway', text: 'Accept subscriptions online and issue payment confirmations.' },
  { Icon: CalendarClock, title: 'Subscription management', text: 'Track start date, duration, renewal and expiry.' },
  { Icon: LayoutDashboard, title: 'Order dashboard', text: 'See paid, pending, cancelled and fulfilled orders.' },
  { Icon: Truck, title: 'Delivery tracking', text: 'Manage printed editions and shipping details.' },
  { Icon: BellRing, title: 'Email notifications', text: 'Send order confirmation, dispatch updates and renewal reminders.' },
];

const GRADE_OPTIONS = EDITIONS.map((e) => ({ id: e.id, label: `${e.grades} — ${e.name}` }));

// Backend endpoint (app/api/code-scoop/route.ts)
const API_URL = '/api/code-scoop';

// ─── Social handles — TODO: replace the placeholder links/handles ────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', handle: '@your_instagram_handle', href: 'https://instagram.com/your_instagram_handle', Icon: InstagramIcon },
  { key: 'whatsapp', label: 'WhatsApp', handle: '+91 XXXXX XXXXX', href: 'https://wa.me/91XXXXXXXXXX', Icon: MessageCircle },
  { key: 'facebook', label: 'Facebook', handle: 'your.facebook.page', href: 'https://facebook.com/your.facebook.page', Icon: FacebookIcon },
];

// ─── Monthly issue image ─────────────────────────────────────────────────────
// Each month, put the new cover image in /public/issues/ and add one line to
// ISSUE_IMAGES below (key = YYYY-MM). If a month has no entry, the default
// image is shown. The "upcoming" month is always next month.
const ISSUE_IMAGES: Record<string, string> = {
  default: '/issues/upcoming.jpg',
  // '2026-12': '/issues/2026-12.jpg',
};

function getIssueImage(ym?: string): string {
  return (ym && ISSUE_IMAGES[ym]) || ISSUE_IMAGES.default;
}

function upcomingYm(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CodeScoopPage() {
  const reduce = useReducedMotion();
  const [editionId, setEditionId] = useState<EditionId>('discover');
  const [ym, setYm] = useState<string | undefined>(undefined);
  const edition = EDITIONS.find((e) => e.id === editionId)!;

  // Computed after mount so server and client never disagree about the month.
  useEffect(() => {
    setYm(upcomingYm());
  }, []);

  const issueImage = getIssueImage(ym);

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });

  const subscribeToEdition = () => {
    goTo('subscribe');
  };

  return (
    <div className={`${body.className} min-h-screen overflow-x-clip bg-[#FFFAF3] text-[#1A1A26]`}>
      {/* Header: logo + Subscribe on row 1, menu on its own row (mobile) / right-aligned (desktop) */}
      <header className="sticky top-0 z-40 border-b border-[#1A1A26]/10 bg-[#FFFAF3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 py-2 sm:px-6">
          <a href="#top" className="flex items-center gap-2" aria-label="Code Scoop home">
            <Image src="/image/codescoop.jpeg" alt="Code Scoop" width={48} height={48} priority className="h-11 w-11 rounded-lg object-contain" />
            <span className={`${display.className} text-xl font-extrabold`}>
              Code <span style={{ color: ORANGE }}>Scoop</span>
            </span>
          </a>

          <nav
            aria-label="Main"
            className="order-3 mt-1 flex w-full items-center justify-center gap-6 border-t border-[#1A1A26]/10 pt-1 text-sm font-semibold md:order-none md:ml-auto md:mr-6 md:mt-0 md:w-auto md:border-0 md:pt-0"
          >
            <button onClick={() => goTo('inside')} className="py-1.5 hover:text-[#E8711F]">What&apos;s inside</button>
            <button onClick={() => goTo('plans')} className="py-1.5 hover:text-[#E8711F]">Plans</button>
            <button onClick={() => goTo('features')} className="py-1.5 hover:text-[#E8711F]">How it works</button>
          </nav>

          <button
            onClick={() => goTo('subscribe')}
            className="order-2 rounded-full px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26] md:order-none"
            style={{ background: ORANGE }}
          >
            Subscribe
          </button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div>
          <p className="mb-3 inline-block rounded-full px-4 py-1 text-sm font-bold" style={{ background: GOLD }}>
            Your fresh bytes of tech, code &amp; fun!
          </p>
          <h1 className={`${display.className} text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl`}>
            Meet Code Scoop — where technology becomes an adventure!
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#1A1A26]/75 sm:text-lg">
            Code Scoop is a monthly technology-learning booklet by Codexcellence Edutech, designed to help school
            students explore the fascinating world of computers, coding, artificial intelligence, digital safety, and
            emerging technologies.
          </p>

          {/* Edition picker */}
          <p className="mt-8 text-sm font-bold">Pick your child&apos;s grade to preview the edition</p>
          <div role="radiogroup" aria-label="Edition" className="mt-3 flex flex-wrap gap-2">
            {EDITIONS.map((e) => {
              const active = e.id === editionId;
              return (
                <button
                  key={e.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setEditionId(e.id)}
                  className="rounded-full border-2 px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
                  style={
                    active
                      ? { background: INK, borderColor: INK, color: '#fff' }
                      : { background: '#fff', borderColor: 'rgba(26,26,38,0.15)', color: INK }
                  }
                >
                  {e.grades}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              onClick={subscribeToEdition}
              className="rounded-full px-7 py-3 font-bold text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
              style={{ background: ORANGE }}
            >
              Subscribe to {edition.name}
            </button>
            <button onClick={() => goTo('inside')} className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
              See what&apos;s inside <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Booklet preview — changes with the picker; the empty middle now shows the upcoming issue */}
        <div className="relative mx-auto flex w-full max-w-sm justify-center py-6">
          <div className="absolute inset-x-8 top-10 h-[92%] rotate-6 rounded-3xl bg-[#1A1A26]/10" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.div
              key={edition.id}
              initial={reduce ? false : { opacity: 0, rotate: -9, y: 20 }}
              animate={{ opacity: 1, rotate: -3, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 6, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[5/7] w-full overflow-hidden rounded-3xl p-5 shadow-2xl sm:p-6"
              style={{ background: edition.bg, color: edition.fg }}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" aria-hidden />
              <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10" aria-hidden />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center gap-2">
                  <span className="grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-xl bg-white">
                    <Image src="/image/codescoop.jpeg" alt="" width={48} height={48} className="h-10 w-10 object-contain" />
                  </span>
                  <span className={`${display.className} text-lg font-bold`}>Code Scoop</span>
                </div>

                <div className="my-4 min-h-0 flex-1">
                  <IssueWindow src={issueImage} editionName={edition.name} />
                </div>

                <div>
                  <p className="text-sm font-bold opacity-80">{edition.grades}</p>
                  <p className={`${display.className} text-5xl font-extrabold leading-none sm:text-6xl`}>{edition.name}</p>
                  <p className="mt-2 text-sm font-semibold leading-snug opacity-90">{edition.tagline}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <p className="text-base leading-relaxed sm:text-lg">
          Every edition brings technology to life through engaging stories, fascinating facts, real-world discoveries,
          puzzles, quizzes, creative activities, and hands-on challenges that encourage children to think, question,
          explore, and create.
        </p>
        <div className="flex items-start gap-3 rounded-2xl bg-[#FFF1E3] p-5">
          <BookOpenCheck className="mt-0.5 h-6 w-6 flex-shrink-0" style={{ color: ORANGE }} />
          <p className="leading-relaxed">
            We believe technology education should go beyond screens and textbooks. It should spark curiosity, build
            logical thinking, encourage creativity, and help children understand the digital world shaping their future.
          </p>
        </div>
      </section>

      {/* Why families choose — carousel */}
      <section id="why" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <UspCarousel reduce={!!reduce} />
      </section>

      {/* What's inside */}
      <section id="inside" className="scroll-mt-28 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>
            What&apos;s inside the {edition.name} edition
          </h2>
          <p className="mt-2 max-w-2xl text-[#1A1A26]/70">
            Every edition has a fresh monthly theme and learning that goes beyond the classroom. Switch the grade above to see what changes.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SECTIONS.map(({ key, Icon, title, text, codeOnly }) => {
              const locked = codeOnly && !edition.hasCodeCorner;
              return (
                <motion.div
                  layout={!reduce}
                  key={key}
                  className="flex gap-4 rounded-2xl border-2 p-5"
                  style={{
                    borderColor: locked ? 'rgba(26,26,38,0.12)' : edition.id === 'innovate' ? INK : edition.bg,
                    background: locked ? '#F6F3EE' : '#fff',
                    opacity: locked ? 0.75 : 1,
                  }}
                >
                  <span
                    className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl"
                    style={{ background: locked ? '#E4DFD6' : edition.bg, color: locked ? INK : edition.fg }}
                  >
                    {locked ? <Lock className="h-5 w-5" /> : <Icon className="h-6 w-6" />}
                  </span>
                  <div>
                    <h3 className={`${display.className} text-xl font-bold`}>{title}</h3>
                    <p className="text-sm leading-relaxed text-[#1A1A26]/70">
                      {locked ? 'Code Corner starts from Grade 3. Your child will unlock it in the Discover edition.' : text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-[#1A1A26]/25 p-6 text-center sm:p-10">
          <Hourglass className="h-8 w-8" style={{ color: ORANGE }} />
          <h2 className={`${display.className} text-2xl font-extrabold sm:text-3xl`}>Explore subscription plans</h2>
          <p className="max-w-lg text-[#1A1A26]/70">
            Plan details will be conveyed shortly. The 6-month and 12-month options are open in the form below, so you
            can register your interest now.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-14 sm:px-6 sm:pb-16">
        <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>Subscriptions made simple</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl bg-white p-5">
              <Icon className="mt-1 h-6 w-6 flex-shrink-0" style={{ color: ORANGE }} />
              <div>
                <h3 className={`${display.className} text-lg font-bold leading-tight`}>{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#1A1A26]/70">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section id="subscribe" className="scroll-mt-20 bg-[#1A1A26] py-14 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>Subscribe to Code Scoop</h2>
            <p className="mt-3 text-white/75">Bring a fresh world of technology discoveries to your child every month.</p>
            <ul className="mt-8 space-y-4">
              {[
                { Icon: CreditCard, t: 'Secure online payment with a confirmation for every order.' },
                { Icon: Mail, t: 'Email updates for order confirmation, dispatch and renewal reminders.' },
                { Icon: Truck, t: 'Track the delivery of your printed editions.' },
                { Icon: ShieldCheck, t: 'Parent or guardian consent is required for every subscription.' },
              ].map(({ Icon, t }) => (
                <li key={t} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-sm leading-relaxed text-white/85">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <SubscribeForm editionId={editionId} onEditionChange={setEditionId} reduce={!!reduce} />
        </div>
      </section>

      {/* Social handles */}
      <section id="follow" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className={`${display.className} text-2xl font-extrabold sm:text-3xl`}>Follow Code Scoop</h2>
        <p className="mt-2 max-w-xl text-[#1A1A26]/70">Get previews of upcoming issues, activity ideas and updates. You can also message us with any questions.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {SOCIALS.map(({ key, label, handle, href, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border-2 border-[#1A1A26]/10 bg-white p-4 transition hover:border-[#E8711F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl text-white" style={{ background: ORANGE }}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className={`${display.className} block text-lg font-bold leading-tight`}>{label}</span>
                <span className="block truncate text-sm text-[#1A1A26]/70">{handle}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm text-[#1A1A26]/60">
        Code Scoop is a monthly booklet by Codexcellence Edutech.
      </footer>
    </div>
  );
}

// ─── Upcoming-issue image (inside the booklet card) ──────────────────────────
function IssueWindow({ src, editionName }: { src: string; editionName: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
      <Image
        src={src}
        alt={`${editionName} edition upcoming issue`}
        fill
        sizes="(min-width: 1024px) 380px, 80vw"
        className="object-cover"
        priority
      />
    </div>
  );
}

// ─── "Why families choose" carousel ──────────────────────────────────────────
function UspCarousel({ reduce }: { reduce: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [maxIndex, setMaxIndex] = useState(USPS.length - 1);
  const [paused, setPaused] = useState(false);

  // How many cards fit at the current screen width decides how many "stops" there are.
  const measure = useCallback(() => {
    const t = trackRef.current;
    const first = t?.children[0] as HTMLElement | undefined;
    if (!t || !first) return;
    const perView = Math.max(1, Math.floor((t.clientWidth + 16) / (first.offsetWidth + 16)));
    setMaxIndex(Math.max(0, USPS.length - perView));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const goTo = useCallback(
    (i: number) => {
      const t = trackRef.current;
      const card = t?.children[i] as HTMLElement | undefined;
      if (!t || !card) return;
      t.scrollTo({ left: card.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    },
    [reduce],
  );

  const next = useCallback(() => goTo(active >= maxIndex ? 0 : active + 1), [active, maxIndex, goTo]);
  const prev = () => goTo(active <= 0 ? maxIndex : active - 1);

  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    if (t.scrollLeft >= t.scrollWidth - t.clientWidth - 2) {
      setActive(maxIndex);
      return;
    }
    let best = 0;
    let dist = Infinity;
    Array.from(t.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - t.scrollLeft);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setActive(Math.min(best, maxIndex));
  };

  // Gentle autoplay; stops on hover/focus/touch and for reduced-motion users.
  useEffect(() => {
    if (reduce || paused || maxIndex === 0) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [reduce, paused, maxIndex, next]);

  const btn =
    'grid h-10 w-10 place-items-center rounded-full border-2 border-[#1A1A26]/15 bg-white transition hover:border-[#E8711F] hover:text-[#E8711F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]';

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Why families choose Code Scoop"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="flex items-end justify-between gap-4">
        <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>Why families choose Code Scoop</h2>
        {maxIndex > 0 && (
          <div className="flex flex-none gap-2">
            <button type="button" onClick={prev} aria-label="Previous" className={btn}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} aria-label="Next" className={btn}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="relative mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {USPS.map(({ Icon, title, text }, i) => (
          <div
            key={title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${USPS.length}`}
            className="flex-none basis-[85%] snap-start rounded-2xl border-2 border-[#1A1A26]/10 bg-white p-5 sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]"
          >
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: ORANGE }}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className={`${display.className} text-lg font-bold leading-tight`}>{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#1A1A26]/70">{text}</p>
          </div>
        ))}
      </div>

      {maxIndex > 0 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => goTo(n)}
              aria-label={`Go to slide ${n + 1}`}
              aria-current={n === active}
              className="h-2.5 rounded-full transition-all"
              style={{ width: n === active ? 24 : 10, background: n === active ? ORANGE : 'rgba(26,26,38,0.2)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subscription form ───────────────────────────────────────────────────────
interface Values {
  parentName: string;
  email: string;
  mobile: string;
  duration: '6' | '12' | '';
  pin: string;
  address: string;
  consent: boolean;
}

type FieldKey = keyof Values;
type Errors = Partial<Record<FieldKey, string>>;

// Same order as the fields on screen, so the first error gets focus.
const FIELD_ORDER: FieldKey[] = ['parentName', 'email', 'mobile', 'duration', 'pin', 'address', 'consent'];

// One place for every rule. Returns an error message, or '' when the field is valid.
function check(k: FieldKey, v: Values): string {
  switch (k) {
    case 'parentName':
      if (!v.parentName.trim()) return 'Enter the parent or guardian name.';
      if (v.parentName.trim().length < 2) return 'Name must be at least 2 characters.';
      if (/\d/.test(v.parentName)) return 'Name should not contain numbers.';
      return '';
    case 'email':
      if (!v.email.trim()) return 'Enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) return 'Enter a valid email address, like name@example.com.';
      return '';
    case 'mobile':
      if (!v.mobile) return 'Enter your mobile number.';
      if (!/^\d{10}$/.test(v.mobile)) return 'Mobile number must be exactly 10 digits.';
      return '';
    case 'duration':
      return v.duration ? '' : 'Choose a subscription duration.';
    case 'pin':
      if (!v.pin) return 'Enter the delivery PIN code.';
      if (!/^[1-9]\d{5}$/.test(v.pin)) return 'Enter a valid 6-digit PIN code.';
      return '';
    case 'address':
      if (!v.address.trim()) return 'Enter the delivery address.';
      if (v.address.trim().length < 10) return 'Enter the full address: house no., street, area and city.';
      return '';
    case 'consent':
      return v.consent ? '' : 'Please confirm you are the parent or legal guardian.';
  }
}

// Red asterisk for required fields
const Req = () => (
  <>
    <span className="ml-0.5 font-bold text-red-600" aria-hidden="true">*</span>
    <span className="sr-only"> (required)</span>
  </>
);

function SubscribeForm({
  editionId,
  onEditionChange,
  reduce,
}: {
  editionId: EditionId;
  onEditionChange: (id: EditionId) => void;
  reduce: boolean;
}) {
  const [f, setF] = useState<Values>({
    parentName: '',
    email: '',
    mobile: '',
    duration: '',
    pin: '',
    address: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const set = <K extends FieldKey>(k: K, v: Values[K]) => {
    const next: Values = { ...f, [k]: v };
    setF(next);
    if (serverError) setServerError('');
    // Once a field shows an error (or after a submit attempt) re-check as the person types.
    if (errors[k] || submitted) setErrors((p) => ({ ...p, [k]: check(k, next) || undefined }));
  };

  const blur = (k: FieldKey) => setErrors((p) => ({ ...p, [k]: check(k, f) || undefined }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const e: Errors = {};
    for (const k of FIELD_ORDER) {
      const msg = check(k, f);
      if (msg) e[k] = msg;
    }
    setErrors(e);
    const first = FIELD_ORDER.find((k) => e[k]);
    if (first) {
      document.getElementById(`field-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName: f.parentName.trim(),
          email: f.email.trim(),
          mobile: f.mobile,
          edition: editionId, // 'learn' | 'discover' | ... — the API upper-cases it
          durationMonths: Number(f.duration),
          pin: f.pin,
          address: f.address.trim(),
          consent: f.consent,
        }),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        setOrderNumber(json.data?.orderNumber ?? '');
        setDone(true);
        return;
      }

      // 400: show each server-side message under its field
      if (Array.isArray(json?.errors)) {
        const fe: Errors = {};
        let general = '';
        for (const it of json.errors as { field: string; message: string }[]) {
          const key = (it.field === 'durationMonths' ? 'duration' : it.field) as FieldKey;
          if (FIELD_ORDER.includes(key)) {
            if (!fe[key]) fe[key] = it.message;
          } else if (!general) {
            general = it.message; // e.g. an invalid grade
          }
        }
        setErrors(fe);
        if (general) setServerError(general);
        const firstKey = FIELD_ORDER.find((k) => fe[k]);
        if (firstKey) document.getElementById(`field-${firstKey}`)?.focus();
        return;
      }

      // 409 duplicate, 500, etc.
      setServerError(json?.message || 'Something went wrong. Please try again.');
    } catch {
      setServerError('Could not reach the server. Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fully-open input boxes: white, clear grey border, orange on focus, red when invalid.
  const input = (k: FieldKey) =>
    `w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-[#1A1A26] placeholder:text-[#1A1A26]/40 focus:outline-none focus:ring-4 ${
      errors[k]
        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200'
        : 'border-[#1A1A26]/30 hover:border-[#1A1A26]/50 focus:border-[#E8711F] focus:ring-[#E8711F]/20'
    }`;

  const aria = (k: FieldKey) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `err-${k}` : undefined,
  });

  const errorMsg = (k: FieldKey) =>
    errors[k] ? (
      <p id={`err-${k}`} role="alert" className="mt-1 flex items-start gap-1 text-sm font-semibold text-red-600">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
        {errors[k]}
      </p>
    ) : null;

  const errorCount = Object.values(errors).filter(Boolean).length;

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 text-center text-[#1A1A26] sm:p-10"
      >
        <CheckCircle2 className="h-16 w-16 text-green-500" strokeWidth={1.5} />
        <h3 className={`${display.className} mt-4 text-2xl font-extrabold`}>Subscription request received</h3>
        <p className="mt-2 max-w-sm text-[#1A1A26]/70">
          Thank you, {f.parentName.trim().split(' ')[0]}. We&apos;ll email {f.email.trim()} with the plan details and the next steps for payment.
        </p>
        <OrderSummary editionId={editionId} months={Number(f.duration)} hasDelivery orderNumber={orderNumber} />
      </motion.div>
    );
  }

  const radioBox = (active: boolean, invalid: boolean) => ({
    borderColor: active ? ORANGE : invalid ? '#EF4444' : 'rgba(26,26,38,0.3)',
    background: active ? '#FFF1E3' : invalid ? '#FEF2F2' : '#fff',
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl bg-white p-5 text-[#1A1A26] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-block rounded-full bg-[#FFF1E3] px-3 py-1 text-sm font-bold">Individual subscription</p>
        <p className="text-sm text-[#1A1A26]/70">
          <span className="font-bold text-red-600">*</span> All fields are required
        </p>
      </div>

      {submitted && errorCount > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border-2 border-red-500 bg-red-50 p-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          Please fix the {errorCount} highlighted {errorCount === 1 ? 'field' : 'fields'} below.
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className={`${display.className} mb-1 text-xl font-bold`}>Parent / guardian details</legend>

        <div>
          <label htmlFor="field-parentName" className="mb-1 block text-sm font-bold">
            Parent / guardian name <Req />
          </label>
          <input
            id="field-parentName"
            className={input('parentName')}
            value={f.parentName}
            onChange={(e) => set('parentName', e.target.value)}
            onBlur={() => blur('parentName')}
            placeholder="Full name"
            autoComplete="name"
            {...aria('parentName')}
          />
          {errorMsg('parentName')}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="field-email" className="mb-1 block text-sm font-bold">
              Email address <Req />
            </label>
            <input
              id="field-email"
              type="email"
              className={input('email')}
              value={f.email}
              onChange={(e) => set('email', e.target.value)}
              onBlur={() => blur('email')}
              placeholder="name@example.com"
              autoComplete="email"
              {...aria('email')}
            />
            {errorMsg('email')}
          </div>
          <div>
            <label htmlFor="field-mobile" className="mb-1 block text-sm font-bold">
              Mobile number <Req />
            </label>
            <input
              id="field-mobile"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={input('mobile')}
              value={f.mobile}
              onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => blur('mobile')}
              placeholder="10-digit mobile number"
              autoComplete="tel-national"
              {...aria('mobile')}
            />
            {errorMsg('mobile')}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${display.className} mb-2 text-xl font-bold`}>Subscription preferences</legend>

        <p className="mb-2 text-sm font-bold">
          Student&apos;s grade <Req />
        </p>
        <div role="radiogroup" aria-label="Student's grade" className="grid gap-2 sm:grid-cols-2">
          {GRADE_OPTIONS.map((g) => {
            const active = g.id === editionId;
            return (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-[#1A1A26]"
                style={radioBox(active, false)}
              >
                <input type="radio" name="grade" className="h-4 w-4 accent-[#E8711F]" checked={active} onChange={() => onEditionChange(g.id)} />
                {g.label}
              </label>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-sm font-bold">
          Subscription duration <Req />
        </p>
        <div role="radiogroup" aria-label="Subscription duration" className="grid grid-cols-2 gap-2">
          {(['6', '12'] as const).map((d) => {
            const active = f.duration === d;
            return (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-[#1A1A26]"
                style={radioBox(active, !!errors.duration)}
              >
                <input
                  id={d === '6' ? 'field-duration' : undefined}
                  type="radio"
                  name="duration"
                  className="h-4 w-4 accent-[#E8711F]"
                  checked={active}
                  onChange={() => set('duration', d)}
                  {...(d === '6' ? aria('duration') : {})}
                />
                {d} months
              </label>
            );
          })}
        </div>
        {errorMsg('duration')}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={`${display.className} mb-1 text-xl font-bold`}>Delivery for printed editions</legend>
        <div>
          <label htmlFor="field-pin" className="mb-1 block text-sm font-bold">
            Delivery PIN code <Req />
          </label>
          <input
            id="field-pin"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className={`${input('pin')} sm:max-w-[220px]`}
            value={f.pin}
            onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
            onBlur={() => blur('pin')}
            placeholder="6-digit PIN code"
            autoComplete="postal-code"
            {...aria('pin')}
          />
          {errorMsg('pin')}
        </div>
        <div>
          <label htmlFor="field-address" className="mb-1 block text-sm font-bold">
            Delivery address <Req />
          </label>
          <textarea
            id="field-address"
            rows={3}
            className={input('address')}
            value={f.address}
            onChange={(e) => set('address', e.target.value)}
            onBlur={() => blur('address')}
            placeholder="House no., street, area, city"
            autoComplete="street-address"
            {...aria('address')}
          />
          {errorMsg('address')}
        </div>
      </fieldset>

      <div>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 text-sm leading-relaxed ${
            errors.consent ? 'border-red-500 bg-red-50' : 'border-transparent'
          }`}
        >
          <input
            id="field-consent"
            type="checkbox"
            className="mt-1 h-4 w-4 flex-none accent-[#E8711F]"
            checked={f.consent}
            onChange={(e) => set('consent', e.target.checked)}
            {...aria('consent')}
          />
          <span>
            I am the parent or legal guardian and agree to the applicable subscription terms and privacy notice. <Req />
          </span>
        </label>
        {errorMsg('consent')}
      </div>

      {serverError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border-2 border-red-500 bg-red-50 p-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full py-3.5 text-lg font-bold text-white transition hover:brightness-110 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
        style={{ background: ORANGE }}
      >
        {submitting ? 'Setting up your subscription…' : 'Continue with subscription setup'}
      </button>
      <p className="text-center text-xs text-[#1A1A26]/60">
        By continuing you consent to the subscription terms and privacy notice.
      </p>
    </form>
  );
}

// ─── Order summary (subscription management + delivery tracking preview) ─────
function OrderSummary({ editionId, months, hasDelivery, orderNumber }: { editionId: EditionId; months: number; hasDelivery: boolean; orderNumber?: string }) {
  const edition = EDITIONS.find((e) => e.id === editionId)!;
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const steps = [
    { label: 'Order placed', done: true },
    { label: 'Payment', done: false },
    ...(hasDelivery ? [{ label: 'Dispatched', done: false }, { label: 'Delivered', done: false }] : []),
  ];

  return (
    <div className="mt-6 w-full max-w-sm rounded-2xl bg-[#F6F3EE] p-5 text-left">
      <dl className="space-y-2 text-sm">
        {[
          ...(orderNumber ? [['Order no.', orderNumber]] : []),
          ['Edition', `${edition.name} (${edition.grades})`],
          ['Duration', `${months} months`],
          ['Start date', fmt(start)],
          ['Expiry', fmt(end)],
          ['Status', 'Pending payment'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-[#1A1A26]/60">{k}</dt>
            <dd className="text-right font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <ol className="mt-4 space-y-2 border-t border-[#1A1A26]/10 pt-4">
        {steps.map((st) => (
          <li key={st.label} className="flex items-center gap-2 text-sm font-semibold">
            {st.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-[#1A1A26]/30" />}
            {st.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
