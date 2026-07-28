// // "use client";

// // import { useRef, useState } from "react";

// // /**
// //  * ── Color helpers ──────────────────────────────────────────────────
// //  * Everything below derives its palette from a single `colorCode` hex
// //  * value (the one saved per grade band in CertificateGradeMaster).
// //  * We turn that one hex into:
// //  *   - a darker shade  -> used for the ribbon gradient "bottom"
// //  *   - a lighter tint  -> used for soft background washes
// //  *   - alpha versions  -> used for the translucent overlays
// //  * so the whole certificate re-themes itself automatically per grade.
// //  */
// // function hexToRgb(hex) {
// //   let clean = (hex || "#3a1650").replace("#", "").trim();
// //   if (clean.length === 3) {
// //     clean = clean.split("").map((c) => c + c).join("");
// //   }
// //   const bigint = parseInt(clean, 16);
// //   if (Number.isNaN(bigint)) return { r: 58, g: 22, b: 80 }; // fallback purple
// //   return {
// //     r: (bigint >> 16) & 255,
// //     g: (bigint >> 8) & 255,
// //     b: bigint & 255,
// //   };
// // }

// // function rgbaFromHex(hex, alpha) {
// //   const { r, g, b } = hexToRgb(hex);
// //   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// // }

// // // percent > 0 lightens toward white, percent < 0 darkens toward black
// // function shadeHex(hex, percent) {
// //   const { r, g, b } = hexToRgb(hex);
// //   const t = percent < 0 ? 0 : 255;
// //   const p = Math.abs(percent) / 100;
// //   const nr = Math.round((t - r) * p) + r;
// //   const ng = Math.round((t - g) * p) + g;
// //   const nb = Math.round((t - b) * p) + b;
// //   return `rgb(${nr}, ${ng}, ${nb})`;
// // }

// // /**
// //  * Certificate
// //  * ------------------------------------------------------------------
// //  * Renders the full certificate design and (optionally) lets the user
// //  * download it as a PDF via /api/certificate/pdf.
// //  *
// //  * NOTE on props:
// //  *  - `studentName` defaults to "" (blank) so that when this component
// //  *    is used purely as a *grade-band preview* (from CertificateGradeMaster's
// //  *    Eye button) no placeholder student name is shown.
// //  *  - `grade` is used to display the certificate/grade-band name
// //  *    (e.g. "Arambh", "Pragyan", ...) instead of a raw score like "A+".
// //  *  - `colorCode` is the hex color saved against the grade band. It now
// //  *    drives the ribbon, logo badge, student-name underline, and top-bar
// //  *    text color, so every grade band renders with its own theme.
// //  * ------------------------------------------------------------------
// //  */
// // export default function Certificate({
// //   orgName = "CODE EXCELLENCE EDUTECH",
// //   studentName = "Student_Name",
// //   course = "Java Programing",
// //   dateConducted = "20-12-2026",
// //   grade = "",
// //   colorCode = "#3a1650",
// //   signatureLabel = "RAINA BAFNA",
// //   logoSrc = "/image/logo.png",
// //   signatureSrc = "/image/signature.png",
// //   showDownloadButton = true,
// // }) {
// //   const certificateRef = useRef(null);
// //   const [isDownloading, setIsDownloading] = useState(false);

// //   // Derived theme colors from the single colorCode prop
// //   const themeMain = colorCode;
// //   const themeDark = shadeHex(colorCode, -25); // ribbon gradient bottom
// //   const themeTint45 = rgbaFromHex(colorCode, 0.45);
// //   const themeTint55 = rgbaFromHex(colorCode, 0.55);
// //   const themeTint40 = rgbaFromHex(colorCode, 0.4);
// //   const themeTint25 = rgbaFromHex(colorCode, 0.25);

// //   const convertImageToBase64 = async (imagePath) => {
// //     try {
// //       const fullUrl = imagePath.startsWith("http")
// //         ? imagePath
// //         : `${window.location.origin}${imagePath}`;

// //       const response = await fetch(fullUrl);
// //       const blob = await response.blob();

// //       return new Promise((resolve, reject) => {
// //         const reader = new FileReader();
// //         reader.onloadend = () => resolve(reader.result);
// //         reader.onerror = reject;
// //         reader.readAsDataURL(blob);
// //       });
// //     } catch (error) {
// //       console.error("Error converting image to base64:", error);
// //       return null;
// //     }
// //   };

// //   const downloadPDF = async () => {
// //     if (!certificateRef.current) return;

// //     setIsDownloading(true);
// //     try {
// //       const [logoBase64, signatureBase64] = await Promise.all([
// //         convertImageToBase64(logoSrc),
// //         convertImageToBase64(signatureSrc),
// //       ]);

// //       const finalLogoSrc = logoBase64 || logoSrc;
// //       const finalSignatureSrc = signatureBase64 || signatureSrc;

// //       const certificateHTML = generateFullCertificateHTML({
// //         orgName,
// //         studentName,
// //         course,
// //         dateConducted,
// //         grade,
// //         colorCode,
// //         signatureLabel,
// //         logoSrc: finalLogoSrc,
// //         signatureSrc: finalSignatureSrc,
// //       });

// //       const response = await fetch("/api/certificate/pdf", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ html: certificateHTML }),
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to generate PDF");
// //       }

// //       const blob = await response.blob();
// //       const url = window.URL.createObjectURL(blob);
// //       const link = document.createElement("a");
// //       link.href = url;
// //       link.download = `${(studentName || "certificate").replace(/\s+/g, "_")}_Certificate.pdf`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       window.URL.revokeObjectURL(url);
// //     } catch (error) {
// //       console.error("Error generating PDF:", error);
// //       alert("Failed to generate PDF. Please try again.");
// //     } finally {
// //       setIsDownloading(false);
// //     }
// //   };

// //   const generateFullCertificateHTML = (props) => {
// //     const {
// //       orgName,
// //       studentName,
// //       course,
// //       dateConducted,
// //       grade,
// //       colorCode,
// //       signatureLabel,
// //       logoSrc,
// //       signatureSrc,
// //     } = props;

// //     // Recompute the same derived shades inside the PDF template so the
// //     // downloaded PDF always matches the on-screen preview exactly.
// //     const main = colorCode;
// //     const dark = shadeHex(colorCode, -25);
// //     const tint45 = rgbaFromHex(colorCode, 0.45);
// //     const tint55 = rgbaFromHex(colorCode, 0.55);
// //     const tint40 = rgbaFromHex(colorCode, 0.4);
// //     const tint25 = rgbaFromHex(colorCode, 0.25);

// //     return `
// //       <!DOCTYPE html>
// //       <html>
// //         <head>
// //           <meta charset="UTF-8">
// //           <style>
// //           @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');

// //             * {
// //               margin: 0;
// //               padding: 0;
// //               box-sizing: border-box;
// //             }
// //             body {
// //               display: flex;
// //               justify-content: center;
// //               align-items: center;
// //               min-height: 100vh;
// //               background: white;
// //               margin: 0;
// //               padding: 0;
// //             }
// //             .certificate-wrapper {
// //               width: 1200px;
// //               height: 750px;
// //               position: relative;
// //               background: #fafafa;
// //               overflow: hidden;
// //               font-family: 'Georgia', 'Times New Roman', serif;
// //               box-shadow: 0 20px 60px rgba(0,0,0,0.3);
// //             }

// //             .bg-gradient {
// //               position: absolute;
// //               inset: 0;
// //               pointer-events: none;
// //               background:
// //                 linear-gradient(135deg, transparent 54%, ${tint45} 54%, ${tint55} 72%, ${tint40} 86%, rgba(255,255,255,0) 100%),
// //                 radial-gradient(circle at 88% 55%, ${tint25}, transparent 60%),
// //                 #ffffff;
// //             }
// //             .bg-gradient-2 {
// //               position: absolute;
// //               inset: 0;
// //               pointer-events: none;
// //               background: radial-gradient(circle at 78% 55%, ${tint55}, transparent 55%);
// //             }

