"use client";
import "./cancil-modal.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";

export default function CancilModal({ onKeep, onConfirm }: { onKeep: () => void; onConfirm: () => void }) {
  return (
    <div className="cancil-overlay" onClick={onKeep}>
      <div className="cancil-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancil-icon"></div>
        <div className="cancil-title">Cancel subscription?</div>
        <div className="cancil-desc">
          Your progress will be lost. You can resume anytime. Are you sure you want to cancel?
        </div>
        <div className="cancil-actions">
          <button className="cancil-keep" onClick={onKeep}>Keep Plan</button>
          <button className="cancil-confirm" onClick={onConfirm}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

