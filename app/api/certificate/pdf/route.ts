
// import { NextRequest, NextResponse } from "next/server";
// import puppeteer from "puppeteer-core";
// import chromium from "@sparticuz/chromium";

// export const runtime = "nodejs";
// export const maxDuration = 30;

// export async function POST(request: NextRequest) {
//   let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

//   try {
//     const { html }: { html?: string } = await request.json();

//     if (!html) {
//       return NextResponse.json(
//         { error: "HTML content is required" },
//         { status: 400 }
//       );
//     }

//     const isLocal = !process.env.VERCEL;

//     browser = await puppeteer.launch({
//       args: [
//         ...(isLocal
//           ? ["--no-sandbox", "--disable-setuid-sandbox"]
//           : chromium.args),
//         "--disable-gpu",
//         "--hide-scrollbars",
//         "--font-render-hinting=none",
//       ],

//       executablePath: isLocal
//         ? process.env.CHROME_PATH ||
//           "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
//         : await chromium.executablePath(),

//       headless: true,

//       defaultViewport: {
//         width: 1200,
//         height: 750,
//         deviceScaleFactor: 1,
//         isMobile: false,
//         hasTouch: false,
//       },
//     });

//     const page = await browser.newPage();

//     await page.setViewport({
//       width: 1200,
//       height: 750,
//       deviceScaleFactor: 1,
//       isMobile: false,
//       hasTouch: false,
//     });

//     await page.setContent(html, {
//        waitUntil: "load",
//       timeout: 30000,
//     });

//     await page.emulateMediaType("screen");

//     await page.evaluate(async () => {
//       if (document.fonts) {
//         await document.fonts.ready;
//       }

//       const images = Array.from(document.images);

//       await Promise.all(
//         images.map((img) => {
//           if (img.complete && img.naturalWidth > 0) {
//             return Promise.resolve();
//           }

//           return new Promise<void>((resolve) => {
//             const done = () => resolve();

//             img.addEventListener("load", done, { once: true });
//             img.addEventListener("error", done, { once: true });
//           });
//         })
//       );

//       await new Promise<void>((resolve) =>
//         requestAnimationFrame(() => resolve())
//       );

//       await new Promise<void>((resolve) =>
//         requestAnimationFrame(() => resolve())
//       );
//     });

//     await page.addStyleTag({
//       content: `
//         @page {
//           size: 1200px 750px;
//           margin: 0;
//         }

//         html,
//         body {
//           width: 1200px !important;
//           height: 750px !important;
//           min-width: 1200px !important;
//           min-height: 750px !important;
//           max-width: 1200px !important;
//           max-height: 750px !important;
//           margin: 0 !important;
//           padding: 0 !important;
//           overflow: hidden !important;
//           background: #ffffff !important;
//         }

//         body {
//           display: block !important;
//         }

//         .certificate-wrapper {
//           width: 1200px !important;
//           height: 750px !important;
//           min-width: 1200px !important;
//           min-height: 750px !important;
//           max-width: 1200px !important;
//           max-height: 750px !important;
//           margin: 0 !important;
//           padding: 0 !important;
//           overflow: hidden !important;
//           box-shadow: none !important;
//         }

//         *,
//         *::before,
//         *::after {
//           -webkit-print-color-adjust: exact !important;
//           print-color-adjust: exact !important;
//         }
//       `,
//     });

//     const certificateExists = await page.evaluate(() => {
//       return Boolean(document.querySelector(".certificate-wrapper"));
//     });

//     if (!certificateExists) {
//       throw new Error(
//         "Certificate wrapper (.certificate-wrapper) was not found."
//       );
//     }

//    const pdf = await page.pdf({
//   width: "1200px",
//   height: "750px",
//   printBackground: true,
//   preferCSSPageSize: false,
//   scale: 1,
//   pageRanges: "1",
//   displayHeaderFooter: false,
//   margin: {
//     top: "0px",
//     right: "0px",
//     bottom: "0px",
//     left: "0px",
//   },
// });

// return new Response(Buffer.from(pdf), {
//   status: 200,
//   headers: {
//     "Content-Type": "application/pdf",
//     "Content-Disposition": 'attachment; filename="certificate.pdf"',
//     "Content-Length": String(pdf.length),
//   },
// });
//   } catch (error: unknown) {
//     console.error("PDF generation error:", error);

