// backend/utils/fetchAQI.js
import axios from "axios";

const API_KEY = process.env.OPENWEATHER_KEY;

export async function getAQI(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const response = await axios.get(url);
  return response.data.list[0].main.aqi;
}
