
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request) {
  try {
    const { html } = await request.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    });

    const page = await browser.newPage();

    // Match viewport to the actual certificate size (no scale factor here —
    // scale factor blows up page.pdf() dimensions when combined with fixed width/height)
    await page.setViewport({
      width: 1200,
      height: 750,
      deviceScaleFactor: 1,
    });

   await page.setContent(html, {
  waitUntil: 'load',
  timeout: 30000,
});

// Wait until there are no active network requests
await page.waitForNetworkIdle();
    await page.evaluate(() => document.fonts.ready);

    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
          )
      );
    });

    // Generate PDF at EXACT certificate size — no preferCSSPageSize,
    // since there's no @page rule for it to defer to (that was causing
    // Puppeteer to fall back to Letter size).
    const pdf = await page.pdf({
      width: '1200px',
      height: '750px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: '1',
    });

    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=certificate.pdf',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + error.message },
      { status: 500 }
    );
  }
}