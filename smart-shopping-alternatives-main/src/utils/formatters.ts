
/**
 * Formats a number as currency (USD by default). Handles non-numeric input gracefully.
 */
export const formatCurrency = (value: number | null | undefined, locale = 'en-US', currency = 'USD'): string => {
  // Check if the value is a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A'; // Or 'Price unavailable', or an empty string ''
  }

  // Proceed with formatting if it's a valid number
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a percentage value
 */
export const formatPercentage = (value: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

/**
 * Truncates text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
