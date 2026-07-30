
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
export const maxDuration = 30; // seconds — bump if on a plan that allows more

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const { html }: { html: string } = await request.json();

    const isLocal = process.env.NODE_ENV === "development";

    browser = await puppeteer.launch({
      args: isLocal
        ? ["--no-sandbox", "--disable-setuid-sandbox"]
        : chromium.args,
      defaultViewport: { width: 1200, height: 750 },
      executablePath: isLocal
        ? // On your machine, point this at a local Chrome/Chromium install.
          // Easiest: keep a regular `puppeteer` devDependency locally, or
          // set PUPPETEER_EXECUTABLE_PATH in your local .env.
          process.env.PUPPETEER_EXECUTABLE_PATH ?? (await chromium.executablePath())
        : await chromium.executablePath(),
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
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}