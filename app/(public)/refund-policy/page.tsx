"use client";
// Save as: app/refund-policy/page.jsx   (or pages/refund-policy.jsx if you use the Pages Router)
import { useState, useEffect } from "react";
import Link from "next/link";

// ------------------------------ CONTENT --------------------------------------
const META = {
  entity: "CODEXELLENCE EDUTECH LLP",
  effective: "28 October 2026",
  updated: "28 October 2026",
};

const CONTACT = {
  email: "codeexcellence.offical@gmail.com",
  phone: "[Insert Official Contact Number]", // replace with the real number; hidden on the page until you do
  address: "NeelPrabha Apartments, H P T College, College Road Police Chowki, Nashik, Nashik – 422005, Maharashtra, India.",
};

const highlights = [
  { value: "24 hours", label: "Window to request cancellation, counted from course start", color: "bg-[#c8e03a] text-gray-900" },
  { value: "5–7 days", label: "Business days to initiate an approved refund", color: "bg-[#49205E] text-white" },
  { value: "48 hours", label: "We aim to acknowledge every complaint within this time", color: "bg-[#BC579E] text-white" },
];

// block types: p (paragraph), ul (bullets), ol (lettered list), note (highlighted callout), contact
const sections = [
  {
    id: "introduction",
    title: "Introduction",
    blocks: [
      { p: "CODEXELLENCE EDUTECH LLP (“Codexellence,” “we,” “our” or “us”) provides educational courses, training programmes, digital content, study materials, subscriptions, educational publications, and related services." },
      { p: "This Refund and Cancellation Policy set out the terms governing cancellations, refund requests, payment errors, and service-related issues for purchases made through our website, payment gateways, online platforms, or other authorised channels." },
      { p: "By purchasing a course, enrolling in a programme, or subscribing to a service, the customer, student, or parent/guardian agrees to this Policy, subject to applicable law." },
    ],
  },
  {
    id: "scope",
    title: "Scope of the Policy",
    blocks: [
      { p: "This Policy applies to all products and services offered by Codexellence, including:" },
      { ul: [
        "Pre-recorded coding courses and digital learning programmes.",
        "Live classes, training sessions and educational workshops.",
        "Digital study materials, downloadable resources and educational content.",
        "The Code Scoop magazine and related subscriptions.",
        "Other educational products and services offered by Codexellence.",
      ] },
      { p: "The applicable terms may vary depending on the nature of the product or service purchased." },
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation Policy for Courses and Programmes",
    blocks: [
      { p: "Students or customers wishing to cancel their enrolment or discontinue a course or programme must submit a written request through the official contact details provided in this Policy." },
      { p: "Cancellation requests should be submitted within 24 hours from the commencement of the relevant course or programme." },
      { note: "Submitting a cancellation request within this period does not automatically entitle the customer to a refund. Fees paid shall generally remain non-refundable in cases of voluntary withdrawal, change of mind, non-attendance, or discontinuation." },
      { p: "Requests received before course access is activated or before the service commences may be considered at the discretion of Codexellence, subject to the terms disclosed at the time of purchase and applicable law." },
    ],
  },
  {
    id: "refunds",
    title: "Refund Policy for Courses and Digital Content",
    blocks: [
      { p: "Fees paid for courses, programmes, digital content and educational resources are generally non-refundable once access has been activated, content has been accessed or the service has commenced." },
      { p: "Refunds will generally not be provided for:" },
      { ol: [
        "Voluntary cancellation, withdrawal or discontinuation of a course.",
        "Non-attendance or failure to participate in classes or training sessions.",
        "Change of mind or a change in personal preferences.",
        "Personal circumstances, scheduling conflicts or inability to complete a course.",
        "Non-utilisation of purchased services or failure to complete a course within the stipulated period.",
        "Access to, downloading of or delivery of digital study materials and educational resources.",
        "Dissatisfaction arising from personal expectations where the service has been delivered substantially as described.",
      ] },
      { note: "However, this Policy does not exclude refunds or other remedies where required by applicable law or in circumstances involving non-delivery, material misrepresentation, a material failure to provide the promised service or other valid grounds requiring a remedy.", tone: "good" },
    ],
  },
  {
    id: "payments",
    title: "Failed Transactions and Duplicate Payments",
    blocks: [
      { p: "If a customer's account is debited but the order, enrolment or course access is not confirmed, the customer should contact Codexellence with the relevant payment reference or transaction ID." },
      { p: "Codexellence will verify the transaction and take appropriate steps to resolve the issue. Where payment has been received but the purchased service cannot be provided, an appropriate remedy, including a refund where applicable, will be arranged." },
      { p: "Duplicate payments for the same order or service will be verified and refunded where confirmed." },
      { p: "For transactions marked as failed by the payment gateway but debited from the customer's account, the customer may contact Codexellence for assistance. The final credit timeline may depend on the payment provider, bank or payment method." },
    ],
  },
  {
    id: "magazine",
    title: "The Code Scoop Magazine and Subscriptions",
    blocks: [
      { p: "Payments for The Code Scoop magazine and related subscriptions are subject to the following conditions:" },
      { ol: [
        "Cancellation requests for future subscription periods will be processed in accordance with the applicable subscription terms.",
        "Where recurring payments are enabled, customers may request cancellation of future renewals. Cancellation will not automatically reverse a payment already processed for the current subscription period.",
        "Refunds for an issue already dispatched or delivered will generally not be available for a change of mind.",
        "If an issue is not delivered, arrives damaged or the subscription cannot be fulfilled, customers may contact Codexellence for an appropriate resolution, which may include replacement, refund or another suitable remedy.",
        "The applicable product page or subscription terms will specify the subscription period, delivery arrangements and any additional conditions.",
      ] },
    ],
  },
  {
    id: "by-us",
    title: "Cancellation or Rescheduling by Codexellence",
    blocks: [
      { p: "Codexellence reserves the right to reschedule, suspend or cancel a course, programme, class or service where reasonably necessary." },
      { p: "Where a course or service is cancelled by Codexellence, we may offer a rescheduled session, an alternative course or another appropriate arrangement. Where the purchased service cannot be provided, customers will be offered an appropriate remedy, including a refund where required by applicable law or the circumstances of the transaction." },
      { p: "Nothing in this clause limits any statutory rights or remedies available to the customer." },
    ],
  },
  {
    id: "timelines",
    title: "Refund Processing and Timelines",
    blocks: [
      { p: "Approved refunds will ordinarily be initiated within 5–7 business days from approval, wherever practicable." },
      { p: "Refunds will generally be processed through the original payment method used for the transaction, wherever possible. The time taken for the amount to reflect in the customer's account may vary depending on the bank, card issuer, payment provider or payment method." },
      { p: "If a refund is delayed beyond the communicated timeline, customers may contact Codexellence with their transaction details for assistance." },
    ],
  },
  {
    id: "procedure",
    title: "Procedure for Cancellation and Refund Requests",
    blocks: [
      { p: "Customers requesting cancellation, assistance with a payment or a refund must contact Codexellence through the official email address provided below." },
      { p: "Requests should include:" },
      { ul: [
        "Full name of the customer or student.",
        "Registered email address and contact number.",
        "Name of the course, product or service purchased.",
        "Order ID, payment reference or transaction ID, where available.",
        "Date of purchase or commencement, as applicable.",
        "Reason for the request and supporting details, where relevant.",
      ] },
      { p: "Codexellence will acknowledge complaints within 48 hours, wherever practicable, and endeavour to resolve them within the period prescribed by applicable law." },
      { p: "Submission of a request does not guarantee approval of a refund. Each request will be reviewed in accordance with this Policy, the terms disclosed at the time of purchase and applicable law." },
    ],
  },
  {
    id: "amendments",
    title: "Policy Amendments",
    blocks: [
      { p: "Codexellence reserves the right to revise this Policy from time to time. Updated versions will be published on the official website with the applicable effective or revision date." },
      { p: "Changes will apply prospectively, except where otherwise required or permitted by applicable law. The terms applicable to a completed purchase will be interpreted in accordance with the terms disclosed at the time of purchase and applicable legal requirements." },
    ],
  },
  {
    id: "contact",
    title: "Contact and Grievance Redressal",
    blocks: [
      { p: "For cancellation requests, refund enquiries, payment-related issues or complaints, please contact:" },
      { contact: true },
      { p: "Customers are encouraged to contact us with their order or transaction details so that the issue can be reviewed and addressed appropriately." },
      { p: "This Policy shall be interpreted in accordance with the applicable laws of India. Nothing in this Policy shall restrict any consumer rights or statutory remedies that cannot legally be excluded." },
    ],
  },
];

// ------------------------------ PIECES ---------------------------------------
function Block({ b }) {
  if (b.p) return <p className="text-gray-600 leading-relaxed mb-4">{b.p}</p>;

  if (b.ul)
    return (
      <ul className="space-y-2.5 mb-5">
        {b.ul.map((t) => (
          <li key={t} className="flex gap-3 text-gray-600 leading-relaxed">
            <span className="mt-2 flex-none w-2 h-2 rounded-full bg-gradient-to-br from-[#49205E] to-[#BC579E]" />
            {t}
          </li>
        ))}
      </ul>
    );

  if (b.ol)
    return (
      <ol className="space-y-3 mb-5">
        {b.ol.map((t, i) => (
          <li key={t} className="flex gap-3 text-gray-600 leading-relaxed">
            <span className="flex-none w-7 h-7 rounded-lg bg-purple-100 text-[#49205E] text-sm font-bold flex items-center justify-center">
              {String.fromCharCode(97 + i)}
            </span>
            <span className="pt-0.5">{t}</span>
          </li>
        ))}
      </ol>
    );

  if (b.note) {
    const good = b.tone === "good";
    return (
      <div
        className={`flex gap-3 rounded-xl border p-4 mb-5 ${
          good ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
        }`}
      >
        <svg className={`flex-none w-5 h-5 mt-0.5 ${good ? "text-emerald-600" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {good ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          )}
        </svg>
        <p className={`text-sm leading-relaxed ${good ? "text-emerald-900" : "text-amber-900"}`}>{b.note}</p>
      </div>
    );
  }

  if (b.contact) {
    const hasPhone = CONTACT.phone && !CONTACT.phone.startsWith("[");
    const rows = [
      { label: "Legal entity", value: META.entity },
      { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
      ...(hasPhone ? [{ label: "Telephone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` }] : []),
      { label: "Address", value: CONTACT.address },
    ];
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#49205E] to-[#BC579E] p-6 sm:p-8 text-white mb-5">
        <dl className="space-y-4">
          {rows.map((r) => (
            <div key={r.label} className="sm:grid sm:grid-cols-[110px_1fr] gap-3">
              <dt className="text-white/60 text-sm">{r.label}</dt>
              <dd className="font-medium break-words">
                {r.href ? (
                  <a href={r.href} className="underline decoration-[#c8e03a] decoration-2 underline-offset-4 hover:text-[#c8e03a] transition-colors">
                    {r.value}
                  </a>
                ) : (
                  r.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <a
          href={`mailto:${CONTACT.email}?subject=Cancellation%20%2F%20Refund%20Request`}
          className="inline-flex items-center gap-2 mt-6 bg-[#c8e03a] hover:bg-[#b8d030] text-gray-900 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Email a refund request
        </a>
      </div>
    );
  }
  return null;
}

// ------------------------------ PAGE -----------------------------------------
export default function RefundPolicyPage() {
  const [active, setActive] = useState(sections[0].id);
  const [progress, setProgress] = useState(0);

  // Highlight the section being read
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-15% 0px -75% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* reading progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 print:hidden">
        <div className="h-full bg-gradient-to-r from-[#BC579E] to-[#c8e03a]" style={{ width: `${progress}%` }} />
      </div>

      {/* Hero */}
      <header className="relative bg-gradient-to-br from-[#49205E] via-[#BC579E] to-[#49205E] overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-2 border-dashed border-white/20" />
        <div className="absolute right-10 top-10 w-52 h-52 rounded-full border border-dashed border-white/10" />
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-24">
          <div className="flex items-center justify-between mb-12 print:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to home
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm text-white border border-white/40 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z" /></svg>
              Print
            </button>
          </div>
          <p className="text-white/70 text-sm mb-3">{META.entity}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">Refund &amp; Cancellation Policy</h1>
          <p className="text-white/80 max-w-2xl text-lg">
            What to expect when you cancel a course, ask for a refund or run into a payment problem.
          </p>
          <div className="flex flex-wrap gap-3 mt-8 text-sm">
            <span className="bg-white/15 border border-white/20 text-white rounded-full px-4 py-1.5">Effective: {META.effective}</span>
            <span className="bg-white/15 border border-white/20 text-white rounded-full px-4 py-1.5">Last updated: {META.updated}</span>
          </div>
        </div>
      </header>

      {/* At-a-glance cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((h) => (
            <div key={h.value} className={`rounded-2xl p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1 ${h.color}`}>
              <div className="text-3xl font-extrabold mb-1">{h.value}</div>
              <p className="text-sm opacity-90 leading-snug">{h.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        {/* Table of contents */}
        <aside className="print:hidden">
          {/* mobile: scrollable chips */}
          <div className="lg:hidden sticky top-1 z-30 -mx-6 px-6 py-2 bg-gray-50/95 backdrop-blur-sm">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(s.id)}
                  className={`flex-none text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
                    active === s.id ? "bg-[#49205E] border-[#49205E] text-white" : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {i + 1}. {s.title.split(" ").slice(0, 2).join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* desktop: sticky list */}
          <nav className="hidden lg:block sticky top-8" aria-label="Table of contents">
            <p className="font-bold text-gray-900 mb-3 px-3">On this page</p>
            <ul className="space-y-1 border-l-2 border-gray-200">
              {sections.map((s, i) => {
                const on = active === s.id;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => goTo(s.id)}
                      className={`w-full text-left text-sm py-2 pl-4 pr-3 -ml-0.5 border-l-2 transition-all duration-200 ${
                        on
                          ? "border-[#BC579E] text-[#49205E] font-semibold bg-purple-50 rounded-r-lg"
                          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-400"
                      }`}
                    >
                      <span className="inline-block w-6 text-gray-400">{i + 1}.</span>
                      {s.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Sections */}
        <main className="space-y-6 min-w-0">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className={`scroll-mt-24 bg-white rounded-2xl border p-6 sm:p-8 transition-shadow duration-300 ${
                active === s.id ? "border-purple-200 shadow-md" : "border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="flex-none w-10 h-10 rounded-xl bg-gradient-to-br from-[#49205E] to-[#BC579E] text-white font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">{s.title}</h2>
              </div>
              {s.blocks.map((b, j) => (
                <Block key={j} b={b} />
              ))}
            </section>
          ))}

          <p className="text-center text-sm text-gray-400 pt-4">
            © {new Date().getFullYear()} {META.entity}. All rights reserved.
          </p>
        </main>
      </div>
    </div>
  );
}
