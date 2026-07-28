// // "use client";

// // import React from "react";

// // /** Builds a scalloped (rosette) circle outline as an SVG path string. */
// // function scallopPath(
// //   cx: number,
// //   cy: number,
// //   rOuter: number,
// //   rInner: number,
// //   scallops: number
// // ) {
// //   const step = (Math.PI * 2) / (scallops * 2);
// //   let d = "";
// //   for (let i = 0; i <= scallops * 2; i++) {
// //     const r = i % 2 === 0 ? rOuter : rInner;
// //     const angle = i * step - Math.PI / 2;
// //     const x = cx + r * Math.cos(angle);
// //     const y = cy + r * Math.sin(angle);
// //     d += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
// //   }
// //   return d + "Z";
// // }

// // interface CertificateProps {
// //   organizationName?: string;
// //   studentName?: string;
// //   assessmentName?: string;
// //   grade?: string;
// //   bodyText?: string;
// //   signerName?: string;
// //   signatureLabel?: string;
// //   logoSrc?: string;
// //   signatureSrc?: string;
// // }

// // function Certificate({
// //   organizationName = "CODE EXCELLENCE EDUTECH",
// //   studentName = "Hannah Morales",
// //   assessmentName = "Python Fundamentals",
// //   grade = "A",
// //   bodyText = "The student has demonstrated proficiency in programming concepts and practical application, earning the grade",
// //   signerName = "RAINA BAFNA",
// //   signatureLabel = "Program Director",
// //   logoSrc = "/image/logo.png",
// //   signatureSrc = "/image/signature.png",
// // }: CertificateProps) {
// //   return (
// //     <div className="w-full flex items-center justify-center bg-neutral-100 p-4 md:p-10">
// //       <style jsx global>{`
// //         @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Pirata+One&family=Oswald:wght@600;700&display=swap");
// //       `}</style>

// //       <div
// //         className="relative w-full max-w-[1400px] aspect-[1600/1132] bg-[#f6f5f4] overflow-hidden shadow-2xl rounded-sm"
// //         style={{ fontFamily: "'Playfair Display', serif" }}
// //       >
// //         {/* top accent strip */}
// //         <div className="absolute top-0 left-0 right-0 h-[2.2%] bg-gradient-to-r from-[#9dc63b] to-[#7fb238]" />

// //         {/* faint wavy line background texture */}
// //         <svg
// //           className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
// //           viewBox="0 0 1600 1132"
// //           preserveAspectRatio="none"
// //         >
// //           {Array.from({ length: 10 }).map((_, i) => (
// //             <path
// //               key={i}
// //               d={`M -100 ${120 + i * 60} C 300 ${40 + i * 60}, 700 ${200 + i * 60}, 1700 ${80 + i * 60}`}
// //               stroke="#5a3d8a"
// //               strokeWidth="2"
// //               fill="none"
// //             />
// //           ))}
// //         </svg>

// //         {/* bottom-right decorative swooshes */}
// //         <svg
// //           className="absolute bottom-0 right-0 w-[46%] h-[62%] pointer-events-none"
// //           viewBox="0 0 800 700"
// //           preserveAspectRatio="xMaxYMax meet"
// //         >
// //           <path d="M 800 700 L 800 260 C 650 340 560 460 560 700 Z" fill="#c9b8de" />
// //           <path d="M 800 700 L 800 380 C 690 440 640 540 660 700 Z" fill="#6a2a8f" />
// //           <path d="M 800 700 L 800 480 C 740 510 720 580 730 700 Z" fill="#8bc53f" />
// //           <path d="M 40 700 C 20 560 60 470 160 400" stroke="#6a2a8f" strokeWidth="14" fill="none" />
// //           <path d="M 90 700 C 70 590 100 510 180 450" stroke="#c9b8de" strokeWidth="10" fill="none" />
// //         </svg>

// //         {/* purple header bar */}
// //       <div className="absolute top-[4%] left-0 z-10">
// //   <div
// //     className="inline-block whitespace-nowrap bg-[#5a2d82] text-white font-bold tracking-wide py-[2%] pl-[3.2%] pr-[200%] rounded-r-full text-[2.4vw] md:text-[1.4vw] min-w-[32%]"
// //     style={{ fontFamily: "'Oswald', sans-serif" }}
// //   >
// //     CODE EXCELLENCE EDUTECH
// //   </div>
// // </div>
// //         {/* logo, top right */}
// //         <div className="absolute top-[8%] right-[3%] w-[9%] aspect-square rounded-2xl shadow-md overflow-hidden bg-white">
// //           {/* eslint-disable-next-line @next/next/no-img-element */}
// //    <img
// //   src={logoSrc}
// //   alt={`${organizationName} logo`}
// //   className="w-full h-full object-cover"
// // />
// //         </div>

