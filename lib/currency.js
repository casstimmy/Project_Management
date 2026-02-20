/**
 * Currency formatting utility
 * Default currency is Nigerian Naira (₦)
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

export function formatCurrency(value, currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  if (!value && value !== 0) return `${currency.symbol}0`;
  return `${currency.symbol}${Number(value).toLocaleString()}`;
}

export function getCurrencySymbol(currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  return (CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY]).symbol;
}
