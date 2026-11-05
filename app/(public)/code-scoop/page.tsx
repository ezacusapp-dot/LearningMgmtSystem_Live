// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { Baloo_2, Nunito } from 'next/font/google';
// import {
//   Newspaper,
//   Hammer,
//   Puzzle,
//   Terminal,
//   BookOpenCheck,
//   Lock,
//   CheckCircle2,
//   CreditCard,
//   Truck,
//   Mail,
//   ShieldCheck,
//   Hourglass,
//   ArrowDown,
// } from 'lucide-react';
// import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

// const display = Baloo_2({ subsets: ['latin'], weight: ['600', '700', '800'] });
// const body = Nunito({ subsets: ['latin'], weight: ['400', '600', '700'] });

// // Brand colours taken from the Code Scoop logo
// const INK = '#1A1A26';
// const ORANGE = '#E8711F';
// const GOLD = '#F2A91E';

// // ─── Content ─────────────────────────────────────────────────────────────────
// type EditionId = 'learn' | 'discover' | 'create' | 'innovate';

// interface Edition {
//   id: EditionId;
//   name: string;
//   grades: string;
//   bg: string;
//   fg: string;
//   tagline: string;
//   hasCodeCorner: boolean;
// }

// const EDITIONS: Edition[] = [
//   { id: 'learn', name: 'Learn', grades: 'Grades 1–2', bg: GOLD, fg: INK, tagline: 'First steps with computers, shapes, patterns and play.', hasCodeCorner: false },
//   { id: 'discover', name: 'Discover', grades: 'Grades 3–4', bg: ORANGE, fg: '#FFFFFF', tagline: 'Find out how technology works, one curious question at a time.', hasCodeCorner: true },
//   { id: 'create', name: 'Create', grades: 'Grades 5–6', bg: '#C4431B', fg: '#FFFFFF', tagline: 'Turn ideas into games, stories and small coding projects.', hasCodeCorner: true },
//   { id: 'innovate', name: 'Innovate', grades: 'Grades 7–8', bg: INK, fg: '#FFFFFF', tagline: 'Go deeper into AI, digital safety and the tech shaping tomorrow.', hasCodeCorner: true },
// ];

// const SECTIONS = [
//   { key: 'news', Icon: Newspaper, title: 'Tech News & Discoveries', text: 'Real-world stories and fascinating facts from the world of technology.' },
//   { key: 'build', Icon: Hammer, title: 'Build It! Activities', text: 'Hands-on challenges that help children make something themselves.' },
//   { key: 'brain', Icon: Puzzle, title: 'Brain Bytes & Puzzles', text: 'Puzzles and quizzes that build logical thinking.' },
//   { key: 'code', Icon: Terminal, title: 'Code Corner', text: 'Short coding exercises to try out. Included from Grade 3 and above.', codeOnly: true },
// ];

// const GRADE_OPTIONS = EDITIONS.map((e) => ({ id: e.id, label: `${e.grades} — ${e.name}` }));

// // ─── Page ────────────────────────────────────────────────────────────────────
// export default function CodeScoopPage() {
//   const reduce = useReducedMotion();
//   const [editionId, setEditionId] = useState<EditionId>('discover');
//   const edition = EDITIONS.find((e) => e.id === editionId)!;

//   const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });

//   const subscribeToEdition = () => {
//     goTo('subscribe');
//   };

//   return (
//     <div className={`${body.className} min-h-screen bg-[#FFFAF3] text-[#1A1A26]`}>
//       {/* Header */}
//       <header className="sticky top-0 z-40 border-b border-[#1A1A26]/10 bg-[#FFFAF3]/90 backdrop-blur">
//         <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
//           <a href="#top" className="flex items-center gap-2" aria-label="Code Scoop home">
//             <Image src="/image/codescoop.jpeg" alt="Code Scoop" width={48} height={48} priority className="h-11 w-11 rounded-lg object-contain" />
//             <span className={`${display.className} text-xl font-extrabold`}>
//               Code <span style={{ color: ORANGE }}>Scoop</span>
//             </span>
//           </a>
//           <nav className="hidden items-center gap-6 text-sm font-semibold sm:flex">
//             <button onClick={() => goTo('inside')} className="hover:text-[#E8711F]">What&apos;s inside</button>
//             <button onClick={() => goTo('plans')} className="hover:text-[#E8711F]">Plans</button>
//           </nav>
//           <button
//             onClick={() => goTo('subscribe')}
//             className="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
//             style={{ background: ORANGE }}
//           >
//             Subscribe
//           </button>
//         </div>
//       </header>