// //         {/* gold seal / scalloped medal */}
// //         <div className="absolute top-[13%] left-[2.5%] w-[9%]">
// //           <svg viewBox="0 0 200 320" className="w-full">
// //             <defs>
// //               <radialGradient id="goldGrad" cx="35%" cy="30%" r="70%">
// //                 <stop offset="0%" stopColor="#fff3c4" />
// //                 <stop offset="40%" stopColor="#eec53a" />
// //                 <stop offset="75%" stopColor="#c9960a" />
// //                 <stop offset="100%" stopColor="#a97c0a" />
// //               </radialGradient>
// //               <linearGradient id="ribbonDark" x1="0" y1="0" x2="1" y2="1">
// //                 <stop offset="0%" stopColor="#c69a1e" />
// //                 <stop offset="100%" stopColor="#7c5c0a" />
// //               </linearGradient>
// //               <linearGradient id="ribbonLight" x1="0" y1="0" x2="1" y2="1">
// //                 <stop offset="0%" stopColor="#f3d774" />
// //                 <stop offset="100%" stopColor="#c69a1e" />
// //               </linearGradient>
// //             </defs>

// //             {/* ribbon tails, pointed V cut like the reference badge */}
// //             <path d="M 76 145 L 88 300 L 100 210 Z" fill="url(#ribbonDark)" />
// //             <path d="M 124 145 L 112 300 L 100 210 Z" fill="url(#ribbonLight)" />

// //             {/* scalloped rosette rim */}
// //             <path
// //               d={scallopPath(100, 95, 82, 70, 20)}
// //               fill="url(#goldGrad)"
// //               stroke="#8a6a12"
// //               strokeWidth="2"
// //             />

// //             {/* sunburst rays inside the medal face */}
// //             <clipPath id="medalClip">
// //               <circle cx="100" cy="95" r="66" />
// //             </clipPath>
// //             <g clipPath="url(#medalClip)">
// //               <circle cx="100" cy="95" r="66" fill="url(#goldGrad)" />
// //               {Array.from({ length: 24 }).map((_, i) => (
// //                 <rect
// //                   key={i}
// //                   x="99"
// //                   y="29"
// //                   width="2"
// //                   height="66"
// //                   fill={i % 2 === 0 ? "#fff3c4" : "#b6890f"}
// //                   opacity={0.45}
// //                   transform={`rotate(${i * 15} 100 95)`}
// //                 />
// //               ))}
// //             </g>

// //             {/* inner ring + highlight */}
// //             <circle cx="100" cy="95" r="66" fill="none" stroke="#8a6a12" strokeWidth="2" />
// //             <circle cx="100" cy="95" r="50" fill="none" stroke="#fffbe0" strokeWidth="1.5" opacity="0.7" />
// //           </svg>
// //         </div>

// //         {/* main content block */}
// //         <div className="absolute top-[15%] left-[15%] right-[6%] bottom-[4%] flex flex-col">
// //           <h1
// //             className="font-black text-[#1a1a1a] leading-none text-[5.4vw] md:text-[4.4vw]"
// //             style={{ fontFamily: "'Pirata One', cursive",fontSize:"72px", width: "700",letterSpacing: "8px" }}
// //           >
// //             CERTIFICATE
// //           </h1>
// //           <h2 className="text-[2vw] md:text-[1.7vw] text-[#2a2a2a] mt-[0.6%] font-normal tracking-wide">
// //             OF ACHIEVEMENT
// //           </h2>

// //           <p className="mt-[2.4%] text-[1.25vw] md:text-[1.05vw] text-[#2a2a2a]">
// //             This certificate is proudly presented to
// //           </p>

// //           <div className="mt-[1.2%] border-b border-neutral-500 pb-[1%] w-[68%]">
// //             <span
// //               className="text-[1.6vw] md:text-[3vw] text-[#1a1a1a] leading-none"
// //               style={{ fontFamily: "'Allura', cursive" }}
// //             >
// //               {studentName}
// //             </span>
// //           </div>