// //             .top-bar {
// //               position: absolute;
// //               top: 0;
// //               left: 6%;
// //               right: 0;
// //               height: 9%;
// //               background: #a9d24a;
// //               display: flex;
// //               align-items: center;
// //             }
// //             .top-bar-text {
// //               padding-left: 2.5rem;
// //               color: ${main};
// //               font-weight: 800;
// //               letter-spacing: 0.1em;
// //               font-size: 1.6vw;
// //               text-transform: uppercase;
// //             }
// //             .top-bar-clip {
// //               position: absolute;
// //               right: 0;
// //               top: 0;
// //               height: 100%;
// //               width: 10%;
// //               background: #a9d24a;
// //               clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%);
// //             }

// //             .left-ribbon {
// //               position: absolute;
// //               top: 0;
// //               left: 0;
// //               height: 100%;
// //               width: 8%;
// //               display: flex;
// //               flex-direction: column;
// //             }
// //             .left-ribbon-top {
// //               flex: 1;
// //               background: linear-gradient(to bottom, ${main}, ${dark});
// //             }
// //             .left-ribbon-bottom {
// //               height: 9%;
// //               background: #a9d24a;
// //               clip-path: polygon(0 0, 100% 0, 50% 100%, 0 60%);
// //             }

// //             .medallion {
// //               position: absolute;
// //               left: 0%;
// //               top: 7%;
// //               width: 14%;
// //               aspect-ratio: 1;
// //               z-index: 10;
// //             }
// //             .medallion svg {
// //               width: 100%;
// //               height: 100%;
// //               filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
// //             }

// //             .logo-badge {
// //               position: absolute;
// //               top: 5%;
// //               right: 3%;
// //               width: 10%;
// //               max-width: 110px;
// //               aspect-ratio: 1;
// //               z-index: 10;
// //               border-radius: 1rem;
// //               overflow: hidden;
// //               box-shadow: 0 4px 6px rgba(0,0,0,0.1);
// //               background: ${dark};
// //             }
// //             .logo-badge img {
// //               width: 100%;
// //               height: 100%;
// //               object-fit: cover;
// //             }

// //             .main-content {
// //               position: absolute;
// //               top: 15%;
// //               left: 15%;
// //               right: 4%;
// //               display: flex;
// //               flex-direction: column;
// //             }
// //             .cert-title {
// //               font-weight:900;
// //               color: #141414;
// //               line-height: 2;
// //               letter-spacing: 0.1em;
// //                font-size: 5.8vw;
// //                font-family: 'Cinzel', serif;
// //             }
// //             .cert-subtitle {
// //               margin-top:0;
// //               color: #1a1a1a;
// //               font-size: 2vw;
// //               font-weight: 800;
// //               letter-spacing: 0.05em;
// //             }
// //             .presented-text {
// //               margin-top: 3%;
// //               color: #222;
// //               font-size: 1.20vw;
// //             }
// //             .student-name {
// //               margin-top: 1rem;
// //               font-size: 4vw;
// //               color: #141414;
// //               line-height: 1;
// //               display: inline-block;
// //               border-bottom: 2px solid ${main};
// //               padding-bottom: 0.5rem;
// //               padding-right: 2.5rem;
// //               width: fit-content;
// //               font-family: 'Brush Script MT', 'Segoe Script', cursive;
// //               min-height: 1em;
// //             }
// //             .description-text {
// //               margin-top: 3%;
// //               color: #222;
// //               width: 82%;
// //               font-size: 1.35vw;
// //               line-height: 1.8;
// //               text-align: justify;
// //               margin-left: 0;
// //               margin-right: 0;
// //             }
// //             .description-text .highlight {
// //               font-weight: 700;
// //               border-bottom: 1.5px solid #222;
// //               padding: 0 4px;
// //             }
// //             .signature-section {
// //               position: absolute;
// //               bottom: 9%;
// //               right: 7%;
// //               display: flex;
// //               flex-direction: column;
// //               align-items: center;
// //             }
// //             .signature-section img {
// //               height: 90px;
// //               width: auto;
// //               object-fit: contain;
// //               margin-bottom: -12px;
// //             }
// //             .signature-line {
// //               width: 260px;
// //               border-top: 1.5px solid #737373;
// //               padding-top: 6px;
// //             }
// //             .signature-label {
// //               font-size: 0.9vw;
// //               color: #525252;
// //               letter-spacing: 0.08em;
// //               margin-top: -2px;
// //             }
// //           </style>
// //         </head>
// //         <body>
// //           <div class="certificate-wrapper">
// //             <div class="bg-gradient"></div>
// //             <div class="bg-gradient-2"></div>

// //             <div class="top-bar">
// //               <div class="top-bar-clip"></div>
// //               <span class="top-bar-text">${orgName}</span>
// //             </div>

// //             <div class="left-ribbon">
// //               <div class="left-ribbon-top"></div>
// //               <div class="left-ribbon-bottom"></div>
// //             </div>

// //             <div class="medallion">
// //               <svg viewBox="0 0 200 200">
// //                 <defs>
// //                   <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
// //                     <stop offset="0%" stop-color="#f6d976" />
// //                     <stop offset="50%" stop-color="#d9a636" />
// //                     <stop offset="100%" stop-color="#b8860b" />
// //                   </linearGradient>
// //                 </defs>
// //                 <g fill="url(#gold)">
// //                   <ellipse cx="35" cy="70" rx="10" ry="5" transform="rotate(-30 35 70)" />
// //                   <ellipse cx="28" cy="90" rx="10" ry="5" transform="rotate(-10 28 90)" />
// //                   <ellipse cx="28" cy="112" rx="10" ry="5" transform="rotate(10 28 112)" />
// //                   <ellipse cx="38" cy="132" rx="10" ry="5" transform="rotate(35 38 132)" />
// //                   <ellipse cx="55" cy="148" rx="10" ry="5" transform="rotate(55 55 148)" />
// //                   <ellipse cx="165" cy="70" rx="10" ry="5" transform="rotate(30 165 70)" />
// //                   <ellipse cx="172" cy="90" rx="10" ry="5" transform="rotate(10 172 90)" />
// //                   <ellipse cx="172" cy="112" rx="10" ry="5" transform="rotate(-10 172 112)" />
// //                   <ellipse cx="162" cy="132" rx="10" ry="5" transform="rotate(-35 162 132)" />
// //                   <ellipse cx="145" cy="148" rx="10" ry="5" transform="rotate(-55 145 148)" />
// //                 </g>
// //                 <g fill="url(#gold)">
// //                   <polygon points="65,20 68,28 76,28 69,33 72,41 65,36 58,41 61,33 54,28 62,28" />
// //                   <polygon points="100,12 103,20 111,20 104,25 107,33 100,28 93,33 96,25 89,20 97,20" />
// //                   <polygon points="135,20 138,28 146,28 139,33 142,41 135,36 128,41 131,33 124,28 132,28" />
// //                 </g>
// //                 <circle cx="100" cy="95" r="48" fill="url(#gold)" stroke="#8a6512" stroke-width="2" />
// //                 <circle cx="100" cy="95" r="38" fill="#e0ab34" stroke="#8a6512" stroke-width="1.5" />
// //                 <circle cx="100" cy="95" r="30" fill="#f0c65a" />
// //               </svg>
// //             </div>

// //             <div class="logo-badge">
// //               <img src="${logoSrc}" alt="${orgName} logo" />
// //             </div>

