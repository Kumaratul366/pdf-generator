import express from "express";
import { downloadPricePDF } from "../controllers/pdf-controller.js";

const router = express.Router();

router.get("/download-price-pdf", downloadPricePDF);

export default router;