import { getPriceData } from "../services/price-service.js";
import { generatePricePDF } from "../services/pdf-service.js";


const today = new Date();

const date = String(today.getDate()).padStart(2, "0");

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const month = months[today.getMonth()];
const year = today.getFullYear();

const fileName = `Kharakia ECP Bihar ${date}th ${month} ${year}.pdf`;

const downloadPricePDF = async (req, res) => {
  try {
    // Fetch data from external website
    const priceData = await getPriceData();

    // Generate custom PDF
    const pdf = await generatePricePDF(priceData);

    // PDF response headers
    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
  "Content-Disposition",
  `attachment; filename="${fileName}"`
);



    // Send PDF
    res.send(pdf);

  } catch (error) {
    console.error("PDF generation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate PDF",
    });
  }
};

export { downloadPricePDF };