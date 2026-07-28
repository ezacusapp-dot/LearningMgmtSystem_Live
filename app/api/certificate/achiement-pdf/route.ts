import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      organizationName = "CODE EXCELLENCE EDUTECH",
      studentName = "Hannah Morales",
      assessmentName = "Python Fundamentals",
      grade = "A",
      bodyText = "The student has demonstrated proficiency in programming concepts and practical application, earning the grade",
      signerName = "RAINA BAFNA",
      signatureLabel = "Program Director",
      logoSrc = "/image/logo.png",
      signatureSrc = "/image/signature.png",
    } = body;

    // Convert image paths to Base64
    const logoBase64 = await imageToBase64(logoSrc);
    const signatureBase64 = await imageToBase64(signatureSrc);

    // Generate the certificate HTML with embedded images
    const html = generateCertificateHTML({
      organizationName,
      studentName,
      assessmentName,
      grade,
      bodyText,
      signerName,
      signatureLabel,
      logoBase64,
      signatureBase64,
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set viewport for A4 landscape
    await page.setViewport({ 
      width: 1120, 
      height: 792 
    });
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
    });
    
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF with A4 landscape
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${studentName.replace(/\s+/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

// Helper function to convert image to Base64
async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    
    const imageBuffer = await fs.readFile(fullPath);
    const base64 = imageBuffer.toString('base64');
    
    const ext = path.extname(fullPath).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn(`Image not found at: ${imagePath}`, error);
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#e0e0e0"/>
        <text x="100" y="100" font-family="Arial" font-size="16" fill="#999" text-anchor="middle" dominant-baseline="central">Image Not Found</text>
      </svg>`
    ).toString('base64')}`;
  }
}

function generateCertificateHTML(data: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Pirata+One&family=Oswald:wght@600;700&family=Allura&display=swap" rel="stylesheet">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          body {
            background: #f6f5f4;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: 'Playfair Display', serif;
          }
          .container {
            width: 1120px;
            height: 792px;
            background: #f6f5f4;
            position: relative;
            overflow: hidden;
          }
          .top-strip {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 18px;
            background: linear-gradient(to right, #9dc63b, #7fb238);
          }
          .wavy-bg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0.06;
            pointer-events: none;
          }
          .swooshes {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 46%;
            height: 62%;
            pointer-events: none;
          }
          .header-bar {
            position: absolute;
            top: 3%;
            left: 0;
            z-index: 10;
          }
          .header-text {
            display: inline-block;
            white-space: nowrap;
            background: #5a2d82;
            color: white;
            font-weight: bold;
            letter-spacing: 2px;
            padding: 0.8% 30% 0.8% 3.5%;
            border-radius: 0 50px 50px 0;
            font-size: 28px;
            font-family: 'Oswald', sans-serif;
          }
   .logo {
    position: absolute;
    top: 3%;
    right: 2.5%;
    width: 120px;
    height: 120px;
    border-radius: 16px;
    background: white;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 0;
}
        .medal {
    position: absolute;
    top: 120px;
    left: 20px;
    width: 110px;
    height: auto;
}