// //           <div className="mt-[3%] text-[1.25vw] md:text-[1.05vw] text-[#2a2a2a] leading-relaxed max-w-[70%]">
// //   <p>
// //     for successfully passing the assessment in{" "}
// //     <span className="font-bold">
// //       {assessmentName || "\u00A0"}
// //     </span>
// //   </p>

// //   <p className="mt-[0.8%]">
// //     {bodyText}{" "}
// //     <span className="font-bold">
// //       {grade || "\u00A0"}
// //     </span>
// //     . We appreciate the student&rsquo;s hard work and dedication and encourage
// //     continued exploration in the world of technology and coding.
// //   </p>
// // </div>

// //         <div className="mt-auto w-[28%]">
// //   {/* eslint-disable-next-line @next/next/no-img-element */}
// //   <img
// //     src={signatureSrc}
// //     alt={`${signerName} signature`}
// //     className="h-[4.2vw] md:h-[3vw] object-contain object-left-bottom"
// //   />

// //   {/* Half-width underline */}
// //   <div className="border-b border-neutral-600 w-[50%] pb-[0.4%]" />

// //   <p className="text-[1.05vw] md:text-[0.95vw] text-[#1a1a1a] font-semibold mt-[0.6%]">
// //     {signerName}
// //   </p>

// //   <p className="text-[0.9vw] md:text-[0.8vw] text-neutral-600">
// //     {signatureLabel}
// //   </p>
// // </div>
// //         </div>

// //         {/* illustration: kids coding at a shared desk (simplified, flat-style) */}
// //         <div className="absolute bottom-0 right-[2%] w-[34%] h-[46%] pointer-events-none">
// //           <svg viewBox="0 0 500 340" className="w-full h-full">
// //             <rect x="205" y="230" width="20" height="60" fill="#6a2a8f" />
// //             <rect x="170" y="290" width="90" height="14" rx="3" fill="#5a2478" />
// //             <rect x="140" y="70" width="180" height="150" rx="10" fill="#7c4bb0" />
// //             <rect x="152" y="90" width="156" height="112" rx="4" fill="#efe9fb" />
// //             <circle cx="165" cy="80" r="4" fill="#e0d4f7" />
// //             <circle cx="178" cy="80" r="4" fill="#e0d4f7" />
// //             <circle cx="230" cy="150" r="10" fill="#f0a93a" />
// //             <rect x="255" y="120" width="34" height="60" rx="4" fill="#5a2478" />
// //             <text x="258" y="158" fontSize="26" fill="#efe9fb" fontFamily="monospace">
// //               {"</>"}
// //             </text>

// //             <g>
// //               <rect x="30" y="250" width="46" height="40" fill="#5a2478" />
// //               <rect x="30" y="250" width="46" height="40" fill="#6a2a8f" opacity="0.6" />
// //               <rect x="18" y="210" width="70" height="18" rx="4" fill="#8bc53f" />
// //               <circle cx="53" cy="180" r="24" fill="#2e2e2e" />
// //               <circle cx="53" cy="188" r="16" fill="#f2c29a" />
// //               <rect x="35" y="200" width="36" height="40" rx="8" fill="#3a3f8f" />
// //             </g>

// //             <g>
// //               <circle cx="360" cy="150" r="22" fill="#7a4a2a" />
// //               <circle cx="360" cy="157" r="15" fill="#f2c29a" />
// //               <rect x="345" y="170" width="30" height="70" rx="8" fill="#3a3f8f" />
// //               <rect x="345" y="170" width="30" height="20" rx="6" fill="#efe9fb" />
// //             </g>

// //             <g>
// //               <circle cx="440" cy="200" r="20" fill="#2e2e2e" />
// //               <circle cx="440" cy="207" r="14" fill="#f2c29a" />
// //               <rect x="425" y="222" width="30" height="50" rx="8" fill="#3a3f8f" />
// //               <rect x="418" y="260" width="44" height="30" rx="4" fill="#5a2478" />
// //             </g>
// //           </svg>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default function Page() {
// //   return (
// //     <Certificate
// //       organizationName="CODE EXCELLENCE EDUTECH"
// //       studentName="Hannah Morales"
// //       assessmentName="Python Fundamentals"
// //       grade="A"
// //       signerName="RAINA BAFNA"
// //       signatureLabel="Program Director"
// //       logoSrc="/image/logo.png"
// //       signatureSrc="/image/signature.png"
// //     />
// //   );
// // }


// "use client";

// import React, { useState } from "react";

