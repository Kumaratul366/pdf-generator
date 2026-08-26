import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const EXTERNAL_URL = process.env.EXTERNAL_PRICE_URL;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/151.0.0.0 Safari/537.36";

// =========================================================
// Create form data
// =========================================================

function createFormData() {
  const formData = new FormData();

  formData.append("state", "Bihar");
  formData.append("district", "Patna");
  formData.append("action", "getprice");

  return formData;
}

// =========================================================
// NODE FETCH
// =========================================================

async function fetchWithNode() {
  console.log("Attempting Node.js request...");

  const formData = createFormData();

  const response = await fetch(EXTERNAL_URL, {
    method: "POST",
    body: formData,

    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": USER_AGENT,
      Referer: "https://www.jswonetmt.com/",
      Origin: "https://www.jswonetmt.com",
    },

    // Prevent a hanging connection
    signal: AbortSignal.timeout(30000),
  });

  console.log(
    "Node request status:",
    response.status
  );

  const responseText = await response.text();

  console.log(
    "Node response length:",
    responseText.length
  );

  if (!response.ok) {
    throw new Error(
      `External endpoint returned ${response.status}`
    );
  }

  return responseText;
}

// =========================================================
// PUPPETEER FALLBACK
// =========================================================

async function fetchWithPuppeteer() {
  let browser;

  try {
    console.log(
      "Falling back to Puppeteer request..."
    );

    const executablePath =
      await puppeteer.executablePath();

    console.log(
      "Puppeteer executable:",
      executablePath
    );

    browser = await puppeteer.launch({
      headless: true,

      executablePath,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],

      timeout: 60000,
    });

    const page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    console.log(
      "Requesting through Chromium:",
      EXTERNAL_URL
    );

    const responseText = await page.evaluate(
      async (url) => {
        const formData = new FormData();

        formData.append("state", "Bihar");
        formData.append("district", "Patna");
        formData.append("action", "getprice");

        const response = await fetch(url, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            `External endpoint returned ${response.status}`
          );
        }

        return await response.text();
      },
      EXTERNAL_URL
    );

    console.log(
      "Puppeteer response received. Length:",
      responseText.length
    );

    return responseText;

  } finally {
    if (browser) {
      await browser.close();

      console.log(
        "Fallback browser closed."
      );
    }
  }
}

// =========================================================
// PARSE RESPONSE
// =========================================================

function parsePriceData(responseText) {
  console.log(
    "Parsing external response..."
  );

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error(
      "Failed to parse external response as JSON."
    );

    console.error(
      responseText.substring(0, 1000)
    );

    throw new Error(
      "External endpoint did not return valid JSON."
    );
  }

  // -------------------------------------------------------
  // Validate API response
  // -------------------------------------------------------

  if (!data.success) {
    console.error(
      "External endpoint returned success=false:",
      data
    );

    throw new Error(
      "External endpoint returned success=false."
    );
  }

  if (!data.results) {
    throw new Error(
      "External response does not contain price results."
    );
  }

  // -------------------------------------------------------
  // Load HTML
  // -------------------------------------------------------

  const html = data.results;

  const $ = cheerio.load(html);

  const sections = [];
  const prices = [];

  // =======================================================
  // DESKTOP TABLE
  // =======================================================

  $("#desktop table thead th").each(
    (index, element) => {
      if (index === 0) return;

      const section = $(element)
        .text()
        .trim();

      if (section) {
        sections.push(section);
      }
    }
  );

  $("#desktop table tbody tr")
    .first()
    .find("td")
    .each((index, element) => {
      const price = $(element)
        .text()
        .trim();

      if (price) {
        prices.push(price);
      }
    });

  // =======================================================
  // MOBILE FALLBACK
  // =======================================================

  if (
    sections.length === 0 ||
    prices.length === 0
  ) {
    console.log(
      "Desktop table not found. Trying mobile table..."
    );

    sections.length = 0;
    prices.length = 0;

    $("#mobile table tbody tr").each(
      (index, element) => {
        const cells = $(element)
          .find("td")
          .map((i, cell) =>
            $(cell).text().trim()
          )
          .get();

        if (cells.length >= 2) {
          sections.push(cells[0]);
          prices.push(cells[1]);
        }
      }
    );
  }

  // =======================================================
  // VALIDATE EXTRACTED DATA
  // =======================================================

  if (
    sections.length === 0 ||
    prices.length === 0
  ) {
    console.error(
      "No price data found in external HTML."
    );

    console.error(
      html.substring(0, 2000)
    );

    throw new Error(
      "No price data found in external response."
    );
  }

  // =======================================================
  // PRICE LIST
  // =======================================================

  const priceList = sections.map(
    (section, index) => ({
      section,
      price: prices[index] || null,
    })
  );

  // =======================================================
  // EFFECTIVE DATE
  // =======================================================

  const effectiveDate = $(".effect")
    .first()
    .text()
    .replace("With effect from:", "")
    .trim();

  // =======================================================
  // DISCOUNT
  // =======================================================

  const discount = $(".effect2")
    .first()
    .text()
    .trim();

  // =======================================================
  // RESULT
  // =======================================================

  const result = {
    priceList,
    effectiveDate,
    discount,
  };

  console.log(
    "Price data extracted successfully:"
  );

  console.log(result);

  return result;
}

// =========================================================
// MAIN FUNCTION
// =========================================================

async function getPriceData() {
  if (!EXTERNAL_URL) {
    throw new Error(
      "EXTERNAL_PRICE_URL is not defined"
    );
  }

  console.log(
    "Requesting price data from:",
    EXTERNAL_URL
  );

  // =======================================================
  // ATTEMPT 1 — NODE FETCH
  // =======================================================

  try {
    const responseText =
      await fetchWithNode();

    return parsePriceData(responseText);

  } catch (nodeError) {

    console.error(
      "Node request failed:"
    );

    console.error(nodeError);

    // =====================================================
    // ATTEMPT 2 — RETRY NODE REQUEST
    // =====================================================

    console.log(
      "Retrying Node.js request..."
    );

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const responseText =
        await fetchWithNode();

      return parsePriceData(responseText);

    } catch (retryError) {

      console.error(
        "Node retry failed:"
      );

      console.error(retryError);

      // ===================================================
      // ATTEMPT 3 — PUPPETEER FALLBACK
      // ===================================================

      console.log(
        "Node requests failed."
      );

      console.log(
        "Switching to Puppeteer..."
      );

      try {
        const responseText =
          await fetchWithPuppeteer();

        return parsePriceData(responseText);

      } catch (puppeteerError) {

        console.error(
          "Puppeteer fallback also failed:"
        );

        console.error(
          puppeteerError
        );

        throw new Error(
          "Unable to fetch price data from external endpoint using Node.js or Puppeteer."
        );
      }
    }
  }
}

export { getPriceData };