//       {/* Hero */}
//       <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
//         <div>
//           <h1 className={`${display.className} text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl`}>
//             Your fresh bytes of tech, code and fun, every month.
//           </h1>
//           <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#1A1A26]/75">
//             Code Scoop is a monthly technology-learning booklet by Codexcellence Edutech. Students explore computers,
//             coding, artificial intelligence, digital safety and emerging technologies through stories, puzzles and
//             hands-on challenges.
//           </p>

//           {/* Edition picker */}
//           <p className="mt-8 text-sm font-bold">Pick your child&apos;s grade to preview the edition</p>
//           <div role="radiogroup" aria-label="Edition" className="mt-3 flex flex-wrap gap-2">
//             {EDITIONS.map((e) => {
//               const active = e.id === editionId;
//               return (
//                 <button
//                   key={e.id}
//                   role="radio"
//                   aria-checked={active}
//                   onClick={() => setEditionId(e.id)}
//                   className="rounded-full border-2 px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
//                   style={
//                     active
//                       ? { background: INK, borderColor: INK, color: '#fff' }
//                       : { background: '#fff', borderColor: 'rgba(26,26,38,0.15)', color: INK }
//                   }
//                 >
//                   {e.grades}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="mt-6 flex flex-wrap items-center gap-3">
//             <button
//               onClick={subscribeToEdition}
//               className="rounded-full px-7 py-3 font-bold text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
//               style={{ background: ORANGE }}
//             >
//               Subscribe to {edition.name}
//             </button>
//             <button onClick={() => goTo('inside')} className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
//               See what&apos;s inside <ArrowDown className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Booklet preview — changes with the picker */}
//         <div className="relative mx-auto flex w-full max-w-sm justify-center py-6" aria-live="polite">
//           <div className="absolute inset-x-8 top-10 h-[92%] rotate-6 rounded-3xl bg-[#1A1A26]/10" aria-hidden />
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={edition.id}
//               initial={reduce ? false : { opacity: 0, rotate: -9, y: 20 }}
//               animate={{ opacity: 1, rotate: -3, y: 0 }}
//               exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 6, y: -10 }}
//               transition={{ duration: 0.3 }}
//               className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl p-6 shadow-2xl"
//               style={{ background: edition.bg, color: edition.fg }}
//             >
//               <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" aria-hidden />
//               <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10" aria-hidden />
//               <div className="relative flex h-full flex-col">
//                 <div className="flex items-center gap-2">
//                   <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white">
//                     <Image src="/image/codescoop.jpeg" alt="" width={48} height={48} className="h-10 w-10 object-contain" />
//                   </span>
//                   <span className={`${display.className} text-lg font-bold`}>Code Scoop</span>
//                 </div>
//                 <div className="mt-auto">
//                   <p className="text-sm font-bold opacity-80">{edition.grades}</p>
//                   <p className={`${display.className} text-6xl font-extrabold leading-none`}>{edition.name}</p>
//                   <p className="mt-3 text-sm font-semibold leading-snug opacity-90">{edition.tagline}</p>
//                 </div>
//               </div>
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </section>

//       {/* What's inside */}
//       <section id="inside" className="bg-white py-16">
//         <div className="mx-auto max-w-6xl px-4 sm:px-6">
//           <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>
//             What&apos;s inside the {edition.name} edition
//           </h2>
//           <p className="mt-2 max-w-2xl text-[#1A1A26]/70">
//             Every edition has a fresh monthly theme and learning that goes beyond the classroom. Switch the grade above to see what changes.
//           </p>