// /** Builds a scalloped (rosette) circle outline as an SVG path string. */
// function scallopPath(
//   cx: number,
//   cy: number,
//   rOuter: number,
//   rInner: number,
//   scallops: number
// ) {
//   const step = (Math.PI * 2) / (scallops * 2);
//   let d = "";
//   for (let i = 0; i <= scallops * 2; i++) {
//     const r = i % 2 === 0 ? rOuter : rInner;
//     const angle = i * step - Math.PI / 2;
//     const x = cx + r * Math.cos(angle);
//     const y = cy + r * Math.sin(angle);
//     d += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
//   }
//   return d + "Z";
// }

// interface CertificateProps {
//   organizationName?: string;
//   studentName?: string;
//   assessmentName?: string;
//   grade?: string;
//   bodyText?: string;
//   signerName?: string;
//   signatureLabel?: string;
//   logoSrc?: string;
//   signatureSrc?: string;
// }

// function Certificate({
//   organizationName = "CODE EXCELLENCE EDUTECH",
//   studentName = "Hannah Morales",
//   assessmentName = "Python Fundamentals",
//   grade = "A",
//   bodyText = "The student has demonstrated proficiency in programming concepts and practical application, earning the grade",
//   signerName = "RAINA BAFNA",
//   signatureLabel = "Program Director",
//   logoSrc = "/image/logo.png",
//   signatureSrc = "/image/signature.png",
// }: CertificateProps) {
//   return (
//     <div className="w-full flex items-center justify-center bg-neutral-100 p-4 md:p-10">
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Pirata+One&family=Oswald:wght@600;700&display=swap");
//       `}</style>

//       <div
//         className="relative w-full max-w-[1400px] aspect-[1600/1132] bg-[#f6f5f4] overflow-hidden shadow-2xl rounded-sm"
//         style={{ fontFamily: "'Playfair Display', serif" }}
//       >
//         {/* top accent strip */}
//         <div className="absolute top-0 left-0 right-0 h-[2.2%] bg-gradient-to-r from-[#9dc63b] to-[#7fb238]" />

//         {/* faint wavy line background texture */}
//         <svg
//           className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
//           viewBox="0 0 1600 1132"
//           preserveAspectRatio="none"
//         >
//           {Array.from({ length: 10 }).map((_, i) => (
//             <path
//               key={i}
//               d={`M -100 ${120 + i * 60} C 300 ${40 + i * 60}, 700 ${200 + i * 60}, 1700 ${80 + i * 60}`}
//               stroke="#5a3d8a"
//               strokeWidth="2"
//               fill="none"
//             />
//           ))}
//         </svg>

//         {/* bottom-right decorative swooshes */}
//         <svg
//           className="absolute bottom-0 right-0 w-[46%] h-[62%] pointer-events-none"
//           viewBox="0 0 800 700"
//           preserveAspectRatio="xMaxYMax meet"
//         >
//           <path d="M 800 700 L 800 260 C 650 340 560 460 560 700 Z" fill="#c9b8de" />
//           <path d="M 800 700 L 800 380 C 690 440 640 540 660 700 Z" fill="#6a2a8f" />
//           <path d="M 800 700 L 800 480 C 740 510 720 580 730 700 Z" fill="#8bc53f" />
//           <path d="M 40 700 C 20 560 60 470 160 400" stroke="#6a2a8f" strokeWidth="14" fill="none" />
//           <path d="M 90 700 C 70 590 100 510 180 450" stroke="#c9b8de" strokeWidth="10" fill="none" />
//         </svg>

//         {/* purple header bar */}
//       <div className="absolute top-[4%] left-0 z-10">
//   <div
//     className="inline-block whitespace-nowrap bg-[#5a2d82] text-white font-bold tracking-wide py-[2%] pl-[3.2%] pr-[200%] rounded-r-full text-[2.4vw] md:text-[1.4vw] min-w-[32%]"
//     style={{ fontFamily: "'Oswald', sans-serif" }}
//   >
//     CODE EXCELLENCE EDUTECH
//   </div>
// </div>
//         {/* logo, top right */}
//         <div className="absolute top-[8%] right-[3%] w-[9%] aspect-square rounded-2xl shadow-md overflow-hidden bg-white">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//    <img
//   src={logoSrc}
//   alt={`${organizationName} logo`}
//   className="w-full h-full object-cover"
// />
//         </div>

