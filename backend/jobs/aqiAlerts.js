// backend/jobs/aqiAlerts.js
import cron from "node-cron";
import { pool } from "../db.js";
import {
  getAQIForCity,
  getAQILevel,
  getPreventiveMeasures,
} from "../services/aqiHelper.js";
import { sendAlertEmail } from "../services/email.js";

function significantChange(oldVal, newVal) {
  // Check if AQI level changed (1-5 scale)
  return oldVal !== newVal;
}

// DAILY ALERT (8 AM)
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily AQI alert job at 8 AM...");

  // Run in background to avoid blocking event loop
  setImmediate(async () => {
    try {
      const users = await pool.query(
        "SELECT id, city, email, last_aqi FROM users WHERE city IS NOT NULL AND email IS NOT NULL"
      );

      const updates = [];

      for (const u of users.rows) {
        try {
          const { id, city, email } = u;

          // Get AQI for the city
          const aqiData = await getAQIForCity(city);
          const aqi = aqiData.aqi;
          const category = getAQILevel(aqi);
          const preventiveMeasures = getPreventiveMeasures(aqi);

          // Send email with AQI and preventive measures (fire and forget with error handling)
          sendAlertEmail(email, city, aqi, category, preventiveMeasures).catch(
            (err) => console.error(`Email failed for ${email}:`, err.message)
          );

          // Batch the update
          updates.push({ id, aqi });
          console.log(`Daily alert queued for ${email} - AQI: ${aqi}`);
        } catch (err) {
          console.error(`Error processing user ${u.id}:`, err.message);
        }
      }

      // Batch update all at once
      if (updates.length > 0) {
        const updateQuery = `
          UPDATE users AS u SET last_aqi = c.aqi
          FROM (VALUES ${updates
            .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
            .join(",")}) AS c(id, aqi)
          WHERE u.id = c.id
        `;
        const updateParams = updates.flatMap((u) => [u.id, u.aqi]);
        await pool.query(updateQuery, updateParams);
        console.log(`Batch updated ${updates.length} users`);
      }
    } catch (err) {
      console.error("Error in daily alert job:", err);
    }
  });
});

// SIGNIFICANT CHANGE ALERT (Every 30 min)
cron.schedule("*/30 * * * *", async () => {
  console.log("Running AQI change detection job...");

  // Run in background to avoid blocking event loop
  setImmediate(async () => {
    try {
      const users = await pool.query(
        "SELECT id, city, email, last_aqi FROM users WHERE last_aqi IS NOT NULL AND city IS NOT NULL AND email IS NOT NULL"
      );

      const updates = [];

      for (const u of users.rows) {
        try {
          const { id, city, email, last_aqi } = u;

          // Get current AQI
          const aqiData = await getAQIForCity(city);
          const newAQI = aqiData.aqi;

          // Check if there's a significant change
          if (significantChange(last_aqi, newAQI)) {
            const category = getAQILevel(newAQI);
            const preventiveMeasures = getPreventiveMeasures(newAQI);

            // Send email (fire and forget with error handling)
            sendAlertEmail(
              email,
              city,
              newAQI,
              category,
              preventiveMeasures
            ).catch((err) =>
              console.error(`Email failed for ${email}:`, err.message)
            );

            // Batch the update
            updates.push({ id, newAQI });
            console.log(
              `Change alert queued for ${email} - AQI changed from ${last_aqi} to ${newAQI}`
            );
          }
        } catch (err) {
          console.error(`Error processing user ${u.id}:`, err.message);
        }
      }

      // Batch update all at once
      if (updates.length > 0) {
        const updateQuery = `
          UPDATE users AS u SET last_aqi = c.new_aqi::integer
          FROM (VALUES ${updates
            .map((_, i) => `($${i * 2 + 1}::integer, $${i * 2 + 2}::integer)`)
            .join(",")}) AS c(id, new_aqi)
          WHERE u.id = c.id
        `;
        const updateParams = updates.flatMap((u) => [u.id, u.newAQI]);
        await pool.query(updateQuery, updateParams);
        console.log(`Batch updated ${updates.length} users`);
      }
    } catch (err) {
      console.error("Error in change detection job:", err);
    }
  });
});

console.log("AQI alert cron jobs scheduled:");
console.log("- Daily alert: 8:00 AM");
console.log("- Change detection: Every 30 minutes");
