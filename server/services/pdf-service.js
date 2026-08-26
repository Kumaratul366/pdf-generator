import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// FILE PATHS
// =========================================================

const dubaiBoldPath = path.join(
  __dirname,
  "../fonts/Dubai-Bold.ttf"
);

const dubaiRegularPath = path.join(
  __dirname,
  "../fonts/Dubai-Regular.ttf"
);

const dubaiMediumPath = path.join(
  __dirname,
  "../fonts/Dubai-Medium.ttf"
);

const calibriPath = path.join(
  __dirname,
  "../fonts/calibri.ttf"
);

const bridgePath = path.join(
  __dirname,
  "../assets/bridge.png"
);

const stampPath = path.join(
  __dirname,
  "../assets/TMT-Stamp.png"
);

const thicknessPath = path.join(
  __dirname,
  "../assets/12m.png"
);

const bottomPath = path.join(
  __dirname,
  "../assets/bottom.png"
);

const footerDetailPath = path.join(
  __dirname,
  "../assets/footer-detail.png"
);

const homeDeliveryPath = path.join(
  __dirname,
  "../assets/home-delivery.png"
);

const pricePath = path.join(
  __dirname,
  "../assets/price.png"
);

const telephonePath = path.join(
  __dirname,
  "../assets/telephone.png"
);

const tmtBarPath = path.join(
  __dirname,
  "../assets/image.png"
);

const webPath = path.join(
  __dirname,
  "../assets/web.png"
);

const logoPath = path.join(
  __dirname,
  "../assets/logo_JSW-one.png"
);

// =========================================================
// LOAD FILES AS BASE64
// =========================================================

const dubaiBoldBase64 = fs
  .readFileSync(dubaiBoldPath)
  .toString("base64");

const dubaiRegularBase64 = fs
  .readFileSync(dubaiRegularPath)
  .toString("base64");

const dubaiMediumBase64 = fs
  .readFileSync(dubaiMediumPath)
  .toString("base64");

const calibriBase64 = fs
  .readFileSync(calibriPath)
  .toString("base64");

const bridgeBase64 = fs
  .readFileSync(bridgePath)
  .toString("base64");

const stampBase64 = fs
  .readFileSync(stampPath)
  .toString("base64");

const logoBase64 = fs
  .readFileSync(logoPath)
  .toString("base64");

const webBase64 = fs
  .readFileSync(webPath)
  .toString("base64");

const telephoneBase64 = fs
  .readFileSync(telephonePath)
  .toString("base64");

const tmtbarBase64 = fs
  .readFileSync(tmtBarPath)
  .toString("base64");

const deliveryBase64 = fs
  .readFileSync(homeDeliveryPath)
  .toString("base64");

const footerDetailsBase64 = fs
  .readFileSync(footerDetailPath)
  .toString("base64");

const footerBgBase64 = fs
  .readFileSync(bottomPath)
  .toString("base64");

const thicknessBase64 = fs
  .readFileSync(thicknessPath)
  .toString("base64");

const priceBase64 = fs
  .readFileSync(pricePath)
  .toString("base64");

// =========================================================
// IMAGE SOURCES
// =========================================================

const bridgeSrc =
  `data:image/png;base64,${bridgeBase64}`;

const stampSrc =
  `data:image/png;base64,${stampBase64}`;

const logoSrc =
  `data:image/png;base64,${logoBase64}`;

const webSrc =
  `data:image/png;base64,${webBase64}`;

const telephoneSrc =
  `data:image/png;base64,${telephoneBase64}`;

const tmtbarSrc =
  `data:image/png;base64,${tmtbarBase64}`;

const deliverySrc =
  `data:image/png;base64,${deliveryBase64}`;

const footerDetailsSrc =
  `data:image/png;base64,${footerDetailsBase64}`;

const footerBgSrc =
  `data:image/png;base64,${footerBgBase64}`;

const priceSrc =
  `data:image/png;base64,${priceBase64}`;

const thicknessSrc =
  `data:image/png;base64,${thicknessBase64}`;