// //             <div class="main-content">
// //               <h1 class="cert-title">CERTIFICATE</h1>
// //               <h2 class="cert-subtitle">OF ACHIEVEMENT</h2>
// //               <p class="presented-text">This certificate is proudly presented to</p>
// //               <p class="student-name">${studentName}</p>
// //               <p class="description-text">
// //                 for successfully passing the assessment in
// //                 <span class="highlight">${course}</span>
// //                 conducted on
// //                 <span class="highlight">${dateConducted}</span>
// //                 . The student has demonstrated proficiency in programming
// //                 concepts and practical application, earning the grade
// //                 <span class="highlight">${grade}</span>
// //                 . We appreciate the student's hard work and dedication and
// //                 encourage continued exploration in the world of technology and
// //                 coding.
// //               </p>
// //             </div>

// //             <div class="signature-section">
// //               <img src="${signatureSrc}" alt="${signatureLabel} signature" />
// //               <div class="signature-line"></div>
// //               <span class="signature-label">${signatureLabel}</span>
// //             </div>
// //           </div>
// //         </body>
// //       </html>
// //     `;
// //   };

// //   return (
// //     <div className="w-full flex flex-col items-center justify-center gap-4">
// //       {showDownloadButton && (
// //         <button
// //           onClick={downloadPDF}
// //           disabled={isDownloading}
// //           style={{ backgroundColor: themeMain }}
// //           className="px-6 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
// //         >
// //           {isDownloading ? (
// //             <>
// //               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //               </svg>
// //               Generating PDF...
// //             </>
// //           ) : (
// //             <>
// //               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// //               </svg>
// //               Download PDF
// //             </>
// //           )}
// //         </button>
// //       )}

// //       <div
// //         ref={certificateRef}
// //         className="relative w-full max-w-[1200px] aspect-[16/10] bg-neutral-50 overflow-hidden shadow-2xl"
// //         style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
// //       >
// //         <div
// //           className="absolute inset-0 pointer-events-none"
// //           style={{
// //             background: `linear-gradient(135deg, transparent 54%, ${themeTint45} 54%, ${themeTint55} 72%, ${themeTint40} 86%, rgba(255,255,255,0) 100%), radial-gradient(circle at 88% 55%, ${themeTint25}, transparent 60%), #ffffff`,
// //           }}
// //         />
// //         <div
// //           className="absolute inset-0 pointer-events-none"
// //           style={{
// //             background: `radial-gradient(circle at 78% 55%, ${themeTint55}, transparent 55%)`,
// //           }}
// //         />

// //         <div className="absolute top-0 left-[6%] sm:left-[8%] right-0 h-[9%] bg-[#a9d24a] flex items-center">
// //           <div
// //             className="absolute right-0 top-0 h-full w-[10%] bg-[#a9d24a]"
// //             style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
// //           />
// //           <span
// //             className="pl-6 sm:pl-10 font-extrabold tracking-wide text-[3vw] sm:text-[1.6vw] uppercase"
// //             style={{ color: themeMain }}
// //           >
// //             {orgName}
// //           </span>
// //         </div>

// //         <div className="absolute top-0 left-0 h-full w-[6%] sm:w-[8%] flex flex-col">
// //           <div
// //             className="flex-1"
// //             style={{ background: `linear-gradient(to bottom, ${themeMain}, ${themeDark})` }}
// //           />
// //           <div className="h-[9%] bg-[#a9d24a]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 60%)" }} />
// //         </div>

// //         <div className="absolute left-[-1%] sm:left-[0%] top-[7%] w-[16%] sm:w-[14%] aspect-square z-10">
// //           <Medallion />
// //         </div>

// //         <div
// //           className="absolute top-[3%] right-[3%] w-[10%] max-w-[110px] aspect-square z-10 rounded-2xl overflow-hidden shadow-md"
// //           style={{ backgroundColor: themeDark }}
// //         >
// //           <img src={logoSrc} alt={`${orgName} logo`} className="w-full h-full object-cover" />
// //         </div>

// //         <div className="absolute top-[22%] left-[10%] sm:left-[10%] right-[4%] flex flex-col">
// //           <h1
// //             className="font-black text-[#141414] leading-none tracking-tight text-[8vw] sm:text-[4.6vw]"
// //             style={{ fontFamily: "'Pirata One'" }}
// //           >
// //             CERTIFICATE
// //           </h1>
// //           <h2 className="mt-1 text-[#1a1a1a] text-[4vw] sm:text-[2vw] font-normal tracking-wide">
// //             OF ACHIEVEMENT
// //           </h2>

// //           <p className="mt-[3%] text-[#222] text-[2.6vw] sm:text-[1.15vw]">
// //             This certificate is proudly presented to
// //           </p>

// //           <p
// //             className="mt-1 min-h-[1em] text-[9vw] sm:text-[4vw] text-[#141414] leading-none inline-block pb-2 pr-10 w-fit"
// //             style={{
// //               fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
// //               borderBottom: `2px solid ${themeMain}`,
// //             }}
// //           >
// //             {studentName}
// //           </p>

// //           <p className="mt-[3%] text-[#222] text-[2.3vw] sm:text-[1.05vw] leading-relaxed max-w-[90%]">
// //             for successfully passing the assessment in{" "}
// //             <span className="font-semibold border-b border-[#222] px-1">{course}</span>{" "}
// //             conducted on{" "}
// //             <span className="font-semibold border-b border-[#222] px-1">{dateConducted}</span>
// //             . The student has demonstrated proficiency in programming
// //             concepts and practical application, earning the grade{" "}
// //             <span className="font-semibold border-b border-[#222] px-1">{grade}</span>
// //             . We appreciate the student&apos;s hard work and dedication and
// //             encourage continued exploration in the world of technology and
// //             coding.
// //           </p>
// //         </div>

// //         <div className="absolute bottom-[7%] right-[7%] flex flex-col items-center">
// //           <img src={signatureSrc} alt={`${signatureLabel} signature`} className="h-[60px] sm:h-[70px] w-auto object-contain mb-[-6px]" />
// //           <div className="w-[220px] sm:w-[260px] border-t border-neutral-500 pt-2" />
// //           <span className="text-[2vw] sm:text-[0.85vw] text-neutral-600 tracking-wide">{signatureLabel}</span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function Medallion() {
// //   return (
// //     <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
// //       <defs>
// //         <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
// //           <stop offset="0%" stopColor="#f6d976" />
// //           <stop offset="50%" stopColor="#d9a636" />
// //           <stop offset="100%" stopColor="#b8860b" />
// //         </linearGradient>
// //       </defs>
// //       <g fill="url(#gold)">
// //         <ellipse cx="35" cy="70" rx="10" ry="5" transform="rotate(-30 35 70)" />
// //         <ellipse cx="28" cy="90" rx="10" ry="5" transform="rotate(-10 28 90)" />
// //         <ellipse cx="28" cy="112" rx="10" ry="5" transform="rotate(10 28 112)" />
// //         <ellipse cx="38" cy="132" rx="10" ry="5" transform="rotate(35 38 132)" />
// //         <ellipse cx="55" cy="148" rx="10" ry="5" transform="rotate(55 55 148)" />
// //         <ellipse cx="165" cy="70" rx="10" ry="5" transform="rotate(30 165 70)" />
// //         <ellipse cx="172" cy="90" rx="10" ry="5" transform="rotate(-10 172 90)" />
// //         <ellipse cx="172" cy="112" rx="10" ry="5" transform="rotate(-10 172 112)" />
// //         <ellipse cx="162" cy="132" rx="10" ry="5" transform="rotate(-35 162 132)" />
// //         <ellipse cx="145" cy="148" rx="10" ry="5" transform="rotate(-55 145 148)" />
// //       </g>
// //       <g fill="url(#gold)">
// //         <polygon points="65,20 68,28 76,28 69,33 72,41 65,36 58,41 61,33 54,28 62,28" />
// //         <polygon points="100,12 103,20 111,20 104,25 107,33 100,28 93,33 96,25 89,20 97,20" />
// //         <polygon points="135,20 138,28 146,28 139,33 142,41 135,36 128,41 131,33 124,28 132,28" />
// //       </g>
// //       <circle cx="100" cy="95" r="48" fill="url(#gold)" stroke="#8a6512" strokeWidth="2" />
// //       <circle cx="100" cy="95" r="38" fill="#e0ab34" stroke="#8a6512" strokeWidth="1.5" />
// //       <circle cx="100" cy="95" r="30" fill="#f0c65a" />
// //     </svg>
// //   );
// // }


