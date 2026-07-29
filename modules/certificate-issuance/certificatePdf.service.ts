import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import type { CertificateTemplate } from '@prisma/client';

export interface CertificatePdfData {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  issueDate: string;
  score?: number;
  percentage?: number;
  grade?: string;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCertificateHtml(template: CertificateTemplate, data: CertificatePdfData): string {
  const {
    primaryColor,
    accentColor,
    fontFamily,
    logoUrl,
    signatureUrl,
    signature2Url,
    backgroundUrl,
    organizationName,
    signatory1Name,
    signatory1Role,
    signatory2Name,
    signatory2Role,
    sealEnabled,
  } = template;

  const bodyText = `has successfully completed the course in <strong>${escapeHtml(data.courseName)} </strong>offered by <strong>Code Excellence Edutech</strong>. Throughout the course, the student has demonstrated dedication, enthusiasm, and commitment to learning relevant concepts, problem-solving, and practical applied skills. We congratulate him/her on this achievement.`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  /* ─── GOOGLE FONTS ─────────────────────────────────────────────── */
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@700;800&family=Pirata+One&family=Inter:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    width: 1120px;
    height: 792px;
    margin: 0;
    padding: 0;
    background: #f5f0eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }
  
  .certificate-wrapper {
    width: 1120px;
    height: 792px;
    padding: 24px;
    background: linear-gradient(145deg, #1a3a8a 0%, ${primaryColor} 40%, ${accentColor} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .certificate-inner {
    position: relative;
    width: 100%;
    height: 100%;
    background: ${backgroundUrl ? `url(${backgroundUrl}) center/cover` : '#ffffff'};
    border: 4px solid #C7A03C;
    border-radius: 16px;
    overflow: hidden;
    padding: 40px 48px 32px 48px;
    display: flex;
    flex-direction: column;
  }
  
  .certificate-inner::before {
    content: '';
    position: absolute;
    inset: 18px;
    border: 2px solid #C7A03C;
    border-radius: 10px;
    pointer-events: none;
  }
  
  .corner {
    position: absolute;
    width: 36px;
    height: 36px;
    border-color: #C7A03C;
    border-style: solid;
    border-width: 0;
  }
  .corner-tl { top: 28px; left: 28px; border-top-width: 4px; border-left-width: 4px; }
  .corner-tr { top: 28px; right: 28px; border-top-width: 4px; border-right-width: 4px; }
  .corner-bl { bottom: 28px; left: 28px; border-bottom-width: 4px; border-left-width: 4px; }
  .corner-br { bottom: 28px; right: 28px; border-bottom-width: 4px; border-right-width: 4px; }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    flex-shrink: 0;
  }
  
  .logo-container {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .logo-container img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .header-left-spacer {
    width: 100px;
    flex-shrink: 0;
  }
  
  .org-name-center {
    text-align: center;
    flex: 1;
  }
  .org-name-center .org-text {
    color: ${primaryColor};
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
  }
  
  .title-section {
    text-align: center;
    margin: 1px 0 0 0;
    flex-shrink: 0;
  } 
  .title-section .main-title {
    font-size: 72px;
    font-weight: 400;
    color: ${primaryColor};
    font-family: 'Pirata One', cursive;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.2;
    margin-bottom: 10px;
  }
  
  .title-section .completion-ribbon {
    display: inline-block;
    background: ${accentColor};
    color: white;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.4em;
    padding: 5px 40px;
    margin-bottom: 8px;
    clip-path: polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%);
    text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
  }
  
  .intro-section {
    text-align: center;
    margin-top: 8px;
    flex-shrink: 0;
  }
  .intro-section .intro-text {
    margin-top: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #4a3a6a;
    letter-spacing: 0.1em;
  }
  
  .student-section {
    text-align: center;
    margin: 12px 0 4px 0;
    flex-shrink: 0;
  }
  .student-section .student-name {
    font-family: 'Dancing Script', cursive;
    font-size: 60px;
    font-weight: 700;
    color: ${primaryColor};
    letter-spacing: 0.04em;
    line-height: 1.2;
  }
  .student-section .name-underline {
    width: 40%;
    height: 3px;
    background: ${accentColor};
    margin: 4px auto 0;
    border-radius: 3px;
  }
  
  .body-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    margin-top: -8px;        
  }
  .body-section .body-text {
    text-align: center;
    font-size: 14px;
    line-height: 1.9;
    color: #3a2c63;
    max-width: 90%;
    margin: 0 auto;
    white-space: pre-line;
  }
  
  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 12px;
    flex-shrink: 0;
    margin-top: 4px;
  }
  
  .signature-block {
    text-align: center;
    flex: 1;
  }
  .signature-block .signature-img {
    height: 60px;
    width: auto;
    object-fit: contain;
    display: block;
    margin: 0 auto 6px;
  }
  .signature-block .signature-line {
    width: 180px;
    height: 2px;
    background: ${accentColor};
    margin: 0 auto 6px;
  }
  .signature-block .signature-name {
    color: ${primaryColor};
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .signature-block .signature-role {
    color: ${primaryColor};
    font-size: 12px;
    font-style: italic;
    font-weight: 400;
  }
  
  .seal-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 90px;
  }
  .seal-container svg {
    width: 80px;
    height: 80px;
  }
  
  .certificate-number {
    position: absolute;
    bottom: 14px;
    right: 30px;
    font-size: 10px;
    color: #bbb;
    font-weight: 400;
    letter-spacing: 0.08em;
    z-index: 1;
  }
  
  @media print {
    body, .certificate-wrapper {
      width: 1120px;
      height: 792px;
    }
  }
