import express from "express";
import { getMajorCitiesAQI } from "../controllers/majorCitiesController.js";

const router = express.Router();

router.get("/", getMajorCitiesAQI);

export default router;