//         {/* gold seal / scalloped medal */}
//         <div className="absolute top-[13%] left-[2.5%] w-[9%]">
//           <svg viewBox="0 0 200 320" className="w-full">
//             <defs>
//               <radialGradient id="goldGrad" cx="35%" cy="30%" r="70%">
//                 <stop offset="0%" stopColor="#fff3c4" />
//                 <stop offset="40%" stopColor="#eec53a" />
//                 <stop offset="75%" stopColor="#c9960a" />
//                 <stop offset="100%" stopColor="#a97c0a" />
//               </radialGradient>
//               <linearGradient id="ribbonDark" x1="0" y1="0" x2="1" y2="1">
//                 <stop offset="0%" stopColor="#c69a1e" />
//                 <stop offset="100%" stopColor="#7c5c0a" />
//               </linearGradient>
//               <linearGradient id="ribbonLight" x1="0" y1="0" x2="1" y2="1">
//                 <stop offset="0%" stopColor="#f3d774" />
//                 <stop offset="100%" stopColor="#c69a1e" />
//               </linearGradient>
//             </defs>

//             {/* ribbon tails, pointed V cut like the reference badge */}
//             <path d="M 76 145 L 88 300 L 100 210 Z" fill="url(#ribbonDark)" />
//             <path d="M 124 145 L 112 300 L 100 210 Z" fill="url(#ribbonLight)" />

//             {/* scalloped rosette rim */}
//             <path
//               d={scallopPath(100, 95, 82, 70, 20)}
//               fill="url(#goldGrad)"
//               stroke="#8a6a12"
//               strokeWidth="2"
//             />

//             {/* sunburst rays inside the medal face */}
//             <clipPath id="medalClip">
//               <circle cx="100" cy="95" r="66" />
//             </clipPath>
//             <g clipPath="url(#medalClip)">
//               <circle cx="100" cy="95" r="66" fill="url(#goldGrad)" />
//               {Array.from({ length: 24 }).map((_, i) => (
//                 <rect
//                   key={i}
//                   x="99"
//                   y="29"
//                   width="2"
//                   height="66"
//                   fill={i % 2 === 0 ? "#fff3c4" : "#b6890f"}
//                   opacity={0.45}
//                   transform={`rotate(${i * 15} 100 95)`}
//                 />
//               ))}
//             </g>

//             {/* inner ring + highlight */}
//             <circle cx="100" cy="95" r="66" fill="none" stroke="#8a6a12" strokeWidth="2" />
//             <circle cx="100" cy="95" r="50" fill="none" stroke="#fffbe0" strokeWidth="1.5" opacity="0.7" />
//           </svg>
//         </div>

//         {/* main content block */}
//         <div className="absolute top-[15%] left-[15%] right-[6%] bottom-[4%] flex flex-col">
//           <h1
//             className="font-black text-[#1a1a1a] leading-none text-[5.4vw] md:text-[4.4vw]"
//             style={{ fontFamily: "'Pirata One', cursive",fontSize:"72px", width: "700",letterSpacing: "8px" }}
//           >
//             CERTIFICATE
//           </h1>
//           <h2 className="text-[2vw] md:text-[1.7vw] text-[#2a2a2a] mt-[0.6%] font-normal tracking-wide">
//             OF ACHIEVEMENT
//           </h2>

//           <p className="mt-[2.4%] text-[1.25vw] md:text-[1.05vw] text-[#2a2a2a]">
//             This certificate is proudly presented to
//           </p>

//           <div className="mt-[1.2%] border-b border-neutral-500 pb-[1%] w-[68%]">
//             <span
//               className="text-[1.6vw] md:text-[3vw] text-[#1a1a1a] leading-none"
//               style={{ fontFamily: "'Allura', cursive" }}
//             >
//               {studentName}
//             </span>
//           </div>

//           <div className="mt-[3%] text-[1.25vw] md:text-[1.05vw] text-[#2a2a2a] leading-relaxed max-w-[70%]">
//   <p>
//     for successfully passing the assessment in{" "}
//     <span className="font-bold">
//       {assessmentName || "\u00A0"}
//     </span>
//   </p>

//   <p className="mt-[0.8%]">
//     {bodyText}{" "}
//     <span className="font-bold">
//       {grade || "\u00A0"}
//     </span>
//     . We appreciate the student&rsquo;s hard work and dedication and encourage
//     continued exploration in the world of technology and coding.
//   </p>
// </div>

//         <div className="mt-auto w-[28%]">
//   {/* eslint-disable-next-line @next/next/no-img-element */}
//   <img
//     src={signatureSrc}
//     alt={`${signerName} signature`}
//     className="h-[4.2vw] md:h-[3vw] object-contain object-left-bottom"
//   />