// "use client";

// import { useRef, useState } from "react";

// /**
//  * ── Color helpers ──────────────────────────────────────────────────
//  * Everything below derives its palette from a single `colorCode` hex
//  * value (the one saved per grade band in CertificateGradeMaster).
//  * We turn that one hex into:
//  *   - a darker shade  -> used for the ribbon gradient "bottom"
//  *   - a lighter tint  -> used for soft background washes
//  *   - alpha versions  -> used for the translucent overlays
//  * so the whole certificate re-themes itself automatically per grade.
//  */
// function hexToRgb(hex) {
//   let clean = (hex || "#3a1650").replace("#", "").trim();
//   if (clean.length === 3) {
//     clean = clean.split("").map((c) => c + c).join("");
//   }
//   const bigint = parseInt(clean, 16);
//   if (Number.isNaN(bigint)) return { r: 58, g: 22, b: 80 }; // fallback purple
//   return {
//     r: (bigint >> 16) & 255,
//     g: (bigint >> 8) & 255,
//     b: bigint & 255,
//   };
// }

// function rgbaFromHex(hex, alpha) {
//   const { r, g, b } = hexToRgb(hex);
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

// // percent > 0 lightens toward white, percent < 0 darkens toward black
// function shadeHex(hex, percent) {
//   const { r, g, b } = hexToRgb(hex);
//   const t = percent < 0 ? 0 : 255;
//   const p = Math.abs(percent) / 100;
//   const nr = Math.round((t - r) * p) + r;
//   const ng = Math.round((t - g) * p) + g;
//   const nb = Math.round((t - b) * p) + b;
//   return `rgb(${nr}, ${ng}, ${nb})`;
// }

// /**
//  * Certificate
//  * ------------------------------------------------------------------
//  * Renders the full certificate design and (optionally) lets the user
//  * download it as a PDF via /api/certificate/pdf.
//  *
//  * NOTE on props:
//  *  - `studentName` defaults to "" (blank) so that when this component
//  *    is used purely as a *grade-band preview* (from CertificateGradeMaster's
//  *    Eye button) no placeholder student name is shown.
//  *  - `grade` is used to display the certificate/grade-band name
//  *    (e.g. "Arambh", "Pragyan", ...) instead of a raw score like "A+".
//  *  - `colorCode` is the hex color saved against the grade band. It now
//  *    drives the ribbon, logo badge, student-name underline, and top-bar
//  *    text color, so every grade band renders with its own theme.
//  * ------------------------------------------------------------------
//  */
// export default function Certificate({
//   orgName = "CODE EXCELLENCE EDUTECH",
//   studentName = "Student_Name",
//   course = "Java Programing",
//   dateConducted = "20-12-2026",
//   grade = "",
//   colorCode = "#3a1650",
//   signatureLabel = "RAINA BAFNA",
//   logoSrc = "/image/logo.png",
//   signatureSrc = "/image/signature.png",
//   showDownloadButton = true,
// }) {
//   const certificateRef = useRef(null);
//   const [isDownloading, setIsDownloading] = useState(false);

//   // Derived theme colors from the single colorCode prop
//   const themeMain = colorCode;
//   const themeDark = shadeHex(colorCode, -25); // ribbon gradient bottom
//   const themeTint45 = rgbaFromHex(colorCode, 0.45);
//   const themeTint55 = rgbaFromHex(colorCode, 0.55);
//   const themeTint40 = rgbaFromHex(colorCode, 0.4);
//   const themeTint25 = rgbaFromHex(colorCode, 0.25);
//   const themeTint10 = rgbaFromHex(colorCode, 0.1);
//   const themeTint70 = rgbaFromHex(colorCode, 0.7);

//   const convertImageToBase64 = async (imagePath) => {
//     try {
//       const fullUrl = imagePath.startsWith("http")
//         ? imagePath
//         : `${window.location.origin}${imagePath}`;

//       const response = await fetch(fullUrl);
//       const blob = await response.blob();

//       return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//       });
//     } catch (error) {
//       console.error("Error converting image to base64:", error);
//       return null;
//     }
//   };

//   const downloadPDF = async () => {
//     if (!certificateRef.current) return;

//     setIsDownloading(true);
//     try {
//       const [logoBase64, signatureBase64] = await Promise.all([
//         convertImageToBase64(logoSrc),
//         convertImageToBase64(signatureSrc),
//       ]);

//       const finalLogoSrc = logoBase64 || logoSrc;
//       const finalSignatureSrc = signatureBase64 || signatureSrc;

//       const certificateHTML = generateFullCertificateHTML({
//         orgName,
//         studentName,
//         course,
//         dateConducted,
//         grade,
//         colorCode,
//         signatureLabel,
//         logoSrc: finalLogoSrc,
//         signatureSrc: finalSignatureSrc,
//       });

//       const response = await fetch("/api/certificate/pdf", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ html: certificateHTML }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate PDF");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${(studentName || "certificate").replace(/\s+/g, "_")}_Certificate.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const generateFullCertificateHTML = (props) => {
//     const {
//       orgName,
//       studentName,
//       course,
//       dateConducted,
//       grade,
//       colorCode,
//       signatureLabel,
//       logoSrc,
//       signatureSrc,
//     } = props;

//     // Recompute the same derived shades inside the PDF template so the
//     // downloaded PDF always matches the on-screen preview exactly.
//     const main = colorCode;
//     const dark = shadeHex(colorCode, -25);
//     const tint45 = rgbaFromHex(colorCode, 0.45);
//     const tint55 = rgbaFromHex(colorCode, 0.55);
//     const tint40 = rgbaFromHex(colorCode, 0.4);
//     const tint25 = rgbaFromHex(colorCode, 0.25);

//     return `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <style>
//           @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');

//             * {
//               margin: 0;
//               padding: 0;
//               box-sizing: border-box;
//             }
//             body {
//               display: flex;
//               justify-content: center;
//               align-items: center;
//               min-height: 100vh;
//               background: white;
//               margin: 0;
//               padding: 0;
//             }
//             .certificate-wrapper {
//               width: 1200px;
//               height: 750px;
//               position: relative;
//               background: #fafafa;
//               overflow: hidden;
//               font-family: 'Georgia', 'Times New Roman', serif;
//               box-shadow: 0 20px 60px rgba(0,0,0,0.3);
//             }

//             .bg-gradient {
//               position: absolute;
//               inset: 0;
//               pointer-events: none;
//               background:
//                 linear-gradient(135deg, transparent 54%, ${tint45} 54%, ${tint55} 72%, ${tint40} 86%, rgba(255,255,255,0) 100%),
//                 radial-gradient(circle at 88% 55%, ${tint25}, transparent 60%),
//                 #ffffff;
//             }
//             .bg-gradient-2 {
//               position: absolute;
//               inset: 0;
//               pointer-events: none;
//               background: radial-gradient(circle at 78% 55%, ${tint55}, transparent 55%);
//             }

//             .top-bar {
//               position: absolute;
//               top: 0;
//               left: 6%;
//               right: 0;
//               height: 9%;
//               background: #a9d24a;
//               display: flex;
//               align-items: center;
//             }
//             .top-bar-text {
//               padding-left: 2.5rem;
//               color: ${main};
//               font-weight: 800;
//               letter-spacing: 0.1em;
//               font-size: 1.6vw;
//               text-transform: uppercase;
//             }
//             .top-bar-clip {
//               position: absolute;
//               right: 0;
//               top: 0;
//               height: 100%;
//               width: 10%;
//               background: #a9d24a;
//               clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%);
//             }

