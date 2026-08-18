
"use client";

import { useRef, useState } from "react";

/**
 * ── Color helpers ──────────────────────────────────────────────────
 * `colorCode` (per grade band) now drives ONLY the outer border-frame.
 * Every other themed color inside the certificate (ribbon, gradients,
 * top-bar text, medallion frame, name underline, logo-badge bg, etc.)
 * is fixed to INNER_COLOR below and no longer varies with grade.
 */
const INNER_COLOR = "#3C0061";

function hexToRgb(hex) {
  let clean = (hex || "#3a1650").replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const bigint = parseInt(clean, 16);
  if (Number.isNaN(bigint)) return { r: 58, g: 22, b: 80 }; // fallback purple
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

/**
 * Gold laurel-wreath achievement badge, served from /public/image/badge.png.
 * Kept as a plain path (not base64) so Next.js can cache/optimize it like
 * any other static asset. The PDF export path base64-encodes it on the fly
 * via convertImageToBase64() so the downloaded PDF embeds the image data
 * directly (same pattern already used for logoSrc / signatureSrc).
 */
const MEDALLION_SRC = "/image/badge.png";

/**
 * Certificate
 * ------------------------------------------------------------------
 * NOTE on props:
 *  - `studentName` defaults to "" for grade-band previews.
 *  - `grade` shows the certificate/grade-band name.
 *  - `colorCode` is the hex color saved against the grade band — it now
 *    ONLY drives the outer border-frame. All other certificate colors
 *    (ribbon, gradients, top-bar text, medallion frame, logo-badge bg,
 *    name underline) are fixed to INNER_COLOR ("#3C0061").
 * ------------------------------------------------------------------
 */
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

  // Border color varies per grade band (colorCode prop).
  const borderColor = colorCode;

  // Every other themed color is fixed — does NOT vary with colorCode.
  const innerMain = INNER_COLOR;
  const innerDark = shadeHex(INNER_COLOR, -25);
  const innerTint45 = rgbaFromHex(INNER_COLOR, 0.45);
  const innerTint55 = rgbaFromHex(INNER_COLOR, 0.55);
  const innerTint40 = rgbaFromHex(INNER_COLOR, 0.4);
  const innerTint25 = rgbaFromHex(INNER_COLOR, 0.25);

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
      const [logoBase64, signatureBase64, medallionBase64] = await Promise.all([
        convertImageToBase64(logoSrc),
        convertImageToBase64(signatureSrc),
        convertImageToBase64(MEDALLION_SRC),
      ]);

      const finalLogoSrc = logoBase64 || logoSrc;
      const finalSignatureSrc = signatureBase64 || signatureSrc;
      const finalMedallionSrc = medallionBase64 || MEDALLION_SRC;

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
        medallionSrc: finalMedallionSrc,
      });

      const response = await fetch("/api/certificate/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      medallionSrc,
    } = props;

    // Border color varies per grade band; everything else is fixed to
    // INNER_COLOR so the downloaded PDF matches the on-screen preview.
    const border = colorCode;
    const main = INNER_COLOR;
    const dark = shadeHex(INNER_COLOR, -25);
    const tint45 = rgbaFromHex(INNER_COLOR, 0.45);
    const tint55 = rgbaFromHex(INNER_COLOR, 0.55);
    const tint40 = rgbaFromHex(INNER_COLOR, 0.4);
    const tint25 = rgbaFromHex(INNER_COLOR, 0.25);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
          @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
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

            .border-frame {
              position: absolute;
              inset: 0;
              border: 6px solid ${border};
              pointer-events: none;
              z-index: 30;
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
  left: 1%;
  top: 8%;
  width: 9%;
  aspect-ratio: 1 / 1;
  z-index: 10;
}

.medallion img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.25));
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
            <div class="border-frame"></div>

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
              <img src="${medallionSrc || MEDALLION_SRC}" alt="Achievement badge" />
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
          style={{ backgroundColor: innerMain }}
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
        {/* Decorative border frame — the ONLY element that varies with colorCode */}
        <div
          className="absolute inset-0 border-[6px] pointer-events-none z-30"
          style={{ borderColor: borderColor }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 54%, ${innerTint45} 54%, ${innerTint55} 72%, ${innerTint40} 86%, rgba(255,255,255,0) 100%), radial-gradient(circle at 88% 55%, ${innerTint25}, transparent 60%), #ffffff`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 78% 55%, ${innerTint55}, transparent 55%)`,
          }}
        />

        <div className="absolute top-0 left-[6%] sm:left-[8%] right-0 h-[9%] bg-[#a9d24a] flex items-center">
          <div
            className="absolute right-0 top-0 h-full w-[10%] bg-[#a9d24a]"
            style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
          />
          <span
            className="pl-6 sm:pl-10 font-extrabold tracking-wide text-[3vw] sm:text-[1.6vw] uppercase"
            style={{ color: innerMain }}
          >
            {orgName}
          </span>
        </div>

        <div className="absolute top-0 left-0 h-full w-[6%] sm:w-[8%] flex flex-col">
          <div
            className="flex-1"
            style={{ background: `linear-gradient(to bottom, ${innerMain}, ${innerDark})` }}
          />
          <div className="h-[9%] bg-[#a9d24a]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 60%)" }} />
        </div>

  <div className="absolute left-[1%] top-[8%] w-[11%] aspect-square z-10">
  <img
    src={MEDALLION_SRC}
    alt="Achievement badge"
    className="w-full h-full object-contain drop-shadow-lg"
  />
</div>
        <div
          className="absolute top-[3%] right-[3%] w-[10%] max-w-[110px] aspect-square z-10 rounded-2xl overflow-hidden shadow-md"
          style={{ backgroundColor: innerDark }}
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
              borderBottom: `2px solid ${innerMain}`,
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

