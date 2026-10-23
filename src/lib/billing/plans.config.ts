export interface BillingPlan {
  id: string;
  name: string;
  price_ugx: number;
  price_usd: number;
  interval: string;
  duration_days: number;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export const PLANS: BillingPlan[] = [
  {
    id: "weekly",
    name: "Weekly",
    price_ugx: 5000,
    price_usd: 2,
    interval: "week",
    duration_days: 7,
    features: ["Unlimited VJ Movies", "No Ads", "4K"],
    popular: false
  },
  {
    id: "monthly",
    name: "Monthly",
    price_ugx: 15000,
    price_usd: 5,
    interval: "month",
    duration_days: 30,
    features: ["Unlimited VJ Movies", "No Ads", "4K", "Early Access"],
    popular: true
  },
  {
    id: "yearly",
    name: "Yearly",
    price_ugx: 120000,
    price_usd: 40,
    interval: "year",
    duration_days: 365,
    features: ["Everything in Monthly", "Save 33%", "Offline Downloads"],
    popular: false,
    badge: "BEST VALUE"
  }
];

export type PlanId = typeof PLANS[number]["id"];

