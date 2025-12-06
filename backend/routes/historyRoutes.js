import express from "express";
import {
  fetchHistoricalAQI,
  getCityHistory,
} from "../controllers/historyController.js";

const router = express.Router();
router.get("/fetch-history", fetchHistoricalAQI);
router.get("/city", getCityHistory);

export default router;