</style>
</head>
<body>
  <div class="certificate-wrapper">
    <div class="certificate-inner">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      
      <!-- Header -->
      <div class="header-section">
        <div class="header-left-spacer"></div>
        <div class="org-name-center">
          <div class="org-text">CODE EXCELLENCE EDUTECH</div>
        </div>
        <div class="logo-container">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : ''}
        </div>
      </div>
      
      <!-- Title -->
      <div class="title-section">
        <div class="main-title">Certificate</div>
        <div class="completion-ribbon">OF COMPLETION</div>
      </div>
     
      <!-- Intro -->
      <div class="intro-section">
        <div class="intro-text">This is to proudly certify that</div>
      </div>
      
      <!-- Student Name -->
      <div class="student-section">
        <div class="student-name">${escapeHtml(data.studentName)}</div>
        <div class="name-underline"></div>
      </div>
      
      <!-- Body -->
      <div class="body-section">
        <div class="body-text">${bodyText}</div>
      </div>
      
      <!-- Footer -->
      <div class="footer-section">
        <div class="signature-block">
          ${signatureUrl ? `<img class="signature-img" src="${signatureUrl}" alt="Signature" />` : ''}
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(signatory1Name.toUpperCase())}</div>
          <div class="signature-role">${escapeHtml(signatory1Role)}</div>
        </div>
        
     <div class="seal-container">
  <svg viewBox="0 0 100 100">
    <!-- Outer seal -->
    <path
      d="
      M50 3
      L54 10 L60 5 L62 13 L69 8 L69 17 L77 15 L74 23
      L82 24 L77 31 L85 35 L78 40 L85 45 L77 49 L82 57
      L74 58 L77 66 L69 64 L69 73 L62 68 L60 76 L54 71
      L50 79 L46 71 L40 76 L38 68 L31 73 L31 64 L23 66
      L26 58 L18 57 L23 49 L15 45 L22 40 L15 35 L23 31
      L18 24 L26 23 L23 15 L31 17 L31 8 L38 13 L40 5
      L46 10 Z"
      fill="#B8860B"
    />

    <!-- Inner white circle -->
    <circle
      cx="50"
      cy="40"
      r="22"
      fill="#FFFDF7"
      stroke="#B8860B"
      stroke-width="2"
    />
  </svg>
</div>
        
        <div class="signature-block">
          ${signature2Url ? `<img class="signature-img" src="${signature2Url}" alt="Signature" />` : ''}
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(signatory2Name.toUpperCase())}</div>
          <div class="signature-role">${escapeHtml(signatory2Role)}</div>
        </div>
      </div>
      
      <div class="certificate-number">Certificate No: ${escapeHtml(data.certificateNumber)}</div>
    </div>
  </div>
</body>
</html>`;
}

async function saveToDisk(certificateNumber: string, pdfBuffer: Buffer): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'certificates');
  await fs.mkdir(dir, { recursive: true });
  const filename = `${certificateNumber}.pdf`;
  await fs.writeFile(path.join(dir, filename), pdfBuffer);
  return `/certificates/${filename}`;
}

export async function renderCertificatePdf(
  template: CertificateTemplate,
  data: CertificatePdfData
): Promise<{ pdfUrl: string }> {
  const html = buildCertificateHtml(template, data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1120,
      height: 792,
      deviceScaleFactor: 2,
    });

    // ─── Set HTML content ──────────────────────────────────────────────
    // await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.setContent(html, { waitUntil: 'networkidle0' as any });

    // ─── Wait for the student name to appear (ensures fonts applied) ──
    await page.waitForSelector('.student-name', { timeout: 5000 });

    // ─── Wait for all images to fully load ──────────────────────────
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });

    // ─── Now generate the PDF ────────────────────────────────────────────
    const pdfBuffer = await page.pdf({
      width: '1120px',
      height: '792px',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      preferCSSPageSize: true,
    });

    const pdfUrl = await saveToDisk(data.certificateNumber, Buffer.from(pdfBuffer));
    return { pdfUrl };
  } finally {
    await browser.close();
  }
}