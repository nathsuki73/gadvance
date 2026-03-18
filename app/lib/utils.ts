import { randomInt } from "crypto";

/**
 * Generates a cryptographically secure 6-digit OTP string.
 * @returns {string} e.g., "482931"
 */
export const generateOTP = (): string => {
  // generates a random integer between 100,000 (inclusive) and 1,000,000 (exclusive)
  const otp = randomInt(100000, 1000000);
  return otp.toString();
};

/**
 * Optional: Mask email for privacy
 * e.g., gemini@lspu.edu.ph -> ge****@lspu.edu.ph
 */
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.substring(0, 2)}****@${domain}`;
};
