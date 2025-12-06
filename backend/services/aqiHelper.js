// Helper function to get AQI for a city using cityCoords
import { fetchAQIfromOpenWeather } from "./openweatherService.js";
import { cityCoords } from "./cityCoords.js";

export async function getAQIForCity(cityName) {
  try {
    // Find city coordinates
    let coords = null;
    
    for (const province in cityCoords) {
      if (cityCoords[province][cityName]) {
        coords = cityCoords[province][cityName];
        break;
      }
    }

    if (!coords) {
      throw new Error(`City ${cityName} not found in cityCoords`);
    }

    // Fetch AQI using OpenWeather API
    const data = await fetchAQIfromOpenWeather(
      coords.lat,
      coords.lon,
      process.env.OPENWEATHER_API_KEY
    );

    const aqi = data?.list?.[0]?.main?.aqi || null;
    const components = data?.list?.[0]?.components || {};

    return {
      aqi,
      components,
      lat: coords.lat,
      lon: coords.lon,
    };
  } catch (error) {
    throw new Error(`Failed to get AQI for ${cityName}: ${error.message}`);
  }
}

// Get AQI level/category
export function getAQILevel(aqi) {
  if (aqi === 1) return "Good";
  if (aqi === 2) return "Fair";
  if (aqi === 3) return "Moderate";
  if (aqi === 4) return "Poor";
  if (aqi === 5) return "Very Poor";
  return "Unknown";
}

// Get preventive measures based on AQI
export function getPreventiveMeasures(aqi) {
  const tipsByLevel = {
    0: [
      "Be aware of your body's signals. Symptoms like coughing, burning eyes, or difficulty breathing are strong indicators that the air quality is poor.",
      "Consider wearing a mask if you experience any discomfort while outdoors.",
      "Stay hydrated and eat healthy.",
      "Avoid high-traffic areas.",
    ],
    1: [
      "Enjoy outdoor activities freely.",
      "Keep indoor spaces naturally ventilated.",
      "A great day for exercise and sports.",
    ],
    2: [
      "Sensitive groups should monitor symptoms.",
      "Light outdoor exercise is okay.",
      "Keep windows open for fresh air.",
    ],
    3: [
      "Limit extended outdoor activities.",
      "Use masks if you feel discomfort.",
      "Reduce exposure for children and elderly.",
    ],
    4: [
      "Avoid outdoor exercise as much as possible.",
      "Use N95 masks when stepping outside.",
      "Keep windows closed to reduce indoor pollution.",
      "Use air purifiers if available.",
    ],
    5: [
      "Stay indoors unless absolutely necessary.",
      "Use N95/KN95 masks outdoors.",
      "Keep all windows closed and seal openings.",
      "Avoid driving during peak smog hours.",
      "People with breathing issues should avoid going out completely.",
    ],
  };

  return tipsByLevel[aqi] || tipsByLevel[0];
}