//   {/* Half-width underline */}
//   <div className="border-b border-neutral-600 w-[50%] pb-[0.4%]" />

//   <p className="text-[1.05vw] md:text-[0.95vw] text-[#1a1a1a] font-semibold mt-[0.6%]">
//     {signerName}
//   </p>

//   <p className="text-[0.9vw] md:text-[0.8vw] text-neutral-600">
//     {signatureLabel}
//   </p>
// </div>
//         </div>

//         {/* illustration: kids coding at a shared desk (simplified, flat-style) */}
//         <div className="absolute bottom-0 right-[2%] w-[34%] h-[46%] pointer-events-none">
//           <svg viewBox="0 0 500 340" className="w-full h-full">
//             <rect x="205" y="230" width="20" height="60" fill="#6a2a8f" />
//             <rect x="170" y="290" width="90" height="14" rx="3" fill="#5a2478" />
//             <rect x="140" y="70" width="180" height="150" rx="10" fill="#7c4bb0" />
//             <rect x="152" y="90" width="156" height="112" rx="4" fill="#efe9fb" />
//             <circle cx="165" cy="80" r="4" fill="#e0d4f7" />
//             <circle cx="178" cy="80" r="4" fill="#e0d4f7" />
//             <circle cx="230" cy="150" r="10" fill="#f0a93a" />
//             <rect x="255" y="120" width="34" height="60" rx="4" fill="#5a2478" />
//             <text x="258" y="158" fontSize="26" fill="#efe9fb" fontFamily="monospace">
//               {"</>"}
//             </text>

//             <g>
//               <rect x="30" y="250" width="46" height="40" fill="#5a2478" />
//               <rect x="30" y="250" width="46" height="40" fill="#6a2a8f" opacity="0.6" />
//               <rect x="18" y="210" width="70" height="18" rx="4" fill="#8bc53f" />
//               <circle cx="53" cy="180" r="24" fill="#2e2e2e" />
//               <circle cx="53" cy="188" r="16" fill="#f2c29a" />
//               <rect x="35" y="200" width="36" height="40" rx="8" fill="#3a3f8f" />
//             </g>

//             <g>
//               <circle cx="360" cy="150" r="22" fill="#7a4a2a" />
//               <circle cx="360" cy="157" r="15" fill="#f2c29a" />
//               <rect x="345" y="170" width="30" height="70" rx="8" fill="#3a3f8f" />
//               <rect x="345" y="170" width="30" height="20" rx="6" fill="#efe9fb" />
//             </g>

//             <g>
//               <circle cx="440" cy="200" r="20" fill="#2e2e2e" />
//               <circle cx="440" cy="207" r="14" fill="#f2c29a" />
//               <rect x="425" y="222" width="30" height="50" rx="8" fill="#3a3f8f" />
//               <rect x="418" y="260" width="44" height="30" rx="4" fill="#5a2478" />
//             </g>
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function Page() {
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleDownload = async () => {
//     setIsDownloading(true);
//     try {
//       const response = await fetch('/api/certificate/achiement-pdf', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           organizationName: "CODE EXCELLENCE EDUTECH",
//           studentName: "Hannah Morales",
//           assessmentName: "Python Fundamentals",
//           grade: "A",
//           bodyText: "The student has demonstrated proficiency in programming concepts and practical application, earning the grade",
//           signerName: "RAINA BAFNA",
//           signatureLabel: "Program Director",
//           logoSrc: "/image/logo.png",
//           signatureSrc: "/image/signature.png",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to download certificate');
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = 'certificate.pdf';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error downloading certificate:', error);
//       alert('Failed to download certificate. Please try again.');
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="flex justify-end mb-4">
//           <button
//             onClick={handleDownload}
//             disabled={isDownloading}
//             className="px-6 py-3 bg-[#5a2d82] text-white rounded-lg font-semibold hover:bg-[#4a2370] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isDownloading ? 'Generating...' : 'Download Certificate (PDF)'}
//           </button>
//         </div>
//         <Certificate
//           organizationName="CODE EXCELLENCE EDUTECH"
//           studentName="Hannah Morales"
//           assessmentName="Python Fundamentals"
//           grade="A"
//           signerName="RAINA BAFNA"
//           signatureLabel="Program Director"
//           logoSrc="/image/logo.png"
//           signatureSrc="/image/signature.png"
//         />
//       </div>
//     </div>
//   );
// }