//           <div className="mt-8 grid gap-4 sm:grid-cols-2">
//             {SECTIONS.map(({ key, Icon, title, text, codeOnly }) => {
//               const locked = codeOnly && !edition.hasCodeCorner;
//               return (
//                 <motion.div
//                   layout={!reduce}
//                   key={key}
//                   className="flex gap-4 rounded-2xl border-2 p-5"
//                   style={{
//                     borderColor: locked ? 'rgba(26,26,38,0.12)' : edition.id === 'innovate' ? INK : edition.bg,
//                     background: locked ? '#F6F3EE' : '#fff',
//                     opacity: locked ? 0.75 : 1,
//                   }}
//                 >
//                   <span
//                     className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl"
//                     style={{ background: locked ? '#E4DFD6' : edition.bg, color: locked ? INK : edition.fg }}
//                   >
//                     {locked ? <Lock className="h-5 w-5" /> : <Icon className="h-6 w-6" />}
//                   </span>
//                   <div>
//                     <h3 className={`${display.className} text-xl font-bold`}>{title}</h3>
//                     <p className="text-sm leading-relaxed text-[#1A1A26]/70">
//                       {locked ? 'Code Corner starts from Grade 3. Your child will unlock it in the Discover edition.' : text}
//                     </p>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>

//           <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#FFF1E3] p-5">
//             <BookOpenCheck className="mt-0.5 h-6 w-6 flex-shrink-0" style={{ color: ORANGE }} />
//             <p className="leading-relaxed">
//               Technology education should go beyond screens and textbooks. Code Scoop is built to spark curiosity, build
//               logical thinking and help children understand the digital world shaping their future.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Plans */}
//       <section id="plans" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
//         <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-[#1A1A26]/25 p-10 text-center">
//           <Hourglass className="h-8 w-8" style={{ color: ORANGE }} />
//           <h2 className={`${display.className} text-2xl font-extrabold sm:text-3xl`}>Subscription plans are coming soon</h2>
//           <p className="max-w-lg text-[#1A1A26]/70">
//             Prices for the 6-month and 12-month plans will be shared shortly. You can fill in the subscription form below
//             now and we&apos;ll get in touch with the details.
//           </p>
//         </div>
//       </section>

//       {/* Subscribe */}
//       <section id="subscribe" className="bg-[#1A1A26] py-16 text-white">
//         <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
//           <div>
//             <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>Subscribe to Code Scoop</h2>
//             <p className="mt-3 text-white/75">Bring a fresh world of technology discoveries to your child every month.</p>
//             <ul className="mt-8 space-y-4">
//               {[
//                 { Icon: CreditCard, t: 'Secure online payment with a confirmation for every order.' },
//                 { Icon: Mail, t: 'Email updates for order confirmation, dispatch and renewal reminders.' },
//                 { Icon: Truck, t: 'Track the delivery of your printed editions.' },
//                 { Icon: ShieldCheck, t: 'Parent or guardian consent is required for every subscription.' },
//               ].map(({ Icon, t }) => (
//                 <li key={t} className="flex gap-3">
//                   <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: GOLD }} />
//                   <span className="text-sm leading-relaxed text-white/85">{t}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <SubscribeForm editionId={editionId} onEditionChange={setEditionId} reduce={!!reduce} />
//         </div>
//       </section>

//       <footer className="px-4 py-8 text-center text-sm text-[#1A1A26]/60">
//         Code Scoop is a monthly booklet by Codexcellence Edutech.
//       </footer>
//     </div>
//   );
// }

// // ─── Subscription form ───────────────────────────────────────────────────────
// interface FormState {
//   parentName: string;
//   email: string;
//   mobile: string;
//   grade: EditionId;
//   duration: '6' | '12' | '';
//   pin: string;
//   address: string;
//   consent: boolean;
// }

// type Errors = Partial<Record<keyof FormState, string>>;

// function SubscribeForm({
//   editionId,
//   onEditionChange,
//   reduce,
// }: {
//   editionId: EditionId;
//   onEditionChange: (id: EditionId) => void;
//   reduce: boolean;
// }) {
//   const [f, setF] = useState<Omit<FormState, 'grade'>>({
//     parentName: '',
//     email: '',
//     mobile: '',
//     duration: '',
//     pin: '',
//     address: '',
//     consent: false,
//   });
//   const [errors, setErrors] = useState<Errors>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [done, setDone] = useState(false);

//   const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
//     setF((p) => ({ ...p, [k]: v }));
//     setErrors((p) => ({ ...p, [k]: undefined }));
//   };

