/**
 * Currency Utility Functions for Rupiah Formatting
 * Zona English Landing Page
 */

/**
 * Format number to Rupiah display format with "Rp" prefix
 * Example: 1000000 => "Rp 1.000.000"
 * @param value - Number to format
 * @returns Formatted string with Rp prefix
 */
export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format input value for real-time display in input fields
 * Example: "1000000" => "1.000.000" (without Rp prefix for easier editing)
 * @param value - String or number to format
 * @returns Formatted string with thousand separators
 */
export const formatRupiahInput = (value: string | number): string => {
  // Remove all non-digit characters
  const numericValue = String(value).replace(/\D/g, "");

  // Return empty string if no digits
  if (!numericValue) return "";

  // Format with thousand separators
  return new Intl.NumberFormat("id-ID").format(Number(numericValue));
};

/**
 * Parse formatted Rupiah string back to number
 * Example: "1.000.000" => 1000000
 * @param value - Formatted string to parse
 * @returns Pure number value
 */
export const parseRupiahInput = (value: string): number => {
  // Remove all non-digit characters (dots, commas, spaces, etc)
  const numericValue = value.replace(/\D/g, "");
  return Number(numericValue) || 0;
};

/**
 * Handle currency input change event
 * Use this in onChange handlers for seamless formatting
 * @param value - Current input value
 * @param callback - Callback function to update state with parsed number
 * @returns Formatted display value
 */
export const handleCurrencyChange = (
  value: string,
  callback: (numericValue: number) => void
): string => {
  const formatted = formatRupiahInput(value);
  const parsed = parseRupiahInput(value);
  callback(parsed);
  return formatted;
};
