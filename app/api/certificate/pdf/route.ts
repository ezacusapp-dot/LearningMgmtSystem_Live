
// import { NextRequest, NextResponse } from "next/server";
// import puppeteer from "puppeteer-core";
// import chromium from "@sparticuz/chromium";

// export const runtime = "nodejs";
// export const maxDuration = 30;

// export async function POST(request: NextRequest) {
//   let browser = null;

//   try {
//     const { html }: { html: string } = await request.json();

//     const isLocal = !process.env.VERCEL;

//     browser = await puppeteer.launch({
//       args: isLocal
//         ? ["--no-sandbox", "--disable-setuid-sandbox"]
//         : chromium.args,
//       defaultViewport: {
//         width: 1200,
//         height: 750,
//         deviceScaleFactor: 1,
//       },
//       executablePath: isLocal
//         ? process.env.CHROME_PATH ||
//           "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // adjust for Windows/Mac/Linux if running locally
//         : await chromium.executablePath(),
//       headless: true,
//     });

//     const page = await browser.newPage();

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
//         "Content-Disposition": 'attachment; filename="certificate.pdf"',
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
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const { html }: { html?: string } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const isLocal = !process.env.VERCEL;

    browser = await puppeteer.launch({
      args: [
        ...(isLocal
          ? ["--no-sandbox", "--disable-setuid-sandbox"]
          : chromium.args),
        "--disable-gpu",
        "--hide-scrollbars",
        "--font-render-hinting=none",
      ],

      executablePath: isLocal
        ? process.env.CHROME_PATH ||
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : await chromium.executablePath(),

      headless: true,

      defaultViewport: {
        width: 1200,
        height: 750,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    });

    const page = await browser.newPage();

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

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="certificate.pdf"',
        "Content-Length": String(pdf.length),
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