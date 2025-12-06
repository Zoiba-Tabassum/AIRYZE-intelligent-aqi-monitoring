import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aqiRoutes from "./routes/aqiRoutes.js";
import cityRoutes from "./routes/majorCitiesRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import "./jobs/aqiAlerts.js"; // Start cron jobs

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", aqiRoutes);
app.use("/api/pak_cities", cityRoutes);
app.use("/api/history", historyRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("OpenWeather AQI Backend running. Use /api/aqi?lat=..&lon=..");
});

// 404 handler - return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler - ensure all errors return JSON
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running at http://localhost:${PORT}");
});
