import express from "express";
import { getAQI } from "../controllers/aqiController.js";

const router = express.Router();

router.get("/aqi", getAQI);

export default router;
