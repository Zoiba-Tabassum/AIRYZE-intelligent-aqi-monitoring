import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAlertEmail = async (
  email,
  city,
  aqi,
  category,
  preventiveMeasures = []
) => {
  // Check for email credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in .env file."
    );
  }

  const measuresText =
    preventiveMeasures.length > 0
      ? `\n\nPreventive Measures:\n${preventiveMeasures
          .map((tip, i) => `${i + 1}. ${tip}`)
          .join("\n")}`
      : "";

  const emailText = `Current AQI in ${city} is ${aqi} (${category}).${measuresText}\n\nStay safe and take care!`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `AQI Alert for ${city}`,
      text: emailText,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🌬️ Air Quality Alert for ${city}</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;">
            <strong>Current AQI:</strong> ${aqi} (${category})
          </p>
        </div>
        ${
          preventiveMeasures.length > 0
            ? `
          <h3 style="color: #1f2937;">Preventive Measures:</h3>
          <ul style="line-height: 1.8;">
            ${preventiveMeasures.map((tip) => `<li>${tip}</li>`).join("")}
          </ul>
        `
            : ""
        }
        <p style="color: #6b7280; margin-top: 20px;">Stay safe and take care!</p>
      </div>
    `,
    });
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }
};
