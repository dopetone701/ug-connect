"use client";
import { BillingPlan } from "@/lib/billing/plans.config";

export default function PlanCard({ plan, selected, onSelect }: { plan: BillingPlan; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`plan-card ${selected ? "selected" : ""} ${plan.popular ? "popular" : ""}`} onClick={onSelect} type="button">
      {plan.popular && <span className="plan-badge">Most Popular</span>}
      <div className="plan-name">{plan.name}</div>
      <div className="plan-price">{"$" + plan.price_usd + " / " + plan.price_ugx.toLocaleString() + " UGX"}</div>
      <div className="plan-duration">{plan.duration_days + " days"}</div>
      <ul className="plan-features">
        {plan.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </button>
  );
}

