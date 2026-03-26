/**
 * Currency formatting utility
 * Default currency is Nigerian Naira (₦)
 * All values are comma-separated by default.
 */

const CURRENCIES = {
  NGN: { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
  ZAR: { symbol: "R", code: "ZAR", name: "South African Rand" },
  KES: { symbol: "KSh", code: "KES", name: "Kenyan Shilling" },
  GHS: { symbol: "GH₵", code: "GHS", name: "Ghanaian Cedi" },
  AED: { symbol: "د.إ", code: "AED", name: "UAE Dirham" },
};

const DEFAULT_CURRENCY = "NGN";

export { CURRENCIES, DEFAULT_CURRENCY };

/**
 * Format a number with commas as thousands separators.
 * e.g. 1234567.89 → "1,234,567.89"
 */
export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-US");
}

/**
 * Format a value as currency with comma-separated thousands.
 * e.g. formatCurrency(1500000) → "₦1,500,000"
 */
export function formatCurrency(value, currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  if (!value && value !== 0) return `${currency.symbol}0`;
  return `${currency.symbol}${Number(value).toLocaleString("en-US")}`;
}

/**
 * Format large numbers in compact form (K/M/B) with currency symbol.
 * e.g. formatCompactCurrency(1500000) → "₦1.5M"
 */
export function formatCompactCurrency(value, currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  if (!value && value !== 0) return `${currency.symbol}0`;
  const num = Number(value);
  if (Math.abs(num) >= 1_000_000_000) return `${currency.symbol}${(num / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(num) >= 1_000_000) return `${currency.symbol}${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${currency.symbol}${(num / 1_000).toFixed(0)}K`;
  return `${currency.symbol}${num.toLocaleString("en-US")}`;
}

export function getCurrencySymbol(currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  return (CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY]).symbol;
}
