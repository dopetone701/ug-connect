// src/lib/currency-transformer.ts
// Base price is in AED

export const BASE_MONTHLY_AED = 10;
export const BASE_YEARLY_AED = 100;
export const YEARLY_SAVE_AED = 20;

export type CurrencyCode = 'AED' | 'USD' | 'UGX' | 'GBP' | 'EUR' | 'KES' | 'ZAR' | 'CAD';

type CurrencyConfig = {
  code: CurrencyCode;
  symbol: string;
  rate: number; // 1 AED =? in this currency
  regions: string[]; // country codes / timezone hints
  locale: string;
};

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  AED: { code: 'AED', symbol: 'AED', rate: 1, regions: ['AE', 'SA', 'QA', 'BH', 'OM'], locale: 'en-AE' },
  USD: { code: 'USD', symbol: '$', rate: 0.2723, regions: ['US'], locale: 'en-US' },
  UGX: { code: 'UGX', symbol: 'USh', rate: 1015, regions: ['UG'], locale: 'en-UG' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.215, regions: ['GB', 'UK'], locale: 'en-GB' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.25, regions: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'IE'], locale: 'en-IE' },
  KES: { code: 'KES', symbol: 'KSh', rate: 35.2, regions: ['KE'], locale: 'en-KE' },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 5.05, regions: ['ZA'], locale: 'en-ZA' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 0.37, regions: ['CA'], locale: 'en-CA' },
};

// Fallback for Dubai users
const DEFAULT_CURRENCY: CurrencyCode = 'AED';

function getUserRegionCode(): string {
  if (typeof window === 'undefined') return 'AE';

  // 1. Try timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g. Africa/Kampala
    if (tz.includes('Kampala')) return 'UG';
    if (tz.includes('Dubai')) return 'AE';
    if (tz.includes('Nairobi')) return 'KE';
    if (tz.includes('London')) return 'GB';
  } catch {}

  // 2. Try locale
  const lang = navigator.language || 'en-AE'; // en-UG, en-US etc
  const parts = lang.split('-');
  return parts[1]?.toUpperCase() || 'AE';
}

export function getCurrencyForRegion(regionCode?: string): CurrencyConfig {
  const region = regionCode || getUserRegionCode();

  for (const curr of Object.values(CURRENCY_MAP)) {
    if (curr.regions.includes(region)) return curr;
  }

  // Special mapping
  if (region === 'UG') return CURRENCY_MAP.UGX;
  if (region === 'US') return CURRENCY_MAP.USD;
  if (region === 'GB' || region === 'UK') return CURRENCY_MAP.GBP;

  return CURRENCY_MAP[DEFAULT_CURRENCY];
}

export function convertFromAED(amountAED: number, targetCurrency: CurrencyCode): number {
  const rate = CURRENCY_MAP[targetCurrency].rate;
  const converted = amountAED * rate;

  // Round nicely for UGX/KES, 2 decimals for others
  if (targetCurrency === 'UGX' || targetCurrency === 'KES') {
    return Math.round(converted / 100) * 100; // round to nearest 100
  }
  return Math.round(converted * 100) / 100;
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_MAP[currency];
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'UGX' || currency === 'KES'? 0 : 0,
      maximumFractionDigits: currency === 'UGX' || currency === 'KES'? 0 : 0,
    }).format(amount);
  } catch {
    return `${config.symbol} ${amount}`;
  }
}

export function getPricing() {
  const currencyConfig = getCurrencyForRegion();
  const code = currencyConfig.code;

  const monthly = convertFromAED(BASE_MONTHLY_AED, code);
  const yearly = convertFromAED(BASE_YEARLY_AED, code);
  const save = convertFromAED(YEARLY_SAVE_AED, code);

  return {
    currency: code,
    symbol: currencyConfig.symbol,
    region: getUserRegionCode(),
    monthly,
    yearly,
    save,
    monthlyFormatted: formatPrice(monthly, code),
    yearlyFormatted: formatPrice(yearly, code),
    saveFormatted: formatPrice(save, code),
    // For FAQ text
    monthlyText: `${formatPrice(monthly, code)} per month`,
    yearlyText: `${formatPrice(yearly, code)} per year and save ${formatPrice(save, code)}`,
  };
}

// Quick helper for FAQ
export function getPricingTextForFaq(): string {
  const p = getPricing();
  return `${p.monthlyFormatted} per month for unlimited streaming, or ${p.yearlyFormatted} per year and save ${p.saveFormatted} - our best value.`;
}
