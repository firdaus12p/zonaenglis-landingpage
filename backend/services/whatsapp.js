// WhatsApp Service - Generate Click-to-Chat URLs
// Purpose: Create pre-filled WhatsApp message links for ambassador notifications

/**
 * Generate WhatsApp Click-to-Chat URL with pre-filled message
 * @param {string} ambassadorPhone - Ambassador's WhatsApp number (format: 628xxx or 08xxx)
 * @param {Object} userData - User information who applied the code
 * @param {string} affiliateCode - The affiliate code that was applied
 * @param {Object} programInfo - Program details
 * @returns {string} WhatsApp URL with pre-filled message
 */
export function generateAmbassadorNotificationUrl(
  ambassadorPhone,
  userData,
  affiliateCode,
  programInfo
) {
  // Normalize phone number to international format (62xxx)
  const normalizedPhone = normalizePhoneNumber(ambassadorPhone);

  // Build notification message
  const message = buildAmbassadorNotificationMessage(
    userData,
    affiliateCode,
    programInfo
  );

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Generate WhatsApp Click-to-Chat URL
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp URL for user to contact ambassador
 * @param {string} ambassadorPhone - Ambassador's WhatsApp number
 * @param {string} ambassadorName - Ambassador's name
 * @param {string} programName - Program user is interested in
 * @returns {string} WhatsApp URL
 */
export function generateUserToAmbassadorUrl(
  ambassadorPhone,
  ambassadorName,
  programName
) {
  const normalizedPhone = normalizePhoneNumber(ambassadorPhone);

  const message =
    `Halo ${ambassadorName}! 👋\n\n` +
    `Saya tertarik dengan program ${programName} di Zona English.\n\n` +
    `Bisa info lebih lanjut?`;

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/**
 * Build notification message for ambassador
 * @private
 */
function buildAmbassadorNotificationMessage(
  userData,
  affiliateCode,
  programInfo
) {
  const { user_name, user_phone, user_email, user_city } = userData;
  const { program_name, discount_applied } = programInfo;

  // Format timestamp
  const timestamp = new Date().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Build message
  let message = `🎉 *ADA YANG PAKAI KODE ANDA!*\n\n`;
  message += `📝 *Kode Affiliate:* ${affiliateCode}\n`;
  message += `👤 *Nama User:* ${user_name}\n`;
  message += `📱 *WhatsApp:* ${user_phone}\n`;

  if (user_email) {
    message += `📧 *Email:* ${user_email}\n`;
  }

  if (user_city) {
    message += `📍 *Kota:* ${user_city}\n`;
  }

  message += `\n💼 *Program:* ${program_name}\n`;

  if (discount_applied) {
    message += `💰 *Diskon:* ${discount_applied}%\n`;
  }

  message += `⏰ *Waktu:* ${timestamp}\n\n`;
  message += `✅ *Silakan follow-up user ini!*\n`;
  message += `Anda bisa hubungi via WhatsApp: ${user_phone}`;

  return message;
}

/**
 * Normalize phone number to international format
 * @private
 * @param {string} phone - Phone number in various formats
 * @returns {string} Normalized phone number (62xxx format)
 */
function normalizePhoneNumber(phone) {
  if (!phone) return "";

  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, "");

  // Convert 08xxx to 628xxx
  if (normalized.startsWith("0")) {
    normalized = "62" + normalized.substring(1);
  }

  // Ensure it starts with 62
  if (!normalized.startsWith("62")) {
    normalized = "62" + normalized;
  }

  return normalized;
}

/**
 * Validate Indonesian phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validatePhoneNumber(phone) {
  if (!phone) return false;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Check length (Indonesian phone: 10-13 digits after country code)
  if (digits.length < 10 || digits.length > 15) return false;

  // Check if starts with valid prefix (0 or 62)
  if (!digits.startsWith("0") && !digits.startsWith("62")) return false;

  return true;
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number (0812-3456-789)
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "";

  const normalized = normalizePhoneNumber(phone);

  // Convert to 08xx format for display
  let displayNumber = normalized;
  if (normalized.startsWith("62")) {
    displayNumber = "0" + normalized.substring(2);
  }

  // Format: 0812-3456-789
  if (displayNumber.length >= 11) {
    return (
      displayNumber.substring(0, 4) +
      "-" +
      displayNumber.substring(4, 8) +
      "-" +
      displayNumber.substring(8)
    );
  }

  return displayNumber;
}

/**
 * Generate device fingerprint for spam prevention
 * @param {Object} req - Express request object
 * @returns {string} Device fingerprint hash
 */
export function generateDeviceFingerprint(req) {
  const userAgent = req.get("user-agent") || "";
  const acceptLanguage = req.get("accept-language") || "";
  const ip = req.ip || req.connection.remoteAddress || "";

  // Simple hash (in production, use crypto.createHash)
  return Buffer.from(`${userAgent}-${acceptLanguage}-${ip}`).toString("base64");
}

export default {
  generateAmbassadorNotificationUrl,
  generateUserToAmbassadorUrl,
  validatePhoneNumber,
  formatPhoneNumber,
  normalizePhoneNumber,
  generateDeviceFingerprint,
};
