import { getPriceData } from "../services/price-service.js";
import { generatePricePDF } from "../services/pdf-service.js";

const downloadPricePDF = async (req, res) => {
  try {
    console.log("1. PDF request received");

    // --------------------------------------------------
    // Fetch price data
    // --------------------------------------------------

    console.log("2. Fetching price data...");

    const priceData = await getPriceData();

    console.log(
      "3. Price data received:",
      priceData
    );

    // --------------------------------------------------
    // Generate PDF
    // --------------------------------------------------

    console.log("4. Generating PDF...");

    const pdf =
      await generatePricePDF(priceData);

    console.log(
      "5. PDF generated successfully"
    );

    // --------------------------------------------------
    // Generate filename
    // --------------------------------------------------

    const today = new Date();

    const date = String(
      today.getDate()
    ).padStart(2, "0");

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month =
      months[today.getMonth()];

    const year =
      today.getFullYear();

    // Proper date suffix
    const day = today.getDate();

    let suffix = "th";

    if (day % 100 < 11 || day % 100 > 13) {
      switch (day % 10) {
        case 1:
          suffix = "st";
          break;

        case 2:
          suffix = "nd";
          break;

        case 3:
          suffix = "rd";
          break;
      }
    }

    const fileName =
      `Kharakia ECP Bihar ` +
      `${date}${suffix} ${month} ${year}.pdf`;

    console.log(
      "6. Filename:",
      fileName
    );

    // --------------------------------------------------
    // Send PDF
    // --------------------------------------------------

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Content-Length",
      pdf.length
    );

    res.send(pdf);

    console.log(
      "7. PDF sent successfully"
    );

  } catch (error) {
    console.error(
      "❌ PDF generation error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message:
          "Unable to generate PDF",
        error: error.message,
      });
    }
  }
};

export { downloadPricePDF };