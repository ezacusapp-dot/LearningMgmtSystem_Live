
// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer';

// export async function POST(request) {
//   try {
//     const { html } = await request.json();

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-accelerated-2d-canvas',
//         '--disable-gpu',
//         '--font-render-hinting=none',
//       ],
//     });

//     const page = await browser.newPage();

//     // Match viewport to the actual certificate size (no scale factor here —
//     // scale factor blows up page.pdf() dimensions when combined with fixed width/height)
//     await page.setViewport({
//       width: 1200,
//       height: 750,
//       deviceScaleFactor: 1,
//     });

//    await page.setContent(html, {
//   waitUntil: 'load',
//   timeout: 30000,
// });

// // Wait until there are no active network requests
// await page.waitForNetworkIdle();
//     await page.evaluate(() => document.fonts.ready);

//     await page.evaluate(() => {
//       return Promise.all(
//         Array.from(document.images)
//           .filter((img) => !img.complete)
//           .map(
//             (img) =>
//               new Promise((resolve) => {
//                 img.onload = resolve;
//                 img.onerror = resolve;
//               })
//           )
//       );
//     });

//     // Generate PDF at EXACT certificate size — no preferCSSPageSize,
//     // since there's no @page rule for it to defer to (that was causing
//     // Puppeteer to fall back to Letter size).
//     const pdf = await page.pdf({
//       width: '1200px',
//       height: '750px',
//       printBackground: true,
//       margin: { top: 0, right: 0, bottom: 0, left: 0 },
//       pageRanges: '1',
//     });

//     await browser.close();

//     return new NextResponse(pdf, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': 'attachment; filename=certificate.pdf',
//       },
//     });
//   } catch (error) {
//     console.error('PDF generation error:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate PDF: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import puppeteer from "puppeteer";

// export async function POST(request: NextRequest) {
//   let browser = null;

//   try {
//     const { html }: { html: string } = await request.json();

//     browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-accelerated-2d-canvas",
//         "--disable-gpu",
//         "--font-render-hinting=none",
//       ],
//     });

//     const page = await browser.newPage();

//     await page.setViewport({
//       width: 1200,
//       height: 750,
//       deviceScaleFactor: 1,
//     });

//     await page.setContent(html, {
//       waitUntil: "load",
//       timeout: 30000,
//     });

//     await page.waitForNetworkIdle();

//     await page.evaluate(async () => {
//       await document.fonts.ready;

//       await Promise.all(
//         Array.from(document.images).map((img) => {
//           if (img.complete) return Promise.resolve();

//           return new Promise<void>((resolve) => {
//             img.onload = () => resolve();
//             img.onerror = () => resolve();
//           });
//         })
//       );
//     });

//     const pdf = await page.pdf({
//       width: "1200px",
//       height: "750px",
//       printBackground: true,
//       margin: {
//         top: "0px",
//         right: "0px",
//         bottom: "0px",
//         left: "0px",
//       },
//       pageRanges: "1",
//     });

//     return new Response(pdf, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition":
//           'attachment; filename="certificate.pdf"',
//       },
//     });
//   } catch (error: unknown) {
//     console.error("PDF generation error:", error);

//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Failed to generate PDF",
//       },
//       {
//         status: 500,
//       }
//     );
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const { html }: { html: string } = await request.json();

    const isLocal = !process.env.VERCEL;

    browser = await puppeteer.launch({
      args: isLocal
        ? ["--no-sandbox", "--disable-setuid-sandbox"]
        : chromium.args,
      defaultViewport: {
        width: 1200,
        height: 750,
        deviceScaleFactor: 1,
      },
      executablePath: isLocal
        ? process.env.CHROME_PATH ||
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // adjust for Windows/Mac/Linux if running locally
        : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30000,
    });

    await page.waitForNetworkIdle();

    await page.evaluate(async () => {
      await document.fonts.ready;

      await Promise.all(
        Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );
    });

    const pdf = await page.pdf({
      width: "1200px",
      height: "750px",
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      pageRanges: "1",
    });

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="certificate.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("PDF generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate PDF",
      },
      {
        status: 500,
      }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}