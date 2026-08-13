export const SERVICES = {
  standard: { label: "Standard clean", multiplier: 1 },
  deep: { label: "Deep clean", multiplier: 1.55 },
  moveout: { label: "Move-out clean", multiplier: 1.8 },
};

export const FREQUENCIES = {
  once: { label: "One time", discount: 0 },
  weekly: { label: "Weekly", discount: 0.15 },
  biweekly: { label: "Every two weeks", discount: 0.1 },
  monthly: { label: "Monthly", discount: 0.05 },
};

export const ADDONS = {
  fridge: { label: "Inside fridge", price: 25 },
  oven: { label: "Inside oven", price: 30 },
  windows: { label: "Interior windows", price: 45 },
};

export const SEED_RECORDS = [
  { id: "NS-1042", name: "Jordan Lee", email: "jordan@example.com", service: "deep", bedrooms: 4, bathrooms: 2.5, frequency: "once", addons: ["fridge"], amount: 303, stage: "quote", createdAt: "2026-08-12T17:30:00.000Z" },
  { id: "NS-1041", name: "Ana Martinez", email: "ana@example.com", service: "standard", bedrooms: 2, bathrooms: 1, frequency: "biweekly", addons: [], amount: 108, stage: "job", createdAt: "2026-08-11T15:15:00.000Z" },
  { id: "NS-1040", name: "Sam Wilson", email: "sam@example.com", service: "moveout", bedrooms: 3, bathrooms: 2, frequency: "once", addons: ["oven", "windows"], amount: 326, stage: "invoice", paid: false, createdAt: "2026-08-09T19:45:00.000Z" },
  { id: "NS-1039", name: "Priya Shah", email: "priya@example.com", service: "standard", bedrooms: 3, bathrooms: 2, frequency: "monthly", addons: [], amount: 138, stage: "paid", paid: true, createdAt: "2026-08-08T16:20:00.000Z" },
  { id: "NS-1038", name: "Chris Morgan", email: "chris@example.com", service: "deep", bedrooms: 2, bathrooms: 2, frequency: "once", addons: ["windows"], amount: 246, stage: "lead", createdAt: "2026-08-07T14:05:00.000Z" },
];
