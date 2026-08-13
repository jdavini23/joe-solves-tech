import { ADDONS, FREQUENCIES, SERVICES } from "./data.js";

export function calculatePrice({ service, frequency, bedrooms, bathrooms, addons = [] }) {
  const base = 65 + Number(bedrooms) * 18 + Number(bathrooms) * 24;
  const serviceTotal = base * SERVICES[service].multiplier;
  const extras = addons.reduce((total, addon) => total + ADDONS[addon].price, 0);
  const discount = serviceTotal * FREQUENCIES[frequency].discount;
  return Math.round(serviceTotal + extras - discount);
}

export function estimateRange(values) {
  const center = calculatePrice(values);
  return { low: Math.max(90, Math.round(center * 0.9 / 5) * 5), high: Math.round(center * 1.12 / 5) * 5 };
}

export function currency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}