// =========================================================
// GENERATE PDF
// =========================================================

async function generatePricePDF(data) {
  let browser;

  try {
    console.log("Starting PDF generation...");

    // -----------------------------------------------------
    // Resolve Puppeteer executable path
    // -----------------------------------------------------

    const executablePath =
      await puppeteer.executablePath();

    console.log(
      "Puppeteer executable:",
      executablePath
    );

    // -----------------------------------------------------
    // Launch Chromium
    // -----------------------------------------------------

    browser = await puppeteer.launch({
      headless: true,

      executablePath,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-features=Translate,BackForwardCache",
      ],

      timeout: 60000,
    });

    console.log("Chromium launched successfully.");

    const page = await browser.newPage();

    // -----------------------------------------------------
    // A4 viewport
    // -----------------------------------------------------

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    // -----------------------------------------------------
    // Browser settings
    // -----------------------------------------------------

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/151.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // -----------------------------------------------------
    // Prepare table rows
    // -----------------------------------------------------

    const rows = data.priceList
      .map(
        (item) => `
          <tr>
            <td>${item.section} mm</td>
            <td>₹ ${Number(item.price)}</td>
          </tr>
        `
      )
      .join("");

    // =====================================================
    // HTML
    // =====================================================

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<style>

* {
  box-sizing: border-box;
}

@page {
  size: A4;
  margin: 0;
}

@font-face {
  font-family: "Dubai";
  src: url("data:font/ttf;base64,${dubaiBoldBase64}") format("truetype");
  font-weight: 800;
  font-style: normal;
}

@font-face {
  font-family: "Dubai-Re";
  src: url("data:font/ttf;base64,${dubaiRegularBase64}") format("truetype");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Dubai-Me";
  src: url("data:font/ttf;base64,${dubaiMediumBase64}") format("truetype");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: "Calibri";
  src: url("data:font/ttf;base64,${calibriBase64}") format("truetype");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Calibri-B";
  src: url("data:font/ttf;base64,${calibriBase64}") format("truetype");
  font-weight: 400;
  font-style: normal;
}

html,
body {
  width: 794px;
  height: 1123px;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #243a7c;
  color: #111;

  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  position: relative;

  width: 794px;
  height: 1123px;

  overflow: hidden;

  background: #243a7c;
}

.bridge-background {
  position: absolute;

  left: 0;
  top: 0;

  width: 794px;
  height: 1123px;

  object-fit: cover;
  object-position: center center;

  z-index: 0;
}

.blue-overlay {
  position: absolute;

  top: 0;
  right: 0;

  width: 330px;
  height: 230px;

  background: #010510;

  clip-path: polygon(
    48% 0,
    100% 0,
    100% 100%,
    0 100%
  );

  z-index: 1;

  display: none;
}

.jsw-logo {
  position: absolute;

  top: 15px;
  right: 20px;

  width: 100px;
  height: auto;

  object-fit: contain;

  z-index: 20;
}

.content {
  position: absolute;

  left: 50%;
  top: 450px;

  width: 650px;

  transform: translate(-50%, -50%);

  z-index: 5;
}

.title {
  color: #fff;

  font-family: "Dubai";

  font-size: 37px;
  line-height: 42px;

  font-weight: 800;

  letter-spacing: -0.9px;
}

.red-line {
  width: 463px;
  height: 5px;

  background: #e63832;
}

.contact-row {
  display: flex;

  font-family: "Dubai";

  align-items: center;

  column-gap: 40px;

  color: #fff;

  font-size: 25px;

  font-weight: 600;

  letter-spacing: -0.5px;

  margin-bottom: 20px;
}

.contact-item {
  display: flex;

  align-items: center;

  white-space: nowrap;
}

.contact-icon {
  width: 24px;
  height: 24px;

  object-fit: contain;

  margin-right: 6px;

  display: block;
}

.certification {
  position: absolute;

  top: -10px;
  right: -15px;

  width: 120px;
  height: 120px;

  z-index: 20;
}

.certification img {
  width: 100%;
  height: 100%;

  object-fit: contain;
}

.state {
  color: #fff;

  font-family: "Dubai-Re";

  font-size: 25px;

  margin-bottom: 12px;
}

.price-box {
  width: 100%;

  font-family: "Dubai-Me";

  background: #fff;
}

table {
  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;
}

th {
  height: 55px;

  background: #fff;

  color: #29457e;

  border: 1px solid #3156a3;

  font-size: 24px;

  font-weight: 600;

  text-align: center;
}

td {
  height: 55px;

  background: #fff;

  border: 1px solid #3156a3;

  text-align: center;

  font-size: 24px;

  font-weight: 600;

  padding: 4px 0;
}

th:first-child,
td:first-child {
  width: 40%;
}

th:last-child,
td:last-child {
  width: 60%;
}

.effective {
  height: 44px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #fff;

  border-left: 1px solid #3156a3;
  border-right: 1px solid #3156a3;
  border-bottom: 1px solid #3156a3;

  font-size: 20px;

  font-family: "Calibri-B";

  font-weight: 600;
}

.statement {
  height: 48px;

  display: flex;

  font-family: "Calibri-B";

  font-weight: 600;

  align-items: center;

  justify-content: center;

  background: #fff;

  color: #405da1;

  border-left: 1px solid #3156a3;
  border-right: 1px solid #3156a3;

  font-size: 17px;
}

.features {
  height: 110px;

  display: grid;

  grid-template-columns:
    1fr 1fr 1fr;

  background: #fff;

  border-left: 1px solid #3156a3;
  border-right: 1px solid #3156a3;
  border-bottom: 1px solid #3156a3;
}

.feature {
  text-align: center;

  color: #3e5a9d;

  font-size: 9px;

  font-weight: 700;

  line-height: 13px;

  padding: 10px 10px 8px;
}

.feature-icon {
  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding-bottom: 3px;

  margin-bottom: 5px;
}

.feature-icon img {
  max-width: 42px;
  max-height: 32px;

  width: auto;
  height: auto;

  object-fit: contain;
}

.feature-text {
  max-width: 165px;

  font-family: "Calibri";

  font-size: 13px;

  margin: auto;
}

.rebar {
  position: relative;

  width: 100%;

  height: 13px;

  overflow: hidden;

  background: #243a7c;
}

.rebar-image {
  position: absolute;

  left: 0;
  top: 0;

  width: 100%;
  height: 13px;

  object-fit: cover;

  display: block;
}

.bottom-area {
  position: absolute;

  left: 0;
  bottom: 0;

  width: 100%;
  height: 265px;

  overflow: hidden;

  background: transparent;

  z-index: 8;
}

.footer-background {
  position: absolute;

  left: 0;
  top: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;

  object-position: center center;

  display: block;

  z-index: 0;
}

.footer-details-image {
  position: absolute;

  left: 50%;
  bottom: 30px;

  transform: translateX(-50%);

  width: 680px;
  height: 140px;

  object-fit: contain;

  object-position: center bottom;

  display: block;

  z-index: 5;
}

</style>

</head>

<body>

<div class="page">

  <!-- BRIDGE BACKGROUND -->

  <img
    class="bridge-background"
    src="${bridgeSrc}"
    alt=""
  />

  <!-- TOP RIGHT BLUE AREA -->

  <div class="blue-overlay"></div>

  <!-- JSW ONE LOGO -->

  <img
    class="jsw-logo"
    src="${logoSrc}"
    alt="JSW ONE"
  />

  <!-- MAIN CONTENT -->

  <main class="content">

    <!-- TITLE -->

    <div class="title">
      JSW One TMT Consumer Price
    </div>

    <!-- RED LINE -->

    <div class="red-line"></div>

    <!-- CONTACT -->

    <div class="contact-row">

      <div class="contact-item">

        <img
          class="contact-icon"
          src="${webSrc}"
          alt=""
        />

        www.jswonetmt.com

      </div>

      <div class="contact-item">

        <img
          class="contact-icon"
          src="${telephoneSrc}"
          alt=""
        />

        1800 1030 663

      </div>

    </div>

    <!-- TMT STAMP -->

    <div class="certification">

      <img
        src="${stampSrc}"
        alt="10X TMT"
      />

    </div>

    <!-- STATE -->

    <div class="state">
      For the state of
      <span style="font-family: 'Dubai';">
        Bihar
      </span>
    </div>

    <!-- PRICE TABLE -->

    <div class="price-box">

      <table>

        <thead>

          <tr>

            <th>
              Section
            </th>

            <th>
              Recommended Price (Fe 550)
            </th>

          </tr>

        </thead>

        <tbody>

          ${rows}

        </tbody>

      </table>

      <!-- EFFECTIVE DATE -->

      <div class="effective">
        With effective from:
        ${data.effectiveDate}
      </div>

      <!-- ENGINEERING STATEMENT -->

      <div class="statement">
        100% engineered TMT that exceeds BIS standards
      </div>

      <!-- FEATURES -->

      <div class="features">

        <!-- FEATURE 1 -->

        <div class="feature">

          <div class="feature-icon">

            <img
              src="${priceSrc}"
              alt=""
            />

          </div>

          <div class="feature-text">

            Prices are inclusive of all<br />

            the taxes &amp; applicable on<br />

            advance payment.

          </div>

        </div>

        <!-- FEATURE 2 -->

        <div class="feature">

          <div class="feature-icon">

            <img
              src="${thicknessSrc}"
              alt=""
            />

          </div>

          <div class="feature-text">

            Each piece is of 12m fixed<br />

            length, all dimensions are<br />

            subject to BIS tolerance.

          </div>

        </div>

        <!-- FEATURE 3 -->

        <div class="feature">

          <div class="feature-icon">

            <img
              src="${deliverySrc}"
              alt=""
            />

          </div>

          <div class="feature-text">

            Free home delivery for<br />

            orders above 1MT within<br />

            5km of municipal limits.

          </div>

        </div>

      </div>

      <!-- TMT BAR -->

      <div class="rebar">

        <img
          class="rebar-image"
          src="${tmtbarSrc}"
          alt=""
        />

      </div>

    </div>

  </main>

  <!-- FOOTER -->

  <section class="bottom-area">

    <img
      class="footer-background"
      src="${footerBgSrc}"
      alt=""
    />

    <img
      class="footer-details-image"
      src="${footerDetailsSrc}"
      alt="Kharakia Metals Private Limited"
    />

  </section>

</div>

</body>

</html>
`;

    // =====================================================
    // LOAD HTML
    // =====================================================

    console.log("Loading generated HTML...");

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log(
      "HTML loaded successfully."
    );

    // =====================================================
    // WAIT FOR FONTS
    // =====================================================

    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    console.log(
      "Fonts loaded successfully."
    );

    // =====================================================
    // WAIT FOR IMAGES
    // =====================================================

    await page.evaluate(async () => {
      const images = Array.from(
        document.images
      );

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.addEventListener(
              "load",
              resolve,
              { once: true }
            );

            img.addEventListener(
              "error",
              resolve,
              { once: true }
            );
          });
        })
      );
    });

    console.log(
      "Images loaded successfully."
    );

    // Small rendering delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    // =====================================================
    // GENERATE PDF
    // =====================================================

    console.log(
      "Creating PDF..."
    );

    const pdf = await page.pdf({
      format: "A4",

      printBackground: true,

      preferCSSPageSize: true,

      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },

      timeout: 60000,
    });

    console.log(
      "PDF generated successfully."
    );

    return pdf;

  } catch (error) {
    console.error(
      "PDF generation failed:",
      error
    );

    throw error;

  } finally {

    if (browser) {

      try {
        await browser.close();

        console.log(
          "Browser closed."
        );

      } catch (closeError) {

        console.error(
          "Error closing browser:",
          closeError
        );
      }
    }
  }
}

export { generatePricePDF };