//   const validate = (): Errors => {
//     const e: Errors = {};
//     if (!f.parentName.trim()) e.parentName = 'Enter the parent or guardian name.';
//     if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.';
//     if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = 'Enter a 10-digit mobile number.';
//     if (!f.duration) e.duration = 'Choose a subscription duration.';
//     if (f.pin && !/^\d{6}$/.test(f.pin)) e.pin = 'PIN code must be 6 digits.';
//     if (!f.consent) e.consent = 'Please confirm you are the parent or legal guardian.';
//     return e;
//   };

//   const submit = async (ev: React.FormEvent) => {
//     ev.preventDefault();
//     const e = validate();
//     setErrors(e);
//     if (Object.keys(e).length) {
//       document.getElementById(`field-${Object.keys(e)[0]}`)?.focus();
//       return;
//     }
//     setSubmitting(true);
//     // TODO: POST { ...f, grade: editionId } to your subscriptions API here.
//     await new Promise((r) => setTimeout(r, 700));
//     setSubmitting(false);
//     setDone(true);
//   };

//   const input =
//     'w-full rounded-xl border-2 bg-white px-4 py-3 text-[#1A1A26] placeholder:text-[#1A1A26]/40 focus:outline-none focus:border-[#E8711F]';
//   const err = (k: keyof FormState) => (errors[k] ? 'border-red-500' : 'border-transparent');

//   if (done) {
//     return (
//       <motion.div
//         initial={reduce ? false : { opacity: 0, scale: 0.96 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="flex flex-col items-center justify-center rounded-3xl bg-white p-10 text-center text-[#1A1A26]"
//       >
//         <CheckCircle2 className="h-16 w-16 text-green-500" strokeWidth={1.5} />
//         <h3 className={`${display.className} mt-4 text-2xl font-extrabold`}>Subscription request received</h3>
//         <p className="mt-2 max-w-sm text-[#1A1A26]/70">
//           Thank you, {f.parentName.split(' ')[0]}. We&apos;ll email {f.email} with the plan details and the next steps for payment.
//         </p>
//       </motion.div>
//     );
//   }

//   return (
//     <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl bg-white p-6 text-[#1A1A26] sm:p-8">
//       <fieldset className="space-y-4">
//         <legend className={`${display.className} mb-1 text-xl font-bold`}>Parent / guardian details</legend>

//         <div>
//           <label htmlFor="field-parentName" className="mb-1 block text-sm font-bold">Parent / guardian name *</label>
//           <input id="field-parentName" className={`${input} ${err('parentName')} bg-[#F6F3EE]`} value={f.parentName} onChange={(e) => set('parentName', e.target.value)} autoComplete="name" />
//           {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <div>
//             <label htmlFor="field-email" className="mb-1 block text-sm font-bold">Email address *</label>
//             <input id="field-email" type="email" className={`${input} ${err('email')} bg-[#F6F3EE]`} value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
//             {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//           </div>
//           <div>
//             <label htmlFor="field-mobile" className="mb-1 block text-sm font-bold">Mobile number *</label>
//             <input id="field-mobile" inputMode="numeric" maxLength={10} className={`${input} ${err('mobile')} bg-[#F6F3EE]`} value={f.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} autoComplete="tel-national" />
//             {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
//           </div>
//         </div>
//       </fieldset>

//       <fieldset>
//         <legend className={`${display.className} mb-2 text-xl font-bold`}>Subscription preferences</legend>

//         <p className="mb-2 text-sm font-bold">Student&apos;s grade *</p>
//         <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
//           {GRADE_OPTIONS.map((g) => {
//             const active = g.id === editionId;
//             return (
//               <label
//                 key={g.id}
//                 className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-[#1A1A26]"
//                 style={{ borderColor: active ? ORANGE : 'rgba(26,26,38,0.12)', background: active ? '#FFF1E3' : '#fff' }}
//               >
//                 <input type="radio" name="grade" className="accent-[#E8711F]" checked={active} onChange={() => onEditionChange(g.id)} />
//                 {g.label}
//               </label>
//             );
//           })}
//         </div>

