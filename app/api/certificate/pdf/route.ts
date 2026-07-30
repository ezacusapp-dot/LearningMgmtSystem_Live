
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

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "No certificate HTML was provided." },
        { status: 400 }
      );
    }

    const isLocal = process.env.NODE_ENV === "development";

    // On Vercel/production this is always false — @sparticuz/chromium's
    // bundled binary is used instead, no env var needed there.
    const executablePath = isLocal
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : await chromium.executablePath();

    if (isLocal && !executablePath) {
      console.error(
        "PUPPETEER_EXECUTABLE_PATH is not set. Add it to .env.local pointing at your local Chrome install, e.g.\n" +
          "PUPPETEER_EXECUTABLE_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe"
      );
      return NextResponse.json(
        { error: "PDF generation is not configured for local development." },
        { status: 500 }
      );
    }

    browser = await puppeteer.launch({
      args: isLocal
        ? ["--no-sandbox", "--disable-setuid-sandbox"]
        : chromium.args,
      defaultViewport: { width: 1200, height: 750 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 750,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30000,
    });

    await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {
      // Non-fatal — some environments never go fully idle (e.g. web fonts
      // polling). We still wait for fonts/images explicitly below.
    });

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
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
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
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {
        // Ignore close errors — browser may have already crashed/exited.
      });
    }
  }
}