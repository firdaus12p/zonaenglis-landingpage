/**
 * CTA (Call To Action) Links Constants
 * Memusatkan semua link CTA yang digunakan di seluruh aplikasi
 */

// WhatsApp Links - Untuk backward compatibility dengan existing code
export const CTA_WHATSAPP =
  "https://wa.me/6282399627276?text=Halo%20Zona%20English%2C%20saya%20ingin%20konsultasi%20kelas";

// WhatsApp Links Object - Untuk penggunaan yang lebih spesifik
export const WHATSAPP_LINKS = {
  // Link utama untuk konsultasi umum (dari LearnMoreZE)
  MAIN: "https://wa.me/6282399627276?text=Halo%20Zona%20English%2C%20saya%20ingin%20konsultasi%20kelas",

  // Link untuk promo center (dari PromoCenter)
  PROMO_CENTER:
    "https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20tanya%20Promo%20Center",

  // Link untuk partnership/ambassador (dari PromoHub)
  PARTNERSHIP:
    "https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20bergabung%20sebagai%20Ambassador",

  // Alias untuk PromoHub compatibility
  PROMO_HUB:
    "https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20bergabung%20sebagai%20Ambassador",
} as const;

// Registration & Navigation Links
export const CTA_REGISTER = "/promo-hub"; // Menuju ke halaman Promo Hub untuk pendaftaran
export const CTA_SCHEDULE = "#jadwal"; // TODO: ganti ke halaman jadwal & program
export const CTA_TRYFREE = "/promo-hub"; // Menuju ke halaman Promo Hub untuk trial
export const CTA_AFFILIATE = "#daftar-affiliate";
export const CTA_AMBASSADOR = "#daftar-ambassador";

// Social Media Links
export const SOCIAL_MEDIA = {
  INSTAGRAM: "@zonaenglish.id",
  INSTAGRAM_URL: "https://instagram.com/zonaenglish.id",
} as const;

// Location Information
export const LOCATIONS = {
  MAKASSAR: "Makassar Pettarani",
  KOLAKA: "Kolaka",
  KENDARI: "Kendari",
} as const;

// Phone Numbers
export const PHONE_NUMBERS = {
  ADMIN_MAIN: "+62 823-9962-7276",
  ADMIN_PROMO: "+62 821-8808-0688",
} as const;
