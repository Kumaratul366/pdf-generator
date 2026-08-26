import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const EXTERNAL_URL = process.env.EXTERNAL_PRICE_URL;

async function getPriceData() {
  if (!EXTERNAL_URL) {
    throw new Error("EXTERNAL_PRICE_URL is not defined");
  }

  let browser;

  try {
    console.log("Launching browser for price request...");

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/151.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    console.log("Requesting:", EXTERNAL_URL);

    // --------------------------------------------------
    // Make POST request from Chromium
    // --------------------------------------------------

    const responseText = await page.evaluate(async (url) => {
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
    }, EXTERNAL_URL);

    console.log(
      "External response received. Length:",
      responseText.length
    );

    // --------------------------------------------------
    // Parse JSON returned by external website
    // --------------------------------------------------

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "Failed to parse external response as JSON."
      );

      console.error(responseText.substring(0, 1000));

      throw new Error(
        "External endpoint did not return valid JSON."
      );
    }

    // --------------------------------------------------
    // Validate response
    // --------------------------------------------------

    if (!data.success) {
      throw new Error(
        "External endpoint returned success=false."
      );
    }

    if (!data.results) {
      throw new Error(
        "External response does not contain price results."
      );
    }

    // --------------------------------------------------
    // HTML is inside data.results
    // --------------------------------------------------

    const html = data.results;

    const $ = cheerio.load(html);

    const sections = [];
    const prices = [];

    // --------------------------------------------------
    // Desktop table
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Mobile fallback
    // --------------------------------------------------

    if (
      sections.length === 0 ||
      prices.length === 0
    ) {
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

    // --------------------------------------------------
    // Validate extracted data
    // --------------------------------------------------

    if (
      sections.length === 0 ||
      prices.length === 0
    ) {
      throw new Error(
        "No price data found in external response."
      );
    }

    // --------------------------------------------------
    // Create price list
    // --------------------------------------------------

    const priceList = sections.map(
      (section, index) => ({
        section,
        price: prices[index] || null,
      })
    );

    // --------------------------------------------------
    // Effective date
    // --------------------------------------------------

    const effectiveDate = $(".effect")
      .first()
      .text()
      .replace("With effect from:", "")
      .trim();

    // --------------------------------------------------
    // Discount
    // --------------------------------------------------

    const discount = $(".effect2")
      .first()
      .text()
      .trim();

    // --------------------------------------------------
    // Final result
    // --------------------------------------------------

    const result = {
      priceList,
      effectiveDate,
      discount,
    };

    console.log("Price data extracted successfully:");

    console.log(result);

    return result;

  } catch (error) {
    console.error(
      "Price scraping error:",
      error
    );

    throw error;

  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed.");
    }
  }
}

export { getPriceData };