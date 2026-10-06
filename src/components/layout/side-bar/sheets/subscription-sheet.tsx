"use client";
import SubscriptionsSheet from "../../../../app/auth-system/account-sheets/subscriptions-sheet";

export default function SubscriptionSheet(){
  return (
    <>
      <style jsx global>{`
        .sub-root {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 100% !important;
          height: auto !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
          padding: 16px 16px 120px 16px !important;
          margin: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        .sub-card {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          flex-shrink: 0 !important;
        }
        /* make parent sheet scrollable too */
        [data-side-sheet] , .sheet-shell, .side-sheet-content {
          overflow-y: auto !important;
          height: 100% !important;
        }
      `}</style>
      <div style={{ height: "100dvh", overflowY: "auto", overflowX: "hidden" }}>
        <SubscriptionsSheet />
      </div>
    </>
  );
}
