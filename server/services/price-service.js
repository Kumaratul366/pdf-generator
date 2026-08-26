import * as cheerio from "cheerio";

const EXTERNAL_URL = process.env.EXTERNAL_PRICE_URL;

async function getPriceData() {
  if (!EXTERNAL_URL) {
    throw new Error(
      "EXTERNAL_PRICE_URL is not defined in .env"
    );
  }

  const formData = new FormData();

  formData.append("state", "Bihar");
  formData.append("district", "Patna");
  formData.append("action", "getprice");

  const response = await fetch(EXTERNAL_URL, {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",

      "Accept":
        "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const responseText = await response.text();


  if (!response.ok) {

    throw new Error(
      `External endpoint returned ${response.status}`
    );
  }

  // --------------------------------------------------
  // Parse JSON returned by JSW
  // --------------------------------------------------

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse external response as JSON.");
    console.error(responseText);

    throw new Error(
      "External endpoint did not return valid JSON."
    );
  }


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

  // IMPORTANT:
  // The actual HTML is inside data.results
  const html = data.results;

  // --------------------------------------------------
  // Parse the HTML contained inside results
  // --------------------------------------------------

  const $ = cheerio.load(html);


  const sections = [];
  const prices = [];

  // --------------------------------------------------
  // Try desktop table first
  // --------------------------------------------------

  $("#desktop table thead th").each((index, element) => {
    if (index === 0) return;

    const section = $(element)
      .text()
      .trim();

    if (section) {
      sections.push(section);
    }
  });

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
  // Fallback to mobile table
  // --------------------------------------------------

  if (sections.length === 0 || prices.length === 0) {

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
      price: prices[index] || null
    })
  );

  // --------------------------------------------------
  // Extract effective date and discount
  // --------------------------------------------------

  const effectiveDate = $(".effect")
    .first()
    .text()
    .replace("With effect from:", "")
    .trim();

  const discount = $(".effect2")
    .first()
    .text()
    .trim();

  const result = {
    priceList,
    effectiveDate,
    discount
  };

  return result;
}

export { getPriceData };