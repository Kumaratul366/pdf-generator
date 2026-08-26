import "dotenv/config";
import express from 'express';
import cors from 'cors';

import pdfRoutes from '../server/routes/routers.js';

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/pdf", pdfRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "PDF server is running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {});