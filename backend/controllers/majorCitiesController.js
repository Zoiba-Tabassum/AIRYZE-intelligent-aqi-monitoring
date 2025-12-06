const cities = [
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", lat: 31.5204, lon: 74.3587 },
  { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { name: "Rawalpindi", lat: 33.5651, lon: 73.0169 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", lat: 30.1798, lon: 66.975 },
  { name: "Faisalabad", lat: 31.4181, lon: 73.0776 },
  { name: "Multan", lat: 30.1575, lon: 71.5249 },
];

export const getMajorCitiesAQI = async (req, res) => {
  try {
    const results = [];

    for (let city of cities) {
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${process.env.OPENWEATHER_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.list || data.list.length === 0) {
        results.push({
          name: city.name,
          aqi: null,
          components: null,
          updatedAt: null,
        });
        continue;
      }

      const aqiData = data.list[0];

      results.push({
        name: city.name,
        aqi: aqiData.main.aqi,
        components: aqiData.components,
        updatedAt: aqiData.dt,
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch major cities AQI",
      message: error.message,
    });
  }
};
