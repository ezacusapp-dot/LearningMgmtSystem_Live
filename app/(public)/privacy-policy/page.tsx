"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

const EMAIL = "codeexcellence.offical@gmail.com";
const ADDRESS =
    "Flat No. 10, NeelPrabha Apartments, H P T College, College Road Police Chowki, Nashik, Nashik – 422005, Maharashtra, India";

type Item = string | { text: string; sub: string[] };
type Block = { label?: string; text?: string; items?: Item[] };
type Section = { title: string; blocks: Block[] };

const sections: Section[] = [
    {
        title: "1. Entity Information & Contact Details",
        blocks: [
            {
                items: [
                    "Entity Name: CODEXELLENCE EDUTECH LLP",
                    `Registered Office: ${ADDRESS}`,
                    `Official Email: ${EMAIL}`,
                ],
            },
        ],
    },
    {
        title: "2. Website Privacy, Browsing Data & Tracking Technologies",
        blocks: [
            { text: "When you browse, access, or interact with our public website and online resources:" },
            {
                label: "A. Passive Browsing & Server Log Records",
                items: [
                    "Technical Logs: Our servers automatically record standard technical log data whenever a page or resource is accessed. This includes your Internet Protocol (IP) address, device brand and model, operating system build, browser type and version, language preferences, Internet Service Provider (ISP), referring/exit pages, timestamps, and clickstream navigation patterns.",
                    "Operational Intent: Log information is processed to analyze traffic load, diagnose system bottlenecks, monitor platform uptime, detect automated bot activity, and ensure website stability. We do not correlate server logs with personally identifiable contact records unless security breaches, scraping attempts, or unauthorized access events occur.",
                ],
            },
            {
                label: "B. Cookies & Local Storage",
                items: [
                    "Functional & Authentication Cookies: These cookies maintain session continuity, manage CSRF (Cross-Site Request Forgery) protection, preserve dashboard states, and ensure secure authentication while you navigate course modules.",
                    "Analytical Cookies: We utilize aggregate analytical identifiers to understand user engagement, evaluate which syllabus guides or technical resources are accessed most, and optimize platform layout.",
                    "Control Over Cookies: You can adjust your browser settings to decline or clear cookies. However, disabling essential session cookies will disrupt authentication and prevent access to enrolled learning areas and code consoles.",
                ],
            },
            {
                label: "C. Third-Party Links & External Destinations",
                items: [
                    "Our website may provide hyperlinks to third-party services, official developer documentations (such as MDN, GitHub, Python, or Oracle), community resources, or partner tools.",
                    "Disclaimer of Control: We do not operate, inspect, or manage third-party external domains. CODEXELLENCE EDUTECH LLP assumes no liability for the data collection methods, privacy standards, or technical scripts deployed by external sites. We advise you to read the privacy notices of external platforms before sharing data with them.",
                ],
            },
            {
                label: "D. Inquiry & Prospect Forms",
                text: "When you submit web inquiry forms, sign up for curriculum overviews, or request admissions counseling, we collect your name, email address, telephone number, and educational background solely to address your query and facilitate course onboarding.",
            },
        ],
    },
    {
        title: "3. Personal Data We Collect from Registered Learners",
        blocks: [
            { text: "For users enrolled in our courses, bootcamps, and digital modules, we collect:" },
            {
                items: [
                    "Identity & Account Information: Full legal name, email address, mobile phone number, residential/billing address, user profile handle, encrypted login credentials, and government/institutional identity cards (where verification is necessary for certification).",
                    "Academic & Performance Data: Enrolled tracks, video watch times, attendance metrics, project submissions, repository links, quiz and examination scores, code performance logs, and instructor support records.",
                    "Financial & Billing Information: Invoicing details, tax identifiers (e.g., GST numbers), and payment confirmation records.",
                ],
            },
            {
                text: "Note: All monetary transactions are processed directly via Reserve Bank of India (RBI)-authorized, encrypted payment gateways. CODEXELLENCE EDUTECH LLP does not process or retain raw credit/debit card numbers, CVVs, net banking credentials, or UPI PINs on its servers.",
            },
        ],
    },
    {
        title: "4. Legal Grounds & Operational Purposes for Data Processing",
        blocks: [
            { text: "Your data is collected and processed under lawful, specified purposes:" },
            {
                items: [
                    "Administering student accounts, verifying enrollment eligibility, and maintaining academic records.",
                    "Delivering live interactive classes, recorded video streams, structured curricula, code evaluation, and completion certificates.",
                    "Facilitating billing, statutory invoicing, accounting reconciliations, and tax compliance under Indian fiscal statutes.",
                    "Providing technical support, bug patching, and curriculum updates.",
                    "Security & IP Enforcement: Detecting concurrent account usage, preventing credential pooling, capturing forensic leak trails, and identifying automated scrapers targeting our proprietary data and study modules.",
                ],
            },
        ],
    },
    {
        title: "5. Proprietary Educational Data, Anti-Copying & Anti-Misuse Safeguards",
        blocks: [
            {
                label: "Statutory Notice on Intellectual Property",
                text: "All educational materials, recorded sessions, curriculum structures, documentation, assessment questions, code samples, notes, and study modules published or made accessible on this Platform are the original, proprietary intellectual property of CODEXELLENCE EDUTECH LLP, irrespective of whether formal statutory copyright registration has been obtained or is pending. Under the Indian Copyright Act, 1957, copyright subsists automatically upon the creation of original literary, artistic, and digital works.",
            },
            {
                label: "A. Prohibition of Data Copying, Extraction & Misuse",
                text: "All users, visitors, and students agree to strict non-copying covenants. You shall NOT, directly or indirectly:",
                items: [
                    "Copy or Transcribe: Cut, copy, select, transcribe, duplicate, screenshot, screen-record, or mirror any study module, video lesson, diagram, assessment, or source code by any digital, mechanical, or manual process.",
                    "Automate Scraping: Deploy web scrapers, bots, automated scripts, crawlers, browser extensions, curl requests, or OCR (Optical Character Recognition) capture tools against any webpage, API, or database endpoint of our Platform.",
                    "Bypass Technical Controls: Circumvent, disable, or tamper with right-click restrictions, text-selection blockers, session tokens, or video stream encryption layers.",
                    "Redistribute or Leak: Upload, publish, distribute, resell, or share any portion of our study modules on public or private networks (including GitHub, GitLab, Google Drive, Mega, Telegram, Discord, WhatsApp, or torrent networks).",
                    "Pool Credentials: Share or transfer login credentials, session tokens, or access links with third parties to permit multi-person viewing.",
                ],
            },
            {
                label: "B. Dynamic Forensic Watermarking & Security Telemetry",
                items: [
                    "Forensic Identification: To detect leaks and trace unauthorized sharing, the Platform overlays dynamic, visible, and steganographic watermarks displaying your registered User ID, email, IP address, and session timestamps across viewing panes, code modules, and media players.",
                    "Admissibility of Evidence: If proprietary content is discovered in the public domain or on unauthorized repositories, the forensic watermark, telemetry logs, and IP access patterns associated with your profile shall constitute conclusive, admissible evidence of data breach and intellectual property infringement attributable to your account.",
                ],
            },
            {
                label: "C. Legal Recourse for Data Misuse and Piracy",
                text: "Any unauthorized duplication, leak, scraping, or misuse of our data constitutes a material breach of contract, criminal breach of trust, and statutory copyright infringement. CODEXELLENCE EDUTECH LLP reserves the right to enforce the following without prejudice:",
                items: [
                    "Immediate, non-refundable termination of account access and revocation of academic certificates.",
                    "Urgent applications before competent courts for temporary and permanent injunctions, rendition of accounts, and financial damages.",
                    {
                        text: "Filing of formal criminal complaints and First Information Reports (FIRs) under:",
                        sub: [
                            "Sections 51, 63, and 64 of the Indian Copyright Act, 1957 (penalties for infringement including imprisonment and fines);",
                            "Sections 43 and 66 of the Information Technology Act, 2000 (data theft, unauthorized copying of database materials, and computer offenses);",
                            "Applicable provisions of the Bharatiya Nyaya Sanhita, 2023 (cheating, criminal breach of trust, and property misappropriation).",
                        ],
                    },
                ],
            },
        ],
    },
    {
        title: "6. Data Sharing, Confidentiality & Third Parties",
        blocks: [
            { text: "We never sell, rent, monetize, or trade your personal data. Disclosures are restricted exclusively to:" },
            {
                items: [
                    "Authorized Infrastructure Partners: Enterprise cloud hosts, CDN providers, email/SMS delivery gateways, and authentication vendors bound by strict non-disclosure contracts and reasonable security standards.",
                    "Statutory & Legal Requirements: Law enforcement agencies, regulatory bodies, or judicial courts when compelled under applicable Indian legal processes, summons, or valid court orders.",
                    "Business Transfers: Successor entities in the event of an LLP restructuring, merger, or asset acquisition, provided the acquiring party agrees to maintain equivalent data privacy obligations.",
                ],
            },
        ],
    },
    {
        title: "7. Security Standards & Retention Periods",
        blocks: [
            {
                items: [
                    "Technical Measures: We employ industry-standard information security practices, including TLS/SSL encryption for data in transit, encrypted storage for sensitive fields, robust access control lists (ACLs), role-based permissions, and continuous threat mitigation.",
                    "Data Retention: Personal information is retained only for the period necessary to deliver enrolled programs, support ongoing certificate verifications, resolve platform disputes, and satisfy statutory tax and financial record-keeping mandates. Upon expiration of the required retention window, data is permanently erased or irreversibly anonymized.",
                ],
            },
        ],
    },
    {
        title: "8. Your Statutory Rights",
        blocks: [
            { text: "In accordance with Indian data protection laws, you retain the right to:" },
            {
                items: [
                    "Review & Access: Request confirmation and summaries of personal data held about you.",
                    "Correction & Updation: Request rectification of outdated, incomplete, or inaccurate personal information.",
                    "Consent Withdrawal: Withdraw consent for discretionary communications (e.g., promotional newsletters). Note that withdrawal of consent critical to platform functionality may require termination of course access.",
                    "Grievance Redressal: Submit concerns directly to our designated Grievance Officer.",
                ],
            },
        ],
    },
    {
        title: "9. Protection of Minors",
        blocks: [
            {
                text: "The Platform is not directed toward unsupervised minors under 18 years of age. Any enrollment of a minor must be authorized and registered under the direct supervision and consent of a parent or legal guardian. If we identify that personal data of a minor has been gathered without verifiable guardian consent, we will take immediate steps to delete such records.",
            },
        ],
    },
    {
        title: "10. Revisions to this Privacy Policy",
        blocks: [
            {
                text: 'We may periodically revise this Privacy Policy to accommodate platform updates, legal enactments, or technical upgrades. The revised document will be published on our website alongside an updated "Last Updated" timestamp. Continued engagement with our Platform following modifications signifies your binding acceptance of the updated terms.',
            },
        ],
    },
    {
        title: "11. Grievance Officer & Contact Information",
        blocks: [
            {
                text: "In compliance with the Information Technology Act, 2000, the IT Rules, 2011, and the Digital Personal Data Protection Act, 2023, the contact details of our designated Grievance Officer are:",
                items: [
                    "Title / Designation: Grievance Officer",
                    "Entity: CODEXELLENCE EDUTECH LLP",
                    `Office Address: ${ADDRESS}`,
                    `Email: ${EMAIL} (Subject line: "Attn: Grievance Officer – Privacy & Data Policy")`,
                    "Telephone: [●]",
                    "Working Hours: Monday to Friday, 10:00 AM – 6:00 PM IST",
                ],
            },
            {
                text: "We acknowledge receipt of all formal grievances within 48 hours and resolve valid concerns within 30 days of receipt.",
            },
        ],
    },
];