.medal svg {
    width: 100%;
    height: auto;
    display: block;
}
          .content {
            position: absolute;
            top: 17%;
            left: 14%;
            right: 5%;
            bottom: 4%;
            display: flex;
            flex-direction: column;
          }
          .title {
            font-family: 'Pirata One', cursive;
            font-size: 78px;
            font-weight: 900;
            color: #1a1a1a;
            letter-spacing: 8px;
            line-height: 1;
          }
          .subtitle {
            font-size: 26px;
            color: #2a2a2a;
            margin-top: 6px;
            font-weight: 400;
            letter-spacing: 2px;
          }
          .presented {
            margin-top: 18px;
            font-size: 18px;
            color: #2a2a2a;
          }
          .name-wrap {
            margin-top: 12px;
            border-bottom: 1px solid #737373;
            padding-bottom: 8px;
            width: 65%;
          }
          .name {
            font-family: 'Allura', cursive;
            font-size: 46px;
            color: #1a1a1a;
            line-height: 1;
          }
          .body {
            margin-top: 22px;
            font-size: 18px;
            color: #2a2a2a;
            line-height: 1.6;
            max-width: 68%;
          }
          .body .bold { 
            font-weight: 750; 
          }
          .signature {
            margin-top: auto;
            width: 28%;
            top: -15px; 
          }
          .signature img {
            height: 55px;
            object-fit: contain;
            object-position: left bottom;
          }
          .sig-line {
            border-bottom: 1px solid #525252;
            width: 50%;
            padding-bottom: 3px;
          }
          .signer {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 600;
            margin-top: 5px;
          }
          .sig-label {
            font-size: 11px;
            color: #525252;
          }
          .illustration {
            position: absolute;
            bottom: 0;
            right: 2%;
            width: 34%;
            height: 46%;
            pointer-events: none;
          }
          .illustration svg { 
            width: 100%; 
            height: 100%; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="top-strip"></div>
          <svg class="wavy-bg" viewBox="0 0 1120 792">
            ${Array.from({ length: 8 }).map((_, i) => `
              <path d="M -100 ${80 + i * 50} C 200 ${30 + i * 50}, 600 ${160 + i * 50}, 1200 ${60 + i * 50}" stroke="#5a3d8a" stroke-width="2" fill="none" />
            `).join('')}
          </svg>
          <svg class="swooshes" viewBox="0 0 600 500" preserveAspectRatio="xMaxYMax meet">
            <path d="M 600 500 L 600 180 C 480 240 420 320 420 500 Z" fill="#c9b8de" />
            <path d="M 600 500 L 600 270 C 520 310 480 380 500 500 Z" fill="#6a2a8f" />
            <path d="M 600 500 L 600 340 C 560 360 540 410 550 500 Z" fill="#8bc53f" />
            <path d="M 30 500 C 15 400 45 335 120 285" stroke="#6a2a8f" stroke-width="10" fill="none" />
            <path d="M 70 500 C 55 420 75 360 135 320" stroke="#c9b8de" stroke-width="8" fill="none" />
          </svg>
          <div class="header-bar">
            <div class="header-text">${data.organizationName}</div>
          </div>
          <div class="logo">
            <img src="${data.logoBase64}" alt="Logo" />
          </div>
       <div class="medal">
<svg viewBox="0 0 180 300" xmlns="http://www.w3.org/2000/svg">

<defs>

<radialGradient id="gold1" cx="35%" cy="30%">
<stop offset="0%" stop-color="#FFF8C9"/>
<stop offset="35%" stop-color="#FFD84D"/>
<stop offset="70%" stop-color="#D7A318"/>
<stop offset="100%" stop-color="#A86F00"/>
</radialGradient>

<linearGradient id="darkRibbon" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#C28A00"/>
<stop offset="100%" stop-color="#8C6100"/>
</linearGradient>

<linearGradient id="lightRibbon" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#FFD95C"/>
<stop offset="100%" stop-color="#D1A000"/>
</linearGradient>

</defs>

<!-- ribbons -->

<polygon points="72,132 88,132 82,288"
fill="url(#darkRibbon)"/>

<polygon points="92,132 108,132 98,288"
fill="url(#lightRibbon)"/>

<!-- outer star -->

<polygon
points="
90,18
98,28
110,22
116,34
129,31
132,44
145,44
145,57
158,61
154,73
164,81
158,92
166,103
155,111
160,123
147,127
148,140
135,141
132,154
119,151
113,163
101,157
90,166
79,157
67,163
61,151
48,154
45,141
32,140
33,127
20,123
25,111
14,103
22,92
16,81
26,73
22,61
35,57
35,44
48,44
51,31
64,34
70,22
82,28
"
fill="url(#gold1)"
stroke="#8A6500"
stroke-width="2"/>

<!-- rings -->

<circle cx="90" cy="92" r="54"
fill="none"
stroke="#F8E79A"
stroke-width="2"/>

<circle cx="90" cy="92" r="42"
fill="none"
stroke="#FFF4C8"
stroke-width="1.5"/>

<!-- rays -->

<g stroke="#FFF5C5" stroke-width="1">

<line x1="90" y1="92" x2="90" y2="38"/>
<line x1="90" y1="92" x2="114" y2="44"/>
<line x1="90" y1="92" x2="132" y2="56"/>
<line x1="90" y1="92" x2="144" y2="74"/>
<line x1="90" y1="92" x2="145" y2="92"/>
<line x1="90" y1="92" x2="144" y2="110"/>
<line x1="90" y1="92" x2="132" y2="128"/>
<line x1="90" y1="92" x2="114" y2="140"/>
<line x1="90" y1="92" x2="90" y2="146"/>
<line x1="90" y1="92" x2="66" y2="140"/>
<line x1="90" y1="92" x2="48" y2="128"/>
<line x1="90" y1="92" x2="36" y2="110"/>
<line x1="90" y1="92" x2="35" y2="92"/>
<line x1="90" y1="92" x2="36" y2="74"/>
<line x1="90" y1="92" x2="48" y2="56"/>
<line x1="90" y1="92" x2="66" y2="44"/>

</g>

</svg>
</div>
          <div class="content">
            <h1 class="title">CERTIFICATE</h1>
            <h2 class="subtitle">OF ACHIEVEMENT</h2>
            <p class="presented">This certificate is proudly presented to</p>
            <div class="name-wrap">
              <span class="name">${data.studentName}</span>
            </div>
            <div class="body">
              <p>for successfully passing the assessment in <span class="bold">${data.assessmentName || '\u00A0'}</span></p>
              <p style="margin-top:6px;">${data.bodyText} <span class="bold">${data.grade || '\u00A0'}</span>. We appreciate the student&rsquo;s hard work and dedication and encourage continued exploration in the world of technology and coding.</p>
            </div>
            <div class="signature">
              <img src="${data.signatureBase64}" alt="Signature" />
              <div class="sig-line"></div>
              <p class="signer">${data.signerName}</p>
              <p class="sig-label">${data.signatureLabel}</p>
            </div>
          </div>
          <div class="illustration">
            <svg viewBox="0 0 500 340">
              <rect x="205" y="230" width="20" height="60" fill="#6a2a8f" />
              <rect x="170" y="290" width="90" height="14" rx="3" fill="#5a2478" />
              <rect x="140" y="70" width="180" height="150" rx="10" fill="#7c4bb0" />
              <rect x="152" y="90" width="156" height="112" rx="4" fill="#efe9fb" />
              <circle cx="165" cy="80" r="4" fill="#e0d4f7" />
              <circle cx="178" cy="80" r="4" fill="#e0d4f7" />
              <circle cx="230" cy="150" r="10" fill="#f0a93a" />
              <rect x="255" y="120" width="34" height="60" rx="4" fill="#5a2478" />
              <text x="258" y="158" font-size="26" fill="#efe9fb" font-family="monospace">&lt;/&gt;</text>
              <g>
                <rect x="30" y="250" width="46" height="40" fill="#5a2478" />
                <rect x="30" y="250" width="46" height="40" fill="#6a2a8f" opacity="0.6" />
                <rect x="18" y="210" width="70" height="18" rx="4" fill="#8bc53f" />
                <circle cx="53" cy="180" r="24" fill="#2e2e2e" />
                <circle cx="53" cy="188" r="16" fill="#f2c29a" />
                <rect x="35" y="200" width="36" height="40" rx="8" fill="#3a3f8f" />
              </g>
              <g>
                <circle cx="360" cy="150" r="22" fill="#7a4a2a" />
                <circle cx="360" cy="157" r="15" fill="#f2c29a" />
                <rect x="345" y="170" width="30" height="70" rx="8" fill="#3a3f8f" />
                <rect x="345" y="170" width="30" height="20" rx="6" fill="#efe9fb" />
              </g>
              <g>
                <circle cx="440" cy="200" r="20" fill="#2e2e2e" />
                <circle cx="440" cy="207" r="14" fill="#f2c29a" />
                <rect x="425" y="222" width="30" height="50" rx="8" fill="#3a3f8f" />
                <rect x="418" y="260" width="44" height="30" rx="4" fill="#5a2478" />
              </g>
            </svg>
          </div>
        </div>
      </body>
    </html>
  `;
}