//             .left-ribbon {
//               position: absolute;
//               top: 0;
//               left: 0;
//               height: 100%;
//               width: 8%;
//               display: flex;
//               flex-direction: column;
//             }
//             .left-ribbon-top {
//               flex: 1;
//               background: linear-gradient(to bottom, ${main}, ${dark});
//             }
//             .left-ribbon-bottom {
//               height: 9%;
//               background: #a9d24a;
//               clip-path: polygon(0 0, 100% 0, 50% 100%, 0 60%);
//             }

//             .medallion {
//               position: absolute;
//               left: 0%;
//               top: 7%;
//               width: 14%;
//               aspect-ratio: 1;
//               z-index: 10;
//             }
//             .medallion svg {
//               width: 100%;
//               height: 100%;
//               filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
//             }

//             .logo-badge {
//               position: absolute;
//               top: 5%;
//               right: 3%;
//               width: 10%;
//               max-width: 110px;
//               aspect-ratio: 1;
//               z-index: 10;
//               border-radius: 1rem;
//               overflow: hidden;
//               box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//               background: ${dark};
//             }
//             .logo-badge img {
//               width: 100%;
//               height: 100%;
//               object-fit: cover;
//             }

//             .main-content {
//               position: absolute;
//               top: 15%;
//               left: 15%;
//               right: 4%;
//               display: flex;
//               flex-direction: column;
//             }
//             .cert-title {
//               font-weight:900;
//               color: #141414;
//               line-height: 2;
//               letter-spacing: 0.1em;
//                font-size: 5.8vw;
//                font-family: 'Cinzel', serif;
//             }
//             .cert-subtitle {
//               margin-top:0;
//               color: #1a1a1a;
//               font-size: 2vw;
//               font-weight: 800;
//               letter-spacing: 0.05em;
//             }
//             .presented-text {
//               margin-top: 3%;
//               color: #222;
//               font-size: 1.20vw;
//             }
//             .student-name {
//               margin-top: 1rem;
//               font-size: 4vw;
//               color: #141414;
//               line-height: 1;
//               display: inline-block;
//               border-bottom: 2px solid ${main};
//               padding-bottom: 0.5rem;
//               padding-right: 2.5rem;
//               width: fit-content;
//               font-family: 'Brush Script MT', 'Segoe Script', cursive;
//               min-height: 1em;
//             }
//             .description-text {
//               margin-top: 3%;
//               color: #222;
//               width: 82%;
//               font-size: 1.35vw;
//               line-height: 1.8;
//               text-align: justify;
//               margin-left: 0;
//               margin-right: 0;
//             }
//             .description-text .highlight {
//               font-weight: 700;
//               border-bottom: 1.5px solid #222;
//               padding: 0 4px;
//             }
//             .signature-section {
//               position: absolute;
//               bottom: 9%;
//               right: 7%;
//               display: flex;
//               flex-direction: column;
//               align-items: center;
//             }
//             .signature-section img {
//               height: 90px;
//               width: auto;
//               object-fit: contain;
//               margin-bottom: -12px;
//             }
//             .signature-line {
//               width: 260px;
//               border-top: 1.5px solid #737373;
//               padding-top: 6px;
//             }
//             .signature-label {
//               font-size: 0.9vw;
//               color: #525252;
//               letter-spacing: 0.08em;
//               margin-top: -2px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="certificate-wrapper">
//             <div class="bg-gradient"></div>
//             <div class="bg-gradient-2"></div>

//             <div class="top-bar">
//               <div class="top-bar-clip"></div>
//               <span class="top-bar-text">${orgName}</span>
//             </div>

//             <div class="absolute top-0 ">
//               <div class="left-ribbon-top"></div>
//               <div class="left-ribbon-bottom"></div>
//             </div>

//             <div class="medallion">
//               <svg viewBox="0 0 200 200">
//                 <defs>
//                   <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stop-color="#f6d976" />
//                     <stop offset="50%" stop-color="#d9a636" />
//                     <stop offset="100%" stop-color="#b8860b" />
//                   </linearGradient>
//                 </defs>
//                 <g fill="url(#gold)">
//                   <ellipse cx="35" cy="70" rx="10" ry="5" transform="rotate(-30 35 70)" />
//                   <ellipse cx="28" cy="90" rx="10" ry="5" transform="rotate(-10 28 90)" />
//                   <ellipse cx="28" cy="112" rx="10" ry="5" transform="rotate(10 28 112)" />
//                   <ellipse cx="38" cy="132" rx="10" ry="5" transform="rotate(35 38 132)" />
//                   <ellipse cx="55" cy="148" rx="10" ry="5" transform="rotate(55 55 148)" />
//                   <ellipse cx="165" cy="70" rx="10" ry="5" transform="rotate(30 165 70)" />
//                   <ellipse cx="172" cy="90" rx="10" ry="5" transform="rotate(10 172 90)" />
//                   <ellipse cx="172" cy="112" rx="10" ry="5" transform="rotate(-10 172 112)" />
//                   <ellipse cx="162" cy="132" rx="10" ry="5" transform="rotate(-35 162 132)" />
//                   <ellipse cx="145" cy="148" rx="10" ry="5" transform="rotate(-55 145 148)" />
//                 </g>
//                 <g fill="url(#gold)">
//                   <polygon points="65,20 68,28 76,28 69,33 72,41 65,36 58,41 61,33 54,28 62,28" />
//                   <polygon points="100,12 103,20 111,20 104,25 107,33 100,28 93,33 96,25 89,20 97,20" />
//                   <polygon points="135,20 138,28 146,28 139,33 142,41 135,36 128,41 131,33 124,28 132,28" />
//                 </g>
//                 <circle cx="100" cy="95" r="48" fill="url(#gold)" stroke="#8a6512" stroke-width="2" />
//                 <circle cx="100" cy="95" r="38" fill="#e0ab34" stroke="#8a6512" stroke-width="1.5" />
//                 <circle cx="100" cy="95" r="30" fill="#f0c65a" />
//               </svg>
//             </div>

//             <div class="logo-badge">
//               <img src="${logoSrc}" alt="${orgName} logo" />
//             </div>

//             <div class="main-content">
//               <h1 class="cert-title">CERTIFICATE</h1>
//               <h2 class="cert-subtitle">OF ACHIEVEMENT</h2>
//               <p class="presented-text">This certificate is proudly presented to</p>
//               <p class="student-name">${studentName}</p>
//               <p class="description-text">
//                 for successfully passing the assessment in
//                 <span class="highlight">${course}</span>
//                 conducted on
//                 <span class="highlight">${dateConducted}</span>
//                 . The student has demonstrated proficiency in programming
//                 concepts and practical application, earning the grade
//                 <span class="highlight">${grade}</span>
//                 . We appreciate the student's hard work and dedication and
//                 encourage continued exploration in the world of technology and
//                 coding.
//               </p>
//             </div>

//             <div class="signature-section">
//               <img src="${signatureSrc}" alt="${signatureLabel} signature" />
//               <div class="signature-line"></div>
//               <span class="signature-label">${signatureLabel}</span>
//             </div>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   return (
//     <div className="w-full flex flex-col items-center justify-center gap-4">
//       {showDownloadButton && (
//         <button
//           onClick={downloadPDF}
//           disabled={isDownloading}
//           style={{ backgroundColor: themeMain }}
//           className="px-6 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
//         >
//           {isDownloading ? (
//             <>
//               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Generating PDF...
//             </>
//           ) : (
//             <>
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Download PDF
//             </>
//           )}
//         </button>
//       )}