function BulletList({ items }: { items: Item[] }) {
    return (
        <ul className="space-y-3 mt-3">
            {items.map((item, i) => (
                <li key={i} className="flex gap-3 text-gray-600 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-green-500" />
                    <div>
                        {typeof item === "string" ? (
                            item
                        ) : (
                            <>
                                {item.text}
                                <ul className="mt-2 space-y-2">
                                    {item.sub.map((s, j) => (
                                        <li key={j} className="flex gap-3">
                                            <span className="mt-2 w-1 h-1 shrink-0 rounded-full bg-teal-500" />
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default function PrivacyPolicyPage() {
    const router = useRouter();

    // Mark the policy as accepted and return to the login page
    const handleAccept = () => {
        try {
            sessionStorage.setItem("privacyAccepted", "true");
        } catch {
            /* storage unavailable – user can still tick the box on login */
        }
        router.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-800">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
            </div>

            <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-600 transition mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <header className="mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-green-700">
                            CODEXELLENCE EDUTECH LLP
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                        Website Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500">
                        Effective Date: [●] &nbsp;|&nbsp; Last Updated: [●]
                    </p>
                </header>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-10">
                    <div className="space-y-4 text-gray-600 leading-relaxed pb-8 border-b border-gray-200">
                        <p>
                            CODEXELLENCE EDUTECH LLP (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or the
                            &quot;LLP&quot;) is committed to protecting your online privacy, securing personal
                            data, and maintaining strict safeguards over our proprietary educational assets and
                            website infrastructure.
                        </p>
                        <p>
                            This Privacy Policy governs your access to and use of our official website, digital
                            applications, student dashboards, learning portals, educational software, code
                            repositories, assessments, and study modules (collectively, the &quot;Platform&quot;).
                        </p>
                        <p>
                            This policy is formulated in compliance with the Information Technology Act, 2000, the
                            Information Technology (Reasonable Security Practices and Procedures and Sensitive
                            Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection
                            Act, 2023 (DPDPA) of India.
                        </p>
                    </div>

                    {sections.map((section) => (
                        <section key={section.title} className="pt-8">
                            <h2 className="text-xl font-bold mb-3 text-gray-800">{section.title}</h2>
                            <div className="space-y-5">
                                {section.blocks.map((block, i) => (
                                    <div key={i}>
                                        {block.label && (
                                            <h3 className="font-semibold text-green-700 mb-1">{block.label}</h3>
                                        )}
                                        {block.text && (
                                            <p className="text-gray-600 leading-relaxed">{block.text}</p>
                                        )}
                                        {block.items && <BulletList items={block.items} />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleAccept}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            I Agree &amp; Return to Login
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
