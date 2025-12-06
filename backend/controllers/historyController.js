// backend/controllers/historyController.js
import { pool } from "../db.js";
import { majorCities } from "../data/cities.js";

/* -------------------------------------------
   ⚠️ EPA BREAKPOINTS (Correct Units Required)
-------------------------------------------- */
const breakpoints = {
  pm25: [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
    { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
    { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
    { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
    { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
  ],
  no2: [
    { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
    { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
    { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
    { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
  ],
  so2: [
    { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
    { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
    { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
    { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
    { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
  ],
};

/* -------------------------------------------
   AQI Helper Functions
-------------------------------------------- */

function calculateAQI(value, pollutant) {
  if (value == null || isNaN(value)) return null;

  const list = breakpoints[pollutant];
  for (const bp of list) {
    if (value >= bp.cLow && value <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (value - bp.cLow) +
          bp.iLow
      );
    }
  }
  return null;
}

function overallAQI(values) {
  const filtered = Object.values(values).filter((v) => v != null);
  return filtered.length ? Math.max(...filtered) : null;
}

/* -------------------------------------------
   CRITICAL FIX: Unit Conversions
-------------------------------------------- */

const ugm3_to_ppb = (ugm3, molWeight) => {
  if (!ugm3) return null;
  return (ugm3 * 24.45) / molWeight;
};

const convertPollutants = (avg) => {
  return {
    pm25: avg.pm25,
    pm10: avg.pm10,

    // µg/m3 → ppb
    o3: ugm3_to_ppb(avg.o3, 48),
    no2: ugm3_to_ppb(avg.no2, 46),
    so2: ugm3_to_ppb(avg.so2, 64),

    // mg/m3 → µg/m3 → ppb
    co: ugm3_to_ppb(avg.co * 1000, 28),
  };
};

/* -------------------------------------------
   FETCH & STORE 30-DAY HISTORICAL AQI
-------------------------------------------- */

export const fetchHistoricalAQI = async (req, res) => {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const fmt = (d) => d.toISOString().slice(0, 10);

    for (const city of majorCities) {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${
        city.lat
      }&longitude=${
        city.lon
      }&hourly=pm2_5,pm10,ozone,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide&start_date=${fmt(
        start
      )}&end_date=${fmt(end)}`;

      const response = await fetch(url);
      const data = await response.json();

      const hours = data.hourly.time || [];

      const pm25 = data.hourly.pm2_5 || [];
      const pm10 = data.hourly.pm10 || [];
      const o3 = data.hourly.ozone || [];
      const co = data.hourly.carbon_monoxide || [];
      const no2 = data.hourly.nitrogen_dioxide || [];
      const so2 = data.hourly.sulphur_dioxide || [];

      const daily = new Map();

      // Aggregate hourly → daily averages
      for (let i = 0; i < hours.length; i++) {
        const dateKey = hours[i].slice(0, 10);

        if (!daily.has(dateKey)) {
          daily.set(dateKey, {
            count: 0,
            pm25: 0,
            pm10: 0,
            o3: 0,
            co: 0,
            no2: 0,
            so2: 0,
          });
        }

        const bucket = daily.get(dateKey);
        const values = {
          pm25: pm25[i],
          pm10: pm10[i],
          o3: o3[i],
          co: co[i],
          no2: no2[i],
          so2: so2[i],
        };

        const valid = Object.values(values).some((v) => typeof v === "number");

        if (valid) {
          bucket.count++;
          for (const key in values) {
            if (typeof values[key] === "number") {
              bucket[key] += values[key];
            }
          }
        }
      }

      // Convert & store each day
      const sorted = Array.from(daily.keys()).sort();

      for (const dateKey of sorted) {
        const b = daily.get(dateKey);
        if (b.count === 0) continue;

        const avg = {
          pm25: b.pm25 / b.count,
          pm10: b.pm10 / b.count,
          o3: b.o3 / b.count,
          co: b.co / b.count,
          no2: b.no2 / b.count,
          so2: b.so2 / b.count,
        };

        const converted = convertPollutants(avg);

        const aqiEach = {
          pm25: calculateAQI(converted.pm25, "pm25"),
          pm10: calculateAQI(converted.pm10, "pm10"),
          o3: calculateAQI(converted.o3, "o3"),
          no2: calculateAQI(converted.no2, "no2"),
          so2: calculateAQI(converted.so2, "so2"),
        };

        const aqi = overallAQI(aqiEach);

        await pool.query(
          `INSERT INTO aqi_data (
            location_name, lat, lon, aqi, co, no, no2, o3, so2, pm2_5, pm10, nh3, timestamp
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            city.name,
            city.lat,
            city.lon,
            aqi,
            converted.co,
            null,
            converted.no2,
            converted.o3,
            converted.so2,
            avg.pm25,
            avg.pm10,
            null,
            dateKey + "T00:00:00Z",
          ]
        );
      }
    }

    return res.json({ message: "Historical AQI stored successfully" });
  } catch (err) {
    console.error("HISTORICAL AQI ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------
   FETCH CITY HISTORY (Last 30 Days)
-------------------------------------------- */

export const getCityHistory = async (req, res) => {
  const { city } = req.query;

  if (!city) return res.status(400).json({ error: "City name is required" });

  try {
    const result = await pool.query(
      `SELECT
        location_name,
        aqi,
        pm2_5,
        pm10,
        o3,
        no2,
        so2,
        timestamp::date AS date
      FROM aqi_data
      WHERE location_name = $1
      ORDER BY date DESC
      LIMIT 30`,
      [city]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("CITY HISTORY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
