import { fetchAQIfromOpenWeather } from "../services/openweatherService.js";

export const getAQI = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat & lon are required" });
  }

  try {
    const data = await fetchAQIfromOpenWeather(
      lat,
      lon,
      process.env.OPENWEATHER_API_KEY
    );

    const aqi = data?.list?.[0]?.main?.aqi || null;
    const components = data?.list?.[0]?.components || {};

    res.json({
      success: true,
      aqi, // AQI is 1–5 (OpenWeather scale)
      components, // PM2.5, PM10, NO2, SO2 etc.
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
