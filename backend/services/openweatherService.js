// services/openweatherService.js

export async function fetchAQIfromOpenWeather(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log("latitude:", lat, "longitude:", lon);
      console.log("OpenWeather API response status:", response.status);
    }
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenWeather API error: ${response.status} - ${body}`);
    }

    return await response.json();
  } catch (err) {
    throw new Error("Failed to fetch AQI from OpenWeather: " + err.message);
  }
}