//         <p className="mb-2 mt-5 text-sm font-bold">Subscription duration *</p>
//         <div role="radiogroup" className="grid grid-cols-2 gap-2">
//           {(['6', '12'] as const).map((d) => {
//             const active = f.duration === d;
//             return (
//               <label
//                 key={d}
//                 className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-[#1A1A26]"
//                 style={{ borderColor: active ? ORANGE : errors.duration ? '#EF4444' : 'rgba(26,26,38,0.12)', background: active ? '#FFF1E3' : '#fff' }}
//               >
//                 <input id={d === '6' ? 'field-duration' : undefined} type="radio" name="duration" className="accent-[#E8711F]" checked={active} onChange={() => set('duration', d)} />
//                 {d} months
//               </label>
//             );
//           })}
//         </div>
//         {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
//       </fieldset>

//       <fieldset className="space-y-4">
//         <legend className={`${display.className} mb-1 text-xl font-bold`}>Delivery for printed editions</legend>
//         <div>
//           <label htmlFor="field-pin" className="mb-1 block text-sm font-bold">Delivery PIN code</label>
//           <input id="field-pin" inputMode="numeric" maxLength={6} className={`${input} ${err('pin')} bg-[#F6F3EE] sm:max-w-[200px]`} value={f.pin} onChange={(e) => set('pin', e.target.value.replace(/\D/g, ''))} autoComplete="postal-code" />
//           {errors.pin && <p className="mt-1 text-sm text-red-600">{errors.pin}</p>}
//         </div>
//         <div>
//           <label htmlFor="field-address" className="mb-1 block text-sm font-bold">Delivery address</label>
//           <textarea id="field-address" rows={3} className={`${input} border-transparent bg-[#F6F3EE]`} value={f.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" />
//         </div>
//       </fieldset>

//       <div>
//         <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
//           <input id="field-consent" type="checkbox" className="mt-1 h-4 w-4 accent-[#E8711F]" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} />
//           <span>I am the parent or legal guardian and agree to the applicable subscription terms and privacy notice. *</span>
//         </label>
//         {errors.consent && <p className="mt-1 text-sm text-red-600">{errors.consent}</p>}
//       </div>

//       <button
//         type="submit"
//         disabled={submitting}
//         className="w-full rounded-full py-3.5 text-lg font-bold text-white transition hover:brightness-110 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
//         style={{ background: ORANGE }}
//       >
//         {submitting ? 'Setting up your subscription…' : 'Continue with subscription setup'}
//       </button>
//     </form>
//   );
// }

'use client';