//       <div
//         ref={certificateRef}
//         className="relative w-full max-w-[1200px] aspect-[16/10] bg-neutral-50 overflow-hidden shadow-2xl"
//         style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
//       >
//         {/* Background gradients using the dynamic color */}
//         <div
//           className="absolute inset-0 pointer-events-none"
//           style={{
//             background: `linear-gradient(135deg, transparent 54%, ${themeTint45} 54%, ${themeTint55} 72%, ${themeTint40} 86%, rgba(255,255,255,0) 100%), radial-gradient(circle at 88% 55%, ${themeTint25}, transparent 60%), #ffffff`,
//           }}
//         />
//         <div
//           className="absolute inset-0 pointer-events-none"
//           style={{
//             background: `radial-gradient(circle at 78% 55%, ${themeTint55}, transparent 55%)`,
//           }}
//         />

//         {/* Top Bar with dynamic text color */}
//         <div className="absolute top-0 left-[6%] sm:left-[8%] right-0 h-[9%] bg-[#a9d24a] flex items-center">
//           <div
//             className="absolute right-0 top-0 h-full w-[10%] bg-[#a9d24a]"
//             style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
//           />
//           <span
//             className="pl-6 sm:pl-10 font-extrabold tracking-wide text-[3vw] sm:text-[1.6vw] uppercase"
//             style={{ color: themeMain }}
//           >
//             {orgName}
//           </span>
//         </div>

//         {/* Left Ribbon with dynamic gradient */}
//         <div className="absolute top-0 left-0 h-full w-[6%] sm:w-[8%] flex flex-col">
//           <div
//             className="flex-1"
//             style={{ background: `linear-gradient(to bottom, ${themeMain}, ${themeDark})` }}
//           />
//           <div className="h-[9%] bg-[#a9d24a]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 60%)" }} />
//         </div>

//         {/* Medallion */}
//         <div className="absolute left-[-1%] sm:left-[0%] top-[7%] w-[16%] sm:w-[14%] aspect-square z-10">
//           <Medallion />
//         </div>

//         {/* Logo Badge with dynamic background */}
//         <div
//           className="absolute top-[3%] right-[3%] w-[10%] max-w-[110px] aspect-square z-10 rounded-2xl overflow-hidden shadow-md"
//           style={{ backgroundColor: themeDark }}
//         >
//           <img src={logoSrc} alt={`${orgName} logo`} className="w-full h-full object-cover" />
//         </div>

//         {/* Main Content */}
//         <div className="absolute top-[22%] left-[10%] sm:left-[10%] right-[4%] flex flex-col">
//           <h1
//             className="font-black text-[#141414] leading-none tracking-tight text-[8vw] sm:text-[4.6vw]"
//             style={{ fontFamily: "'Pirata One'" }}
//           >
//             CERTIFICATE
//           </h1>
//           <h2 className="mt-1 text-[#1a1a1a] text-[4vw] sm:text-[2vw] font-normal tracking-wide">
//             OF ACHIEVEMENT
//           </h2>

//           <p className="mt-[3%] text-[#222] text-[2.6vw] sm:text-[1.15vw]">
//             This certificate is proudly presented to
//           </p>

//           {/* Student Name with dynamic underline color */}
//           <p
//             className="mt-1 min-h-[1em] text-[9vw] sm:text-[4vw] text-[#141414] leading-none inline-block pb-2 pr-10 w-fit"
//             style={{
//               fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
//               borderBottom: `2px solid ${themeMain}`,
//             }}
//           >
//             {studentName}
//           </p>

//           <p className="mt-[3%] text-[#222] text-[2.3vw] sm:text-[1.05vw] leading-relaxed max-w-[90%]">
//             for successfully passing the assessment in{" "}
//             <span className="font-semibold border-b border-[#222] px-1">{course}</span>{" "}
//             conducted on{" "}
//             <span className="font-semibold border-b border-[#222] px-1">{dateConducted}</span>
//             . The student has demonstrated proficiency in programming
//             concepts and practical application, earning the grade{" "}
//             <span className="font-semibold border-b border-[#222] px-1">{grade}</span>
//             . We appreciate the student&apos;s hard work and dedication and
//             encourage continued exploration in the world of technology and
//             coding.
//           </p>
//         </div>

//         {/* Signature Section */}
//         <div className="absolute bottom-[7%] right-[7%] flex flex-col items-center">
//           <img src={signatureSrc} alt={`${signatureLabel} signature`} className="h-[60px] sm:h-[70px] w-auto object-contain mb-[-6px]" />
//           <div className="w-[220px] sm:w-[260px] border-t border-neutral-500 pt-2" />
//           <span className="text-[2vw] sm:text-[0.85vw] text-neutral-600 tracking-wide">{signatureLabel}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Medallion() {
//   return (
//     <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
//       <defs>
//         <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#f6d976" />
//           <stop offset="50%" stopColor="#d9a636" />
//           <stop offset="100%" stopColor="#b8860b" />
//         </linearGradient>
//       </defs>
//       <g fill="url(#gold)">
//         <ellipse cx="35" cy="70" rx="10" ry="5" transform="rotate(-30 35 70)" />
//         <ellipse cx="28" cy="90" rx="10" ry="5" transform="rotate(-10 28 90)" />
//         <ellipse cx="28" cy="112" rx="10" ry="5" transform="rotate(10 28 112)" />
//         <ellipse cx="38" cy="132" rx="10" ry="5" transform="rotate(35 38 132)" />
//         <ellipse cx="55" cy="148" rx="10" ry="5" transform="rotate(55 55 148)" />
//         <ellipse cx="165" cy="70" rx="10" ry="5" transform="rotate(30 165 70)" />
//         <ellipse cx="172" cy="90" rx="10" ry="5" transform="rotate(-10 172 90)" />
//         <ellipse cx="172" cy="112" rx="10" ry="5" transform="rotate(-10 172 112)" />
//         <ellipse cx="162" cy="132" rx="10" ry="5" transform="rotate(-35 162 132)" />
//         <ellipse cx="145" cy="148" rx="10" ry="5" transform="rotate(-55 145 148)" />
//       </g>
//       <g fill="url(#gold)">
//         <polygon points="65,20 68,28 76,28 69,33 72,41 65,36 58,41 61,33 54,28 62,28" />
//         <polygon points="100,12 103,20 111,20 104,25 107,33 100,28 93,33 96,25 89,20 97,20" />
//         <polygon points="135,20 138,28 146,28 139,33 142,41 135,36 128,41 131,33 124,28 132,28" />
//       </g>
//       <circle cx="100" cy="95" r="48" fill="url(#gold)" stroke="#8a6512" strokeWidth="2" />
//       <circle cx="100" cy="95" r="38" fill="#e0ab34" stroke="#8a6512" strokeWidth="1.5" />
//       <circle cx="100" cy="95" r="30" fill="#f0c65a" />
//     </svg>
//   );
// }
"use client";

import { useRef, useState } from "react";

/**
 * ── Color helpers ──────────────────────────────────────────────────
 * Everything below derives its palette from a single `colorCode` hex
 * value (the one saved per grade band in CertificateGradeMaster).
 */