//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Failed to generate PDF",
//       },
//       { status: 500 }
//     );
//   } finally {
//     if (browser) {
//       try {
//         await browser.close();
//       } catch (error) {
//         console.error("Browser close error:", error);
//       }
//     }
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Typed loosely on purpose — the two branches below return browser
  // instances from different packages (puppeteer vs puppeteer-core) whose
  // types are structurally compatible but not identical.
  let browser: any = null;

  try {
    const { html }: { html?: string } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const isVercel = Boolean(process.env.VERCEL);

    if (isVercel) {
      // Vercel's serverless functions run on Amazon Linux — @sparticuz/chromium
      // ships a Chromium binary built specifically for that environment.
      // This branch will NOT work on Windows or any non-Lambda-like server.
      const { default: puppeteer } = await import("puppeteer-core");
      const { default: chromium } = await import("@sparticuz/chromium");

      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          "--disable-gpu",
          "--hide-scrollbars",
          "--font-render-hinting=none",
          "--disable-dev-shm-usage",
          "--single-process",
          "--no-zygote",
        ],
        executablePath: await chromium.executablePath(),
        // A plain `true` works reliably with @sparticuz/chromium's bundled
        // binary across current versions and avoids a type disagreement
        // between chromium.headless's type and puppeteer-core's LaunchOptions.
        headless: true,
        defaultViewport: {
          width: 1200,
          height: 750,
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
        },
      });
    } else {
      // Any other server (Windows, a Linux VM, on-prem, etc.) — use full
      // `puppeteer`, which downloads and manages its own Chromium build
      // matching the host OS at install time. This removes any dependency
      // on a system Chrome install or guessing file paths per platform.
      //
      // Requires: npm install puppeteer  (in addition to puppeteer-core +
      // @sparticuz/chromium, which stay for the Vercel branch above).
      const { default: puppeteer } = await import("puppeteer");

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--hide-scrollbars",
          "--font-render-hinting=none",
          "--disable-dev-shm-usage",
        ],
        defaultViewport: {
          width: 1200,
          height: 750,
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
        },
      });
    }

    const page = await browser.newPage();

    page.on("console", (msg: any) => {
      if (msg.type() === "error") {
        console.error("[pdf-gen] page console error:", msg.text());
      }
    });
    page.on("pageerror", (err: any) => {
      console.error("[pdf-gen] page runtime error:", err);
    });
    page.on("requestfailed", (req: any) => {
      console.error(
        "[pdf-gen] request failed:",
        req.url(),
        req.failure()?.errorText
      );
    });

    await page.setViewport({
      width: 1200,
      height: 750,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30000,
    });

    await page.emulateMediaType("screen");

    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
          }

          return new Promise<void>((resolve) => {
            const done = () => resolve();

            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          });
        })
      );

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
    });

    await page.addStyleTag({
      content: `
        @page {
          size: 1200px 750px;
          margin: 0;
        }

        html,
        body {
          width: 1200px !important;
          height: 750px !important;
          min-width: 1200px !important;
          min-height: 750px !important;
          max-width: 1200px !important;
          max-height: 750px !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        body {
          display: block !important;
        }

        .certificate-wrapper {
          width: 1200px !important;
          height: 750px !important;
          min-width: 1200px !important;
          min-height: 750px !important;
          max-width: 1200px !important;
          max-height: 750px !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: none !important;
        }

        *,
        *::before,
        *::after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `,
    });

    const certificateExists = await page.evaluate(() => {
      return Boolean(document.querySelector(".certificate-wrapper"));
    });

    if (!certificateExists) {
      throw new Error(
        "Certificate wrapper (.certificate-wrapper) was not found."
      );
    }

    const pdf = await page.pdf({
      width: "1200px",
      height: "750px",
      printBackground: true,
      preferCSSPageSize: false,
      scale: 1,
      pageRanges: "1",
      displayHeaderFooter: false,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });

    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="certificate.pdf"',
        "Content-Length": String(pdf.length),
      },
    });
  } catch (error: unknown) {
    console.error("PDF generation error (raw):", error);
    if (error instanceof Error) {
      console.error("PDF generation error stack:", error.stack);
    }

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : JSON.stringify(error);

    return NextResponse.json(
      { error: `Failed to generate PDF: ${message}` },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error("Browser close error:", error);
      }
    }
  }
}