import * as cheerio from "cheerio";

const EXTERNAL_URL = process.env.EXTERNAL_PRICE_URL;

async function getPriceData() {
  if (!EXTERNAL_URL) {
    throw new Error("EXTERNAL_PRICE_URL is not defined");
  }

  try {
    console.log("Requesting price data from:", EXTERNAL_URL);

    // --------------------------------------------------
    // Create POST form data
    // --------------------------------------------------

    const formData = new FormData();

    formData.append("state", "Bihar");
    formData.append("district", "Patna");
    formData.append("action", "getprice");

    // --------------------------------------------------
    // Make POST request directly from Node.js
    // --------------------------------------------------

    const response = await fetch(EXTERNAL_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/151.0.0.0 Safari/537.36",
        Referer: "https://www.jswonetmt.com/",
        Origin: "https://www.jswonetmt.com",
      },
    });

    console.log(
      "External endpoint status:",
      response.status
    );

    // --------------------------------------------------
    // Get response text
    // --------------------------------------------------

    const responseText = await response.text();

    console.log(
      "External response received. Length:",
      responseText.length
    );

    // --------------------------------------------------
    // Validate HTTP response
    // --------------------------------------------------

    if (!response.ok) {
      console.error(
        "External endpoint response:",
        responseText.substring(0, 1000)
      );

      throw new Error(
        `External endpoint returned ${response.status} ${response.statusText}`
      );
    }

    // --------------------------------------------------
    // Parse JSON
    // --------------------------------------------------

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "Failed to parse external response as JSON."
      );

      console.error(
        "Response:",
        responseText.substring(0, 1000)
      );

      throw new Error(
        "External endpoint did not return valid JSON."
      );
    }

    // --------------------------------------------------
    // Validate response
    // --------------------------------------------------

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
      console.error(
        "External response does not contain results:",
        data
      );

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
    // Validate extracted price data
    // --------------------------------------------------

    if (
      sections.length === 0 ||
      prices.length === 0
    ) {
      console.error(
        "Could not find prices in returned HTML."
      );

      console.error(
        "Returned HTML:",
        html.substring(0, 2000)
      );

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

    console.log(
      "Price data extracted successfully:"
    );

    console.log(result);

    return result;

  } catch (error) {
    console.error(
      "Price scraping error:",
      error
    );

    throw error;
  }
}

export { getPriceData };