import { useState } from 'react';
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

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CodeScoopPage() {
  const reduce = useReducedMotion();
  const [editionId, setEditionId] = useState<EditionId>('discover');
  const edition = EDITIONS.find((e) => e.id === editionId)!;

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });

  const subscribeToEdition = () => {
    goTo('subscribe');
  };

  return (
    <div className={`${body.className} min-h-screen bg-[#FFFAF3] text-[#1A1A26]`}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1A1A26]/10 bg-[#FFFAF3]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
          <a href="#top" className="flex items-center gap-2" aria-label="Code Scoop home">
            <Image src="/image/codescoop.jpeg" alt="Code Scoop" width={48} height={48} priority className="h-11 w-11 rounded-lg object-contain" />
            <span className={`${display.className} text-xl font-extrabold`}>
              Code <span style={{ color: ORANGE }}>Scoop</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold sm:flex">
            <button onClick={() => goTo('inside')} className="hover:text-[#E8711F]">What&apos;s inside</button>
            <button onClick={() => goTo('plans')} className="hover:text-[#E8711F]">Plans</button>
            <button onClick={() => goTo('features')} className="hover:text-[#E8711F]">How it works</button>
          </nav>
          <button
            onClick={() => goTo('subscribe')}
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A26]"
            style={{ background: ORANGE }}
          >
            Subscribe
          </button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div>
          <p className="mb-3 inline-block rounded-full px-4 py-1 text-sm font-bold" style={{ background: GOLD }}>
            Your fresh bytes of tech, code &amp; fun!
          </p>
          <h1 className={`${display.className} text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl`}>
            Meet Code Scoop — where technology becomes an adventure!
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#1A1A26]/75">
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

          <div className="mt-6 flex flex-wrap items-center gap-3">
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

        {/* Booklet preview — changes with the picker */}
        <div className="relative mx-auto flex w-full max-w-sm justify-center py-6" aria-live="polite">
          <div className="absolute inset-x-8 top-10 h-[92%] rotate-6 rounded-3xl bg-[#1A1A26]/10" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.div
              key={edition.id}
              initial={reduce ? false : { opacity: 0, rotate: -9, y: 20 }}
              animate={{ opacity: 1, rotate: -3, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 6, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl p-6 shadow-2xl"
              style={{ background: edition.bg, color: edition.fg }}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" aria-hidden />
              <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10" aria-hidden />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center gap-2">
                  <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white">
                    <Image src="/image/codescoop.jpeg" alt="" width={48} height={48} className="h-10 w-10 object-contain" />
                  </span>
                  <span className={`${display.className} text-lg font-bold`}>Code Scoop</span>
                </div>
                <div className="mt-auto">
                  <p className="text-sm font-bold opacity-80">{edition.grades}</p>
                  <p className={`${display.className} text-6xl font-extrabold leading-none`}>{edition.name}</p>
                  <p className="mt-3 text-sm font-semibold leading-snug opacity-90">{edition.tagline}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <p className="text-lg leading-relaxed">
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

      {/* Editions + USPs */}
      <section id="why" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className={`${display.className} text-3xl font-extrabold sm:text-4xl`}>Why families choose Code Scoop</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border-2 border-[#1A1A26]/10 bg-white p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: ORANGE }}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className={`${display.className} text-lg font-bold leading-tight`}>{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#1A1A26]/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's inside */}
      <section id="inside" className="bg-white py-16">
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
      <section id="plans" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-[#1A1A26]/25 p-10 text-center">
          <Hourglass className="h-8 w-8" style={{ color: ORANGE }} />
          <h2 className={`${display.className} text-2xl font-extrabold sm:text-3xl`}>Explore subscription plans</h2>
          <p className="max-w-lg text-[#1A1A26]/70">
            Plan details will be conveyed shortly. The 6-month and 12-month options are open in the form below, so you
            can register your interest now.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
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
      <section id="subscribe" className="bg-[#1A1A26] py-16 text-white">
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

      <footer className="px-4 py-8 text-center text-sm text-[#1A1A26]/60">
        Code Scoop is a monthly booklet by Codexcellence Edutech.
      </footer>
    </div>
  );
}

// ─── Subscription form ───────────────────────────────────────────────────────
interface FormState {
  parentName: string;
  email: string;
  mobile: string;
  grade: EditionId;
  duration: '6' | '12' | '';
  pin: string;
  address: string;
  consent: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

function SubscribeForm({
  editionId,
  onEditionChange,
  reduce,
}: {
  editionId: EditionId;
  onEditionChange: (id: EditionId) => void;
  reduce: boolean;
}) {
  const [f, setF] = useState<Omit<FormState, 'grade'>>({
    parentName: '',
    email: '',
    mobile: '',
    duration: '',
    pin: '',
    address: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!f.parentName.trim()) e.parentName = 'Enter the parent or guardian name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = 'Enter a 10-digit mobile number.';
    if (!f.duration) e.duration = 'Choose a subscription duration.';
    if (f.pin && !/^\d{6}$/.test(f.pin)) e.pin = 'PIN code must be 6 digits.';
    if (!f.consent) e.consent = 'Please confirm you are the parent or legal guardian.';
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`field-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    // TODO: POST { ...f, grade: editionId } to your subscriptions API here.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setDone(true);
  };

  const input =
    'w-full rounded-xl border-2 bg-white px-4 py-3 text-[#1A1A26] placeholder:text-[#1A1A26]/40 focus:outline-none focus:border-[#E8711F]';
  const err = (k: keyof FormState) => (errors[k] ? 'border-red-500' : 'border-transparent');

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl bg-white p-10 text-center text-[#1A1A26]"
      >
        <CheckCircle2 className="h-16 w-16 text-green-500" strokeWidth={1.5} />
        <h3 className={`${display.className} mt-4 text-2xl font-extrabold`}>Subscription request received</h3>
        <p className="mt-2 max-w-sm text-[#1A1A26]/70">
          Thank you, {f.parentName.split(' ')[0]}. We&apos;ll email {f.email} with the plan details and the next steps for payment.
        </p>
        <OrderSummary editionId={editionId} months={Number(f.duration)} hasDelivery={!!(f.pin || f.address)} />
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl bg-white p-6 text-[#1A1A26] sm:p-8">
      <p className="inline-block rounded-full bg-[#FFF1E3] px-3 py-1 text-sm font-bold">Individual subscription</p>

      <fieldset className="space-y-4">
        <legend className={`${display.className} mb-1 text-xl font-bold`}>Parent / guardian details</legend>

        <div>
          <label htmlFor="field-parentName" className="mb-1 block text-sm font-bold">Parent / guardian name *</label>
          <input id="field-parentName" className={`${input} ${err('parentName')} bg-[#F6F3EE]`} value={f.parentName} onChange={(e) => set('parentName', e.target.value)} autoComplete="name" />
          {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="field-email" className="mb-1 block text-sm font-bold">Email address *</label>
            <input id="field-email" type="email" className={`${input} ${err('email')} bg-[#F6F3EE]`} value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="field-mobile" className="mb-1 block text-sm font-bold">Mobile number *</label>
            <input id="field-mobile" inputMode="numeric" maxLength={10} className={`${input} ${err('mobile')} bg-[#F6F3EE]`} value={f.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} autoComplete="tel-national" />
            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${display.className} mb-2 text-xl font-bold`}>Subscription preferences</legend>

        <p className="mb-2 text-sm font-bold">Student&apos;s grade *</p>
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
          {GRADE_OPTIONS.map((g) => {
            const active = g.id === editionId;
            return (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-[#1A1A26]"
                style={{ borderColor: active ? ORANGE : 'rgba(26,26,38,0.12)', background: active ? '#FFF1E3' : '#fff' }}
              >
                <input type="radio" name="grade" className="accent-[#E8711F]" checked={active} onChange={() => onEditionChange(g.id)} />
                {g.label}
              </label>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-sm font-bold">Subscription duration *</p>
        <div role="radiogroup" className="grid grid-cols-2 gap-2">
          {(['6', '12'] as const).map((d) => {
            const active = f.duration === d;
            return (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-[#1A1A26]"
                style={{ borderColor: active ? ORANGE : errors.duration ? '#EF4444' : 'rgba(26,26,38,0.12)', background: active ? '#FFF1E3' : '#fff' }}
              >
                <input id={d === '6' ? 'field-duration' : undefined} type="radio" name="duration" className="accent-[#E8711F]" checked={active} onChange={() => set('duration', d)} />
                {d} months
              </label>
            );
          })}
        </div>
        {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={`${display.className} mb-1 text-xl font-bold`}>Delivery for printed editions</legend>
        <div>
          <label htmlFor="field-pin" className="mb-1 block text-sm font-bold">Delivery PIN code</label>
          <input id="field-pin" inputMode="numeric" maxLength={6} className={`${input} ${err('pin')} bg-[#F6F3EE] sm:max-w-[200px]`} value={f.pin} onChange={(e) => set('pin', e.target.value.replace(/\D/g, ''))} autoComplete="postal-code" />
          {errors.pin && <p className="mt-1 text-sm text-red-600">{errors.pin}</p>}
        </div>
        <div>
          <label htmlFor="field-address" className="mb-1 block text-sm font-bold">Delivery address</label>
          <textarea id="field-address" rows={3} className={`${input} border-transparent bg-[#F6F3EE]`} value={f.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" />
        </div>
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <input id="field-consent" type="checkbox" className="mt-1 h-4 w-4 accent-[#E8711F]" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} />
          <span>I am the parent or legal guardian and agree to the applicable subscription terms and privacy notice. *</span>
        </label>
        {errors.consent && <p className="mt-1 text-sm text-red-600">{errors.consent}</p>}
      </div>

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
function OrderSummary({ editionId, months, hasDelivery }: { editionId: EditionId; months: number; hasDelivery: boolean }) {
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
          ['Edition', `${edition.name} (${edition.grades})`],
          ['Duration', `${months} months`],
          ['Start date', fmt(start)],
          ['Expiry', fmt(end)],
          ['Status', 'Pending payment'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-[#1A1A26]/60">{k}</dt>
            <dd className="font-bold">{v}</dd>
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
