import nodemailer from "nodemailer";

/**
 * Configuration for easy migration.
 * When you get Hostinger, just add these to your .env file.
 */
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;

export const sendOTPEmail = async (email: string, otp: string) => {
  // 1. DEVELOPMENT MODE: If no credentials exist, log to console
  if (!SMTP_USER || !SMTP_PASSWORD) {
    console.log("-----------------------------------------");
    console.log("📧 [MOCK EMAIL SERVICE]");
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your Gadvance Account`);
    console.log(`Your 6-digit OTP is: ${otp}`);
    console.log("-----------------------------------------");

    return { success: true, message: "OTP logged to console (Dev Mode)" };
  }

  // 2. PRODUCTION MODE: Hostinger SMTP Logic
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true, // Use SSL/TLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Gadvance Security" <${SMTP_USER}>`,
      to: email,
      subject: "Verify your Gadvance Account",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 20px;">
          <h2 style="color: #0d9488; text-align: center;">Gadvance</h2>
          <p style="text-align: center; color: #666;">Use the code below to verify your identity.</p>
          <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 12px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #999; text-align: center;">This code expires in 5 minutes.</p>
        </div>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ SMTP Error:", error);
    throw new Error("Failed to send email");
  }
};