function hexToRgb(hex) {
  let clean = (hex || "#3a1650").replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const bigint = parseInt(clean, 16);
  if (Number.isNaN(bigint)) return { r: 58, g: 22, b: 80 };
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadeHex(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const nr = Math.round((t - r) * p) + r;
  const ng = Math.round((t - g) * p) + g;
  const nb = Math.round((t - b) * p) + b;
  return `rgb(${nr}, ${ng}, ${nb})`;
}

export default function Certificate({
  orgName = "CODE EXCELLENCE EDUTECH",
  studentName = "Student_Name",
  course = "Java Programing",
  dateConducted = "20-12-2026",
  grade = "",
  colorCode = "#3a1650",
  signatureLabel = "RAINA BAFNA",
  logoSrc = "/image/logo.png",
  signatureSrc = "/image/signature.png",
  showDownloadButton = true,
}) {
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const themeMain = colorCode;
  const themeDark = shadeHex(colorCode, -25);
  const themeTint45 = rgbaFromHex(colorCode, 0.45);
  const themeTint55 = rgbaFromHex(colorCode, 0.55);
  const themeTint40 = rgbaFromHex(colorCode, 0.4);
  const themeTint25 = rgbaFromHex(colorCode, 0.25);

  const convertImageToBase64 = async (imagePath) => {
    try {
      const fullUrl = imagePath.startsWith("http")
        ? imagePath
        : `${window.location.origin}${imagePath}`;

      const response = await fetch(fullUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    try {
      const [logoBase64, signatureBase64] = await Promise.all([
        convertImageToBase64(logoSrc),
        convertImageToBase64(signatureSrc),
      ]);

      const finalLogoSrc = logoBase64 || logoSrc;
      const finalSignatureSrc = signatureBase64 || signatureSrc;

      const certificateHTML = generateFullCertificateHTML({
        orgName,
        studentName,
        course,
        dateConducted,
        grade,
        colorCode,
        signatureLabel,
        logoSrc: finalLogoSrc,
        signatureSrc: finalSignatureSrc,
      });

      const response = await fetch("/api/certificate/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: certificateHTML }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(studentName || "certificate").replace(/\s+/g, "_")}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const generateFullCertificateHTML = (props) => {
    const {
      orgName,
      studentName,
      course,
      dateConducted,
      grade,
      colorCode,
      signatureLabel,
      logoSrc,
      signatureSrc,
    } = props;

    const main = colorCode;
    const dark = shadeHex(colorCode, -25);
    const tint45 = rgbaFromHex(colorCode, 0.45);
    const tint55 = rgbaFromHex(colorCode, 0.55);
    const tint40 = rgbaFromHex(colorCode, 0.4);
    const tint25 = rgbaFromHex(colorCode, 0.25);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
          @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');

            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              margin: 0;
              padding: 0;
            }
            .certificate-wrapper {
              width: 1200px;
              height: 750px;
              position: relative;
              background: #fafafa;
              overflow: hidden;
              font-family: 'Georgia', 'Times New Roman', serif;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }

            .bg-gradient {
              position: absolute;
              inset: 0;
              pointer-events: none;
              background:
                linear-gradient(135deg, transparent 54%, ${tint45} 54%, ${tint55} 72%, ${tint40} 86%, rgba(255,255,255,0) 100%),
                radial-gradient(circle at 88% 55%, ${tint25}, transparent 60%),
                #ffffff;
            }
            .bg-gradient-2 {
              position: absolute;
              inset: 0;
              pointer-events: none;
              background: radial-gradient(circle at 78% 55%, ${tint55}, transparent 55%);
            }

            .top-bar {
              position: absolute;
              top: 0;
              left: 6%;
              right: 0;
              height: 9%;
              background: #a9d24a;
              display: flex;
              align-items: center;
            }
            .top-bar-text {
              padding-left: 2.5rem;
              color: ${main};
              font-weight: 800;
              letter-spacing: 0.1em;
              font-size: 1.6vw;
              text-transform: uppercase;
            }
            .top-bar-clip {
              position: absolute;
              right: 0;
              top: 0;
              height: 100%;
              width: 10%;
              background: #a9d24a;
              clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%);
            }

            .left-ribbon {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              width: 8%;
              display: flex;
              flex-direction: column;
            }
            .left-ribbon-top {
              flex: 1;
              background: linear-gradient(to bottom, ${main}, ${dark});
            }
            .left-ribbon-bottom {
              height: 9%;
              background: #a9d24a;
              clip-path: polygon(0 0, 100% 0, 50% 100%, 0 60%);
            }

            .medallion {
              position: absolute;
              left: 0%;
              top: 7%;
              width: 14%;
              aspect-ratio: 1;
              z-index: 10;
            }
            .medallion svg {
              width: 100%;
              height: 100%;
              filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
            }

            .logo-badge {
              position: absolute;
              top: 5%;
              right: 3%;
              width: 10%;
              max-width: 110px;
              aspect-ratio: 1;
              z-index: 10;
              border-radius: 1rem;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              background: ${dark};
            }
            .logo-badge img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .main-content {
              position: absolute;
              top: 15%;
              left: 15%;
              right: 4%;
              display: flex;
              flex-direction: column;
            }
            .cert-title {
              font-weight:900;
              color: #141414;
              line-height: 2;
              letter-spacing: 0.1em;
              font-size: 5.8vw;
              font-family: 'Cinzel', serif;
            }
            .cert-subtitle {
              margin-top:0;
              color: #1a1a1a;
              font-size: 2vw;
              font-weight: 800;
              letter-spacing: 0.05em;
            }
            .presented-text {
              margin-top: 3%;
              color: #222;
              font-size: 1.20vw;
            }
            .student-name {
              margin-top: 1rem;
              font-size: 4vw;
              color: #141414;
              line-height: 1;
              display: inline-block;
              border-bottom: 2px solid ${main};
              padding-bottom: 0.5rem;
              padding-right: 2.5rem;
              width: fit-content;
              font-family: 'Brush Script MT', 'Segoe Script', cursive;
              min-height: 1em;
            }
            .description-text {
              margin-top: 3%;
              color: #222;
              width: 82%;
              font-size: 1.35vw;
              line-height: 1.8;
              text-align: justify;
              margin-left: 0;
              margin-right: 0;
            }
            .description-text .highlight {
              font-weight: 700;
              border-bottom: 1.5px solid #222;
              padding: 0 4px;
            }
            .signature-section {
              position: absolute;
              bottom: 9%;
              right: 7%;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .signature-section img {
              height: 90px;
              width: auto;
              object-fit: contain;
              margin-bottom: -12px;
            }
            .signature-line {
              width: 260px;
              border-top: 1.5px solid #737373;
              padding-top: 6px;
            }
            .signature-label {
              font-size: 0.9vw;
              color: #525252;
              letter-spacing: 0.08em;
              margin-top: -2px;
            }
          </style>
        </head>
        <body>
          <div class="certificate-wrapper">
            <div class="bg-gradient"></div>
            <div class="bg-gradient-2"></div>

            <div class="top-bar">
              <div class="top-bar-clip"></div>
              <span class="top-bar-text">${orgName}</span>
            </div>

            <div class="left-ribbon">
              <div class="left-ribbon-top"></div>
              <div class="left-ribbon-bottom"></div>
            </div>

            <div class="medallion">
              <svg viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f6d976" />
                    <stop offset="50%" stop-color="#d9a636" />
                    <stop offset="100%" stop-color="#b8860b" />
                  </linearGradient>
                </defs>
                <g fill="url(#gold)">
                  <ellipse cx="35" cy="70" rx="10" ry="5" transform="rotate(-30 35 70)" />
                  <ellipse cx="28" cy="90" rx="10" ry="5" transform="rotate(-10 28 90)" />
                  <ellipse cx="28" cy="112" rx="10" ry="5" transform="rotate(10 28 112)" />
                  <ellipse cx="38" cy="132" rx="10" ry="5" transform="rotate(35 38 132)" />
                  <ellipse cx="55" cy="148" rx="10" ry="5" transform="rotate(55 55 148)" />
                  <ellipse cx="165" cy="70" rx="10" ry="5" transform="rotate(30 165 70)" />
                  <ellipse cx="172" cy="90" rx="10" ry="5" transform="rotate(10 172 90)" />
                  <ellipse cx="172" cy="112" rx="10" ry="5" transform="rotate(-10 172 112)" />
                  <ellipse cx="162" cy="132" rx="10" ry="5" transform="rotate(-35 162 132)" />
                  <ellipse cx="145" cy="148" rx="10" ry="5" transform="rotate(-55 145 148)" />
                </g>
                <g fill="url(#gold)">
                  <polygon points="65,20 68,28 76,28 69,33 72,41 65,36 58,41 61,33 54,28 62,28" />
                  <polygon points="100,12 103,20 111,20 104,25 107,33 100,28 93,33 96,25 89,20 97,20" />
                  <polygon points="135,20 138,28 146,28 139,33 142,41 135,36 128,41 131,33 124,28 132,28" />
                </g>
                <circle cx="100" cy="95" r="48" fill="url(#gold)" stroke="#8a6512" stroke-width="2" />
                <circle cx="100" cy="95" r="38" fill="#e0ab34" stroke="#8a6512" stroke-width="1.5" />
                <circle cx="100" cy="95" r="30" fill="#f0c65a" />
              </svg>
            </div>

            <div class="logo-badge">
              <img src="${logoSrc}" alt="${orgName} logo" />
            </div>

            <div class="main-content">
              <h1 class="cert-title">CERTIFICATE</h1>
              <h2 class="cert-subtitle">OF ACHIEVEMENT</h2>
              <p class="presented-text">This certificate is proudly presented to</p>
              <p class="student-name">${studentName}</p>
              <p class="description-text">
                for successfully passing the assessment in
                <span class="highlight">${course}</span>
                conducted on
                <span class="highlight">${dateConducted}</span>
                . The student has demonstrated proficiency in programming
                concepts and practical application, earning the grade
                <span class="highlight">${grade}</span>
                . We appreciate the student's hard work and dedication and
                encourage continued exploration in the world of technology and
                coding.
              </p>
            </div>

            <div class="signature-section">
              <img src="${signatureSrc}" alt="${signatureLabel} signature" />
              <div class="signature-line"></div>
              <span class="signature-label">${signatureLabel}</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      {showDownloadButton && (
        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          style={{ backgroundColor: themeMain }}
          className="px-6 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      )}

      <div
        ref={certificateRef}
        className="relative w-full max-w-[1200px] aspect-[16/10] bg-neutral-50 overflow-hidden shadow-2xl"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 54%, ${themeTint45} 54%, ${themeTint55} 72%, ${themeTint40} 86%, rgba(255,255,255,0) 100%), radial-gradient(circle at 88% 55%, ${themeTint25}, transparent 60%), #ffffff`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 78% 55%, ${themeTint55}, transparent 55%)`,
          }}
        />

        <div className="absolute top-0 left-[6%] sm:left-[8%] right-0 h-[9%] bg-[#a9d24a] flex items-center">
          <div
            className="absolute right-0 top-0 h-full w-[10%] bg-[#a9d24a]"
            style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
          />
          <span
            className="pl-6 sm:pl-10 font-extrabold tracking-wide text-[3vw] sm:text-[1.6vw] uppercase"
            style={{ color: themeMain }}
          >
            {orgName}
          </span>
        </div>

        <div className="absolute top-0 left-0 h-full w-[6%] sm:w-[8%] flex flex-col">
          <div
            className="flex-1"
            style={{ background: `linear-gradient(to bottom, ${themeMain}, ${themeDark})` }}
          />
          <div className="h-[9%] bg-[#a9d24a]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 60%)" }} />
        </div>

        <div className="absolute left-[-1%] sm:left-[0%] top-[7%] w-[16%] sm:w-[14%] aspect-square z-10">
          <Medallion />
        </div>

        <div
          className="absolute top-[3%] right-[3%] w-[10%] max-w-[110px] aspect-square z-10 rounded-2xl overflow-hidden shadow-md"
          style={{ backgroundColor: themeDark }}
        >
          <img src={logoSrc} alt={`${orgName} logo`} className="w-full h-full object-cover" />
        </div>

        <div className="absolute top-[22%] left-[10%] sm:left-[10%] right-[4%] flex flex-col">
          <h1
            className="font-black text-[#141414] leading-none tracking-tight text-[8vw] sm:text-[4.6vw]"
            style={{ fontFamily: "'Pirata One'" }}
          >
            CERTIFICATE
          </h1>
          <h2 className="mt-1 text-[#1a1a1a] text-[4vw] sm:text-[2vw] font-normal tracking-wide">
            OF ACHIEVEMENT
          </h2>

          <p className="mt-[3%] text-[#222] text-[2.6vw] sm:text-[1.15vw]">
            This certificate is proudly presented to
          </p>

          <p
            className="mt-1 min-h-[1em] text-[9vw] sm:text-[4vw] text-[#141414] leading-none inline-block pb-2 pr-10 w-fit"
            style={{
              fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
              borderBottom: `2px solid ${themeMain}`,
            }}
          >
            {studentName}
          </p>

          <p className="mt-[3%] text-[#222] text-[2.3vw] sm:text-[1.05vw] leading-relaxed max-w-[90%]">
            for successfully passing the assessment in{" "}
            <span className="font-semibold border-b border-[#222] px-1">{course}</span>{" "}
            conducted on{" "}
            <span className="font-semibold border-b border-[#222] px-1">{dateConducted}</span>
            . The student has demonstrated proficiency in programming
            concepts and practical application, earning the grade{" "}
            <span className="font-semibold border-b border-[#222] px-1">{grade}</span>
            . We appreciate the student&apos;s hard work and dedication and
            encourage continued exploration in the world of technology and
            coding.
          </p>
        </div>

        <div className="absolute bottom-[7%] right-[7%] flex flex-col items-center">
          <img src={signatureSrc} alt={`${signatureLabel} signature`} className="h-[60px] sm:h-[70px] w-auto object-contain mb-[-6px]" />
          <div className="w-[220px] sm:w-[260px] border-t border-neutral-500 pt-2" />
          <span className="text-[2vw] sm:text-[0.85vw] text-neutral-600 tracking-wide">{signatureLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Medallion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6d976" />
          <stop offset="50%" stopColor="#d9a636" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <g fill="url(#gold)">
        <ellipse cx="35" cy="70" rx="10" ry="5" transform="rotate(-30 35 70)" />
        <ellipse cx="28" cy="90" rx="10" ry="5" transform="rotate(-10 28 90)" />
        <ellipse cx="28" cy="112" rx="10" ry="5" transform="rotate(10 28 112)" />
        <ellipse cx="38" cy="132" rx="10" ry="5" transform="rotate(35 38 132)" />
        <ellipse cx="55" cy="148" rx="10" ry="5" transform="rotate(55 55 148)" />
        <ellipse cx="165" cy="70" rx="10" ry="5" transform="rotate(30 165 70)" />
        <ellipse cx="172" cy="90" rx="10" ry="5" transform="rotate(-10 172 90)" />
        <ellipse cx="172" cy="112" rx="10" ry="5" transform="rotate(-10 172 112)" />
        <ellipse cx="162" cy="132" rx="10" ry="5" transform="rotate(-35 162 132)" />
        <ellipse cx="145" cy="148" rx="10" ry="5" transform="rotate(-55 145 148)" />
      </g>
      <g fill="url(#gold)">
        <polygon points="65,20 68,28 76,28 69,33 72,41 65,36 58,41 61,33 54,28 62,28" />
        <polygon points="100,12 103,20 111,20 104,25 107,33 100,28 93,33 96,25 89,20 97,20" />
        <polygon points="135,20 138,28 146,28 139,33 142,41 135,36 128,41 131,33 124,28 132,28" />
      </g>
      <circle cx="100" cy="95" r="48" fill="url(#gold)" stroke="#8a6512" strokeWidth="2" />
      <circle cx="100" cy="95" r="38" fill="#e0ab34" stroke="#8a6512" strokeWidth="1.5" />
      <circle cx="100" cy="95" r="30" fill="#f0c65a" />
    </svg>
  );
}